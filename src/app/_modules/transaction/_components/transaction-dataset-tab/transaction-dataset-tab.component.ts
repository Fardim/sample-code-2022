import { Component, Inject, Input, LOCALE_ID, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { DatasetForm } from '@models/list-page/listpage';
import { HierarchyListItem, HierarchyService } from '@modules/list/_components/field/hierarchy-service/hierarchy.service';
import { ActiveForm, CurrentReferenceFormDetails, Process, TabResponse } from '@modules/transaction/model/transaction';
import { TransactionService } from '@modules/transaction/_service/transaction.service';
import { CoreService } from '@services/core/core.service';
import { RuleService } from '@services/rule/rule.service';
import { forkJoin, Subject } from 'rxjs';
import { distinctUntilChanged, map, take, takeUntil } from 'rxjs/operators';
import { sortBy } from 'lodash';
import { DataControlService } from '@modules/transaction/_service/data-control.service';
import { UserService } from '@services/user/userservice.service';
import { FormControl, Validators } from '@angular/forms';
import { CoreCrudService } from '@services/core-crud/core-crud.service';

@Component({
  selector: 'pros-transaction-dataset-tab',
  templateUrl: './transaction-dataset-tab.component.html',
  styleUrls: ['./transaction-dataset-tab.component.scss']
})
export class TransactionDatasetTabComponent implements OnInit, OnChanges, OnDestroy {

  @Input()
  moduleId: string;

  @Input()
  layoutId: string;

  @Input()
  process = Process.create;

  @Input()
  isChildDataset: boolean;

  @Input()
  recordId: string;

  @Input()
  crId: string;

  @Input()
  dataControl;

  @Input()
  relatedDatasets = [];

  @Input()
  dataEventId: string;

  @Input() flowId: string;
  @Input() stepId: string;

  @Input()
  sidebarToggleState: boolean = false;
  /**
   * layout details
   */
  layoutDetails: DatasetForm;

  tabList: Array<TabResponse> = [];

  activeStructures = [1];

  hierarchyListSearchTerm = '';
  hierarchyListPageIndex = 0;
  hierarchyListPageSize = 50;
  hierarchyList: HierarchyListItem[] = [];
  searchSub: Subject<string> = new Subject();

  /**
   * search string for searching the conditions
   */
  conditionSearchString='' ;
  /**
   * conditions table page index
   */
  conditionsPageIndex=1;
  /**
   * default size for one page of conditions table
   */
  conditionsPageSize=10;

  rulesList: Array<any> = [];
  rulesDetails: Array<any> = [];
  allRecordsList = {};

  widthOfHierarchies=240;
  arrowIcon = 'chevron-left';
  activeTabsArray = null;
  activeForm: ActiveForm;
  isTabArrayLoading = false;
  unsubscribeAll$: Subject<boolean> = new Subject<boolean>();
  isLoadingTemplate = false;
  tenantId: string = null;
  userId: string = null;
  datasetDescription;
  constructor(private coreService: CoreService,
    private hierarchyService: HierarchyService,
    private ruleService: RuleService,
    private transactionService: TransactionService,
    private dataControlService: DataControlService,
    private userService: UserService,
    private coreCrudService: CoreCrudService,
    @Inject(LOCALE_ID) public locale: string) {
    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes && changes.moduleId && changes.moduleId.previousValue !== changes.moduleId.currentValue) {
      this.getAllRules();
    }

    if(changes.sidebarToggleState?.currentValue !== undefined) {
      this.sidebarToggleState = changes.sidebarToggleState.currentValue;
      if (!this.sidebarToggleState) {
        this.arrowIcon = 'chevron-right';
        this.widthOfHierarchies=0;
      } else {
        this.arrowIcon = 'chevron-left';
        this.widthOfHierarchies=276;
      }
    }
    // if(changes && changes.layoutId && changes.layoutId.previousValue !== changes.layoutId.currentValue) {
    //   this.getLayoutDetails();
      // this.getLayoutTabList(this.activeStructures);
    // }
  }

  ngOnInit(): void {
    this.userService
        .getUserDetails()
        .pipe(distinctUntilChanged())
        .subscribe((user) => {
          if (user?.plantCode) {
            this.tenantId = user?.plantCode;
            this.userId = user?.userId;
        }});
    this.dataControlService.activeForm$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((activeForm: ActiveForm) => {
      if(activeForm) {
        this.activeForm = activeForm;
        const dataset = this.relatedDatasets.filter(item => item.childDatasetId === this.moduleId);
          if(dataset.length) {
            this.datasetDescription = dataset[0].childDescription || dataset[0].childDatasetId;
          }
        if(activeForm.referenceRecordDetails) {
          this.activeTabsArray = this.dataControlService.getReferenceRecordForm(this.dataControl, activeForm.referenceRecordDetails);
          const masterData = this.transactionService.getMasterData(this.activeForm.isPrimary, this.moduleId, null, activeForm.referenceRecordDetails);
          if(!masterData)
            this.setMasterData(activeForm.objnr, activeForm.referenceRecordDetails);
          this.structureChanged([1]);
          return;
        }
        if(!activeForm.isPrimary) {
          if(activeForm.objnr) {
            this.activeTabsArray = this.dataControlService.getRecordForRelatedModuledId(this.dataControl, activeForm);
          }else {
            this.activeTabsArray = this.dataControlService.getFirsrtRecordForRelatedModuledId(this.dataControl, activeForm);
            if(this.process !== Process.create) {
              this.getChildRecord();
            }
          }
          if(activeForm.isNew) {
            const masterData = this.transactionService.getMappedTempateByDatasetId(this.moduleId);
            if(!masterData)
              this.setMasterData(activeForm.objnr);
            else {
              const updatedMasterData = this.process === Process.create ? masterData : this.removeCurrentValues(masterData);
              this.transactionService.setMasterData(this.activeForm.isPrimary, this.moduleId, updatedMasterData, true, activeForm.objnr);
            }
          }
          this.structureChanged([1]);
        }else {
          this.activeTabsArray = this.dataControlService.getActiveForm(this.dataControl, activeForm);
          this.getLayoutDetails();
        }
      }
    });

    this.transactionService.updateValidators.
    pipe(takeUntil(this.unsubscribeAll$)).
      subscribe((resp: any) => {
        this.validateRules(resp);
        console.log('resp');
     });
  }

  removeCurrentValues(masterData) {
    const mdoRecordEs = masterData.mdoRecordES;
    if(!mdoRecordEs) return masterData;
    if(!mdoRecordEs.hdvs) return masterData;
    const hdvs = mdoRecordEs.hdvs;
    Object.keys(hdvs).forEach((fieldId) => {
      if(hdvs[fieldId] && hdvs[fieldId].vc) {
        hdvs[fieldId].vc = [{c: null, t: null}];
      };
    });
    masterData.mdoRecordES.hdvs = hdvs;
    return masterData;
  }

  getChildRecord() {
    if(this.process !== Process.create) {
      const parentDatasetId = this.transactionService.parentDatasetIdSub.getValue();
      const masterRecord = this.transactionService.getMasterData(this.activeForm.isPrimary, this.moduleId);
      if(!masterRecord) {
        this.coreCrudService.getRelatedChildRecords(this.moduleId, parentDatasetId, this.recordId, 0, 0, '', this.locale, this.crId).subscribe((records: any) => {
          console.log('child record: ', records);
          // form controls for the child record
          if(records) {
            const recordObj = {};
            const dto = {
              getAllData: true,
              getWfvs: true,
              keyFields: {},
            };
            records.forEach((record)  => {
              recordObj[record.recordNumber] =
                  this.coreCrudService.getMDOCrRecord(this.moduleId, record.recordNumber, this.locale, '1', this.tenantId, dto, record.crId, this.dataEventId)
                                      .pipe(map((item) =>{ return {...item, crId: record.crId}}));
            });
            let recordToNavigate = null;
            forkJoin(recordObj).subscribe((resp: any) => {
              Object.keys(resp).forEach((recordNumber, index) => {
                this.transactionService.setMasterData(this.activeForm.isPrimary, this.moduleId, resp[recordNumber], true, recordNumber);
                this.dataControlService.addNewRecord({
                  dataControl: this.dataControl,
                  moduleId: this.moduleId,
                  isNewRecord: false,
                  navigateTo: false,
                  recordNumber
                });
                if(index === 0) {
                  recordToNavigate = recordNumber;
                }
              });
              this.dataControlService.activeForm$.next({isPrimary: false, moduleId: this.moduleId, objnr: recordToNavigate, isNew: false})
            });
          }
        },
        (error: any) => {
            console.error('Some error occured: ', error);
          }
        );
      }
    }
  }

  validateRules(rules) {
    if(rules.rules.length) {
      rules.rules.forEach((item: any) => {
        const targetFieldDetails = this.transactionService.getFieldDetailById(item.targetField);
        if(targetFieldDetails) {
          if(!targetFieldDetails.parentField) {
            const targetControl = this.dataControlService.getControByFieldName(this.dataControl, this.activeForm, targetFieldDetails.fieldId);
            const targetFieldValidators = this.transactionService.getFieldValidators(targetFieldDetails);
            const isDropdown = this.isListField(targetFieldDetails);
            switch(item.propertyKey) {
              case 'MANDATORY':
                if(rules.sourceValue === item.sourceValue) {
                  targetControl.setValidators([...targetFieldValidators, Validators.required]);
                  if(item.targetIsDefault) {
                    if(isDropdown) targetControl.setValue(this.getDropdownValue(item));
                    else targetControl.setValue(item.targetValue);
                  }
                }
                else {
                  targetControl.clearValidators();
                  targetControl.setValidators([...targetFieldValidators]);
                }
                break;
              case 'READ_ONLY':
                if(rules.sourceValue === item.sourceValue) {
                  if(item.targetIsDefault) {
                    if(isDropdown) targetControl.setValue(this.getDropdownValue(item));
                    else targetControl.setValue(item.targetValue);
                  }
                  targetControl.disable();
                }
                else {
                  if(!targetFieldDetails?.fieldCtrl.isReadOnly)
                    targetControl.enable();
                }
                break;
              case 'HIDDEN':
                if(rules.sourceValue === item.sourceValue) {
                  this.transactionService.updateRuleHidden(item.targetField, true);
                }else {
                  this.transactionService.updateRuleHidden(item.targetField, false);
                }
                break;
              default:
                if(item.targetIsDefault) {
                  if(isDropdown) targetControl.setValue(this.getDropdownValue(item));
                  else targetControl.setValue(item.targetValue);
                }
            }
            if(targetControl)
              (targetControl as FormControl).updateValueAndValidity({emitEvent: false});
          }else {
            const tableValidatorObj = {
              fieldId: item.targetField,
              parentFieldId: targetFieldDetails.parentField,
              propertyKey: item.propertyKey,
              isRuleSatisfy: rules.sourceValue === item.sourceValue
            };
            this.transactionService.updateTableValidators.next(tableValidatorObj);
          }
        }
      });
    }
   }

  isListField(fieldObj): boolean {
    return (fieldObj?.fieldCtrl?.pickList === '1') || (fieldObj?.fieldCtrl?.pickList === '37');
  }

  getDropdownValue(item) {
    return [{code: item.targetValue, text: item.targetValueText || item.targetValue, textRef: item.targetUuid || item.targetValue}];
  }


  getAllStructures(loadMore?) {
    if(!this.moduleId || !this.locale) { return; };

    if(loadMore) {
      this.hierarchyListPageIndex++;
    } else {
      this.hierarchyListPageIndex = 0;
    }
    this.coreService.getAllStructures(
      this.moduleId,
      this.locale,
      this.hierarchyListPageIndex,
      this.hierarchyListPageSize,
      this.hierarchyListSearchTerm).subscribe((response) => {
        const hierarchies = response?.length ? this.hierarchyService.transformStructureToHierarchy(response) : [];
        if(hierarchies.length) {
          if(loadMore) {
            this.hierarchyList = this.hierarchyList.concat(hierarchies);
          } else {
            this.hierarchyList = hierarchies;
          }
        } else if(loadMore) {
          this.hierarchyListPageIndex--;
        } else if (this.hierarchyListSearchTerm) {
          this.hierarchyList = [];
        }
      }, error => {
        console.error(`Error:: ${error.message}`);
      });
  }

  getAllRules(){
    const payload ={
      pageInfo: {
        pageNumber: 0,
        pageSize: 30
      },
      searchString: ''
    }
    this.ruleService.getModuleRules(this.moduleId, payload).subscribe((resp)=>{
        this.rulesList.length=0;
         resp.response.content.map((row)=>{
               this.rulesList.push({
                 description:row.description,
                 status:row.status,
                 uuid:row.uuid,
                 groupId:row.groupId,
                 moduleId:row.moduleId,
               });
         });
         this.getRulesDetails();
    })
  }

  getRulesDetails() {
    const rulesRequestObs = [];
    if(this.rulesList.length) {
      this.rulesList.forEach((item: any) => {
        if(item.groupId) {
          const payload = {
            pageInfo: {
              pageNumber: this.conditionsPageIndex - 1,
              pageSize: 0,
            },
            searchString: ''
          }
          rulesRequestObs.push(this.ruleService.getGroupConditions(item.groupId, this.locale, payload));
        }
      });
      if(rulesRequestObs.length) {
        forkJoin([...rulesRequestObs]).subscribe((resp: any) => {
          this.rulesDetails = [];
          resp.forEach((item: any) => {
            if(item?.response?.content && item?.response?.content?.length) {
              this.rulesDetails.push(item?.response?.content);
            }
          });
          // TODO set rules based on module
          this.transactionService.setRules(this.moduleId, this.rulesDetails);
        })
      }
    }
  }

  /**
   * Get layout (view) details
   */
  getLayoutDetails(): void {
    this.coreService
      .getDatasetFormDetail(this.moduleId, this.layoutId)
      .pipe(take(1))
      .subscribe((resp: DatasetForm) => {
        this.layoutDetails = resp;
        this.transactionService.setLayoutDetails(resp);
      }, error => {
        console.error(`Error:: ${error.errorMsg}`);
    });
  }

  /**
   * Get layout tab list
   */
  getLayoutTabList(structureIds: number[]) {
    this.coreService.getDatasetFormTabs(this.layoutId, this.locale, 0, 0, structureIds).subscribe((resp: TabResponse[]) => {
      if(resp) {
        sortBy(resp, 'tabOrder');
        resp.map(m=> m.isTabReadOnly = (this.process === Process.view));
        this.tabList = resp;
        this.transactionService.setNumberOfTabs(this.tabList.length);
      }
    },
    (error) => {
      console.log('error: ', error);
    }
    )
  }

  structureChanged(event) {
    this.activeStructures = event.sort();
    this.transactionService.setActiveStructuresSub(this.activeStructures);
    this.getLayoutTabList(this.activeStructures);
  }

  toggleSideBar() {
    if (this.arrowIcon === 'chevron-left') {
      this.arrowIcon = 'chevron-right';
      this.widthOfHierarchies=0;

    }
    else {
      this.arrowIcon = 'chevron-left';
      this.widthOfHierarchies=240;
    }
  }

  // new record creation handling
  createNewRecord() {
    this.dataControlService.addNewRecord({
        dataControl: this.dataControl,
        moduleId: this.moduleId,
        isNewRecord: true,
        navigateTo: true,
        description: this.datasetDescription
    });
  }

  setMasterData(objnr: string, refRecord?: CurrentReferenceFormDetails) {
    this.userService
    .getUserDetails()
    .pipe(distinctUntilChanged())
    .subscribe((user) => {
      this.isLoadingTemplate = true;
      this.coreCrudService.getTransactionDetails(this.moduleId, this.locale, user.plantCode, this.layoutId).subscribe(
        (response) => {
          let data;
          if(refRecord) {
            data = response;
            this.transactionService.setMasterData(refRecord.isParentModulePrimary, refRecord.parentModuleId, data, true, null, refRecord);
            this.isLoadingTemplate = false;
            return;
          }
          if(this.isChildDataset) {
            data =  response;
            this.transactionService.setMasterData(this.activeForm.isPrimary, this.moduleId, data, true, objnr, null);
          }
          this.isLoadingTemplate = false;
        },
        (error) =>{
          this.isLoadingTemplate = false;
          console.error(`Error : ${error.message}`);
        }
      );
    })
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next(true);
    this.unsubscribeAll$.unsubscribe();
  }

}

