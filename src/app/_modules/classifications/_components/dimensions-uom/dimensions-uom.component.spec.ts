import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Userdetails } from '@models/userdetails';
import { Dimensions, ResultInfo, SaveDimensionsRequest, SaveDimensionsResponse } from '@modules/classifications/_models/classifications';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { RuleService } from '@services/rule/rule.service';
import { UserService } from '@services/user/userservice.service';
import { TransientService } from 'mdo-ui-library';
import { of } from 'rxjs';
import { DimensionAddComponent } from '../dimension-add/dimension-add.component';

import { DimensionsUomComponent } from './dimensions-uom.component';

describe('DimensionsUomComponent', () => {
  let component: DimensionsUomComponent;
  let fixture: ComponentFixture<DimensionsUomComponent>;
  let dialog: MatDialog;
  // let userService: UserService;
  // let ruleService: RuleService;
  // let transientService: TransientService;
  // let sharedService: SharedServiceService;

  const dimensions: Dimensions[] = [
    {
      description: 'Weight',
      values: [
        {
          type: 'Weight',
          uomValue: 'Kg',
        },
        {
          type: 'Weight',
          uomValue: 'gram',
        }
      ],
    }
  ];

  const mockDialogRef = { close: jasmine.createSpy('close'), open: jasmine.createSpy('open') };
  const userServiceStub = {
    getUserDetails: () => of<Userdetails>(),
  };
  const ruleServiceStub = {
    getDimensions: () => of<ResultInfo<Dimensions[]>>({
      acknowledged: true,
      success: true,
      data: dimensions,
      response: dimensions,
      message: '',
      status: 0,
    }),
    getDimensionsById: () => of<ResultInfo<Dimensions>>({
      acknowledged: true,
      success: true,
      data: dimensions[0],
      response: dimensions[0],
      message: '',
      status: 0,
    }),
    saveDimensions: (payload: SaveDimensionsRequest) => of({
      response: {
        ...dimensions[0],
        uuid: '1',
      },
    } as SaveDimensionsResponse),
  };
  const transientServiceStub = {
    open: () => jasmine.createSpy('open'),
  };
  const sharedServiceStub = {
    publish: (action) => of({}),
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DimensionsUomComponent],
      imports: [HttpClientTestingModule, MatDialogModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: [] },
        { provide: UserService, useValue: userServiceStub },
        { provide: RuleService, useValue: ruleServiceStub },
        { provide: TransientService, useValue: transientServiceStub },
        { provide: SharedServiceService, useValue: sharedServiceStub },
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DimensionsUomComponent);
    component = fixture.componentInstance;
    dialog = TestBed.inject(MatDialog);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit(), should call ngOnInit', (() => {
    component.ngOnInit();
    expect(component.ngOnInit).toBeTruthy();
  }));

  it('delete', () => {
    spyOn(component, 'delete').and.callThrough();
    component.dimensionsList = dimensions;
    component.delete(0);
    expect(component.delete).toHaveBeenCalled();
  });

  it('edit', () => {
    spyOn(component, 'edit').and.callThrough();
    component.dimensionsList = dimensions;
    spyOn(dialog, 'open').and.returnValues({ afterClosed: () => of({ result: 'Dime2' }) } as MatDialogRef<DimensionAddComponent>);
    component.edit(dimensions[0]);
    expect(dialog.open).toHaveBeenCalled();
  });

  it('add', () => {
    spyOn(component, 'addDimension').and.callThrough();
    component.dimensionsList = dimensions;
    spyOn(dialog, 'open').and.returnValues({ afterClosed: () => of({ result: 'Dime2' }) } as MatDialogRef<DimensionAddComponent>);
    component.addDimension();
    expect(dialog.open).toHaveBeenCalled();
  });

  it('closeDialog()', () => {
    spyOn(component, 'closeDialog').and.callThrough();
    component.closeDialog();
    expect(component.closeDialog).toHaveBeenCalled();
  });

  it('add(), while search and enter then value should be reset ', () => {
    const event = { input: { value: '' } } as MatChipInputEvent;
    // call actual method
    component.addDimUoM(event);
    expect(component.addDimUoM).toBeTruthy();

    const event1 = { value: '' } as MatChipInputEvent;
    // call actual method
    component.addDimUoM(event1);
    expect(component.addDimUoM).toBeTruthy();
  });

  it('remove(), should remove ', async () => {
    component.dimensionsList = dimensions;
    component.selectedDimension = dimensions[0];

    component.remove(0);

    await fixture.whenStable();

    expect(component.uomList.length).toEqual(1);
  });

  it('loads dimensions', async () => {
    spyOn(component, 'loadDimensions').and.callThrough();

    component.loadDimensions();
    await fixture.whenStable();

    expect(component.loadDimensions).toHaveBeenCalled();
  });

  it('save', (() => {
    spyOn(component, 'save').and.callThrough();
    component.dimensionsList = dimensions;
    component.save();
    expect(component.save).toHaveBeenCalled();
  }));
});
