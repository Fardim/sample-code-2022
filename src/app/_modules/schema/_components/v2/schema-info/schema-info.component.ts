import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SchemaService } from '@services/home/schema.service';
import { CoreSchemaBrMap, SchemaListDetails, LoadDropValueReq, VariantDetails, ModuleInfo } from '@models/schema/schemalist';
import { PermissionOn, ROLES, RuleDependentOn, SchemaCollaborator, SchemaDashboardPermission, UserMdoModel } from '@models/collaborator';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { BusinessRuleType, CoreSchemaBrInfo, CreateUpdateSchema, DropDownValue, DuplicateRuleModel, RULE_TYPES } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { SecondaynavType } from '@models/menu-navigation';
import { CategoryInfo, FilterCriteria } from '@models/schema/schemadetailstable';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { SchemalistService } from '@services/home/schema/schemalist.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AddFilterOutput, DataScopeSidesheet, ErrorStateRes} from '@models/schema/schema';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SchemaVariantService } from '@services/home/schema/schema-variant.service';
import { GlobaldialogService } from '@services/globaldialog.service';
import { BehaviorSubject, forkJoin, Subject, Subscription } from 'rxjs';
import { SchemaScheduler } from '@models/schema/schemaScheduler';
import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs/operators';
import { TransientService } from 'mdo-ui-library';
import { SchemaExecutionRequest } from '@models/schema/schema-execution';
import { SchemaExecutionService } from '@services/home/schema/schema-execution.service';
import { debounce } from 'lodash';

@Component({
  selector: 'pros-schema-info',
  templateUrl: './schema-info.component.html',
  styleUrls: ['./schema-info.component.scss']
})
export class SchemaInfoComponent implements OnInit, OnDestroy {
  constructor(
    private activateRoute: ActivatedRoute,
    private router: Router,
    private schemaService: SchemaService,
    private schemaDetailsService: SchemaDetailsService,
    private sharedService: SharedServiceService,
    private schemaListService: SchemalistService,
    private schemaExecutionService: SchemaExecutionService,
    private schemaVariantService: SchemaVariantService,
    private matSnackBar: MatSnackBar,
    private toasterService: TransientService,
    private globalDialogService: GlobaldialogService,
    private transientservice: TransientService
  ) {
  }

