import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { PermissionOn, SchemaCollaborator, SchemaDashboardPermission, UserMdoModel, ROLES, RuleDependentOn } from '@models/collaborator';
import { ObjectType } from '@models/core/coreModel';
import { AddFilterOutput, DataScopeSidesheet, ErrorStateRes } from '@models/schema/schema';
import { SchemaExecutionRequest } from '@models/schema/schema-execution';
import { CategoryInfo, FilterCriteria } from '@models/schema/schemadetailstable';
import { CoreSchemaBrMap, LoadDropValueReq, SchemaListDetails, VariantDetails } from '@models/schema/schemalist';
import { BusinessRuleType, CoreSchemaBrInfo, CreateUpdateSchema, DropDownValue, RULE_TYPES } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { PublishPackage, PackageType, PublishToConnekthubComponent } from '@modules/connekthub';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { CoreService } from '@services/core/core.service';
import { GlobaldialogService } from '@services/globaldialog.service';
import { SchemaService } from '@services/home/schema.service';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { SchemaExecutionService } from '@services/home/schema/schema-execution.service';
import { SchemaVariantService } from '@services/home/schema/schema-variant.service';
import { SchemalistService } from '@services/home/schema/schemalist.service';
import { TransientService } from 'mdo-ui-library';
import { forkJoin, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';


@Component({
  selector: 'pros-schema-summary-sidesheet',
  templateUrl: './schema-summary-sidesheet.component.html',
  styleUrls: ['./schema-summary-sidesheet.component.scss']
})
export class SchemaSummarySidesheetComponent implements OnInit, OnDestroy {

  constructor(
    private activateRoute: ActivatedRoute,
    private router: Router,
    private schemaService: SchemaService,
    private schemaDetailsService: SchemaDetailsService,
    private sharedService: SharedServiceService,
    private schemaListService: SchemalistService,
    private schemaExecutionService: SchemaExecutionService,
    private schemaVariantService: SchemaVariantService,
    private toasterService: TransientService,
    private globalDialogService: GlobaldialogService,
    private transientservice: TransientService,
    private coreService: CoreService,
    private matDialog: MatDialog
  ) { }

  get getBusinessRulesLength(){
    let inn=0;
    const count=this.businessRuleData.map(element=>{
      if(element.dep_rules)
     inn+= element.dep_rules.length;
    }).length
    return count+inn;
  }

  /**
   * module ID of current module
   */
  moduleId: string;

  /**
   * schema ID of current schema
   */
  schemaId: string;

  /**
   * to have subscribers data of schema
   */
  subscriberData: SchemaDashboardPermission[] = [];

  /**
   * To have business rule data of schema
   */
  businessRuleData: CoreSchemaBrInfo[] = [];
  activeTab: string;
  selectedIndex: number;
  category: CategoryInfo[];
  schemaDetails: SchemaListDetails = new SchemaListDetails();
  loadDopValuesFor: LoadDropValueReq;
  collaboratorData: SchemaCollaborator;
  reInilize = true;

  /**
   * To have variant details of a schema
   */
  variantDetails: VariantDetails[] = [];

  /**
   * Outlet name in which side sheet to be opened
   */
  outlet = 'outer';

  /**
   * To hold all business rules information
   */
  allBusinessRulesList: CoreSchemaBrInfo[] = [];

  /**
   * To hold all subscriber information
   */
  allSubscribers: UserMdoModel[] = [];

  /**
   * To hold fetchCount for getting subscriber api
   */
  fetchCount = 0;

  /**
   * To hold check data subscribers details
   */
  checkDataSubscribersData = [];

  /**
   * To hold check data busines rules details
   */
  checkDataBRsData = [];

  /**
   * Null state message to show when schema does not have any business rule added
   */
  brsNullMessage = `You don't have any business rules selected. Type the business rule in the box above to add one.`;

  /**
   * Null state message to show when schema does not have any subscriber added
   */
  subscribersNullMessage = `You don't have any subscribers selected. Type the user's name in the box above to add one.`;

  /**
   * formcontrol for schema Name to be passed to child component
   */
  schemaName: FormControl = new FormControl('', Validators.required);

  /**
   * formcontrol for data scope
   */
  dataScopeControl: FormControl = new FormControl('0');

  /**
   * formcontrol for schema threshold
   */
  schemaThresholdControl: FormControl = new FormControl(0);

  /**
   * To hold updated schema name
   */
  updatedSchemaName: string;

  /**
   * To hold all the roles of subscriber
   */
  roles = ROLES;

  /**
   * To check whether to show schema name input field
   */
  isFromCheckData = false;

  moduleDesc: string;

  /**
   * To hold all the subscriptions related to component
   */
  subscriptions: Subscription[] = [];

  depRuleList = [{ value: 'ALL', key: 'ALL' }, { value: 'SUCCESS', key: 'SUCCESS' }, { value: 'FAILURE', key: 'ERROR' }];

  submitted = false;

  entireDataSetCount = 0;

  variantListPage = 0;

  currentVariantCnt = 0;

  dataScopeName: FormControl = new FormControl('Entire data scope');

  schemaRunFailureMsg = '';

  isOnlyForTrans = false;

  schemaValueChanged: Subject<string> = new Subject<string>();
  schemaThresholdChanged: Subject<string> = new Subject<string>();

  /**
   * Hold the whole error information ...
   */
  errorStateRes: ErrorStateRes;

  bannerSuccessText = '';
  objectType: ObjectType = { objectdesc: '', objectid: 0, objectInfo: '' };
  previousWeightage:Number;
  private readonly dialofConfig = {
    disableClose: true,
    width: '600px',
    minHeight: '250px',
  };

  /**
   * function to format slider thumbs label.
   * @param percent percent
   */
  rangeSliderLabelFormat(percent) {
    return `${percent}%`;
  }

  getCurrentBrStatusObj(status) {
    return this.depRuleList.find(depRule => [depRule.key, depRule.value].includes(status)) || this.depRuleList[0];
  }

  /**
   * Check if the rule to save is a dependent child
   * update the parent's child in case the rule is a child
   * @param rule pass the rule data
   * @returns return the modified rule
   */
  checkIfDependentRule(rule: CoreSchemaBrInfo): CoreSchemaBrInfo {
    let brToUpdate = rule;
    this.businessRuleData.map((item, index) => {
      if(item.dep_rules?.length) {
        item.dep_rules.map((drule, dIndex) => {
          if(drule.brIdStr === rule.brIdStr) {
            brToUpdate = {...this.businessRuleData[index]};
            brToUpdate.dep_rules[dIndex] = rule;
            return brToUpdate;
          }
        });
      }
    });

    return brToUpdate;
  }

  /**
   * ANGULAR HOOK
   */
  ngOnInit(): void {

    this.sharedService.isBuisnessRuleListUpdated.subscribe((res)=>{
      if(res){
        this.getAllBusinessRulesList(this.moduleId,'','','0');
      }
    })
    this.dataScopeName.valueChanges.subscribe((res) => {
      this.updateDataScopeList(0);
    });

    this.getRouteParams();

    const attachedRuleSave = this.sharedService.gettransSavedBehaviourSub().subscribe(res => {
      this.isOnlyForTrans = res ? true : false;
    });
    this.subscriptions.push(attachedRuleSave);

    const brSave = this.sharedService.getAfterBrSave().subscribe(res => {
      res = this.checkIfDependentRule(res);
      if (res && !this.isOnlyForTrans) {
        console.log(res);
        const fj = {};
        if(!Array.isArray(res)) {
          fj[res.brIdStr] = res;

          // Update if trying to edit an existing rule and push if adding a new one
          const index = this.businessRuleData.findIndex((brData) => brData.brIdStr === res.brIdStr);
          //check weight : if the combined weight after adding new br's weight exceeds 100 then new br's weight is set to 0
          let sumofAllWeightage = 0;
          sumofAllWeightage = this.sumOfAllWeightage();
          if((res.brWeightage + sumofAllWeightage)>100){
            res.brWeightage = 100 - sumofAllWeightage;
          }
          if (index > -1) {
            this.businessRuleData[index] = res;
          } else if (Object.keys(res).length) {
            this.businessRuleData.push(res);
          }

          if (res === 'delete') {
            this.businessRuleData = [];
            this.getBusinessRuleList(this.schemaId);
          }
        } else {
          res.forEach((r,idx) => {
            r.copiedFrom = r.brIdStr;
            r.brIdStr = '';
            r.brId = '';
            r.brWeightage = '0';
            r.isCopied = true;
            r.schemaId = this.schemaId;
            r.moduleId = this.moduleId;
            r.dependantStatus=RuleDependentOn.ALL;
            fj[idx] = this.schemaService.createBusinessRule(r);
          });

          forkJoin({...fj}).subscribe(fres=>{
            const keyArr: any = Object.values(fres);
            // keyArr = keyArr.slice(0, keyArr.length - 1);
            console.log(keyArr);
            this.businessRuleData = this.businessRuleData.concat(keyArr);
            console.log(this.businessRuleData);
            this.sharedService.setAfterBrSave(null);
          }, err=> console.log(`Error : ${err.message}`));

        }
      }
      this.isOnlyForTrans = false;
    });
    this.subscriptions.push(brSave);
    const saveSubSubscription = this.sharedService.getAfterSubscriberSave().subscribe(res => {
      if (res && res.length) {
        res.forEach((sb, idx)=>{
          delete sb.userMdoModel.isAdd;
          this.addSubscriber(sb.userMdoModel);
        });
        this.sharedService.setAfterSubscriberSave(null);
      }
    });
    this.subscriptions.push(saveSubSubscription);

  this.sharedService.getDataScope().subscribe(res => {
      if(res) {
        this.dataScopeControl.setValue(res);
        this.setDataScopeName(this.dataScopeControl.value);
        this.getSchemaVariants(this.schemaId, 'RUNFOR');
      }
    })

    this.getCollaborators('', this.fetchCount); // To fetch all users details (will use to show in auto complete)
    this.getAllBusinessRulesList(this.moduleId, '', '', '0'); // To fetch all BRs details (will use to show in auto complete)

    this.sharedService.getdatascopeSheetState().subscribe((res: DataScopeSidesheet) => {
      if (res && res.openedFrom === 'schemaSummary') {
        if (res.editSheet && res.variantId) {
          this.router.navigate([{ outlets: { sb: `sb/schema/check-data/${this.moduleId}/${this.schemaId}`, outer: `outer/schema/data-scope/${this.moduleId}/${this.schemaId}/${res.variantId}/outer` } }], {queryParamsHandling: 'preserve'});
        } else if (!res.editSheet && res.listSheet) {
          this.router.navigate([ { outlets: { sb: `sb/schema/check-data/${this.moduleId}/${this.schemaId}`, outer: `outer/schema/data-scope/list/${this.moduleId}/${this.schemaId}/outer` } }], {queryParamsHandling: 'preserve'});
        }
      }
    });

    this.sharedService.getAfterVariantDeleted().subscribe(res => {
      if (res) {
        this.variantDetails = this.variantDetails.filter(x => x.variantId !== res);
        if (this.dataScopeControl.value === res) {
          this.setDataScopeName('0');
        }
      }
    });
  }

  setDataScopeName(variantId) {
    if (variantId && variantId !== '0') {
      const variant = this.variantDetails.find((x) => x.variantId === variantId);
      if (variant && variant.variantName) {
        this.dataScopeName.setValue(variant.variantName);
        this.dataScopeControl.setValue(variantId);
        this.currentVariantCnt = variant.dataScopeCount || 0;
      }
    } else {
      this.dataScopeName.setValue('Entire data scope');
      this.dataScopeControl.setValue('0');
      this.currentVariantCnt = this.entireDataSetCount;
    }
  }

  /**
   * get params of active route to get module id and schema id
   */
  public getRouteParams() {

    this.activateRoute.queryParams.subscribe((params) => {
      console.log(params);
      this.isFromCheckData = Boolean(params.isCheckData === 'true');
      this.moduleDesc = params.name;
    })


    this.activateRoute.params.subscribe((params) => {
      this.moduleId = params.moduleId;
      this.schemaId = params.schemaId;

      if(this.schemaId && this.schemaId !== 'new') {
        this.getSchemaVariants(this.schemaId, 'RUNFOR');
        this.getSchemaDetails(this.schemaId);
      } else {
        this.getModuleInfo();
      }

    });
  }


  /**
   * Function to get schema details
   * @param schemaId: Id of schema
   */
  getSchemaDetails(schemaId: string) {
    this.schemaListService.getSchemaDetailsBySchemaId(schemaId).subscribe(res => {
      this.schemaDetails = res;

      // for getting entire datascope count
      this.getDataScopeCount([], true);

      this.setSelectedDataScope();
      this.getModuleInfo();
      this.schemaName.setValue(this.schemaDetails.schemaDescription);
      this.schemaThresholdControl.setValue(this.schemaDetails.schemaThreshold);
      if (this.schemaDetails.runId && this.isFromCheckData) {
        this.getCheckDataDetails(this.schemaId);
      } else {
        this.getSubscriberList(this.schemaId);
        this.getBusinessRuleList(this.schemaId);
      }
    }, (error) => console.error('Error : {}', error.message));
  }

  public setSelectedDataScope() {
    if(this.schemaDetails?.variantId && this.schemaDetails.variantId !== '0') {
      this.subscriptions.push(
        this.schemaVariantService.getVariantdetailsByvariantId(this.schemaDetails.variantId, undefined, undefined, undefined).subscribe((res) => {
          if(res.variantId) {
            this.getDataScopeCount(res.filterCriteria);
            this.dataScopeControl.setValue(res.variantId);
            this.dataScopeName.setValue(res.variantName);
          }
        })
      );
    }
  }

  public getDataScopeCount(filterCriteria: Array<FilterCriteria>, entireDatascope = false) {
    this.schemaService.getDataScopeCount(this.moduleId, filterCriteria).subscribe((res) => {
      this.currentVariantCnt = res;
      if (entireDatascope) {
        this.entireDataSetCount = res;
      }
    });
  }

  public getModuleInfo() {
    const moduleInfoByModuleId = this.coreService.searchAllObjectType({lang: 'en', fetchsize: 50, fetchcount: 0, description: ''}, [this.moduleId]).subscribe((moduleData) => {
      const module = moduleData[0];
      if (module) {
        this.schemaDetails.moduleDescription = module.moduleDesc;
        this.schemaDetails.moduleId = module.moduleId;
      }
    }, error => {
      console.error('Error: {}', error.message);
    });
    this.subscriptions.push(moduleInfoByModuleId);
  }

  /**
   * Function to get dataScope/variants of schema
   * @param schemaId : ID of schema
   */
  getSchemaVariants(schemaId: string, type: string) {
    const body = {
      from: 0,
      size: 10,
      variantName: null
    };
    const schemaVariantList = this.schemaVariantService.getDataScopesList(schemaId, type, body).subscribe(response => {
      this.variantDetails = response;
    }, error => {
      console.log('Error while getting schema variants', error.message)
    })
    this.subscriptions.push(schemaVariantList);
  }

  updateDataScopeList(page?: number, name?: string) {
    const datascopeName = this.dataScopeName.value || '';
    const scopeName = name || ((datascopeName.trim() !== '' && datascopeName !== 'Entire data scope') ? datascopeName.trim() : null);
    const pageNo = (page || page === 0) ? page : (this.variantListPage + 1);
    const body = {
      from: pageNo,
      size: 10,
      variantName: scopeName
    };
    const schemaVariantList = this.schemaVariantService.getDataScopesList(this.schemaId, 'RUNFOR', body).subscribe(res => {
      if (res && res.length) {
        this.variantListPage = pageNo;
        if (pageNo === 0) {
          this.variantDetails = res;
        } else {
          this.variantDetails = [...this.variantDetails, ...res];
        }
      } else if (pageNo === 0) {
        this.variantDetails = [];
      }
    }, error => {
      console.log('Error while getting schema variants', error.message)
    });
    this.subscriptions.push(schemaVariantList);
  }

  selectDataScope() {
    this.setDataScopeName(this.dataScopeName.value);
  }

  resetLastScope() {
    const body = {
      from: 0,
      size: 10,
      variantName: null
    };
    this.schemaVariantService.getDataScopesList(this.schemaId, 'RUNFOR', body).subscribe(res => {
      if (res && res.length) {
        const variant = res.find((x) => x.variantId === this.dataScopeControl.value);
        if (variant && variant.variantName) {
          this.dataScopeName.setValue(variant.variantName);
        }
      }
    }, error => {
      console.log('Error while getting schema variants', error.message)
    });
  }

  /**
   * Function to Api call to get subscribers according to schema ID
   * @param schemaId current schema id
   */
  public getSubscriberList(schemaId: string) {
    const subscriberData = this.schemaDetailsService.getCollaboratorDetailsV2(schemaId).subscribe((responseData) => {
      this.subscriberData = responseData;
    }, error => {
      console.log('Error while fetching subscriber information', error.message)
    })
    this.subscriptions.push(subscriberData);
  }

  /**
   * Function to Api call to get business rules according to schema ID
   * @param schemaId current schema id
   */
  public getBusinessRuleList(schemaId: string) {
    const businessRuleList = this.schemaService.getBusinessRulesBySchemaId(schemaId).subscribe((responseData) => {
      if(responseData && responseData.length>0){
        this.businessRuleData = responseData;
        this.businessRuleData.forEach((businessRule) => {
          businessRule.isCopied = true;
          businessRule.copiedFrom = null;
          businessRule.schemaId = null;
          businessRule.dependantStatus=RuleDependentOn.ALL;
        })
        console.log(this.businessRuleData)
      }
    }, error => {
      console.log('Error while fetching business rule info for schema', error);
    })
    this.subscriptions.push(businessRuleList);
  }

  /**
   * to convert name into shortName for subscriber tab
   * @param fname firstName of the subscriber
   * @param lname lastName of the subscriber
   */
  public shortName(fName: string, lName: string) {
    if (fName && lName && fName.length >= 1 && lName.length >= 1) {
      return fName[0] + lName[0];
    } else {
      return '';
    }
  }

  /**
   *
   * @param br updateable business rules...
   * @param event value of chnaged
   */


  sumOfAllWeightage(){
    let sumofAllWeightage = 0;
    this.businessRuleData.forEach((businessRule)=>{
      sumofAllWeightage = Number(businessRule.brWeightage) + sumofAllWeightage;
      if (businessRule.dep_rules && businessRule.dep_rules.length) {
        businessRule.dep_rules.forEach(rule => {
          sumofAllWeightage = Number(rule.brWeightage) + sumofAllWeightage;
        });
      }
    })
    return sumofAllWeightage;
  }

  updateBrForRangeSlider(br: CoreSchemaBrInfo, event?: any){
    this.previousWeightage = Number(br.brWeightage);
    const totalWeight = 100;
    let sumofAllWeightage = this.sumOfAllWeightage();
    sumofAllWeightage = (sumofAllWeightage - Number(br.brWeightage)) + (Number(event));

    if(sumofAllWeightage <= totalWeight){
      this.updateBr(br,event, 'slider')
    } else{
      this.toasterService.open("Total Weightage of all business rules can't be more than 100%",'OK',{duration : 2000});
      setTimeout(()=>{
        this.updateBr(br,this.previousWeightage, 'slider');
      },2000);
    }

  }

  updateBr(br: CoreSchemaBrInfo, event?: any, eventName?: string, child?: boolean) {
    let businessRule: CoreSchemaBrInfo = new CoreSchemaBrInfo();
    if (child) {
      this.businessRuleData.filter((rule) => {
        if (rule.dep_rules?.length) {
          rule.dep_rules.filter((depRule) => {
            if (depRule.brIdStr === br.brIdStr) {
              businessRule = depRule;
            }
          });
        }
      });
    } else {
      businessRule = this.businessRuleData.filter((rule) => rule.brIdStr === br.brIdStr)[0];
    }
    if (eventName === 'checkbox') {
      businessRule.status = event ? '1' : '0';
    } else {
      businessRule.brWeightage = String(event);
    }

    if (eventName === 'slider' || eventName === 'checkbox') {
      this.updateBusinessRuleInfo(br, event, eventName);
    }
  }

  /**
   * Update order of business rule
   * @param event updateable ordre
   */
  drop(event: CdkDragDrop<any>) {
    console.log(event.item.data);
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      const br = this.businessRuleData[event.previousIndex];
      if (br) {
        const request: CoreSchemaBrMap = new CoreSchemaBrMap();
        request.schemaId = this.schemaId;
        request.brId = br.brIdStr;
        request.order = event.currentIndex;
        request.brWeightage = Number(br.brWeightage);
        request.status = br.status;
      }
      this.updateBrOrder();
    }
  }

  /**
   * Delete business rule by id
   * @param br delete by br id
   */
  deleteBr(br: CoreSchemaBrInfo) {
    const index= this.businessRuleData.findIndex(element=>element.brId===br.brId);
    let label='Are you sure you want to delete this ?';
    if(this.businessRuleData[index].dep_rules)
    label='After delete the dependent rules will removed';
    this.globalDialogService.confirm({ label }, (response) => {
      if (response && response === 'yes') {
        const forkObj = {};
        let counter = 0;
        if (br.brIdStr) {
          forkObj[counter] = this.schemaService.deleteBr(br.brIdStr);
          counter++;
          if (br.dep_rules)
            br.dep_rules.forEach(element => {
              forkObj[counter] = this.schemaService.deleteBr(element.brIdStr);;
              counter++;
            });
          const deleteSubscriber = forkJoin(forkObj).subscribe(res => {
            if (res) {
              const innerindex = this.businessRuleData.findIndex((businessRule) => businessRule.brIdStr === br.brIdStr);
              this.businessRuleData.splice(innerindex, 1);
            }
          }, err=> console.error(`Error : ${err.message}`));
          this.subscriptions.push(deleteSubscriber);
        }
      }
    })
  }

  /**
   * Delete child business rule  by id
   * @param br delete by br id
   */
  deleteBrChild(br: CoreSchemaBrInfo,parentbr: CoreSchemaBrInfo) {
    this.globalDialogService.confirm({ label: 'Are you sure you want to delete this ?' }, (response) => {
      if (response && response === 'yes') {
        const idx = this.businessRuleData.findIndex(element=>element.brIdStr===parentbr.brIdStr);
        const childIdx = this.businessRuleData[idx].dep_rules;
        const brToBeDelete = childIdx.find((businessRule) => businessRule.brIdStr === br.brIdStr);
        const index = this.businessRuleData.indexOf(brToBeDelete);
        this.schemaService.deleteBr(brToBeDelete.brIdStr).subscribe(res=>{
          this.businessRuleData[idx].dep_rules.splice(index,1);
        }, err=> console.error(`Error : ${err.message}`));


      }
    })
  }

  /**
   * Edit curren business rule..
   * @param br editable business rule ..
   */
  editBr(br: CoreSchemaBrInfo) {
    this.router.navigate(['', { outlets: { sb: `sb/schema/business-rule/${this.moduleId}/${this.schemaId}/${br.brIdStr}` } }]);
  }

  /**
   * Run schema now ..
   * @param schema runable schema details .
   */
  runSchema() {
    const schemaExecutionReq: SchemaExecutionRequest = new SchemaExecutionRequest();
    schemaExecutionReq.schemaId = `${this.schemaId}`;
    schemaExecutionReq.variantId = this.dataScopeControl.value ? this.dataScopeControl.value : '0'; // 0 for run all
    this.schemaExecutionService.scheduleSChema(schemaExecutionReq, false).subscribe(data => {
      this.schemaDetails.isInRunning = true;
      this.sharedService.setSchemaRunNotif(true);

      this.close();
      // Trigger to refresh the list of schemas on the left sidenav so the latest appears on top
      this.sharedService.refresSchemaListTrigger.next(true);
      this.toasterService.open('Schema run triggered successfully', 'Okay', {
        duration: 2000
      });
    }, (error) => {
      console.log('Something went wrong while running schema', error.message);
      this.schemaRunFailureMsg = '';
      this.errorStateRes = error?.error;
      if (!this.errorStateRes.code && error?.error?.errorMsg) {
        this.errorStateRes = null;
        this.setSchemaFailureMsg(error.error.errorMsg);
      }
    });
  }

  /**
   * sets error message in banner
   * @param msg error message
   */
  setSchemaFailureMsg(msg) {
    this.schemaRunFailureMsg = msg || 'Something went wrong';
    setTimeout(() => {
      this.schemaRunFailureMsg = '';
    }, 5000);
  }


  makeFilterControl(event: AddFilterOutput, sNo: string) {
    const exitingFilterCtrl = [];

    const filterCtrl: FilterCriteria = new FilterCriteria();
    filterCtrl.fieldId = event.fldCtrl.fieldId;
    filterCtrl.type = 'DROPDOWN';
    filterCtrl.values = [];
    filterCtrl.textValues = [];
    filterCtrl.selectedValues = [];

    event.selectedValues.forEach((value) => {
      if (value.FIELDNAME === filterCtrl.fieldId) {
        filterCtrl.values.push(value.CODE);
        filterCtrl.textValues.push(value.TEXT);
        filterCtrl.selectedValues.push(value);
      }
    })
    filterCtrl.fldCtrl = event.fldCtrl;

    exitingFilterCtrl.push(filterCtrl);
    let flag = false;
    this.subscriberData.forEach((subscriber) => {
      if (subscriber.uuid === sNo) {
        if (subscriber.filterCriteria.length === 0) {
          subscriber.filterCriteria = [];
          subscriber.filterCriteria.push(filterCtrl);
          this.updateSubscriberInfo(sNo, subscriber.filterCriteria);
          return;
        }
        subscriber.filterCriteria.forEach((res) => {
          if (event.fldCtrl.fieldId === res.fieldId) {
            res.values.push(...filterCtrl.values);
            flag = true;
          }
        })
        if (flag === false) {
          subscriber.filterCriteria.push(filterCtrl);
        }
        this.updateSubscriberInfo(sNo, subscriber.filterCriteria);
      }
    })
  }


  /**
   * Function to show chips of selected filters
   * @param ctrl Filter criteria
   */
  prepareTextToShow(ctrl: FilterCriteria) {
    if (ctrl.values.length > 1) {
      return ctrl.values.length;
    } else if (ctrl.selectedValues?.length) {
      return ctrl.selectedValues[0].TEXT || 'Unknown';
    } else {
      return ctrl.values[0];
    }
  }



  /**
   * Function to load dropdown values of already selcted filters
   */
  loadDropValues(fldC: FilterCriteria) {
    if (fldC) {
      const dropArray: DropDownValue[] = [];
      fldC.selectedValues.forEach(val => {
        const drop: DropDownValue = { CODE: val.CODE, FIELDNAME: fldC.fieldId, TEXT: val.TEXT } as DropDownValue;
        dropArray.push(drop);
      });
      this.loadDopValuesFor = { fieldId: fldC.fieldId, checkedValue: dropArray };
    }
  }


  /**
   * Function to remove filters on clicking cross icon
   * @param ctrl Filter criteria
   */
  removeAppliedFilter(ctrl: FilterCriteria, sNo: string) {
    this.subscriberData.forEach((subscriber) => {
      if (subscriber.uuid === sNo) {
        subscriber.filterCriteria.forEach((res) => {
          if (res.fieldId === ctrl.fieldId) {
            subscriber.filterCriteria.splice(subscriber.filterCriteria.indexOf(res), 1);
            this.updateSubscriberInfo(sNo, subscriber.filterCriteria);
          }
        })
      }
    })
  }


  /**
   * Function to delete subscriber from schema
   * @param sNo serial No of the subscriber.
   */
  public deleteSubscriber(sNo: string) {
    this.globalDialogService.confirm({ label: 'Are you sure you want to delete this ?' }, (response) => {
      if (response && response === 'yes') {
        const deleteSubscriber = this.schemaDetailsService.deleteCollaborator([sNo]).subscribe(res => {
          this.toasterService.open('Subscriber deleted successfully.', null, { duration: 5000 });
          const subscriberToBeDel = this.subscriberData.filter((subscriber => subscriber.uuid === sNo))[0];
          const index = this.subscriberData.indexOf(subscriberToBeDel);
          this.subscriberData.splice(index, 1);
        }, error => {
          console.log('Error while deleting subscriber', error.message)
        });

        this.subscriptions.push(deleteSubscriber);

      }
    })
  }

  /**
   * Function to edit subscriber details of schema
   * @param sNo serial Number of subscriber
   */
  public editSubscriberInfo(sNo: number) {
    this.router.navigate([{ outlets: { sb: `sb/schema/subscriber/${this.moduleId}/${this.schemaId}/${sNo}` } }])
  }

  /**
   * Function to fetch selected subscriber from a dropdown
   * @param selectedValues list of selected drop down values
   * @param sNo serial number of subscriber
   */
  fetchSelectedValues(selectedValues, sNo: string) {
    if (selectedValues.length > 0) {
      this.subscriberData.forEach((subscriber) => {
        if (subscriber.uuid === sNo) {
          subscriber.filterCriteria.forEach((res) => {
            if (res.fieldId === selectedValues[0].FIELDNAME) {
              res.values = [];

              res.selectedValues = selectedValues;
              res.values = selectedValues.map((value) => value.CODE)
            }
          });
          this.schemaDetailsService.createUpdateUserDetails(Array(subscriber)).subscribe(res => {
            this.getSubscriberList(this.schemaId);
          })
        }
      })
    }
  }

  /**
   * ANGULAR HOOK
   * To destroy all the subscriptions
   */
  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    })
  }
  /**
   * Function to check for the maximum available threshold for business rule
   * @param weightage threshold of the business rule.
   * @returns maximum value of slider to available.
   */
  availableWeightage(weightage: string): number {
    let sumOfAllWeightage = 0; // store sum of all business rules weightage
    let freeWeight = 0;        // store max free weightage for any business rule

    this.businessRuleData.forEach((businessRule) => {
      sumOfAllWeightage = Number(businessRule.brWeightage) + sumOfAllWeightage;
      if (businessRule.dep_rules && businessRule.dep_rules.length) {
        businessRule.dep_rules.forEach(rule => {
          sumOfAllWeightage = Number(rule.brWeightage) + sumOfAllWeightage;
        });
      }
    })
    freeWeight = 100 - sumOfAllWeightage;

    return freeWeight + Number(weightage); // max value to slide for a business rule
  }


  /**
   * Function to close summary sidesheet on click
   */
  close() {
    this.sharedService.setAfterBrSave(null);
    this.router.navigate([{ outlets: { sb: null } }])
  }

  /**
   * Function to open business rule library side sheet
   */
  openBrLibrarySideSheet() {
    this.router.navigate(['', { outlets: {sb: `sb/schema/check-data/${this.moduleId}/${this.schemaId}`, outer: `outer/schema/businessrule-library/${this.moduleId}/${this.schemaId}/${this.outlet}` } }])
  }

  /**
   * Function to open subscriber side sheet
   */
  openSubscriberSideSheet() {
    this.router.navigate(['', { outlets: {sb: `sb/schema/check-data/${this.moduleId}/${this.schemaId}`, outer: `outer/schema/subscriber/${this.moduleId}/${this.schemaId}/new/${this.outlet}` } }])
  }

  /**
   * Function to get all business rules information
   */
  getAllBusinessRulesList(moduleId: string, searchString: string, brType: string, fetchCount: string) {
    const getAllBrSubscription = this.schemaService.getBusinessRulesByModuleId(moduleId, searchString, brType, fetchCount).subscribe((rules: CoreSchemaBrInfo[]) => {
      if (rules && rules.length > 0) {
        this.allBusinessRulesList = rules;
      }
    }, (error) => {
      console.error('Error while getting all business rules list', error.message);
    });
    this.subscriptions.push(getAllBrSubscription);
  }

  /**
   * function to get collaboratos/subscribers from the api
   * @param queryString: pass query param to fetch values from the api
   * @param fetchCount: count to fetch subscribers into batches
   */
  getCollaborators(queryString: string, fetchCount: number) {
    this.schemaDetailsService.getAllUserDetails(queryString, fetchCount, ['ACTIVE'])
      .subscribe((response: PermissionOn) => {
        if (response && response.users) {
          const subscribers: UserMdoModel[] = response.users;
          this.allSubscribers = subscribers;
        }
      }, (error) => {
        console.error('Something went wrong while getting subscribers', error.message);
      });
  }

  getUpdatedBrList(qureyString: string, fetchCount){
    this.getAllBusinessRulesList(this.moduleId,qureyString,'',fetchCount);
  }
  /**
   * Function to add business rule from autocomplete
   * @param brInfo: object contains business rule info
   */
  async addBusinessRule(brInfo: CoreSchemaBrInfo) {
    if(!await this.canAllowNewBR(brInfo)) {
      return false;
    }
    if(this.businessRuleData.length > 0) {
      const checkExistence = this.businessRuleData.filter((businessRule) => businessRule.brIdStr === brInfo.brIdStr)[0];
      console.log(checkExistence,this.businessRuleData)
      if(checkExistence) {
        this.toasterService.open('Business rule already added.', 'ok', {
          duration: 2000,
        });
        return;
      }
    }
    brInfo.brId = '';
    brInfo.brIdStr = '';
    brInfo.brWeightage = '0';
    brInfo.isCopied = true;
    brInfo.schemaId = this.schemaId;
    brInfo.copiedFrom = brInfo.brIdStr;
    brInfo.dependantStatus=RuleDependentOn.ALL;
    delete brInfo.udrDto;
    if (brInfo.brType === 'BR_DUPLICATE_CHECK') {
      if(!brInfo.masterRules) {
        brInfo.masterRules = [];
      }
      const subscription = this.schemaService.copyDuplicateRule(brInfo).subscribe((response) => {
        console.log(response);
        brInfo.brIdStr = response.brIdStr;
        this.businessRuleData.push(brInfo); // Push it into current Business rule listing array..
      }, (error) => {
        console.log('Error while adding business rule', error.message);
      })
      this.subscriptions.push(subscription);
    }
    else {
      const subscription = this.schemaService.createBusinessRule(brInfo).subscribe((response) => {
        console.log(response);
        brInfo.brIdStr = response.brIdStr;
        this.businessRuleData.push(brInfo); // Push it into current Business rule listing array..
      }, (error) => {
        console.log('Error while adding business rule', error.message);
      })
      this.subscriptions.push(subscription);
    }

  }

  /**
   * Function to decide if we can allow current business rule to be saved based on some validations
   */
  async canAllowNewBR(brInfo): Promise<boolean> {
    const rules: {
      [index: string]: Array<string>
    } = {
      duplicate: [
        BusinessRuleType.BR_DUPLICATE_RULE
      ],
      classification: [
        BusinessRuleType.MRO_MANU_PRT_NUM_LOOKUP,
        BusinessRuleType.MRO_GSN_DESC_MATCH,
        BusinessRuleType.MRO_CLS_MASTER_CHECK
      ],
      dataQuality: [
        BusinessRuleType.BR_MANDATORY_FIELDS,
        BusinessRuleType.BR_METADATA_RULE,
        BusinessRuleType.BR_CUSTOM_SCRIPT,
        BusinessRuleType.BR_TRANSFORMATION,
        BusinessRuleType.MRO_MANU_PRT_NUM_IDENTI,
        BusinessRuleType.BR_REGEX_RULE
      ]
    };
    const brList = await this.schemaDetailsService.getSchemaBrInfoList(this.schemaId).toPromise();
    const currentRuleType = brInfo.brType;
    let error = '';
    // Find current schema view
    const ruleViewByType = (ruleType: string) => Object.keys(rules).find(ruleView => rules[ruleView].includes(ruleType)) || 'dataQuality';
    const currentRuleView = ruleViewByType(currentRuleType);
    // Check if All are same view
    const isSameView = brList.every(rule => ruleViewByType(rule.brType) === currentRuleView);
    // Check if same rule type already exists
    const isSameType = brList.find(rule => rule.brType === currentRuleType);
    if (!isSameView) {
      error = 'A rule with a different view cannot be added to a schema!';
    } else if (isSameType && currentRuleView!=='dataQuality') {
      error = `Multiple ${currentRuleView} rules cannot be added to one schema!`;
    }
    if(error) {
      this.toasterService.open(error,'ok',{duration:2000});
    }
    return !Boolean(error);
  }

  /**
   * Function to add subscriber from autocomplete
   * @param subscriberInfo: object contains subscriber info
   */
  addSubscriber(subscriberInfo) {
    const checkExistence = this.subscriberData.filter((sub) => sub.userid === subscriberInfo.userName)[0];
    if(checkExistence) {
      this.toasterService.open('Subscriber already added.', 'ok', {
        duration: 2000
      });
      return;
    }

    const subscriber = {
      sno: subscriberInfo.uuid ? subscriberInfo.uuid : Math.floor(Math.random() * Math.pow(100000, 2)),
      userMdoModel: subscriberInfo,
      filterCriteria: [],
      schemaId: this.schemaId,
      isAdmin: false,
      isReviewer: false,
      isViewer: false,
      isEditer: true,
      groupid: '',
      roleId: '',
      userid: subscriberInfo.userName,
      type: 'USER',
      plantCode: '',
      isCopied: false
    } as SchemaDashboardPermission;

    this.schemaDetailsService.createUpdateUserDetails(Array(subscriber)).subscribe((response) => {
      if (response) {
        this.subscriberData.push(subscriber); // Push it into current Subscribers listing array..
      }
    }, (error) => {
      console.error('Something went wrong while adding subscriber', error.message);
    });
  }

  /**
   * Function to get schema check data information
   * @param schemaId: Schema Id
   * @param runId: run Id of schema
   */
  getCheckDataDetails(schemaId: string) {
    this.schemaService.getCheckData(schemaId).subscribe((res) => {
      console.log(res);
      this.subscriberData = res.CollaboratorModel;
      this.businessRuleData = res.BrModel;
      if (this.subscriberData.length === 0 && this.businessRuleData.length === 0) {
        this.getSubscriberList(this.schemaId);
        this.getBusinessRuleList(this.schemaId);
      }
    }, (error) => {
      console.log('Something went wrong while getting check data details', error.message);
    })
  }


  /**
   * Function to save check data
   */
  saveCheckData() {
    this.schemaRunFailureMsg = '';
    this.submitted = true;
    if(!this.schemaName.valid) {
      return false;
    }

    if (this.businessRuleData.length) {
      let totalWeightage = 0;
      this.businessRuleData.forEach((x) => {
        totalWeightage += (parseInt(x.brWeightage, 10) || 0);
        if (x.dep_rules && x.dep_rules.length) {
          x.dep_rules.forEach((y) => {
            totalWeightage += (parseInt(y.brWeightage, 10) || 0);
          });
        }
      });

      if (totalWeightage > 100) {
        this.schemaRunFailureMsg = 'Schema weightage cannnot be more than 100%';
        return false;
      }
    } else {
      this.schemaRunFailureMsg = 'Schema should have atleast one business rule';
      setTimeout(() => {
        this.schemaRunFailureMsg = '';
      }, 2000);

      return;
    }

    // save the schema infor
    const schemaReq: CreateUpdateSchema = new CreateUpdateSchema();
    schemaReq.moduleId = this.moduleId;
    schemaReq.schemaId = this.schemaId === 'new' ? '' : `${this.schemaId}`;
    schemaReq.discription = this.schemaName.value ? this.schemaName.value : this.schemaDetails.schemaDescription;
    schemaReq.schemaThreshold = this.schemaThresholdControl.value;
    schemaReq.schemaCategory = this.schemaDetails.schemaCategory;
    const updateSc = this.schemaService.createUpdateSchema(schemaReq).subscribe((response) => {
          this.schemaId = `${response}`;
          console.log('Schema updated successfully.');
          this.prepareData(this.schemaId);
    },(error) => {
      console.error('Something went wrong while updating schema.', error.message);
      this.setSchemaFailureMsg(error.error.message);
    });
    this.subscriptions.push(updateSc);
  }


  /**
   * Function to add business rules and subscribers
   * @param schemaId Schema Id
   */
  prepareData(schemaId) {

    // update the business rule..
    const forkObj = {};
    let counter=0;
    this.businessRuleData.forEach((br)=>{
      const coreSchemaBrMap: CoreSchemaBrMap = {brId: br.brIdStr,
        dependantStatus: br.dependantStatus ? br.dependantStatus : RuleDependentOn.ALL,
        order: counter,
        schemaId: `${this.schemaId}`,
        status: br.status,
        brWeightage: Number(br.brWeightage)
        } as CoreSchemaBrMap;

        forkObj[counter] = this.schemaService.updateBrMap(coreSchemaBrMap);
        counter++;
        // add dependent rules as well
        br.dep_rules?.forEach(dep_r=>{
          const coreSchemaBrMapD: CoreSchemaBrMap = {brId: dep_r.brIdStr,
            dependantStatus: dep_r.dependantStatus ? dep_r.dependantStatus : RuleDependentOn.ALL,
            order: counter,
            schemaId: `${this.schemaId}`,
            status: dep_r.status,
            brWeightage: Number(dep_r.brWeightage)
            } as CoreSchemaBrMap;

            forkObj[counter] = this.schemaService.updateBrMap(coreSchemaBrMapD);
            counter++;
        });

    });

    // const checkDataSubscriber = [];
    // const checkDataBrs = [];

    if (this.subscriberData.length) {
      this.subscriberData.forEach((subscriber) => {
        subscriber.sno = (subscriber?.sno || subscriber?.uuid) || (Math.floor(Math.random() * Math.pow(100000, 2)).toString());
        subscriber.schemaId = `${schemaId}`;
      });
      const subscriberSnos = this.schemaDetailsService.createUpdateUserDetails(this.subscriberData)
      forkJoin({ ...forkObj,subscriberSnos}).subscribe(res => {
        console.log(`Created successful ${res}`);
        this.runSchema();
      }, err=>{
        console.log(`Exception while creating rule map ${err.message}`);
      });
    } else {
      forkJoin({ ...forkObj}).subscribe(res => {
        console.log(`Created successful ${res}`);
        this.runSchema();
      }, err=>{
        console.log(`Exception while creating rule map ${err.message}`);
      });
    }





    // forkJoin({subscriberSnos}).subscribe(res => {
    //   console.log(`Subscribers created successfuly ${res}`);
    // }, err=>{
    //   console.log(`Exception while creating subscribers map ${err.message}`);
    // });


  }

  /**
   * Function to open sidesheet to Upload data
   */
  public openUploadSideSheet() {
    this.router.navigate(['', { outlets: {sb:`sb/schema/check-data/${this.moduleId}/${this.schemaId}`, outer: `outer/schema/upload-data/${this.moduleId}/${this.outlet}` } }]);
  }

  /**
   * Function to update role of subscriber
   * @param subscriber subscriber object
   * @param role new role of subscriber
   */
  updateRole(subscriber, role) {
    this.roles.forEach((r) => {
      subscriber[r.code] = false;
    });

    subscriber[role] = true;
    subscriber.schemaId = this.schemaId;

    const subscription = this.schemaDetailsService.createUpdateUserDetails(Array(subscriber)).subscribe(res => {
      this.getSubscriberList(this.schemaId)
      this.toasterService.open(`Collaborator role updated successfully.`, null, {
        duration: 2000
      });
    }, (error) => {
      this.toasterService.open(`Something went wrong. Unable to update collaborator role`, null, {
        duration: 2000
      });
      console.log('Something went wrong while update role..', error.message);
    })
    this.subscriptions.push(subscription);
  }


  updateDepRule(br: CoreSchemaBrInfo, value?: any) {
    const event = this.depRuleList.find(depRule => depRule.value === value || depRule.key === value);
    const index = this.businessRuleData.findIndex(item => item.brIdStr === br.brIdStr);

    if(event.value !== RuleDependentOn.ALL) {
      const tobeChild = this.businessRuleData[index];

      if(this.businessRuleData[index-1].dep_rules) {
        this.addChildatSameRoot(tobeChild, index);
      } else {
        this.businessRuleData[index-1].dep_rules = [];
        this.addChildatSameRoot(tobeChild, index);
      }

      const idxforChild = this.businessRuleData[index-1].dep_rules.indexOf(tobeChild);

      this.businessRuleData[index-1].dep_rules[idxforChild].dependantStatus=event.key || event.value;
      this.businessRuleData.splice(index, 1);
    }
    this.updateBusinessRuleInfo(br, event, 'depStatus');
  }

  addChildatSameRoot(tobeChild:CoreSchemaBrInfo,index:number){
    this.businessRuleData[index-1].dep_rules.push(tobeChild)
    if(tobeChild.dep_rules)
    tobeChild.dep_rules.forEach(element=>{
      this.businessRuleData[index-1].dep_rules.push(element);
    });
  }

  updateDepRuleForChild(br: CoreSchemaBrInfo,index:number,  value?: any) {
    const event = this.depRuleList.find(depRule => depRule.value === value || depRule.key === value);
    const idx=this.businessRuleData.findIndex(item=>item.brIdStr===br.brIdStr);
    this.businessRuleData[idx].dep_rules[index].dependantStatus=event.key || event.value;

    const childBr = this.businessRuleData[idx].dep_rules[index]
    console.log(childBr)
    if (event.value === RuleDependentOn.ALL) {
      childBr.dependantStatus=event.value;
      this.businessRuleData.push(childBr)
      this.businessRuleData[idx].dep_rules.splice(index,1);
    }

    this.updateBusinessRuleInfo(childBr, event, 'depStatus');
    console.log(this.businessRuleData)
  }
  /**
   * Function to open data scope side sheet
   */
  openDataScopeSideSheet() {
    this.router.navigate([ { outlets: {sb: `sb/schema/check-data/${this.moduleId}/${this.schemaId}`, outer: `outer/schema/data-scope/${this.moduleId}/${this.schemaId}/new/${this.outlet}` } }], {queryParamsHandling: 'preserve'});
  }
  /**
   * Function to open new br sidesheet
   */
  openBusinessRuleSideSheet() {
    this.router.navigate(['', { outlets: { sb: `sb/schema/check-data/${this.moduleId}/${this.schemaId}` , outer: `outer/schema/business-rule/${this.moduleId}/${this.schemaId}/new/outer`} }]);
  }

  /**
   * to convert rule type into rule description
   * @param ruleType ruleType of a business rule object
   */
   public getRuleTypeDesc(ruleType: string) {
    return RULE_TYPES.find(rule => rule.ruleType === ruleType)?.ruleDesc;
  }

  /**
   * Edit the business rule ...
   * @param br edit this business rule
   */
  public editBuisnessRule(br: CoreSchemaBrInfo) {
    this.router.navigate(['', { outlets: { sb: `sb/schema/check-data/${this.moduleId}/${this.schemaId}` , outer: `outer/schema/business-rule/${this.moduleId}/${this.schemaId}/${br.brIdStr}/outer`} }]);
  }

  openDatascopeListSidesheet() {
    const state: DataScopeSidesheet = {
      openedFrom: 'schemaSummary',
      editSheet: false,
      listSheet: true
    };
    this.sharedService.setdatascopeSheetState(state);
  }

  /**
   * Create the queue and run the schema based on the parameter ....
   * @returns if having queues ... just execute that and return it ..
   */
  createQueueAndRerunSchema() {
    if(this.errorStateRes && this.errorStateRes.queueName) {
      this.schemaDetailsService.createQueueAndRunSchema(this.errorStateRes.queueName, this.schemaId, this.dataScopeControl.value ? this.dataScopeControl.value : '0', true).subscribe(res=>{
        console.log(`schema scheduled !!!`);
        this.errorStateRes = null;
        this.sharedService.setSchemaRunNotif(true);
        this.schemaDetails.isInRunning = true;
      }, err=>{
        console.error(`Error : ${err?.error?.message}`);
      });
      return;
    }
    this.transientservice.open(`Oops , somethings not good`);

  }

  publishSchema() {
    const publishPackage: PublishPackage = {
      id: Number(this.schemaDetails.schemaId),
      name: this.schemaDetails?.schemaDescription || '',
      brief: (this.schemaDetails?.description || this.schemaDetails?.schemaDescription) || '',
      type: PackageType.SCHEMA
    };
    this.matDialog.open(PublishToConnekthubComponent, {
      data: publishPackage,
      ...this.dialofConfig,
      disableClose: true,
      autoFocus: false,
      minWidth: '765px',
      panelClass: 'create-master-panel'
    }).afterClosed().subscribe((dialogData: any) => {
      if (dialogData.successfully) {
        this.bannerSuccessText = 'Thanks for taking the time to contribute to the community. We will inform you when your schema is available on the ConnektHub library!';
        setTimeout(() => {
          this.bannerSuccessText = '';
        }, 5000);
      }
      if (dialogData.returnId) {
        this.objectType.packageId = dialogData.returnId;
      }
    })
  }

  sanitizeValue(control) {
    control.setValue(control.value.replace(/[^a-zA-Z0-9 ]/g, ''));
  }

  onChangeSchemaDescription($event) {
    if(this.schemaName.errors) { return; }

    if (this.schemaValueChanged.observers.length === 0) {
      this.schemaValueChanged.pipe(distinctUntilChanged()).subscribe(schema => {
        this.updateSchemaInfo(schema, null, 'name');
      });
    }
    this.schemaValueChanged.next($event);
  }

  onChangeSchemaThreshold($event) {
    console.log($event);
    if (this.schemaThresholdChanged.observers.length === 0) {
      this.schemaThresholdChanged.pipe(debounceTime(1000), distinctUntilChanged()).subscribe(threshold => {
        this.updateSchemaInfo(this.schemaDetails.schemaDescription, { value: threshold }, 'threshold');
      });
    }
    this.schemaThresholdChanged.next($event);
  }

  updateSchemaInfo(schemaDescription: string, event?: any, field = '') {
    if (this.schemaId !== 'new' && (this.schemaDetails && schemaDescription !== this.schemaDetails.schemaDescription || event)) {
      const schemaReq: CreateUpdateSchema = new CreateUpdateSchema();
      schemaReq.moduleId = this.moduleId;
      schemaReq.schemaId = this.schemaId;
      schemaReq.discription = schemaDescription;
      schemaReq.schemaThreshold = event ? event.value : this.schemaDetails.schemaThreshold;
      schemaReq.schemaCategory = this.schemaDetails.schemaCategory;

      const subscription = this.schemaService.createUpdateSchema(schemaReq).subscribe((response) => {
        if (field === 'name') {
          this.schemaDetails.schemaDescription = schemaDescription;
        } else if (field === 'threshold') {
          this.schemaDetails.schemaThreshold = event?.value || this.schemaDetails.schemaThreshold;
        }
        this.toasterService.open(`Schema ${field} updated successfully.`, null, {
          duration: 2000
        });
      }, (error) => {
        this.toasterService.open(`Something went wrong. Unable to update schema ${field}`, null, {
          duration: 2000
        });
      })
      this.subscriptions.push(subscription);
    }
  }

  updateBusinessRuleInfo(br: CoreSchemaBrInfo, event: any, eventName: string) {
    const coreSchemaBrMap: CoreSchemaBrMap = {
      brId: br.brIdStr,
      dependantStatus: eventName === 'depStatus' ? (event?.key || br.dependantStatus) : br.dependantStatus,
      order: br.order,
      schemaId: `${this.schemaId}`,
      status: eventName === 'checkbox' ? (event ? '1' : '0') : br.status,
      brWeightage: eventName === 'slider' ? Number(event) : br.brWeightage
    } as CoreSchemaBrMap;

    const sub = this.schemaService.updateBrMap(coreSchemaBrMap).subscribe((res) => {
      if (res) {
        this.getBusinessRuleList(this.schemaId);
        this.toasterService.open(`Business rule updated successfully.`, null, {
          duration: 2000
        });
      }
    }, (err) => {
      this.toasterService.open(`Something went wrong. Unable to udpate business rule.`, null, {
        duration: 2000
      });
    });
    this.subscriptions.push(sub);
  }

  updateBrOrder() {
    const forkObj = {};
    let currentIndex = 0;
    this.businessRuleData.forEach((br) => {
      if (br) {
        const parentRequest: CoreSchemaBrMap = new CoreSchemaBrMap();
        parentRequest.schemaId = this.schemaId;
        parentRequest.brId = br.brIdStr;
        parentRequest.order = currentIndex;
        parentRequest.brWeightage = Number(br.brWeightage);
        parentRequest.status = br.status ? br.status : '0';
        parentRequest.dependantStatus = br.dependantStatus;
        forkObj[currentIndex] = this.schemaService.updateBrMap(parentRequest);
        currentIndex++;
        if (br.dep_rules)
          br.dep_rules.forEach(element => {
            const childRequest: CoreSchemaBrMap = new CoreSchemaBrMap();
            childRequest.schemaId = this.schemaId;
            childRequest.brId = element.brIdStr;
            childRequest.order = currentIndex;
            childRequest.brWeightage = Number(element.brWeightage);
            childRequest.status = br.status ? br.status : '0';
            childRequest.dependantStatus = element.dependantStatus;
            forkObj[currentIndex] = this.schemaService.updateBrMap(childRequest);
            currentIndex++;
          });
      }
    });
    forkJoin(forkObj).subscribe(res => {
      if (res) {
        this.getBusinessRuleList(this.schemaId);
      }
    });
  }

  updateSubscriberInfo(sNo: string, filterCriteria: FilterCriteria[]) {
    /**
     * Filter data according to sNo.
     */
    const data = this.subscriberData.find(x => x.uuid === sNo);
    if (data) {
      data.schemaId = this.schemaId;

      /**
       * Delete not required fields for UPDATE api
       */
      delete data.userMdoModel;

      data.filterCriteria = filterCriteria;
      this.schemaDetailsService.createUpdateUserDetails([data]).subscribe((res) => {
        this.getSubscriberList(this.schemaId);
      }, error => {
        console.log('Error while update subscriber filter information', error.message)
      })
    }
  }

}
