import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { LayoutTabResponse, MDORECORDESV3, LayoutFieldsResponse, FieldValueV2 } from '@modules/report/_models/widget';
import { MatAccordion } from '@angular/material/expansion';
import { WidgetService } from '@services/widgets/widget.service';
import { BehaviorSubject } from 'rxjs';
import { EndpointService } from '@services/endpoint.service';
import { UserService } from '@services/user/userservice.service';
import { Userdetails } from '@models/userdetails';

@Component({
  selector: 'pros-summary-tabs',
  templateUrl: './summary-tabs.component.html',
  styleUrls: ['./summary-tabs.component.scss']
})
export class SummaryTabsComponent implements OnInit {

  constructor(
    private widgetService:WidgetService,
    private endPointService:EndpointService,
    private userService:UserService
  ) { }

  @Input()
  metadata: LayoutTabResponse;

  @Input()
  data: MDORECORDESV3;

  @ViewChild(MatAccordion) accordion: MatAccordion;

  attachmentResponse: BehaviorSubject<any[]> = new BehaviorSubject<any[]>(null);

  /**
   * SET PROPERTY HELP TEXT FOR INPUT
   */
  isHelpIcon = false;

  /**
   * SET PROPERTY READ ONLY FOR INPUT
   */
  isReadOnly = true;

  /**
   * FLAG USED TO SET ALL FIELDSLIST VALUE
   */
  dataAllSet = false;

  attachMentData = new Object();

  tabsnosList = new Array();

  panelOpenState = false;

  dateFormat: string;

  userDetails: Userdetails = new Userdetails();

  ngOnInit(): void {
    this.preparedata();
    this.attachmentResponse.subscribe(data=>{
      if(data != null && this.metadata){
        this.metadata.fieldsList.forEach(fieldlist=>{
          if(fieldlist.picklist === 28){
            data.forEach(att=>{
              if(att.stringSno === fieldlist.value){
                fieldlist.value = att.fileName;
              }
            });
          }
      });
      }
    });

    this.userService.getUserDetails().subscribe(res => {
      this.userDetails = res;
    }, error => console.error(`Error : ${error.message}`));

    this.getDateTimeFormat();
  }

  preparedata():void{
    this.metadata.fieldsList.forEach(fieldlist=>{
        fieldlist.value = this.findValueofField(fieldlist);
        fieldlist.showMore = false ;
    });
    if(this.metadata && this.metadata.fieldsList.length === 1 && this.metadata.fieldsList[0].picklist===15){
        // GRID TAB NOT SHOW NOW
        this.dataAllSet = false;
    }else{
      this.dataAllSet = true;
    }
    // Call TO Find all attchment Type fields for each-TAB
    if(this.tabsnosList.length > 0){
      this.getAttachmentDetails(this.tabsnosList);
    }
  }

  findValueofField(fieldMetadata : LayoutFieldsResponse):string{
      let returnValue = '';
      const fieldData:FieldValueV2 = this.data.hdvs[fieldMetadata.fieldId];
     if(fieldData !== undefined){
      fieldData.vc.forEach(vcVal=>{
        returnValue += vcVal.c;
        switch (fieldMetadata.picklist){

            case 1:                   // Drop-down Case
              if(fieldMetadata.dispCriteria ===0 && vcVal.t !== undefined && vcVal.t !==''){
              returnValue += ' -- '+vcVal.t;
              }else if(fieldMetadata.dispCriteria ===2 && vcVal.t !== undefined && vcVal.t !==''){
                returnValue = vcVal.t;
              }
            break;

            case 28:                   // Attachment Case
              this.attachMentData[fieldMetadata.fieldId] = returnValue;
              this.tabsnosList.push(returnValue);
              fieldMetadata.sno = returnValue;
              break;

              case 2:                   // Check-Box Case
              if(vcVal.c === 'on'){
                returnValue = 'false';
              }else if(vcVal.c === 'off'){
                returnValue = 'true';
              }
              break;

              case 30:
                if(fieldMetadata.dispCriteria ===0 && vcVal.t !== undefined && vcVal.t !==''){
                  returnValue += ' -- '+vcVal.t;
                }else if(fieldMetadata.dispCriteria ===2 && vcVal.t !== undefined && vcVal.t !==''){
                  returnValue = vcVal.t;
                }
              break;

              default:
                if(vcVal.t) {
                  returnValue = vcVal.t;
                }
                break;
      }
      returnValue+=' , ';
      });
    }
      returnValue = returnValue !== '' ?returnValue.slice(0,returnValue.length-3):returnValue;
       return returnValue;
  }

  getAttachmentDetails(snos: string[]):void{
      this.widgetService.getAttachmentData(snos).subscribe(data=>{
        console.log(data);
        this.attachmentResponse.next(data);
      },error=>console.error(`Error : ${error}`));
  }

  downloadAttachment(metadata : LayoutFieldsResponse):void{
    const link = document.createElement('a');
    link.target = '_blank';
    link.href = this.endPointService.downloadAttachment(metadata.sno);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  setDynamicHeight() {
    return '56px'
  }

  truncateText(text, maxLength){
    return text.length > maxLength ?
           text.toString().substr(0, maxLength) + '...' :
           text;
  }

  public getDateTimeFormat(){
    if (this.userDetails){
      switch(this.userDetails.dateformat){
        case 'mm.dd.yy':
          this.dateFormat = 'MM.dd.yyyy, h:mm:ss a';
          break;

        case 'dd.MM.yy':
         this.dateFormat = 'dd.MM.yyyy, h:mm:ss a';
          break;

        case 'dd M, yy':
          this.dateFormat = 'dd MMM, yyyy, h:mm:ss a';
          break;

        case 'MM d, yy':
          this.dateFormat = 'MMMM d, yyyy, h:mm:ss a';
          break;

        default:
          break;
    }
    }
  }

}
