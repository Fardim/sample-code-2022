import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryTabsComponent } from './summary-tabs.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { LayoutFieldsResponse, LayoutTabResponse, MDORECORDESV3, FieldValueV2, FieldCodeText } from '@modules/report/_models/widget';
import { WidgetService } from '@services/widgets/widget.service';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { SharedModule } from '@modules/shared/shared.module';
import { Userdetails } from '@models/userdetails';

describe('SummaryTabsComponent', () => {
  let component: SummaryTabsComponent;
  let fixture: ComponentFixture<SummaryTabsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SummaryTabsComponent ],
      imports:[HttpClientTestingModule, AppMaterialModuleForSpec, RouterTestingModule, SharedModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SummaryTabsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('preparedata(),  preparedata', ()=>{
    const listofFields :LayoutFieldsResponse[] = new Array();
    const Fields :LayoutFieldsResponse = {tcode:123,fieldId:'abc',fieldDescri:'abc desc',dataType:'CHAR',picklist:1,dispCriteria:0,strucId:'',mandatory:true,hidden:true,isCheckList:true,maxChar:0,dependency:'',parentField:'',locType:'',refField:'',textAreaLength:20,textAreaWidth:10,value:'',sno:''};
    listofFields.push(Fields);
    const metadata :LayoutTabResponse = {tabCode:'123',tabDesc:'Tab',headerType:'N',helpLink:'',refParentObjectId:'',fieldsList:listofFields};
    component.metadata = metadata;
    const vcT : FieldCodeText ={c:'12',t:'12',p:'12'};
    const vctList : FieldCodeText[] = new Array();
    vctList.push(vcT);
    const ocT : FieldCodeText ={c:'12',t:'12',p:'12'};
    const octList : FieldCodeText[] = new Array();
    octList.push(ocT);
    const fv2 : FieldValueV2 = {fId:'abc',vc:vctList,oc:octList,ls:''};
    const data : MDORECORDESV3 = { id : '12345',stat:'INP',hdvs:{string:fv2}};
    component.data = data;

    const output :string = component.findValueofField(Fields);
    expect(output).toEqual('');

  });

  it('getAttachmentDetails(), get AttachmentDetails', async(()=>{
    const service = fixture.debugElement.injector.get(WidgetService);
    const snos :string[] = new Array();
    snos.push('113131331');
    const data : any = {};
    spyOn(service,'getAttachmentData').withArgs(snos).and.returnValue(of(data));

    component.getAttachmentDetails(snos);

    expect(service.getAttachmentData).toHaveBeenCalledWith(snos);
  }));

  it('should truncate the text', () => {
    const text = 'field value';
    const result = component.truncateText(text,5);
    expect(result.length).toEqual(8);

    const result2 = component.truncateText(text,50);
    expect(result2.length).toEqual(11);
  })


  it('getDateTimeFormat()', async(() => {
    component.userDetails = { dateformat: 'mm.dd.yy' } as Userdetails;
    component.getDateTimeFormat();
    expect(component.dateFormat).toEqual('MM.dd.yyyy, h:mm:ss a');

    component.userDetails = { dateformat: 'dd.MM.yy' } as Userdetails;
    component.getDateTimeFormat();
    expect(component.dateFormat).toEqual('dd.MM.yyyy, h:mm:ss a');

    component.userDetails = { dateformat: 'dd M, yy' } as Userdetails;
    component.getDateTimeFormat();
    expect(component.dateFormat).toEqual('dd MMM, yyyy, h:mm:ss a');

    component.userDetails = { dateformat: 'MM d, yy' } as Userdetails;
    component.getDateTimeFormat();
    expect(component.dateFormat).toEqual('MMMM d, yyyy, h:mm:ss a');
  }));
});
