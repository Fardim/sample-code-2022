import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { PackageType, PublishToConnekthubComponent } from '@modules/connekthub';
import { SharedModule } from '@modules/shared/shared.module';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { ExportInterfaceComponent } from './export-interface.component';

describe('ExportInterfaceComponent', () => {
  let component: ExportInterfaceComponent;
  let fixture: ComponentFixture<ExportInterfaceComponent>;
  let router: Router;
  let dialogSpy: jasmine.Spy;
  const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of({}), close: null });

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ExportInterfaceComponent],
      imports: [HttpClientTestingModule, RouterTestingModule, AppMaterialModuleForSpec, SharedModule]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportInterfaceComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    dialogSpy = spyOn(TestBed.inject(MatDialog), 'open').and.returnValue(dialogRefSpyObj);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close sidesheet', () => {
    spyOn(router, 'navigate');
    component.close();
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { outer: null } }], { queryParamsHandling: 'preserve' })
  });

  it('should clear selection', () => {
    component.interfaces = new MatTableDataSource<any>([{ id: '1701' }]);
    component.masterToggle();
    expect(component.isAllSelected()).toBeTrue();

    spyOn(component.selection, 'clear');
    component.masterToggle();
    expect(component.selection.clear).toHaveBeenCalled();
  });

  it('export(), open dialog', () => {
    component.interfaces = new MatTableDataSource<any>([{ id: '1701', name: 'Test' }]);
    component.currentConnectionId = '111';
    component.selection.select(...component.interfaces.data);
    component.export();
    const data = {
      id: component.currentConnectionId,
      type: PackageType.SAP_TRANSPORTS,
      name: component.selection.selected[0].name,
      brief: '',
      scenarioIds: component.selection.selected.map(i => i.interfaceId)
    }
    expect(dialogSpy).toHaveBeenCalledWith(PublishToConnekthubComponent, { data: data, disableClose: true, width: '600px', minHeight: '250px', autoFocus: false, minWidth: '765px', panelClass: 'create-master-panel' });
  });
});
