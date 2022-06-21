import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Rules } from '@models/dependencyRules';
import { RuleTypes } from '@models/list-page/listpage';
import { RuleService } from '@services/rule/rule.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, take, takeUntil } from 'rxjs/operators';
@Component({
  selector: 'pros-list-dependency-rule',
  templateUrl: './list-dependency-rule.component.html',
  styleUrls: ['./list-dependency-rule.component.scss'],
})
export class ListDependencyRuleComponent implements OnInit, OnDestroy {
/**
 * menu for creating new or use existing
 */
  ruleTypes = RuleTypes;
  /**
   * Current ModuleId where we are working
   */
  moduleId: string;
  /**
   * List of rules in side menu
   */
  RulesList:Rules[]=[];
  /**
   * Form control for renaming the rule
   */
  unsubscribeAll$: Subject<boolean> = new Subject<boolean>();
  /**
   * rules search string
   */
  fieldsSearchString:string;
  /**
   * Form control for searching the rule
   */
  globalSearchControl: FormControl = new FormControl('');
  /**
   * selected group Id
   */
  groupId:string;
  /**
   * ruletitle
   */
  ruleTitle:string;
  /**
   * input mode id for renaming the rule to show which input to show when user rename a specific rule
   */
  InputModeId:any;
  activeLink: string;
  constructor(
    private router: Router,private activatedRouter: ActivatedRoute,
    private ruleService:RuleService,
    public snackBar: MatSnackBar
  ) {
  }
  ngOnInit(): void {
    this.fieldsSearchString='';
    this.activatedRouter.params.pipe(takeUntil(this.unsubscribeAll$)).subscribe((params) => {
      this.moduleId=params.moduleId;
    });
    this.CheckEmptyRules();
    this.globalSearchControl.valueChanges.pipe(
      takeUntil(this.unsubscribeAll$),
      debounceTime(1),
      distinctUntilChanged()
      ).subscribe(searchTxt => {
        this.RulesList.length=0;
        this.fieldsSearchString=searchTxt;
        this.getAllRules();
    });
  }
  navigate(link,moduleId,groupId,ruleTitle){
       this.router.navigate([link]);
  }
  setGroupId(groupId,ruleText){
      this.groupId=groupId;
      this.ruleTitle=ruleText;
  }
  AddDefaultRule(){
    this.ruleTitle='Rule 1'
    const body = {
      description: this.ruleTitle,
      priority: 1111,
      source:[],
      target: []
    }
    this.ruleService.saveModuleRules(this.moduleId,body).pipe(take(1)).subscribe((resp)=>{
      this.RulesList.push({
        description:this.ruleTitle,
        status:'ACTIVE',
        uuid:'',
        groupId:resp.groupId,
        moduleId:this.moduleId,
      })
       this.groupId=resp.groupId;
       this.router.navigate([`rule/${this.moduleId}/${this.groupId}/${this.ruleTitle}`], {
         relativeTo: this.activatedRouter,
         queryParamsHandling: 'preserve',
         preserveFragment: true,
       });
    })
  }
  CheckEmptyRules(){
    const body={
      pageInfo: {
        pageNumer: 0,
        pageSize: 10
      },
      searchString: this.fieldsSearchString
    }
   this.ruleService.getModuleRules(this.moduleId,body).pipe(take(1)).subscribe((resp)=>{
        if(resp.response.content.length===0){
          this.RulesList.length=0;
          this.AddDefaultRule();
        }
        else{
          this.RulesList.length=0;
          resp.response.content.map((row)=>{
            this.RulesList.push({
              description:row.description,
              status:row.status,
              uuid:row.uuid,
              groupId:row.groupId,
              moduleId:row.moduleId,
            });
          })
          this.ruleTitle=this.RulesList[0].description;
          this.groupId=this.RulesList[0].groupId;
          this.router.navigate([`rule/${this.moduleId}/${this.groupId}/${this.ruleTitle}`], {
            relativeTo: this.activatedRouter,
            queryParamsHandling: 'preserve',
            preserveFragment: true,
          });
        }
   },(error)=>{
   })
  }
  afterBlur(event){
  }
  NameChanged(groupId){
    const newName=  (document.getElementById(groupId+'_input') as HTMLInputElement).value;
    let body;
    this.RulesList.map((row,i)=>{
      if (row.groupId===groupId) {
        if(row.description!==newName){
          body={
            uuid: row.uuid,
            groupId: row.groupId,
            moduleId: row.moduleId,
            status: row.status,
            description: newName
          }
          this.ruleService.updateRulesmetaData(body).pipe(take(1)).subscribe((resp)=>{
            if(this.groupId===groupId){
              this.router.navigate(['rule/' + this.moduleId + '/' + this.groupId + '/' + newName], {
                relativeTo: this.activatedRouter,
                queryParamsHandling: 'preserve',
                preserveFragment: true,
              });
            }
            this.getAllRules();
          },(error)=>{
            if (error.status===404) {
            }else{
              this.snackBar.open('Error updating the name', 'okay', {
                duration: 1000
              })
            }
          });
        }
        this.InputModeId=0;
      }
    })

  }
  addNewRule(){
    this.AddDefaultRule();
  }
  setRenameModeOn(groupId){
      this.InputModeId=groupId;
  }
  getAllRules(){
    const body={
      pageInfo: {
        pageNumer: 0,
        pageSize: 10
      },
      searchString: this.fieldsSearchString
    }
    this.ruleService.getModuleRules(this.moduleId,body).pipe(take(1)).subscribe((resp)=>{
      console.log('rules:',resp.response.content);
        this.RulesList.length=0;
         resp.response.content.map((row)=>{
               this.RulesList.push({
                 description:row.description,
                 status:row.status,
                 uuid:row.uuid,
                 groupId:row.groupId,
                 moduleId:row.moduleId,
               });
         })
     })
  }

  /**
   * close the sidesheet and navigate to the edit form page
   */
  close() {
    let urlTree = this.router.parseUrl(this.router.url);
    delete urlTree?.root?.children.sb3;
    delete urlTree?.root?.children?.outer;
    this.router.navigateByUrl(urlTree);
  }

  removeRules(groupId){
    this.ruleService.deleteGroup(groupId).pipe(take(1)).subscribe((resp)=>{
        this.snackBar.open('Removed Successfully!', 'okay', {
          duration: 2000
        })
        this.CheckEmptyRules();
     },(error)=>{
      if (error.status===404) {
        this.snackBar.open('Rule no found!', 'okay', {
          duration: 2000
        })
      }else{
      }
    })
  }

  afterClick(event) {

  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next(true);
    this.unsubscribeAll$.unsubscribe();
  }
}
