import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { VirtualDatasetDetails } from '@models/list-page/virtual-dataset/virtual-dataset';
import { SharedModule } from '@modules/shared/shared.module';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { VirtualDatasetService } from '@services/list/virtual-dataset/virtual-dataset.service';
import { TransientService } from 'mdo-ui-library';
import { of, throwError } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { CreateVirtualDatasetComponent } from '../dataset/dataset/create-virtual-dataset/create-virtual-dataset.component';
import { VirtualDatasetDetailsComponent } from './virtual-dataset-details.component';

describe('VirtualDatasetDetailsComponent', () => {
  let component: VirtualDatasetDetailsComponent;
  let fixture: ComponentFixture<VirtualDatasetDetailsComponent>;
  let router: Router;
  let virtualDatasetService: VirtualDatasetService;
  let transientService: TransientService;
  let sharedService: SharedServiceService;
  const mockMatSnackBar = {
    open: jasmine.createSpy('open')
  };
  const routeParams = { id: '1005' };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [VirtualDatasetDetailsComponent],
      imports: [AppMaterialModuleForSpec, HttpClientTestingModule, RouterTestingModule, SharedModule,
        RouterTestingModule.withRoutes([{ path: 'home/list/vd/:id/edit', component: CreateVirtualDatasetComponent }]),
      ],
      providers: [
        { provide: ActivatedRoute, useValue: { params: of(routeParams) } },
        {
          provide: MatSnackBar,
          useValue: mockMatSnackBar
        },
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VirtualDatasetDetailsComponent);
    component = fixture.componentInstance;
    virtualDatasetService = fixture.debugElement.injector.get(VirtualDatasetService);
    transientService = fixture.debugElement.injector.get(TransientService);
    sharedService = fixture.debugElement.injector.get(SharedServiceService);
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit(), should call ngOnInit', (() => {
    spyOn(component, 'getVirtualDatasetDetailsByVdId');
    spyOn(virtualDatasetService, 'getVirtualDatasetDetailsByVdId').withArgs(undefined).and.returnValue(of());
    component.ngOnInit();
    expect(component.getVirtualDatasetDetailsByVdId).toHaveBeenCalled();
  }));

  it('getVirtualDatasetDetailsByVdId(), should call service for get schema details', async(() => {
    const vdId = '23472538';
    const virtualDatasetDetails = new VirtualDatasetDetails();
    component.vdId = vdId;
    spyOn(virtualDatasetService, 'getVirtualDatasetDetailsByVdId').withArgs(vdId).and.returnValue(of(virtualDatasetDetails));

    component.getVirtualDatasetDetailsByVdId(vdId);

    expect(virtualDatasetService.getVirtualDatasetDetailsByVdId).toHaveBeenCalledWith(vdId);
  }));

  it('getVirtualDatasetDetailsByVdId(), should throw error', async(() => {
    const vdId = '23472538';
    component.vdId = vdId;
    spyOn(virtualDatasetService, 'getVirtualDatasetDetailsByVdId').withArgs(vdId).and.returnValue(throwError('Something went wrong while getting details.'));

    component.getVirtualDatasetDetailsByVdId(vdId);

    expect(virtualDatasetService.getVirtualDatasetDetailsByVdId).toHaveBeenCalledWith(vdId);
  }));

  it('Should render edit dataset button', () => {
    component.vdId = '1005';
    component.virtualDatasetDetails = null;
    fixture.detectChanges();
    const ele = fixture.debugElement.query(By.css('.edit-dataset-button'))
    expect(ele).toBeTruthy();
  });

  it('Should render cog icon', () => {
    spyOn(component, 'editDataset').and.callThrough();
    component.vdId = '1005';
    component.virtualDatasetDetails = null;
    fixture.detectChanges();
    const ele = fixture.debugElement.query(By.css('.cog-icon'))
    expect(ele).toBeTruthy();
  });


  it('editDataset(), should navigate', async(() => {
    component.vdId = '1005';
    spyOn(router, 'navigate');
    component.editDataset(component.vdId);
    expect(router.navigate).toHaveBeenCalled();
  }));

  it('should render delete button inside action', async(() => {
    component.virtualDatasetDetails = new VirtualDatasetDetails();
    component.virtualDatasetDetails.vdId = '1005';
    component.ngOnInit();
    fixture.detectChanges();
    const ellipseButtonElement = fixture.debugElement.query(By.css('.ellipsis-icon')).nativeElement;
    ellipseButtonElement.click();
    const ele = fixture.debugElement.query(By.css('.navigation-menu')).nativeElement;
    expect(ele).toBeTruthy();
  }));

  it('deleteVirtualDataset() shoud delete virtual dataset after confirm box displayed', async () => {
    const vdId = '332526634';
    component.virtualDatasetDetails = new VirtualDatasetDetails();
    component.virtualDatasetDetails.vdId = vdId;

    spyOn(transientService, 'confirm').and.callFake((a, b) => b('yes'));
    spyOn(sharedService, 'setViewDetailsData');
    spyOn(virtualDatasetService, 'deleteVirtualDataset').withArgs(vdId).and.returnValues(of(true));

    component.deleteVirtualDataset(component.virtualDatasetDetails);
    expect(transientService.confirm).toHaveBeenCalled();
    expect(mockMatSnackBar.open).toHaveBeenCalled();
  });

  it('deleteVirtualDataset() shoud throw error', async () => {
    const vdId = '332526634';
    component.virtualDatasetDetails = new VirtualDatasetDetails();
    component.virtualDatasetDetails.vdId = vdId;
    spyOn(transientService, 'confirm').and.callFake((a, b) => b('yes'));
    spyOn(virtualDatasetService, 'deleteVirtualDataset').withArgs(vdId).and.returnValues(throwError('Something went wrong while getting details.'));
    component.deleteVirtualDataset(component.virtualDatasetDetails);
    expect(transientService.confirm).toHaveBeenCalled();
    expect(mockMatSnackBar.open).toHaveBeenCalled();
  });

  it('ngOnDestroy()', () => {
    component.ngOnDestroy();
    expect(component.ngOnDestroy).toBeTruthy();
  });

});