  get getBusinessRulesLength() {
    let inn = 0;
    const count = this.businessRuleData.map(element => {
      if (element.dep_rules)
        inn += element.dep_rules.length;
    }).length
    return count + inn;
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

  businessRuleData: CoreSchemaBrInfo[] = [];
  activeTab: string;
  selectedIndex: number;
  category: CategoryInfo[];
  schemaDetails: SchemaListDetails;
  loadDopValuesFor: LoadDropValueReq;
  collaboratorData: SchemaCollaborator;
  reInilize = true;

  /** FormGroup to have schema summary form.. */
  schemaSummaryForm: FormGroup;

  /** To have variant details of a schema */
  variantDetails: VariantDetails[];
  module: ModuleInfo;
  /**
   * formcontrol for data scope...
   */
  dataScopeControl: FormControl = new FormControl('0');
  dataScopeName: FormControl = new FormControl('Entire data scope');
  currentVariantCnt = 0;
  /**
   * To have the info about schedule
   */
  scheduleInfo: SchemaScheduler;

  /**
   * To check whether show edit schedule or add schedule button
   */
  canEditSchedule: boolean;

  /**
   * To store all subscribers..
   */
  allSubscribers = [];

  allBusinessRulesList: CoreSchemaBrInfo[] = [];

  /**
   * outlet name in which sheets to be opened
   */
  outlet = 'sb';

  /**
   * To hold all roles of suscribers
   */
  roles = ROLES;

  /**
   * Loading flag
   */
  private initialSubscriptionList: Array<Subscription> = [];
  get loading() {
    return Boolean(this.initialSubscriptionList?.find(x => !x.closed));
  }

  /**
   * Null state message to show when schema does not have any business rule
   */
  brsNullMessage = `You don't have any business rules selected. Type the business rule in the box above to add one.`;

  /**
   * Null state message to show when schema does not have any subscriber
   */
  subscribersNullMessage = `You don't have any subscribers selected. Type the user's name in the box above to add one.`;

  /**
   * To hold all the subscriptions related to component
   */
  subscriptions: Subscription[] = [];

  /**
   * To hold all tab labels
   */
  infoTabs: string[] = ['summary', 'business-rules', 'subscribers', 'Schedule', 'Statistics'];

  depRuleList = [{ value: 'ALL', key: 'ALL' }, { value: 'SUCCESS', key: 'SUCCESS' }, { value: 'FAILURE', key: 'ERROR' }];

  /**
   * To trigger debounced event on schema name changed
   */
  schemaValueChanged: Subject<string> = new Subject<string>();
  schemaThresholdChanged: Subject<string> = new Subject<string>();

  /**
   * Applied search string on brs list
   */
  brSearchString = '';
  serachFieldsSub: BehaviorSubject<string> = new BehaviorSubject(null);

  brListFetchCount = 0;

  schemaLoader: any = {
    loading: false,
    error: false
  };

  schemaRunFailMsg = '';

  /**
   * Hold the whole error information ...
   */
  errorStateRes: ErrorStateRes;

  updateBrOnMouseUp = debounce((br: CoreSchemaBrInfo) => {
    const weight = br.brWeightage;
    this.updateBr(br, weight, 'slider');
  }, 500);

  /**
   * ANGULAR HOOK
   */
  ngOnInit(): void {
    this.getRouteParams();
    // this.getQueryParams();

    this.initializeSummaryForm(); // To initialize schema summary tab form

    const getBrSubscription = this.sharedService.getAfterBrSave().subscribe(res => {
      if (res) {
        this.getBusinessRuleList(this.schemaId, false);
        this.getAllBusinessRulesList(this.moduleId, '', '');
      }
    });
    this.subscriptions.push(getBrSubscription);

    const getSubscriberSubscription = this.sharedService.getAfterSubscriberSave().subscribe(res => {
      if (res) {
        this.getSubscriberList(this.schemaId, false);
      }
    })
    this.subscriptions.push(getSubscriberSubscription);

    const getScheduleSubscription = this.sharedService.getScheduleInfo().subscribe((res) => {
      if (res) {
        this.getScheduleInfo(this.schemaId);
      }
    })
    this.subscriptions.push(getScheduleSubscription);

    const getDataScopeSubscription = this.sharedService.getDataScope().subscribe((res) => {
      if (res) {
        this.getSchemaVariants(this.schemaId, 'RUNFOR');
      }
    })
    this.subscriptions.push(getDataScopeSubscription);

    this.getAllCategoryInfo(); // To get info of business rules categories

    this.getScheduleInfo(this.schemaId); // To get info about schedule

    this.getCollaborators('', 0); // To get all the subscribers

    this.getAllBusinessRulesList(this.moduleId, '', ''); // To get all business rules list

    this.sharedService.getdatascopeSheetState().subscribe((response: DataScopeSidesheet) => {
      if (response && response.openedFrom === 'schemaInfo' && response.editSheet && response.variantId) {
        this.router.navigate([{ outlets: { sb: `sb/schema/data-scope/list/${this.moduleId}/${this.schemaId}/sb`, outer: `outer/schema/data-scope/${this.moduleId}/${this.schemaId}/${response.variantId}/outer` } }], {queryParamsHandling: 'preserve'});
      }
    });

    this.sharedService.getAfterVariantDeleted().subscribe((res) => {
      if (res) {
        this.variantDetails = this.variantDetails.filter((x) => x.variantId !== res);
        if (this.dataScopeControl.value === res) {
          this.setDataScopeName('0');
        }
      }
    });

    this.serachFieldsSub.pipe(filter(res=> res !== null), debounceTime(300), distinctUntilChanged()).subscribe(res=>{
      this.getAllBusinessRulesList(this.moduleId, res || '', '', false);
    });
  }

  /**
   * get params of active route to get module id and schema id...
   */
  private getRouteParams() {
    this.activateRoute.params.subscribe((params) => {
      if (this.schemaId && (this.schemaId !== params.schemaId)) {
        this.setDataScopeName('0');
      }

      this.moduleId = params.moduleId;
      this.schemaId = params.schemaId;

      this.getSchemaDetails(this.schemaId);
      this.getSubscriberList(this.schemaId);
      this.getBusinessRuleList(this.schemaId);
      this.getSchemaVariants(this.schemaId, 'RUNFOR');
    })
  }

  /**
   * Function to initialize schema summary tab form
   */
  initializeSummaryForm() {
    this.schemaSummaryForm = new FormGroup({
      schemaName: new FormControl('', [Validators.maxLength(100)]),
      schemaDescription: new FormControl(''),
      schemaThreshold: new FormControl()
    })
    // this.schemaSummaryForm.get('schemaThreshold').disable(); // disable threshold slider..
  }

  /**
   * method to return the formcontrol
   */
  schemaField(fieldName) {
    return this.schemaSummaryForm.get(fieldName);
  }

  /**
   * function to get schema details
   * @param schemaId: Id of schema
   */
  getSchemaDetails(schemaId: string, loading = true) {
    const sub = this.schemaListService.getSchemaDetailsBySchemaId(schemaId).subscribe(res => {
      this.schemaDetails = {
        ...res,
        moduleDescription: this.schemaDetails?.moduleDescription
      };
      this.setSelectedDataScope();
      this.getModuleInfo(loading);
      this.schemaSummaryForm.controls.schemaThreshold.setValue(this.schemaDetails.schemaThreshold);
    }, (error) => console.error('Error : {}', error.message));
    if(loading) {
      this.initialSubscriptionList.push(sub);
    }
  }

  public setSelectedDataScope() {
    if(this.schemaDetails?.variantId && this.schemaDetails.variantId !== '0') {
      this.subscriptions.push(
        this.schemaVariantService.getVariantdetailsByvariantId(this.schemaDetails.variantId, undefined, undefined, undefined).subscribe((res) => {
          if(res.variantId) {
            this.dataScopeControl.setValue(res.variantId);
            this.dataScopeName.setValue(res.variantName);
          }
        })
      );
    }
  }

  public getModuleInfo(loading = true) {
    const moduleInfoByModuleId = this.schemaService.getModuleInfoByModuleId(this.moduleId).subscribe((moduleData) => {
      const module = moduleData[0];
      if (module) {
        this.schemaDetails.moduleDescription = module.moduleDesc;
        this.schemaDetails.moduleId = module.moduleId;
        this.module = module;
      }
    }, error => {
      console.error('Error: {}', error.message);
    });
    this.subscriptions.push(moduleInfoByModuleId);
    if(loading) {
      this.initialSubscriptionList.push(moduleInfoByModuleId);
    }
  }

  /**
   * Function to get dataScope/variants of schema
   * @param schemaId : ID of schema
   */
  getSchemaVariants(schemaId: string, type: string) {
    if(!schemaId) { return; }
    const schemaVariantList = this.schemaVariantService.getAllDataScopeList(schemaId, type).subscribe(response => {
      this.variantDetails = response;
    }, error => {
      console.log('Error while getting schema variants', error.message);
    })
    this.subscriptions.push(schemaVariantList);
  }

  /**
   * Function to delete variant of a schema
   * @param variantId : ID of variant needs to be deleted
   */
  deleteVariant(variantId: string) {
    this.globalDialogService.confirm({ label: 'Are you sure you want to delete this ?' }, (response) => {
      this.deleteVariantAfterConfirm(response, variantId);
    });
  }

  deleteVariantAfterConfirm(response, variantId: string) {
    if (response && response === 'yes') {
      const deleteVariant = this.schemaVariantService.deleteVariant(variantId).subscribe(res => {
        if (res) {
          this.getSchemaVariants(this.schemaId, 'RUNFOR');
          this.toasterService.open('SuccessFully Deleted!!', 'close', { duration: 3000 })
        }
      }, error => {
        console.log('Error while deleting schema variant', error.message)
      })
      this.subscriptions.push(deleteVariant);
    }
  }

  /**
   * Function to open data scope side sheet in edit mode
   * @param variantId: ID of variant/data-scope
   */
  editDataScope(variantId: string) {
    this.router.navigate([{ outlets: { sb: `sb/schema/data-scope/${this.moduleId}/${this.schemaId}/${variantId}/sb` } }])
  }

  /**
   * Function to get all business rule categories..
   */
  getAllCategoryInfo() {
    const categoryInfo = this.schemaDetailsService.getAllCategoryInfo().subscribe(res => {
      this.category = res;
    }, error => console.error(`Error : ${error.message}`));
    this.subscriptions.push(categoryInfo);
  }

  // private getQueryParams(){
  //   this.activateRoute.queryParams.subscribe(Queryparams => {
  //     console.log('Inside query params',Queryparams);

  //     this.activeTab = Queryparams.fragment;
  //     // this.updateFragment(this.activeTab);

  //     console.log(this.activeTab);
  //   })
  // }


  /**
   * update fragement of route according to the selected tab
   * @param event matTab event object
   */
  public updateFragment(tabLabel: string) {
    if (tabLabel) {
      this.router.navigate(['/home/schema/schema-info', this.moduleId, this.schemaId], { queryParams: { fragment: tabLabel } })
    }

    switch (tabLabel) {
      case 'business-rules':
        this.selectedIndex = 1;
        break;
      case 'subscribers':
        this.selectedIndex = 2;
        break;
      case 'execution-logs':
        this.selectedIndex = 3;
        break;
      default:
        break;
    }
  }
  /**
   * update fragement of route according to the selected tab index
   * @param event matTab event object
   */
  updateFragmentByIndex(tabIndex: number) {
    this.updateFragment(this.infoTabs[tabIndex]);
  }
  /**
   * function to get collaboratos/subscribers from the api
   * @param queryString: pass query param to fetch values from the api
   * @param fetchCount: count to fetch subscribers into batches
   */
  getCollaborators(queryString: string, fetchCount: number) {
    this.schemaDetailsService.getAllUserDetails(queryString, fetchCount)
      .subscribe((response: PermissionOn) => {
        if (response && response.users) {
          const subscribers: UserMdoModel[] = response.users;
          this.allSubscribers = subscribers;
        }
      }, (error) => {
        console.error('Something went wrong while getting subscribers', error.message);
      });
  }

  /**
   * function to add subscriber from autocomplete list menu
   * @param subscriberInfo: Object having details of subscriber
   */
  addSubscriber(subscriberInfo) {
    const subscriber = {
      sno: Math.floor(Math.random() * Math.pow(100000, 2)),
      schemaId: this.schemaId,
      userid: subscriberInfo.userName,
      roleId: '',
      groupid: '',
      isAdmin: false,
      isViewer: false,
      isEditer: true,
      isReviewer: false,
      permissionType: 'USER',
      description: '',
      userMdoModel: {
        userId: subscriberInfo.userName,
        userName: subscriberInfo.userName,
        fName: subscriberInfo.fName,
        lName: subscriberInfo.lName,
        fullName: subscriberInfo.fullName,
        email: subscriberInfo.email
      },
      rolesModel: {
        roleId: '',
        roleDesc: ''
      },
      plantCode: '',
      filterCriteria: [],
      isCopied: false
    } as SchemaDashboardPermission

    const existSubscriber = this.subscriberData.filter((sub) => sub.userid === subscriber.userid)[0];
    if (existSubscriber) {
      this.matSnackBar.open('This subscriber is already added.', 'Okay', {
        duration: 2000
      })
    }
    else {
      this.schemaDetailsService.createUpdateUserDetails(Array(subscriber)).subscribe((response) => {
        if (response) {
          this.getSubscriberList(this.schemaId, false);
        }
      }, (error) => {
        console.error('Something went wrong while adding subscriber', error.message);
      })
    }
  }


  /**
   * Function to Api call to get subscribers according to schema ID
   * @param schemaId current schema id
   */
  public getSubscriberList(schemaId: string, loading = true) {
    const subscriberData = this.schemaDetailsService.getCollaboratorDetails(schemaId).subscribe((responseData) => {
      responseData.forEach((subscriber) => {
        subscriber.filterCriteria.forEach((data) => {
          const fltr: FilterCriteria = new FilterCriteria();
          fltr.fieldId = data.fieldId;
          fltr.type = data.type;
          fltr.values = data.values;

          const dropVal: DropDownValue[] = [];
          fltr.values.forEach(val => {
            const dd: DropDownValue = { CODE: val, FIELDNAME: data.fieldId } as DropDownValue;
            dropVal.push(dd);
          })
          fltr.filterCtrl = { fldCtrl: data.fldCtrl, selectedValues: dropVal };
          data.filterCtrl = fltr.filterCtrl;
        })
      }),
        this.subscriberData = responseData;
    }, error => {
      console.log('Error while fetching subscriber information', error.message)
    })
    this.subscriptions.push(subscriberData);
    if(loading) {
      this.initialSubscriptionList.push(subscriberData);
    }
  }

  /**
   * Function to Api call to get business rules according to schema ID
   * @param schemaId current schema id
   */
  public getBusinessRuleList(schemaId: string, loading = true) {
    const businessRuleList = this.schemaService.getBusinessRulesBySchemaId(schemaId).subscribe((responseData) => {
      this.businessRuleData = responseData;
      this.businessRuleData.forEach(element => {
        if (!element.dependantStatus) {
          element.dependantStatus = 'ALL';
        }
      });
    }, error => {
      console.log('Error while fetching business rule info for schema', error);
    })
    this.subscriptions.push(businessRuleList);
    if (loading) {
      this.initialSubscriptionList.push(businessRuleList);
    }
  }

  /**
   * to convert name into shortName for subscriber tab
   * @param fname firstName of the subscriber
   * @param lname lastName of the subscriber
   */
  public shortName(fName: string, lName: string) {
    if (fName.length >= 1 && lName.length >= 1) {
      return fName[0] + lName[0];
    } else {
      return '';
    }
  }

  /**
   * to convert rule type into rule description
   * @param ruleType ruleType of a business rule object
   */
  public getRuleDesc(ruleType: string) {
    return RULE_TYPES.find(rule => rule.ruleType === ruleType)?.ruleDesc;
  }

  /**
   * Function to open sidesheet to add subscriber
   */
  public openSubscriberSideSheet() {
    this.router.navigate(['', { outlets: { sb: `sb/schema/subscriber/${this.moduleId}/${this.schemaId}/new/${this.outlet}` } }]);
  }

  /**
   * Function to open sidesheet to add business rule
   */
  public openBusinessRuleSideSheet() {
    this.schemaService.currentweightage = this.availableWeightage('0');
    this.router.navigate(['', { outlets: { sb: `sb/schema/business-rule/${this.moduleId}/${this.schemaId}/new` } }]);
  }

  /**
   * @param br updateable business rules...
   * @param event value of chnaged
   * @param eventName name of the event
   */
  updateBr(br: CoreSchemaBrInfo, event?: any, eventName?: string) {
    const request: CoreSchemaBrMap = new CoreSchemaBrMap();
    if (eventName === 'slider') {
      request.brWeightage = event || 0;
    } else if (eventName === 'checkbox') {
      request.status = event ? '1' : '0';
    }
    request.schemaId = this.schemaId;
    request.brId = br.brIdStr;
    request.order = br.order;
    request.dependantStatus = br.dependantStatus;
    if (!request.brWeightage) {
      request.brWeightage = Number(br.brWeightage);
    }
    if (!request.status) {
      request.status = br.status;
    }
    const updateBusinessRule = this.schemaService.updateBrMap(request).subscribe(res => {
      if (res) {
        this.getBusinessRuleList(this.schemaId, false);
      }
    }, error => console.error(`Error : ${error.message}`));
    this.subscriptions.push(updateBusinessRule);
  }

  /**
   * update br category ..
   * @param cat updateable category ..
   * @param br business rule which is going for update
   */
  updateCategory(cat: CategoryInfo, br: CoreSchemaBrInfo) {
    const request: CoreSchemaBrInfo = new CoreSchemaBrInfo();
    request.brId = br.brIdStr;
    request.schemaId = this.schemaId;
    request.categoryId = cat.categoryId;
    request.brInfo = br.brInfo;
    request.brType = br.brType;
    request.fields = br.fields;
    request.message = br.message;
    request.moduleId = this.moduleId;
    request.isCopied = false;
    request.brWeightage = br.brWeightage;
    request.status = br.status;
    request.dependantStatus = br.dependantStatus;
    request.order = br.order;
    const model = new DuplicateRuleModel();
    model.coreBrInfo = { ...request };
    const params = { objectId: this.moduleId, autoMerge: '', groupId: '' };
    if (br.brType === 'BR_DUPLICATE_CHECK') {
      this.schemaService.getBusinessRulesBySchemaId(this.schemaId).pipe(map(content => content.filter(dup => dup.brIdStr === br.brIdStr)[0])).subscribe(dupBr => {
        model.addFields = dupBr.duplicacyField;
        model.addFields[0].fId = model.addFields[0].fieldId;
        model.mergeRules = dupBr.duplicacyMaster;
        model.removeList = [];
        this.schemaService.saveUpdateDuplicateRule(model, params).subscribe(res => {
          this.getBusinessRuleList(this.schemaId, false);
        }, error => {
          console.error(`Error while updating schema .. `, error);
        });
      });

    }
    else {
      this.schemaService.createBusinessRule(request).subscribe(res => {
        this.getBusinessRuleList(this.schemaId, false);
      }, error => {
        console.error(`Error while updating schema .. `);
      });
    }
  }

  /**
   * Update order of business rule
   * @param event updateable ordre
   */
  drop(event: CdkDragDrop<any>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      this.updateBrOrder();
    }
  }

