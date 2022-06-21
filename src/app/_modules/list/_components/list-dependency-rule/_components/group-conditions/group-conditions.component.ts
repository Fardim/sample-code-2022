import { Component, Inject, Input, LOCALE_ID, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router, UrlSegment, UrlSegmentGroup, UrlTree } from '@angular/router';
import { DependencyRuleService } from '@services/dependency-rule.service';
import { RuleService } from '@services/rule/rule.service';
import {  MappingObject } from '@models/list-page/listpage';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'pros-group-conditions',
  templateUrl: './group-conditions.component.html',
  styleUrls: ['./group-conditions.component.scss']
})
export class GroupConditionsComponent implements OnInit {
  @Input() blockCtrl: FormGroup;
  SourceSelectedOptions=[];
  // source selected options on previouse page
  sourceObject={};
  // target selected options on previouse page
  targetObject={};
  /**
   * Icons Mapping Object against the property
   */
  MappingObject=MappingObject;
  /**
   * current Module Id where we are working
   */
  moduleId='';
  /**
   * dropdowns against the picklist
   */
  dropdowns=[];
  /**
   * containing fieldnames against the ids
   */
  fieldNames={};
  /**
   * flag for cheking if source is empty
   */
  sourceisEmpty=true;
  /**
   * flag for cheking if source is empty
   */
  targetisEmpty=true;
  /**
   * Current Group Id where we are working
   */
  groupId='';
  /**
   * Current rule title where we are working
   */
  ruleTitle='';
  /**
   * Mapping Id in case of editing the conditions
   */
  mappingId;
  constructor( private router: Router,private _dependencyService:DependencyRuleService,private activatedRouter: ActivatedRoute,@Inject(LOCALE_ID) public locale: string,
  private ruleService:RuleService, public snackBar: MatSnackBar) {
    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
  }
  SetValues(fieldId,value){
       this.targetObject[fieldId].property=value;
  }
  setasDefault(event,fieldId){
    this.targetObject[fieldId].isDefault=event;

  }
  settargetValueCondition(event,fieldId){
    this.targetObject[fieldId].code=event.target.value;
  }
  settSourceValueCondition(event,fieldId){
    this.sourceObject[fieldId].code=event.target.value;
  }
  getDropDownofPickList(field){
    const body={
      parent: {
      },
      searchString: ''
    }
    this.ruleService.getDropdownOfPickList(this.moduleId, field,this.locale,body).subscribe((resp) => {
      resp.content.map(row=>{
        this.dropdowns.push({
          fieldId:field,
          code:row.code,
          text:row.text,
          textRef:row.textRef
        });
      })
    },(error)=>{
         if (error.status===404) {
              this.dropdowns.push({
                fieldId:field,
                code:'*',
                text:'Any Value',
                textRef:'',
              });
         }
    })
  }
  getFieldDetails(FieldID){
    this.ruleService.getFieldDettails(this.moduleId,FieldID).subscribe((resp) => {
      this.fieldNames[FieldID]=resp.shortText[this.locale].description;
      if (resp.pickList==='1' || resp.pickList==='4') {
            this.getDropDownofPickList(FieldID);
      }
    });
  }

  isEmptyObject(obj) {
    return (obj && (Object.keys(obj).length === 0));
  }
  ngOnInit(): void {
    const sourceKey='source';
    const targetKey='target';
    this.activatedRouter.params.subscribe((params) => {
      this.moduleId=params.moduleId;
      this.groupId=params.groupId;
      this.ruleTitle=params.ruleTitle;
      if (params.mappingId) {
         this.mappingId=params.mappingId;
         this.ruleService.getGroupConditionByMappingId(this.groupId,this.mappingId,this.locale).subscribe((res)=>{
           const sourceFields={};
           const targetFields={};
           res.response.conditions.map(row => {
             this.targetisEmpty=false;
             this.sourceisEmpty=false;
            if(sourceFields[row.sourceField]===null ||sourceFields[row.sourceField]===undefined){
                sourceFields[row.sourceField] = {
                  code: row.sourceValue,
                  text: row.sourceValueText,
                  textRef: '',
                }
            }
            if(targetFields[row.targetField]===null ||targetFields[row.targetField]===undefined){
              targetFields[row.targetField] = {
                code: row.targetValue,
                text: row.targetValueText,
                textRef: '',
                property: row.propertyKey,
                isDefault: row.targetIsDefault,
              }
            }
          })
          this.sourceObject=sourceFields;
          this.targetObject=targetFields;
          for (const key in this.sourceObject) {
            if (key) {
              this.getFieldDetails(key);
            }
          }
          for (const key in this.targetObject) {
            if (key) {
              this.getFieldDetails(key);
            }
          }
         })
      }
      else {
        this.SourceSelectedOptions=this._dependencyService.getOption().soruceSelectedOptions;
        this.sourceObject = this.SourceSelectedOptions[sourceKey];
        this.targetObject = this.SourceSelectedOptions[targetKey];
        for (const key in this.sourceObject) {
          if (key) {
            this.sourceisEmpty=false;
            this.getFieldDetails(key);
          }
        }
        for (const key in this.targetObject) {
          if (key) {
            this.targetisEmpty=false;
            this.getFieldDetails(key);
          }
        }
      }
    });
    this.MappingObject=this.MappingObject;
  }
  close(){
    const urlTree: UrlTree = this.router.parseUrl(this.router.url);
    urlTree.root.children = {
      ...urlTree.root.children,
      sb3: new UrlSegmentGroup([
        new UrlSegment(`sb3`, {}),
        new UrlSegment(`dependency-rule`, {}),
        new UrlSegment(`${this.moduleId}`, {}),
      ], {}),
    }
    this.router.navigateByUrl(urlTree);
  }
  save(){
    if(Object.keys(this.sourceObject).length!==0 || Object.keys(this.targetObject).length!==0 ){
      const bodyarray=[];
      bodyarray.push({
        mappingId: this.mappingId,
        source:this.sourceObject,
        target:this.targetObject
      });
      if(this.mappingId === 0){
        delete bodyarray[0].mappingId;
      }
      this.ruleService.saveGroupConditions(this.moduleId,this.groupId,this.locale,bodyarray).subscribe
      ((resp)=>{
        this._dependencyService.loadingSubject.next(true)
        this.close();
      },
      (error)=>{
        this.snackBar.open('error saving the Conditions', 'okay', {
          duration: 1000
        });
      })
    }
    else{
      this.router.navigate([{ outlets: { outer: null } }], { queryParamsHandling: 'preserve' });
    }
  }
  sourceCodeselected(event){
    const codeText=event.option.value.split(',');
    console.log(event,codeText);
    (document.getElementById(codeText[2]) as HTMLInputElement).value=codeText[1];
    this.sourceObject[codeText[2]].code=codeText[0];
    this.sourceObject[codeText[2]].text=codeText[1];
    this.sourceObject[codeText[2]].textRef=codeText[3];
  }
  targetCodeselected(event){
    const codeText=event.option.value.split(',');
    console.log(event,codeText);
    (document.getElementById(codeText[2]) as HTMLInputElement).value=codeText[1];
    this.targetObject[codeText[2]].code=codeText[0];
    this.targetObject[codeText[2]].text=codeText[1];
    this.targetObject[codeText[2]].textRef=codeText[3];
  }

}
