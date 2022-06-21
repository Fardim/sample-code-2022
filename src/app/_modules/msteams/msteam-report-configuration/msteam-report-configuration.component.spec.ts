import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import * as microsoftTeams from '@microsoft/teams-js';
import { MsteamsConfigService } from '../_service/msteams-config.service';

import { MsteamReportConfigurationComponent, Report } from './msteam-report-configuration.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { of } from 'rxjs';
import { SharedModule } from '@modules/shared/shared.module';

describe('MsteamReportConfigurationComponent', () => {
  let component: MsteamReportConfigurationComponent;
  let fixture: ComponentFixture<MsteamReportConfigurationComponent>;
  let msteamsConfigService: jasmine.SpyObj<MsteamsConfigService>;


  beforeEach(async(() => {
    const spyObj = jasmine.createSpyObj('MsteamsConfigService', ['getReportUrlList']);
    TestBed.configureTestingModule({
      declarations: [ MsteamReportConfigurationComponent ],
      imports:[HttpClientTestingModule, AppMaterialModuleForSpec, SharedModule],
      providers:[
        {provide: MsteamsConfigService, useValue: spyObj}
      ]
    })
    .compileComponents();
    msteamsConfigService = TestBed.inject(MsteamsConfigService) as jasmine.SpyObj<MsteamsConfigService>;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MsteamReportConfigurationComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnIt(), should be test with pre required ',async(()=>{
      spyOn(microsoftTeams, 'initialize').and.callFake(() => {
        return '';
      });
      spyOn(microsoftTeams.settings, 'registerOnSaveHandler').and.callFake(() => {
        return '';
      });
      spyOn(microsoftTeams.settings, 'setValidityState').and.callFake(() => {
        return '';
      });
      const returnData: Report[] = [{reportId: '1', reportName: 'Test Name', reportUrl: 'url test'}];
      msteamsConfigService.getReportUrlList.and.returnValue(of(returnData));
      component.ngOnInit();
      expect(component.ngOnInit).toBeTruthy();
  }));

  it('getReportUrls(), get report list', async(() => {
    spyOn(microsoftTeams.settings, 'setValidityState').and.callFake(() => {
      return '';
    });
    const returnData: Report[] = [{reportId: '1', reportName: 'Test Name', reportUrl: 'url test'}];
    msteamsConfigService.getReportUrlList.and.returnValue(of(returnData));
    component.getReportUrls();
    expect(msteamsConfigService.getReportUrlList).toHaveBeenCalled();
  }))


  it('setValidity(), should call set validity of MS teams', async(() => {
    spyOn(microsoftTeams.settings, 'setValidityState').and.callFake(() => {
      return '';
    });
    expect(component.setValidity).toBeTruthy();
  }));

  it('createTabUrl(), should return selected tab url', async(() => {
    component.reportListSelected = {reportName:'Test',reportId:'3223',reportUrl:'test'};
    expect(component.createTabUrl()).toEqual(component.reportListSelected.reportUrl);
  }))

  it('getDisplayName(), should return display name for Microsoft Teams Tab', async(() => {
    component.reportListSelected = {reportName:'Test',reportId:'3223',reportUrl:'test'};
    expect(component.getDisplayName()).toEqual(component.reportListSelected.reportName);
  }))

  // it('radioChange() should set the false for save button in MS Teams App', async(() => {
  //   spyOn(microsoftTeams.settings, 'setValidityState').and.callFake(() => {
  //     return '';
  //   });
  //   component.reportListSelected = 'TEST';
  //   component.customUrl = 'some url';
  //   component.radioChange('1');
  //   expect(component.selectedOption).toEqual('1');

  //   component.radioChange('2');
  //   expect(component.selectedOption).toEqual('2');

  //   component.customUrl = null;
  //   component.reportListSelected = null;
  //   component.radioChange('1');
  //   expect(component.selectedOption).toEqual('1');

  //   component.radioChange('2');
  //   expect(component.selectedOption).toEqual('2');
  // }))

  // it('onSelectUrlChange(), should set true for validity', async(() => {
  //   spyOn(microsoftTeams.settings, 'setValidityState').and.callFake(() => {
  //     return '';
  //   });
  //   component.selectedOption = '1';
  //   component.radioOptions = [{optionId: '1', optionName: 'Select url'}, {optionId: '2', optionName: 'Custom url'}];
  //   component.reportListSelected = 'some report';
  //   component.onSelectUrlChange();
  //   expect(component.onSelectUrlChange).toBeTruthy();

  //   component.selectedOption = '1';
  //   component.reportListSelected = null;
  //   component.onSelectUrlChange();
  //   expect(component.onSelectUrlChange).toBeTruthy();

  //   component.selectedOption = '3';
  //   component.onSelectUrlChange();
  //   expect(component.onSelectUrlChange).toBeTruthy();
  // }))

  // it('onCustomUrlChange(), should set true for validity', async(() => {
  //   spyOn(microsoftTeams.settings, 'setValidityState').and.callFake(() => {
  //     return '';
  //   });
  //   component.selectedOption = '2';
  //   component.customUrl = 'some url';
  //   component.radioOptions = [{optionId: '1', optionName: 'Select url'}, {optionId: '2', optionName: 'Custom url'}];
  //   component.onCustomUrlChange();
  //   expect(component.onCustomUrlChange).toBeTruthy();

  //   component.selectedOption = '2';
  //   component.customUrl = null;
  //   component.onCustomUrlChange();
  //   expect(component.onCustomUrlChange).toBeTruthy();

  //   component.selectedOption = '3';
  //   component.onCustomUrlChange();
  //   expect(component.onCustomUrlChange).toBeTruthy();
  // }))
});