  /**
   * Update the business rule order
   */
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
      if (res)
        this.getBusinessRuleList(this.schemaId, false);
    });
  }

  /**
   * Delete business rule by id
   * @param br delete by br id
   */
  deleteBr(br: CoreSchemaBrInfo) {
    const index = this.businessRuleData.findIndex(item => item.brIdStr === br.brIdStr);
    let label = 'Are you sure you want to delete this ?';
    if (this.businessRuleData[index].dep_rules)
      label = 'All the dependent rules will also be deleted. Do you wish to proceed ?';
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
              this.getBusinessRuleList(this.schemaId, false);
              this.getAllBusinessRulesList(this.moduleId, '', '');
            }
          });
          // const deleteSubscriber = this.schemaService.deleteBr(br.brIdStr).subscribe(res => {
          //   this.getBusinessRuleList(this.schemaId);
          // }, error => console.error(`Error : ${error.message}`));
          this.subscriptions.push(deleteSubscriber);
        }
      }
    });
  }

  /**
   * Delete child business rule  by id
   * @param br delete by br id
   */
  deleteBrChild(br: CoreSchemaBrInfo, parentbr: CoreSchemaBrInfo) {
    this.globalDialogService.confirm({ label: 'Are you sure you want to delete this ?' }, (response) => {
      if (response && response === 'yes') {
        const idx = this.businessRuleData.indexOf(parentbr);
        const childIdx = this.businessRuleData[idx].dep_rules;
        const brToBeDelete = childIdx.filter((businessRule) => businessRule.brId === br.brId)[0];
        const index = this.businessRuleData.indexOf(brToBeDelete);
        this.businessRuleData[idx].dep_rules.splice(index, 1);

        const forkObj = {};
        let counter = 0;
        if (br.brIdStr) {
          forkObj[counter] = this.schemaService.deleteBr(br.brIdStr);
          counter++;
          const deleteSubscriber = forkJoin(forkObj).subscribe(res => {
            if (res)
              this.getBusinessRuleList(this.schemaId, false);
          });
          this.subscriptions.push(deleteSubscriber);
        }
      }
    })
  }

  deleteBrAfterConfirm(response: string, br: CoreSchemaBrInfo) {
    if (response && response === 'yes') {
      if (br.brIdStr) {
        const deleteSubscriber = this.schemaService.deleteBr(br.brIdStr).subscribe(res => {
          this.getBusinessRuleList(this.schemaId, false);
        }, error => console.error(`Error : ${error.message}`));
        this.subscriptions.push(deleteSubscriber);
      }
    }
  }

  /**
   * Edit curren business rule..
   * @param br editable business rule
   */
  editBr(br: CoreSchemaBrInfo) {
    this.schemaService.currentweightage = this.availableWeightage('0');
    this.router.navigate(['', { outlets: { sb: `sb/schema/business-rule/${this.moduleId}/${this.schemaId}/${br.brIdStr}` } }]);
  }

  makeFilterControl(event: AddFilterOutput, sNo: number) {
    const exitingFilterCtrl: FilterCriteria[] = [];

    const filterCtrl: FilterCriteria = new FilterCriteria();
    filterCtrl.fieldId = event.fldCtrl.fieldId;
    filterCtrl.fldCtrl = event.fldCtrl;
    filterCtrl.type = 'DROPDOWN';
    filterCtrl.values = [];
    filterCtrl.textValues = [];
    filterCtrl.selectedValues = [];

    event.selectedValues.forEach((value) => {
      if (value.fieldId === filterCtrl.fieldId) {
        filterCtrl.values.push(value.CODE);
        filterCtrl.textValues.push(value.TEXT);
        filterCtrl.selectedValues.push(value);
      }
    })

    exitingFilterCtrl.push(filterCtrl);

    this.subscriberData.forEach((subscriber) => {
      if (subscriber.sno === sNo) {
        if (subscriber.filterCriteria.length === 0) {
          this.updateSubscriberInfo(sNo, exitingFilterCtrl)
          return;
        }
        const filCtrl = subscriber.filterCriteria.find(fc => fc.fieldId === event.fldCtrl.fieldId);
        if (filCtrl) {

          filCtrl.values = filterCtrl.values || [];
          filCtrl.fldCtrl = filterCtrl.fldCtrl;

          filCtrl.selectedValues = filCtrl.selectedValues ? filCtrl.selectedValues.filter(sVal => filterCtrl.selectedValues.some(v => v.CODE === sVal.CODE)) : [];
          filterCtrl.selectedValues.forEach(v => {
            if (!filCtrl.selectedValues.some(value => value.CODE === v.CODE)) {
              filCtrl.selectedValues.push(v);
            }
          });

          filCtrl.textValues = [];
          filCtrl.selectedValues.forEach(v => {
            filCtrl.textValues.push(v.TEXT);
          });

          const updateSubscriber: SchemaDashboardPermission = subscriber;

          delete updateSubscriber.userMdoModel;

          updateSubscriber.sno = subscriber.sno.toString();
          updateSubscriber.schemaId = this.schemaId;
          this.schemaDetailsService.createUpdateUserDetails(Array(updateSubscriber)).subscribe(response => {
            this.getSubscriberList(this.schemaId, false);
          })
        } else {
          this.updateSubscriberInfo(sNo, exitingFilterCtrl)
        }
      }
    })
  }


  /**
   * Function to show chips of selected filters
   * @param ctrl Filter criteria
   */
  prepareTextToShow(ctrl: FilterCriteria): string {
    if (ctrl.values && ctrl.values.length > 1) {
      return String(ctrl.values.length);
    } else {
      if (ctrl.textValues && ctrl.textValues.length) {
        return ctrl.textValues[0] || 'Unknown';
      } else {
        const selected = ctrl.selectedValues && ctrl.selectedValues.find(s => s.CODE === ctrl.values[0]);
        return selected ? selected.TEXT : 'Unknown';
      }
    }
  }



  /**
   * Function to load dropdown values of already selcted filters
   */
  loadDropValues(fldC: FilterCriteria) {
    if (fldC) {
      const dropArray: DropDownValue[] = [];
      fldC.values.forEach(val => {
        const dropDetails = fldC.selectedValues && fldC.selectedValues.find(v => v.CODE === val);
        const drop: DropDownValue = dropDetails || { CODE: val, FIELDNAME: fldC.fieldId } as DropDownValue;
        dropArray.push(drop);
      });
      this.loadDopValuesFor = { fieldId: fldC.fieldId, checkedValue: dropArray };
    }
  }


  /**
   * Function to remove filters on clicking cross icon
   * @param ctrl Filter criteria
   */
  removeAppliedFilter(ctrl: FilterCriteria, sNo: number) {
    this.subscriberData.forEach((subscriber) => {
      if (subscriber.sno === sNo) {
        subscriber.filterCriteria.forEach((res) => {
          if (res.fieldId === ctrl.fieldId) {
            subscriber.filterCriteria.splice(subscriber.filterCriteria.indexOf(res), 1);
          }
        })
        subscriber.schemaId = this.schemaId;
        subscriber.sno = sNo.toString();
        delete subscriber.userMdoModel;

        this.schemaDetailsService.createUpdateUserDetails(Array(subscriber)).subscribe((res) => {
          this.getSubscriberList(this.schemaId, false);
        }, error => {
          console.log('Error while removing filter from subscriber', error.message);
        })
      }
    })
  }


  /**
   * Function to delete subscriber from schema
   * @param sNo serial No of the subscriber.
   */
  public deleteSubscriber(sNo: string) {
    console.log(sNo);
    this.globalDialogService.confirm({ label: 'Are you sure you want to delete this ?' }, (response) => {
      this.deleteSubsAfterConfirm(response, sNo)
    });
  }

  deleteSubsAfterConfirm(response: string, sNo: string) {
    if (response && response === 'yes') {
      const sNoList = [];
      sNoList.push(sNo);
      const deleteSubscriber = this.schemaDetailsService.deleteCollaborator(sNoList).subscribe(res => {
        this.matSnackBar.open('Subscriber deleted successfully.', 'okay', { duration: 5000 });
        this.getSubscriberList(this.schemaId, false);
      }, error => {
        console.log('Error while deleting subscriber', error.message)
      })
      this.subscriptions.push(deleteSubscriber);
    }
  }

  /**
   * Function to edit subscriber details of schema
   * @param sNo serial Number of subscriber
   */
  public editSubscriberInfo(sNo: number) {
    this.router.navigate([{ outlets: { sb: `sb/schema/subscriber/${this.moduleId}/${this.schemaId}/${sNo}` } }])
  }


  /**
   * Function to update subscriber filter criteria
   * @param sNo serial number of subscriber
   * @param schemaId schema id
   * @param exitingFilterCtrl array of filter criteria
   */
  updateSubscriberInfo(sNo: number, exitingFilterCtrl: FilterCriteria[]) {
    /**
     * Filter data according to sNo.
     */
    this.subscriberData.filter((data) => {
      if (data.sno === sNo) {
        /**
         * Prepare the data of subscriber to send into API
         */
        data.schemaId = this.schemaId;
        data.sno = data.sno.toString();

        /**
         * Delete not required fields for UPDATE api
         */
        delete data.userMdoModel;

        exitingFilterCtrl.map((fltr) => {
          data.filterCriteria.push(fltr);
        })
        const collaboratorArray = [];
        collaboratorArray.push(data)
        this.schemaDetailsService.createUpdateUserDetails(collaboratorArray).subscribe((res) => {
          this.getSubscriberList(this.schemaId, false);
        }, error => {
          console.log('Error while update subscriber filter information', error.message)
        })
      }
    })
  }

  /**
   * Function to fetch selected subscriber from a dropdown
   * @param selectedValues list of selected drop down values
   * @param sNo serial number of subscriber
   */
  fetchSelectedValues(selectedValues, sNo: number) {
    if (selectedValues.length > 0) {
      this.subscriberData.forEach((subscriber) => {
        if (subscriber.sno === sNo) {
          subscriber.schemaId = this.schemaId;
          subscriber.sno = sNo.toString();
          delete subscriber.userMdoModel;

          subscriber.filterCriteria.forEach((filterCtrl) => {
            if (filterCtrl.fieldId === selectedValues[0].fieldId) {
              filterCtrl.values.length = 0;
              filterCtrl.textValues = [];
              filterCtrl.selectedValues = selectedValues;
              selectedValues.forEach((value) => {
                filterCtrl.values.push(value.CODE);
                filterCtrl.textValues.push(value.TEXT ? value.TEXT : value.CODE);
              })
            }
          })
          this.schemaDetailsService.createUpdateUserDetails(Array(subscriber)).subscribe(res => {
            this.getSubscriberList(this.schemaId, false)
          })
        }
      })
    }
  }

  /**
   * function to open dataScope side sheet(Add new data scope).
   */
  addDataScope() {
    this.router.navigate([{ outlets: { sb: `sb/schema/data-scope/${this.moduleId}/${this.schemaId}/new/sb` } }]);
  }

  /**
   * Function to open summary side sheet of schema
   */
  openSummarySideSheet() {
    this.router.navigate([{ outlets: { sb: `sb/schema/check-data/${this.moduleId}/${this.schemaId}` } }], {
      queryParams: {
        isCheckData: true
      }
    });
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
   * Function to open schedule side-sheet
   * @param scheduleId: schedule Id
   */
  openScheduleSideSheet(scheduleId?: string) {
    if (!scheduleId) {
      this.router.navigate([{ outlets: { sb: `sb/schema/schedule/${this.schemaId}/new` } }])
    }
    else {
      this.router.navigate([{ outlets: { sb: `sb/schema/schedule/${this.schemaId}/${scheduleId}` } }])
    }
  }

  /**
   * Function to change state of enable/disable schedule
   */
  toggleScheduleState() {
    this.scheduleInfo.isEnable = !this.scheduleInfo.isEnable;
    const updateSubscriber = this.schemaService.createUpdateSchedule(this.schemaId, this.scheduleInfo).subscribe((response) => {
      this.matSnackBar.open('This action has been confirmed..', 'okay', {
        duration: 3000
      })
    }, (error) => {
      console.log('Error while updating scheduler..', error.message);
      this.matSnackBar.open('Something went wrong..', 'okay', {
        duration: 3000
      })
    })
    this.subscriptions.push(updateSubscriber);
  }

  /**
   * Function to get schedule information
   * @param schemaId: Id of schema for which schedule info needed
   */
  getScheduleInfo(schemaId: string) {
    const scheduleSubscription = this.schemaService.getSchedule(schemaId).subscribe((response) => {
      this.scheduleInfo = response;
      response ? this.canEditSchedule = true : this.canEditSchedule = false;
    }, (error) => {
      console.log('Something went wrong when getting schedule information.', error.message);
    })
    this.subscriptions.push(scheduleSubscription);
  }

  /**
   * Function to open business rule library side sheet
   * It holds all the business rules inside it.
   */
  openBrLibrarySideSheet() {
    this.router.navigate([{ outlets: { sb: `sb/schema/businessrule-library/${this.moduleId}/${this.schemaId}/${this.outlet}` } }])
  }

  triggerSearch(str) {
    this.serachFieldsSub.next(str);
  }

  /**
   * Function to get info of all business rules.
   * @param moduleId ID of module
   * @param searchString string to be searched
   * @param brType type of business rule
   * @param loadMore load more
   */
  getAllBusinessRulesList(moduleId: string, searchString: string, brType: string, loadMore?) {
    console.log('loading more ', loadMore);
    this.brSearchString = searchString || '';
    if (loadMore) {
      this.brListFetchCount++;
    } else {
      this.brListFetchCount = 0;
    }
    const getAllBrSubscription = this.schemaService.getBusinessRulesByModuleId(moduleId, searchString, brType, `${this.brListFetchCount}`).subscribe((rules: CoreSchemaBrInfo[]) => {
      if (loadMore) {
        if (rules && rules.length) {
          this.allBusinessRulesList = [...this.allBusinessRulesList, ...rules];
        } else {
          this.brListFetchCount--;
        }
      } else {
        this.allBusinessRulesList = rules || [];
      }
    }, (error) => {
      console.error('Error while getting all business rules list', error.message);
    });
    this.subscriptions.push(getAllBrSubscription);
  }

  /**
   * Function to add business rule to schema
   * @param brInfo: business rule information for schema.
   */
  async addBusinessRule(brInfo) {
    if(!await this.canAllowNewBR(brInfo)) {
      return false;
    }
    console.log(brInfo);
    const request: CoreSchemaBrInfo = new CoreSchemaBrInfo();
    request.brId = '';
    request.schemaId = this.schemaId;
    request.brInfo = brInfo.brInfo;
    request.brType = brInfo.brType;
    request.fields = brInfo.fields;
    request.message = brInfo.message;
    request.moduleId = this.moduleId;
    request.isCopied = true;
    request.copiedFrom = brInfo.brIdStr;
    request.brWeightage = '0';
    request.accuracyScore = brInfo.accuracyScore;
    request.categoryId = brInfo.categoryId;
    request.apiKey = brInfo.apiKey;
    request.target_field = brInfo.target_field;
    request.source_field = brInfo.source_field;

    console.log(brInfo);
    const checkExistBr = this.businessRuleData.filter((businessRule) => businessRule.brIdStr === brInfo.brIdStr)[0];
    const checkExistCopiedBr = this.businessRuleData.filter((businessRule) => businessRule.copiedFrom === brInfo.brIdStr)[0];
    if (checkExistBr || checkExistCopiedBr) {
      this.matSnackBar.open('This business rule is already added.', 'Okay', {
        duration: 2000
      })
    }
    else {
      if (brInfo.brType === 'BR_DUPLICATE_CHECK') {
        const subscription = this.schemaService.copyDuplicateRule(request).subscribe((response) => {
          console.log(response);
          this.getBusinessRuleList(this.schemaId, false);
        }, (error) => {
          console.log('Error while adding business rule', error.message);
        })
        this.subscriptions.push(subscription);
      }

      else {
        const subscription = this.schemaService.createBusinessRule(request).subscribe((response) => {
          console.log(response);
          this.getBusinessRuleList(this.schemaId, false);
        }, (error) => {
          console.log('Error while adding business rule', error.message);
        })
        this.subscriptions.push(subscription);
      }
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
   * Function to change role of subscriber
   * @param subscriber information of subscriber
   * @param role updated role
   */
  updateRole(subscriber, role) {
    this.roles.forEach((r) => {
      subscriber[r.code] = false;
    })

    subscriber[role] = true;
    subscriber.schemaId = this.schemaId;

    const subscription = this.schemaDetailsService.createUpdateUserDetails(Array(subscriber)).subscribe(res => {
      this.getSubscriberList(this.schemaId, false)
    }, (error) => {
      console.log('Something went wrong while update role..', error.message);
    })
    this.subscriptions.push(subscription);
  }

  /**
   * Function to update schema name and desc
   * @param schemaDescription: updated schema description.
   * @param event: event of mat slider(for schema threshold).
   */
  updateSchemaInfo(schemaDescription: string, event?: any, field = null) {
    if (this.schemaDetails && schemaDescription !== this.schemaDetails.schemaDescription || event) {
      const schemaReq: CreateUpdateSchema = new CreateUpdateSchema();
      schemaReq.moduleId = this.moduleId;
      schemaReq.schemaId = this.schemaId;
      schemaReq.discription = schemaDescription;
      schemaReq.schemaThreshold = event ? event.value : this.schemaDetails.schemaThreshold;
      schemaReq.schemaCategory = this.schemaDetails.schemaCategory;

      // Show schema loader only when changing the schema name
      let isNameUpdated = false;
      if(this.schemaDetails?.schemaDescription !== schemaReq.discription) {
        this.schemaLoader = {
          loading: true,
          error: false
        };
        isNameUpdated = true;
      }
      const subscription = this.schemaService.createUpdateSchema(schemaReq).subscribe((response) => {
        this.schemaLoader = {
          loading: false,
          error: false
        };
        if(isNameUpdated) {
          this.sharedService.setRefreshSecondaryNav(SecondaynavType.schema, true, this.moduleId, {
            moduleId: this.moduleId,
            schemaId: this.schemaId,
            schemaName: schemaDescription
          });
        }
        if (field) {
          this.toasterService.open(`Schema ${field} updated successfully.`, 'ok', {
            duration: 2000
          });
        }
        this.getSchemaDetails(this.schemaId, false);
      }, (error) => {
        if(this.schemaDetails?.schemaDescription !== schemaReq.discription) {
          this.schemaLoader = {
            loading: false,
            error: true
          };
        }
        this.toasterService.open('Something went wrong', 'ok', {
          duration: 2000
        });
        console.error('Something went wrong while updating schema info', error.message);
      })
      this.subscriptions.push(subscription);
    }
  }

  /**
   * Function to call when schema threshold is changed in slider
   * @param $event: updated schema description.
   */
  onChangeSchemaThreshold($event) {
    console.log($event);
    if (this.schemaThresholdChanged.observers.length === 0) {
      this.schemaThresholdChanged
        .pipe(debounceTime(1000), distinctUntilChanged())
        .subscribe(threshold => {
          this.updateSchemaInfo(this.schemaDetails.schemaDescription, { value: threshold }, 'threshold');
        });
    }
    this.schemaThresholdChanged.next($event);
  }
  /**
   * Function to call when schema description is changed in inputbox
   * @param $event: updated schema description.
   */
  onChangeSchemaDescription($event) {
    if(this.schemaSummaryForm.controls.schemaName.errors) { return; }

    if (this.schemaValueChanged.observers.length === 0) {
      this.schemaValueChanged
        .pipe(distinctUntilChanged())
        .subscribe(schema => {
          this.updateSchemaInfo(schema, null, null);
        });
    }
    this.schemaValueChanged.next($event);
  }

  updateDepRule(br: CoreSchemaBrInfo, value?: any) {
    const event = this.depRuleList.find(depRule => depRule.value === value || depRule.key === value);
    const index = this.businessRuleData.findIndex(item => item.brIdStr === br.brIdStr);
    if (event.value !== RuleDependentOn.ALL) {
      const tobeChild = this.businessRuleData[index]
      if (this.businessRuleData[index - 1].dep_rules) {
        this.addChildatSameRoot(tobeChild, index);
      }
      else {
        this.businessRuleData[index - 1].dep_rules = [];
        this.addChildatSameRoot(tobeChild, index);
      }
      const idxforChild = this.businessRuleData[index - 1].dep_rules.findIndex(item => item.brIdStr === tobeChild.brIdStr);
      this.businessRuleData[index - 1].dep_rules[idxforChild].dependantStatus = event.value;
      this.businessRuleData.splice(index, 1);
      const request: CoreSchemaBrMap = new CoreSchemaBrMap();
      request.brWeightage = Number(br.brWeightage);
      request.schemaId = this.schemaId;
      request.brId = br.brIdStr;
      request.order = br.order;
      request.status = br.status
      request.dependantStatus = event.key || br.dependantStatus;
      const updateBusinessRule = this.schemaService.updateBrMap(request).subscribe(res => {
        if (res) {
          this.getBusinessRuleList(this.schemaId, false);
        }
      }, error => console.error(`Error : ${error.message}`));
      this.subscriptions.push(updateBusinessRule);
    }
  }

  addChildatSameRoot(tobeChild: CoreSchemaBrInfo, index: number) {
    this.businessRuleData[index - 1].dep_rules.push(tobeChild)
    if (tobeChild.dep_rules)
      tobeChild.dep_rules.forEach(element => {
        this.businessRuleData[index - 1].dep_rules.push(element);
      });
  }

  updateDepRuleForChild(br: CoreSchemaBrInfo, index: number, value?: any) {
    const event = this.depRuleList.find(depRule => depRule.value === value || depRule.key === value);
    const idx = this.businessRuleData.findIndex(item => item.brIdStr === br.brIdStr);
    this.businessRuleData[idx].dep_rules[index].dependantStatus = event.value;
    const childIdx = this.businessRuleData[idx].dep_rules[index]

    if (event.value === RuleDependentOn.ALL) {
      childIdx.dep_rules = [];
      this.businessRuleData.push(childIdx);
      this.businessRuleData[idx].dep_rules.splice(index, 1);
    }

    const request: CoreSchemaBrMap = new CoreSchemaBrMap();
    request.brWeightage = Number(childIdx.brWeightage);
    request.schemaId = this.schemaId;
    request.brId = childIdx.brIdStr;
    request.order = childIdx.order;
    request.status = childIdx.status
    request.dependantStatus = this.depRuleList.find(x => x.value === childIdx.dependantStatus)?.key;
    const updateBusinessRule = this.schemaService.updateBrMap(request).subscribe(res => {
      if (res) {
        this.getBusinessRuleList(this.schemaId, false);
      }
    }, error => console.error(`Error : ${error.message}`));
    this.subscriptions.push(updateBusinessRule);
  }

  deleteSchema() {
    this.globalDialogService.confirm({ label: 'Are you sure you want to delete this ?' }, (response) => {
      if (response === 'yes') {
        this.schemaService.deleteSChema(this.schemaId)
        .subscribe(resp => {
          this.router.navigate(['home', 'schema', this.moduleId]);
          this.sharedService.setRefreshSecondaryNav(SecondaynavType.schema, true, this.moduleId);
          this.toasterService.open('Schema deleted successfully.', 'ok', { duration: 2000 });
        }, error => {
          this.toasterService.open('Something went wrong', 'ok', { duration: 2000 });
        });
      }
    });
  }
  getCurrentBrStatus(status) {
    return status ? status : 'ALL';
  }
  getCurrentBrStatusObj(status) {
    return this.depRuleList.find(depRule => depRule.key === status || depRule.value === status) || this.depRuleList[0];
  }

  getStatusIcon(controlName: string, loader: any): any {
    const status = {
      icon: '',
      font: '',
      type: ''
    }

    if (this.schemaSummaryForm.controls[controlName].touched) {
      if (this.schemaSummaryForm.controls[controlName].value) {
        status.icon = 'clock';
        status.font = '';
        status.type = '';

        if (!loader.loading && loader.error) {
          status.icon = 'exclamation-circle';
          status.type = 'error';
          status.font = 'solid';
        }
        if (!loader.loading && !loader.error) {
          status.icon = 'check';
          status.type = 'success';
        }
      }
    }

    return status;
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
      this.currentVariantCnt = this.module?.datasetCount || 0;
    }
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
   * Run schema now ..
   * @param schema runable schema details .
   */
  runSchema() {
    if (!this.businessRuleData.length) {
      this.schemaRunFailMsg = 'Schema should have atleast one business rule';
      setTimeout(() => {
        this.schemaRunFailMsg = '';
      }, 2000);

      return;
    }

    const schemaExecutionReq: SchemaExecutionRequest = new SchemaExecutionRequest();
    schemaExecutionReq.schemaId = this.schemaId;
    schemaExecutionReq.variantId = this.dataScopeControl.value ? this.dataScopeControl.value : '0'; // 0 for run all
    this.schemaExecutionService.scheduleSChema(schemaExecutionReq, false).subscribe(data => {
      this.schemaDetails.isInRunning = true;
      this.sharedService.setSchemaRunNotif(true);
    }, (error) => {
      this.errorStateRes = error?.error;
      this.schemaRunFailMsg = '';
      console.log('Something went wrong while running schema', error.message);
    });
  }

  openExecutionTrendSidesheet() {
    const schema = this.schemaDetails;
    this.router.navigate(['', { outlets: { sb: `sb/schema/execution-trend/${schema.moduleId}/${schema.schemaId}/${this.dataScopeControl.value}` } }], {queryParamsHandling: 'preserve'});
  }

  openDatascopeListSidesheet() {
    const state: DataScopeSidesheet = {
      openedFrom: 'schemaInfo',
      editSheet: false,
      listSheet: true
    };
    this.sharedService.setdatascopeSheetState(state);
    this.router.navigate([ { outlets: { sb: `sb/schema/data-scope/list/${this.moduleId}/${this.schemaId}/sb` } }], {queryParamsHandling: 'preserve'});
  }

  /**
   * Sanitize Form control value
   * @param control Form control
   */
  sanitizeValue(control) {
    control.setValue(control.value.replace(/[^a-zA-Z0-9 ]/g, ''));
  }

  trackByBrId(index: number, br: CoreSchemaBrInfo): string {
    return br.brId;
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

  exportSchema() {
    // const schema = this.schemaDetails;
    this.schemaService.exportSchema(this.schemaId)
      .subscribe(resp => {
        this.toasterService.open('The schema configuration has been exported', '', { duration: 2000 });
      }, error => {
        this.toasterService.alert({
          data: {dialogTitle: 'Alert', label: `There was an error exporting the schema: ${error?.message}`},
          disableClose: true,
          autoFocus: false,
          width: '400px',
          panelClass: 'create-master-panel',
        }, (response) => {});
      });
  }
}