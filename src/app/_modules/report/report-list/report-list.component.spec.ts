import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportListComponent } from './report-list.component';
import { BreadcrumbComponent } from '../../shared/_components/breadcrumb/breadcrumb.component';
import { HttpClientModule } from '@angular/common/http';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { AddTileComponent } from '@modules/shared/_components/add-tile/add-tile.component';
import { SharedModule } from '@modules/shared/shared.module';

describe('ReportListComponent', () => {
  let component: ReportListComponent;
  let fixture: ComponentFixture<ReportListComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportListComponent, BreadcrumbComponent, AddTileComponent ],
      imports:[ HttpClientModule, AppMaterialModuleForSpec, SharedModule],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // it(`reportsList(), get report service`,async(()=>{
  //  const returnData: ReportList[] = [];
  //  component.roleId = 'AD';
  //  component.plantCode = '0';
  //  spyOn(reportService,'reportList').withArgs(component.plantCode, component.roleId).and.returnValue(of(returnData));
  //  component.reportsList();
  //  expect(reportService.reportList).toHaveBeenCalledWith(component.plantCode, component.roleId);
  // }));

  // it('delete(), should delete the report', async(() => {
  //   const reportId = '8756787'
  //   spyOn(reportService,'deleteReport').withArgs(reportId).and.returnValue(of(true));
  //   component.delete(reportId);
  //   expect(reportService.deleteReport).toHaveBeenCalledWith(reportId);
  // }));
});
