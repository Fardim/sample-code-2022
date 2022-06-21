import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import * as microsoftTeams from '@microsoft/teams-js';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MsteamsConfigService } from '../_service/msteams-config.service';

export class Report {
  reportId: string;
  reportName: string;
  reportUrl: string;
}

@Component({
  selector: 'pros-msteam-report-configuration',
  templateUrl: './msteam-report-configuration.component.html',
  styleUrls: ['./msteam-report-configuration.component.scss']
})
export class MsteamReportConfigurationComponent implements OnInit {

  constructor(
    private msteamsConfigService: MsteamsConfigService,
    private sharedServices: SharedServiceService,
    @Inject(LOCALE_ID) public locale: string
  ) {
    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
  }


  /**
   * Just hold the selected report info ...
   */
  reportListSelected: Report;


  /**
   * Formcontrol for the report name filter
   */
  reportCtrl: FormControl = new FormControl('');

  /**
   * Get the report list ...
   */
  reportList: Report[] = [];

  ngOnInit(): void {
      microsoftTeams.initialize();
      const vm = this;
      // Save configuration changes
      microsoftTeams.settings.registerOnSaveHandler(saveEvent => {
        microsoftTeams.settings.setSettings({
          contentUrl: vm.createTabUrl(), // Mandatory parameter
          entityId: vm.createTabUrl(), // Mandatory parameter
          suggestedDisplayName: vm.getDisplayName()
        });
        saveEvent.notifySuccess();
      });
    // Get list of report urls from MDO
    this.getReportUrls();

    this.sharedServices.setIsFromMsTeamLogedIn(true);

    this.reportCtrl.valueChanges.pipe(distinctUntilChanged(), debounceTime(200)).subscribe(f=>{
       this.getReportUrls(f);
    });
  }

 // Get list of report urls from MDO
  getReportUrls(s?: string){
    this.msteamsConfigService.getReportUrlList(this.locale, s).subscribe(res=>{
      this.reportList = res ? res : [];
      // res.forEach(r=>{
      //   this.reportList.push({reportId:r.reportId,reportName:r.reportName, reportUrl: r.reportUrl.replace('null/fuze/ngx-mdo/index.html#/nonav/report/dashboard/',`https://598e-2409-4050-e11-bcc8-683a-fc90-e5f9-311a.ngrok.io/#/nonav/report/view/`)});
      // })

    },error=>console.error(`Error : ${error}`));
  }


  /**
   * Enable save button of MS Teams App configuration page once everyting is set/valid
   * @param isValid will be the params for validate the validity
   */
  setValidity(isValid: boolean){
    microsoftTeams.settings.setValidityState(isValid);
  }

  // Change trigger of Radio options in configuration page
  // radioChange(optionId: string){
  //   this.selectedOption = optionId;
  //   this.setValidity(false);
  //   if(optionId === this.radioOptions[0].optionId){
  //     if(this.reportListSelected){
  //       this.setValidity(true);
  //     }
  //   }
  //   if(optionId === this.radioOptions[1].optionId){
  //     if(this.customUrl){
  //       this.setValidity(true);
  //     }
  //   }
  // }

  /**
   * Create the URL that Microsoft Teams will load in the tab. You can compose any URL even with query strings.
   * @returns Will return the selected report id
   */
  createTabUrl() {
    return this.reportListSelected?.reportUrl;
  }


  /**
   * Display name of the report in MS Teams Tab
   * @returns Will return the reportname ...
   */
  getDisplayName(){
    return this.reportListSelected?.reportName;
  }

  // Enabling save button in MS Teams app on valid select input
  onSelect(evt){
    console.log(evt);
    this.reportListSelected = evt?.option?.value;
    if(evt?.option?.value) {
      if(this.reportListSelected){
        this.setValidity(true);
      }else{
        this.setValidity(false);
      }
    }
  }

  // Enabling save button in MS Teams app on valid custom url input
  // onCustomUrlChange(){
  //   if(this.selectedOption === this.radioOptions[1].optionId){
  //     if(this.customUrl){
  //       this.setValidity(true);
  //     }else{
  //       this.setValidity(false);
  //     }
  //   }
  // }

  /**
   * function to display rule desc in mat auto complete
   */
   displayRuleFn(value?: Report) {
    return value && value.reportName ? value.reportName : null;
  }


}
