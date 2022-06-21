import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { MdoUiLibraryModule } from 'mdo-ui-library';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { PayloadTestExpansionViewComponent } from './payload-test-expansion-view.component';

describe('PayloadTestExpansionViewComponent', () => {
  let component: PayloadTestExpansionViewComponent;
  let fixture: ComponentFixture<PayloadTestExpansionViewComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PayloadTestExpansionViewComponent ],
      imports:  [ SharedModule, RouterTestingModule, AppMaterialModuleForSpec, MdoUiLibraryModule ],
      providers: [
        {
          provide: MatDialogRef,
          useValue: mockDialogRef
        }, { provide: MAT_DIALOG_DATA, useValue: {elementTableRowData: {column1: '1',column2: '2'}}
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PayloadTestExpansionViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit(), add tabledata', () => {
    component.elementData = {column1: '1',column2: '2'};
    component.ngOnInit();
    expect(component.tableData).toEqual([
      {
        columnName: 'column1',
        value: '1'
      },
      {
        columnName: 'column2',
        value: '2'
      }
    ])
  })
});
