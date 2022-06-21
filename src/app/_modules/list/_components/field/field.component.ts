import { FormControl } from '@angular/forms';
import { FieldPaginationDto, FieldService } from './field-service/field.service';
import { GlobaldialogService } from '@services/globaldialog.service';
import { ObjectType } from '@models/core/coreModel';
import { TransientService } from 'mdo-ui-library';
import { CoreService } from '@services/core/core.service';
import {
  Fieldlist,
  FieldActionResponse,
  ListValueSaveModel,
  ListValueActionResponse,
  FieldlistContainer,
  FieldControlType,
  EditDataSetInfo,
  DatasetRefSaveResponse,
  Field
} from '@models/list-page/listpage';
import { takeUntil, take, debounceTime, catchError, delay, filter, tap, distinctUntilChanged, startWith } from 'rxjs/operators';
import { Subject, combineLatest, forkJoin, Observable, of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { SchemaNavGrab } from '@models/schema/schemalist';
import { Component, OnInit, ViewChild, ElementRef, OnDestroy, AfterViewInit, Inject, LOCALE_ID } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { RuleService } from '@services/rule/rule.service';
import { HierarchyListItem, HierarchyService, Structure } from './hierarchy-service/hierarchy.service';
import { get, uniq } from 'lodash';
import { Store, select } from '@ngrx/store';
import * as fromFields from '@store/selectors/field.selector';
import { State as FieldState } from '@store//models/field.model';
import * as fieldActions from '@store//actions/field.action';
import { datasetFieldsCol2, datasetFieldsCol1, systemDatasetFieldsCol1, picklistValues } from './../field/field-service/field.service';
import { Utilities } from '@models/schema/utilities';

export enum FieldLoadingState {
  LOADALL = 'loadAll',
  LOADPARTIAL = 'loadPartial',
}

@Component({
  selector: 'pros-field',
  templateUrl: './field.component.html',
  styleUrls: ['./field.component.scss'],
})
export class FieldComponent implements OnInit, OnDestroy, AfterViewInit {
  /**
   * Creating the root hierarchy right at declration
   */
  hierarchyList: HierarchyListItem[] = [];
  selectedStructureDescription: string;
  /**
   * moduleId from param
   */
  moduleId = '';

  callable = true;
  /**
   * navigation style
   */
  arrowIcon = 'chevron-left';
  public status: SchemaNavGrab = SchemaNavGrab.OFF;
  public mousePosition: { x: number; y: number };
  boxPosition: { left: number; top: number };
  /**
   * check null state and enable showDataSetFieldList
   */
  showDataSetFieldList = false;
  /**
   * first column of control types
   */
  datasetFieldsCol1 = datasetFieldsCol1;
  /**
   * second column of control types
   */
  datasetFieldsCol2 = datasetFieldsCol2;
  /**
   * when module is SYS type fields are only Text and Date
   */
  systemDatasetFieldsCol1 = systemDatasetFieldsCol1;
  /**
   * pre defined picklist values with icon and fieldType
   */
  picklistValues = picklistValues;
  unsubscribeAll$: Subject<boolean> = new Subject<boolean>();
  /**
   * currnently selected field Id
   */
  currentFieldId = '';
  parentSubGridId = null;
  childSubGridId = null;
  /**
   * currnently selected field
   */
  currentField: any = null;
  /**
   * should we show the property panel on open
   */
  openPropertyPanel = false;
  /**
   * get field from the api
   */
  datasetFieldList: FieldlistContainer[] = [];
  /**
   * get all fieldlist of multiple structureId from ngrx
   */
  allDatasetFieldList: FieldlistContainer[] = [];
  /**
   * filter by errors, changed, deleted fields
   */
  filteredDatasetFieldList: FieldlistContainer[] = [];
  /**
   * currentFilter = Deleted | Changes | Errors
   */
  currentFilter = '';

  /**
   * For edit click or not
   */
  isEditDataSet = false;
  /**
   * currentFilterSub = Deleted | Changes | Errors emits on Selection of chips at page top to filter the fields
   */
  currentFilterSub: Subject<string> = new Subject();

  structureId = '';
  /**
   * if on scroll down fetching fieldIds, then there should be another api call to get fieldIds. Used this flag to identify if a fetch is going on right now
   */
  infinteScrollLoading = false;
  /**
   * if getListFieldIdByStructure returns no fieldid then there is no more fieldIds. So, hasMoreData = false
   */
  hasMoreData = true;
  hasMoreDataByStructureId: {[key: string]: boolean} = {};
  /**
   * fieldList pagination for scroll down
   */
  recordsPageIndex = 1;
  /**
   * fieldList pagination size
   */
  recordsPageSize = 50;
  /**
   * From null state, when user wants to add manually the dataset
   */
  addManually = false;
  /**
   * Hold current module details
   */
  objectType: ObjectType = { objectdesc: '', objectInfo: '', objectid: 0 };
  /**
   * drop down list values with moduleId and fieldId
   */
  dropvalsList: ListValueSaveModel[] = [];
  /**
   * on hover of the fields on menu field explanaiton will show at menu bottom
   */
  fieldExplanation = '';
  /**
   * fields search by string
   */
  searchFieldSub: FormControl = new FormControl('');
  searchString = '';
  /**
   * Module or Dataset Details. call the backend get module details to identify is this dataset STD, SYS, TP type
   */
  selectedDatasetDetails: any;
  fieldIdsWithValidationError: { fieldId: string; isValid: boolean }[] = [];
  fieldIdsWithError: string[] = [];
  hasFieldError = false;
  fieldListLoadingState: FieldLoadingState = null;
  nextStructureId = 0;

  /**
   * track the fieldIds that has been changed
   */
  updatedFieldIds: string[] = [];

  /**
   * track the fieldIds that has been changedin all structure from ngrx
   */
  allUpdatedFieldIds: string[] = [];

  /**
   * track the fields that has been changed in all structure from ngrx
   */
  allUpdatedFields: {fieldId: string;isValid: boolean;structureId: string;}[] = []; // only tracks the root level fieldIds. to find the fields changed or updated
  childUpdatedFields: {fieldId: string;isValid: boolean;structureId: string;}[] = []; // track the root, child, subchild fieldIds that are updatd, valid or not. to find the fieldIds with error

  deletedDatasetFieldList: FieldlistContainer[] = []; // it may contain Table fields which is not deleted but its child field is deleted
  deletedFieldIds: string[] = []; // it contains specific fieldIds (root, child, subchild) which are deleted
  /**
   * disable Save and Discard button on click
   */
  saving = false;

  /**
   * Flag to handle the readonly for readonly mode
   */
  isReadOnlyMode = false;

  fieldPaginationDto: {
	  [key: string]: FieldPaginationDto
  } = {};
  currentFieldPaginationDto: FieldPaginationDto = null;


  @ViewChild('navscroll') navscroll: ElementRef;
  @ViewChild('listingContainer') listingContainer: ElementRef;
  @ViewChild('drawer') drawer: MatDrawer;

  constructor(
    public readonly route: ActivatedRoute,
    private router: Router,
    private ruleService: RuleService,
    private coreService: CoreService,
    private globalDialogService: GlobaldialogService,
    private transientService: TransientService,
    private hierarchyService: HierarchyService,
    // private fieldStore: Store<fromFields.State>,
    private fieldStore: Store<FieldState>,
    private fieldService: FieldService,
    private utilities: Utilities,
    @Inject(LOCALE_ID) public locale: string,
  ) {}

  ngAfterViewInit(): void {
    combineLatest([
      this.route.fragment.pipe(takeUntil(this.unsubscribeAll$)),
      this.route.queryParams.pipe(takeUntil(this.unsubscribeAll$)),
      this.route.params.pipe(takeUntil(this.unsubscribeAll$)),
    ])
    .pipe(delay(0), takeUntil(this.unsubscribeAll$))
    .subscribe((resp) => {
      if(!this.moduleId || (this.moduleId !== resp[2]?.moduleId)) {
        this.fieldStore.dispatch(new fieldActions.ResetAll());
        this.getResolvedData();
      }
      if (resp[2]?.type === 'read-only') {
        this.isReadOnlyMode = true;
      }
      // Detect Change in structure Id
      if(resp[1].s && (this.structureId !== resp[1].s || !this.structureId)) {
        /* clear the states for the structure change */
        // this.datasetFieldList = [];
        // this.filteredDatasetFieldList = [];
        this.clearData();
        // this.updatedFieldIds = [];
        /* clear the states for the structure change*/
        // this.getFieldList(resp[1].s, this.datasetFieldList?.length? null: FieldLoadingState.LOADALL);
        this.fieldStore.dispatch(new fieldActions.SetFieldListLoadingState(FieldLoadingState.LOADALL));
        this.structureId = resp[1].s || null;
        this.currentFieldPaginationDto = this.fieldPaginationDto[this.structureId];
        this.trackChangedFieldIds();
        this.getStructureDescription();
        this.fieldStore.dispatch(new fieldActions.SetStructureId(resp[1].s || null));

        const dto: FieldPaginationDto = this.currentFieldPaginationDto ? this.currentFieldPaginationDto : {
          moduleId: this.moduleId,
          language: this.locale,
          fetchcount: this.recordsPageIndex,
          fetchsize: this.recordsPageSize,
          searchterm: '',
          requestDTO: {
            structureId: this.structureId,
          },
        };
        this.fieldStore.dispatch(new fieldActions.DatasetFieldLoad(dto));
      }


      this.currentFieldId = resp[1].f || null;
      this.childSubGridId = resp[1].subChildField || null;
      this.parentSubGridId = resp[1].childField || null;
      if(this.datasetFieldList?.length) { this.findCurrentField(); }

      this.openPropertyPanel = !!(resp[0] === 'property-panel' && this.currentFieldId);
      this.toggleDrawerState(this.openPropertyPanel);
      if(!this.structureId && this.hierarchyList?.length) {
        this.navigateToRoute({s: this.hierarchyList[0].id }, 'property-panel');
      }
    }, (err) => {
      console.log(err);
    });
  }

  /**
   * Get the resolved data from field resolver
   */
  getResolvedData() {
    const fieldData = get(this.route.snapshot.data, 'fieldData');
    const objectTypeDetails = get(fieldData, 'objectTypeDetails', null);
    const allStructures = get(fieldData, 'allStructures', []);
    this.nextStructureId = this.findMaximumStructureId(allStructures);
    this.moduleId = get(fieldData, 'moduleId', null);
    if(objectTypeDetails) {
      /* this.objectType.objectid = objectTypeDetails.moduleid; */
      this.objectType.objectInfo = objectTypeDetails.moduleDescriptionMap[this.locale][0].information;
      this.objectType.objectdesc = objectTypeDetails.moduleDescriptionMap[this.locale][0].description;
      this.objectType.type = objectTypeDetails.type || 'STD';
    }
    this.hierarchyService.hierarchyItems = this.hierarchyService.transformStructureToHierarchy(allStructures);
  }

  ngOnInit(): void {
    this.hierarchyService.hierarchyList.subscribe((updatedHierarchyList: HierarchyListItem[]) => {
      this.hierarchyList = updatedHierarchyList;
      this.getStructureDescription();
    });
    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
    this.getResolvedData();
    this.coreService.updateFieldPropertySubject$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((resp: Partial<FieldlistContainer>) => {
      if (resp) {
        this.patchFieldList(resp);
        this.coreService.nextUpdateFieldPropertySubject(null);
      }
    });
    this.ruleService.dropvalSubject$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((resp) => {
      if (resp) {
        this.updateDropvalList(resp);
        this.ruleService.nextDropvalSubject(null);
      }
    });

    this.coreService.updateFieldFormValidationStatusSubject$
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe((resp: { fieldId: string; isValid: boolean }) => {
        if (resp) {
          this.fieldStore.dispatch(new fieldActions.SetUpdatedFields({...resp, structureId: this.structureId}));
          this.coreService.nextUpdateFieldFormValidationStatusSubject(null);
        }
      });
    this.coreService.updateChildFieldFormValidationStatusSubject$
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe((resp: { fieldId: string; isValid: boolean }) => {
        if (resp) {
          this.fieldStore.dispatch(new fieldActions.SetUpdatedChildFields({...resp, structureId: this.structureId}));
          this.coreService.nextUpdateChildFieldFormValidationStatusSubject(null);
        }
      });

    this.currentFilterSub.pipe(debounceTime(200)).subscribe((searchString) => {
      if (this.currentFilter === searchString) {
        this.currentFilter = '';
      } else {
        this.currentFilter = searchString;
      }
      this.datasetFieldListByFilter(this.currentFilter);
    });

    this.closeEditFormDrawer();
    combineLatest([
      this.fieldStore.pipe(takeUntil(this.unsubscribeAll$), select(fromFields.getDatasetPagination)),
			this.fieldStore.pipe(takeUntil(this.unsubscribeAll$), select(fromFields.getDatasetFieldList)),
      this.searchFieldSub.valueChanges.pipe(startWith("")),
		])
			.pipe(
				takeUntil(this.unsubscribeAll$),
				filter((response) => {
					return response[0] && response[1] ? true : false;
				}),
				tap(([pagination, response, search]) => {})
			)
			.subscribe((response) => {
				if (response) {
          this.searchString = response[2].toLowerCase();
          this.allDatasetFieldList = JSON.parse(JSON.stringify(response[1])) || [];
          this.datasetFieldList =
            JSON.parse(
              JSON.stringify(
                response[1].filter(
                  (d) =>
                    d.fieldlist.structureId === this.structureId &&
                    (this.searchString
                      ? d.fieldlist.shortText[this.locale].description.toLowerCase().indexOf(this.searchString) >= 0
                      : true)
                )
              )
            ) || [];
          // if(response[2]) {
          //   this.datasetFieldList = this.datasetFieldList.filter(d=> d.fieldlist.shortText[this.locale].description.toLowerCase().indexOf(response[2]) >= 0);
          // }
          this.fieldPaginationDto =  JSON.parse(JSON.stringify(response[0]));
          this.currentFieldPaginationDto = this.fieldPaginationDto[this.structureId];
          this.hasMoreDataByStructureId[this.structureId] =
            this.datasetFieldList.length >= (this.currentFieldPaginationDto ? this.currentFieldPaginationDto.fetchsize * this.currentFieldPaginationDto.fetchcount : 0);
          this.currentFilterSub.next(this.currentFilter);
          this.infinteScrollLoading = false;
          // this.fieldListLoadingState = null;
          this.fieldStore.dispatch(new fieldActions.SetFieldListLoadingState(null));
          this.findCurrentField();
				}
			}, err => {
        this.fieldStore.dispatch(new fieldActions.SetFieldListLoadingState(null));
      });

    this.fieldStore.pipe(takeUntil(this.unsubscribeAll$), select(fromFields.getFieldListLoadingState)).subscribe(resp => {
      this.fieldListLoadingState = resp;
    });

    combineLatest([
			this.fieldStore.pipe(takeUntil(this.unsubscribeAll$), select(fromFields.getFieldsUpdated)),
			this.fieldStore.pipe(takeUntil(this.unsubscribeAll$), select(fromFields.getChildFieldsUpdated)),
		]).pipe(
      takeUntil(this.unsubscribeAll$)
    ).subscribe(resp => {
      this.allUpdatedFields = JSON.parse(JSON.stringify(resp[0])) || [];
      this.childUpdatedFields = JSON.parse(JSON.stringify(resp[1])) || [];
      this.trackChangedFieldIds();
    });
    combineLatest([
			this.fieldStore.pipe(takeUntil(this.unsubscribeAll$), select(fromFields.getDeletedDatasetFieldList)),
			this.fieldStore.pipe(takeUntil(this.unsubscribeAll$), select(fromFields.getDeletedFieldIds)),
		]).pipe(
      takeUntil(this.unsubscribeAll$)
    ).subscribe(resp => {
      this.deletedDatasetFieldList = JSON.parse(JSON.stringify(resp[0])) || [];
      this.deletedFieldIds = JSON.parse(JSON.stringify(resp[1])) || [];
    });
    this.updateDatasetInfo();
  }

  updateDatasetInfo() {
    this.coreService.updateDatasetInfoSubject$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((resp: EditDataSetInfo) => {
      if (resp) {
        if ( +resp.objectId === +this.moduleId ) {
          this.objectType.objectInfo = resp.objectName;
          this.objectType.objectdesc = resp.objectdesc;
          this.coreService.nextUpdateDataSetInfoSubject(null);
        }
      }
    });
  }

  closeEditFormDrawer() {
    this.coreService.closeDrawerSubject$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((resp: boolean) => {
      if (resp) {
        this.drawer.close();
        this.coreService.closeEditDatasetFormDrawe(null);
      }
    });
  }

  getStructureDescription() {
    if(this.structureId) {
      this.selectedStructureDescription = this.hierarchyService.getHierarchyByHierarchyId(parseInt(this.structureId, 0))?.label;
    }
  }

  hierarchyUpdate(event: any) {
    this.getAllStructures(this.moduleId, this.locale);
  }

  getAllStructures(moduleId: string, language: string) {
    if(!moduleId || !language) { return; };
    this.coreService.getAllStructures(moduleId, language, 0, 50).subscribe((response) => {
      if(response?.length) {
        this.hierarchyService.hierarchyItems = this.hierarchyService.transformStructureToHierarchy(response);
        this.nextStructureId = this.findMaximumStructureId(response);
      }
    });
  }

  findMaximumStructureId(response: Structure[]) {
    let temp = 0;
    response.map((node) => {
      temp = temp>node.structureId? temp: node.structureId;
    });

    return temp+1;
  }

  datasetFieldListByFilter(currentFilter: string) {
    switch (currentFilter) {
      case 'Deleted':
        this.filteredDatasetFieldList = this.datasetFieldList.filter((d) => d.fieldlist.deleted === true);
        break;
      case 'Changes':
        this.filteredDatasetFieldList = this.datasetFieldList.filter(
          (d) => this.allUpdatedFields.findIndex((f) => f.fieldId === d.fieldId) >= 0
        );
        break;
      case 'Errors':
        this.filteredDatasetFieldList = this.datasetFieldList.filter((d) => this.fieldIdsWithError.indexOf(d.fieldId) >= 0);
        break;

      default:
        this.filteredDatasetFieldList = this.datasetFieldList.slice();
        break;
    }
  }

  trackChangedFieldIds() {
    this.allUpdatedFieldIds =this.allUpdatedFields.map(d=> d.fieldId);
    this.updatedFieldIds = this.allUpdatedFields.filter(d=> d.structureId === this.structureId).map(d=> d.fieldId);
    this.hasFieldError = this.childUpdatedFields.filter(d=> d.structureId === this.structureId).findIndex((d) => d.isValid === false) >= 0;
    this.fieldIdsWithError = [
      ...this.childUpdatedFields.filter(d=> d.structureId === this.structureId &&  d.isValid === false).map((d) => d.fieldId)
    ];
  }

  showFirstFieldWithError() {
    if (this.fieldIdsWithError.length > 0) {
      this.navigateToRoute({f: this.fieldIdsWithError[0]}, 'property-panel')
    }
  }

  navigateToRoute(queryParams: any, fragment: string, preserveFragment: boolean = false) {
    this.router.navigate(
      ['./'],
      {
        relativeTo: this.route,
        queryParams: { update: true, s: this.structureId, ...queryParams },
        fragment,
        preserveFragment
      });
  }

  /**
   * get current module details
   */
  getObjectTypeDetails() {
    this.coreService
      .getObjectTypeDetails(this.moduleId, this.locale)
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          this.objectType.objectid = response.moduleid;
          this.objectType.objectdesc = response.description;
          this.objectType.type = response.type || 'SYS';
        },
        (error) => {
          console.error(`Error : ${error.message}`);
        }
      );
  }

  toggleDrawerState(isOpen: boolean = false) {
    if(!this.drawer) { return; }

    isOpen && this.structureId? this.drawer.open(): this.drawer.close();
  }

  addOrUpdateField(field: any) {
    const index = this.datasetFieldList.findIndex((dfl) => dfl.fieldId === field.fieldId);
    index>-1? this.datasetFieldList[index] = field: this.datasetFieldList.push(field);
  }

  onScrollDown(loadMore: boolean) {
    if (!this.infinteScrollLoading && this.hasMoreDataByStructureId[this.structureId]) {
      if (loadMore) {
        const count = this.currentFieldPaginationDto.fetchcount + 1;
        this.currentFieldPaginationDto = {
          ...this.currentFieldPaginationDto,
          fetchcount: count,
        }
      } else {
        this.currentFieldPaginationDto = {
          ...this.currentFieldPaginationDto,
          fetchcount: 1,
        };
      }
      this.infinteScrollLoading = true;
      this.fieldStore.dispatch(new fieldActions.SetFieldListLoadingState(FieldLoadingState.LOADPARTIAL));
      this.fieldStore.dispatch(new fieldActions.DatasetFieldLoad(this.currentFieldPaginationDto));
    } else {
      return null;
    }
  }

  findCurrentField() {
    if (this.currentFieldId && this.datasetFieldList.length > 0) {
      const currentFieldFound = this.datasetFieldList.find((d) => d.fieldId === this.currentFieldId) || null;

      if (this.parentSubGridId !== null && this.childSubGridId ===  null) {
        const child = currentFieldFound?.fieldlist?.childfields.find((d) => d.fieldId === this.parentSubGridId);
        this.currentField = {
          fieldId: this.currentFieldId,
          parentSubGridId: this.parentSubGridId,
          childrenId :null,
          fieldlist: child,
          isNew: false,
        }
      } else if (this.parentSubGridId !== null && this.childSubGridId !== null) {
        const child = currentFieldFound?.fieldlist?.childfields?.find((d) => d.fieldId === this.parentSubGridId);
        const subChild = child?.childfields.find((d) => d.fieldId === this.childSubGridId);
        this.currentField = {
          fieldId: this.currentFieldId,
          fieldlist: subChild,
          parentSubGridId :this.parentSubGridId,
          childrenId :this.childSubGridId,
          isNew: false,
        }
      } else {
        this.currentField = currentFieldFound;
      }
      this.toggleDrawerState(this.openPropertyPanel);
    }

    // this.currentField = JSON.parse(JSON.stringify(this.currentField));
  }

  close() {
    this.fieldStore.dispatch(new fieldActions.ResetAll());
    this.router.navigate(['/home/list/datatable', this.moduleId]);
  }

  /**
   * save both the new old old fields with properties.
   */
  save() {
    /**
     * if any grid don't have any child don't save
     */
    let isGridWithoutChild = this.allDatasetFieldList.some(
      (d) =>
        d.fieldlist.fieldType === 'grid' &&
        !d.fieldlist.deleted &&
        d.fieldlist.childfields.length === 0 &&
        this.deletedFieldIds.indexOf(d.fieldlist.fieldId) < 0
    );
    // check child and subchild fields are grid type, but they don't have child
    if(!isGridWithoutChild) {
      this.allDatasetFieldList.map(field=> {
        const isGridChildEmpty = field.fieldlist.childfields.some(c=> c.fieldType === 'grid' && !c.deleted && c.childfields.length === 0 && this.deletedFieldIds.indexOf(c.fieldId) < 0);
        if(isGridChildEmpty) {
          isGridWithoutChild = true;
        }
        field.fieldlist.childfields.map(sc => {
          const isSubGridChildEmpty = sc.childfields.some(c=> c.fieldType === 'grid' && !c.deleted && c.childfields.length === 0 && this.deletedFieldIds.indexOf(c.fieldId) < 0);
          if(isSubGridChildEmpty) {
            isGridWithoutChild = true;
          }
        });
      });
    }
    if (isGridWithoutChild) {
      this.transientService.open('Grid field must have child fields!', 'ok', {
        duration: 2000,
      });
      return;
    }

    /**
     * if field is tagged as isNew and not deleted
     */
    const newFields = this.allDatasetFieldList.filter((d) => d.isNew && !d.fieldlist.deleted).map((d) => d.fieldlist);
    const draftNew = this.allDatasetFieldList
      .filter((d) => !d.isNew && !d.fieldlist.isPersisted && d.fieldlist.isDraft && !d.fieldlist.deleted)
      .map((d) => d.fieldlist);
    newFields.push(...draftNew);

    /**
     * allUpdatedFieldIds contains the root level fieldIds that are updated, allUpdatedFieldIds don't contain the child, subchild level fieldIds
     */
    let oldFields = this.allDatasetFieldList.filter((d) => !d.isNew && !d.fieldlist.deleted && d.fieldlist.isPersisted && this.allUpdatedFieldIds.indexOf(d.fieldId)>=0);

    /**
     * deletedFieldIds contains root, child, subchild fieldIds that are deleted
     * from oldFields -> remove the field, child, subchild if deletedFieldIds contains their fieldIds
     */
    oldFields = oldFields.map(d=> {
      if(this.deletedFieldIds.indexOf(d.fieldlist.fieldId) >= 0) {
        return null;
      } else {
        d.fieldlist.childfields = d.fieldlist.childfields.filter(c=> this.deletedFieldIds.indexOf(c.fieldId) < 0);
        d.fieldlist.childfields = d.fieldlist.childfields.map(sc => {
          sc.childfields = sc.childfields.filter(c=> this.deletedFieldIds.indexOf(c.fieldId) < 0)
          return sc;
        });
      }
      return d;
    }).filter(Boolean);

    const newFieldsCreateObservables$: Observable<FieldActionResponse>[] = [];
    const newFieldsStructureIds: string[] = uniq(newFields.map(d=> d.structureId).filter(Boolean));
    const dtos: Field[] = [];
    newFieldsStructureIds.forEach(strucId=> {
      const fldList = newFields.filter(d=> d.structureId === strucId);
      dtos.push({
        fieldlist: fldList,
        structureid: strucId,
      })
    });
    if(dtos.length>0) {
      newFieldsCreateObservables$.push(
        this.coreService
          .createField(this.moduleId, {
            fields: dtos,
          })
          .pipe(
            take(1),
            catchError((err) => of(null))
          )
      );
    }

    const updateObservables$: Observable<FieldActionResponse>[] = [];
    oldFields.forEach((field) => {
      updateObservables$.push(
        this.coreService
          .updateField(this.moduleId, field.fieldId, {
            fields: [
              {
                fieldlist: [field.fieldlist],
                structureid: field.fieldlist.structureId,
              },
            ],
          })
          .pipe(
            take(1),
            catchError((err) => of(null))
          )
      );
    });

    const dropvalsObservables$: Observable<ListValueActionResponse>[] = [];
    // this.dropvalsList.forEach((dropval) => {
    //   dropvalsObservables$.push(
    //     this.ruleService.saveDropvals(dropval.dropvals, dropval.moduleId, dropval.fieldId, this.locale).pipe(
    //       take(1),
    //       catchError((err) => of(null))
    //     )
    //   );
    // });


    /**
     * in ngrx store deletedFieldIds contains all the root, child, subchild fieldids that are deleted
     */
    const deleteObservalbles$: Observable<any>[] = [];
    this.deletedFieldIds.forEach((fieldId) => {
      deleteObservalbles$.push(
        this.coreService.removeFieldList(this.moduleId, fieldId).pipe(
          take(1),
          catchError((err) => of(null))
        )
      );
    });

    const updateOldReferenceObservables$: Observable<DatasetRefSaveResponse>[] = [];
    oldFields.forEach((field: FieldlistContainer) => {
      if(field.fieldlist.fieldType === FieldControlType.DATASET_REFERENCE) {
          updateOldReferenceObservables$.push(
            this.coreService.saveReferenceFields(
              this.moduleId,
              {
                fieldId: field.fieldId,
                referencedModuleId: field.fieldlist.refDataset.datasetId,
                searchFields: field.fieldlist.refDatasetField.fieldId
              })
              .pipe(
                take(1),
                catchError((err) => of(null))
            )
          )
        }
      });

    const updateNewReferenceObservables$: Observable<DatasetRefSaveResponse>[] = [];
    newFields.forEach((field: Fieldlist) => {
      if(field.fieldType === FieldControlType.DATASET_REFERENCE) {
        updateNewReferenceObservables$.push(
          this.coreService.saveReferenceFields(
            this.moduleId,
            {
              fieldId: field.fieldId,
              referencedModuleId: field.refDataset.datasetId,
              searchFields: field.refDatasetField.fieldId
            })
            .pipe(
              take(1),
              catchError((err) => of(null))
          )
        )
      }
    });

    // this.fieldListLoadingState = FieldLoadingState.LOADALL;
    if (
      newFieldsCreateObservables$.length > 0 ||
      updateObservables$.length > 0 ||
      dropvalsObservables$.length > 0 ||
      deleteObservalbles$.length > 0 ||
      updateNewReferenceObservables$.length > 0 ||
      updateOldReferenceObservables$.length > 0
    ) {
      this.saving = true;
      this.fieldStore.dispatch(new fieldActions.SetFieldListLoadingState(FieldLoadingState.LOADALL));
      forkJoin([
        ...newFieldsCreateObservables$,
        ...updateObservables$,
        ...dropvalsObservables$,
        ...deleteObservalbles$,
        ...updateNewReferenceObservables$,
        ...updateOldReferenceObservables$,
      ])
        .pipe(take(1))
        .subscribe(
          (resp) => {
            let message = 'Fields updated successfully.';
            if(resp?.length && resp.some(result => result === null)) {
              message = 'Some fields update failed !';
            }

            this.saving = false;
            this.navigateToRoute({}, '');

            this.clearData();

            this.getFieldsUpdated();
            this.transientService.open(message, 'ok', {
              duration: 2000,
            });
            this.fieldStore.dispatch(new fieldActions.SetFieldListLoadingState(null));
          },
          (err) => {
            this.fieldStore.dispatch(new fieldActions.SetFieldListLoadingState(null));
            console.log(err);
            this.saving = false;
          }
        );
    }
  }

  /**
   * we will not call the getDetails call anymore after clicking the save.
   * so we have to mark the all root, child, subchild new fields as old one
   */
  markNewFieldsOld() {
    const newFields = this.allDatasetFieldList.filter((d) => d.isNew && !d.fieldlist.deleted);
    const oldFields = this.allDatasetFieldList.filter((d) => !d.isNew && !d.fieldlist.deleted && d.fieldlist.isPersisted && this.allUpdatedFieldIds.indexOf(d.fieldId)>=0);
    const merged = [...newFields, ...oldFields];
    merged.forEach(field => {
      field.isNew = false;
      field.fieldlist.isNew = false;
      field.fieldlist.isDraft = false;
      field.fieldlist.isPersisted = true;
      field.fieldlist.childfields.forEach(child => {
        child.isNew = false;
        child.isDraft = false;
        child.isPersisted = true;
        child.childfields.forEach(subChild => {
          subChild.isNew = false;
          subChild.isDraft = false;
          subChild.isPersisted = true;
        });
      });
    });
    merged.filter(Boolean).map((d) => {
      this.fieldStore.dispatch(new fieldActions.DatasetFieldAdd(d));
    });
  }

  /**
   * in ngrx store deletedDatasetFieldList contains root level fields, which itself or its child, subchild are deleted
   * in ngrx store deletedFieldIds contains root, child, subchild fieldIds that are deleted
   */
  removeDeletedFields() {
    this.deletedDatasetFieldList.map(d=> {
      if(this.deletedFieldIds.indexOf(d.fieldlist.fieldId) >= 0) {
        this.fieldStore.dispatch(new fieldActions.RemoveADatasetField(d.fieldlist.fieldId)); // remove the field from store if it is a root level field
      } else {
        d.fieldlist.childfields = d.fieldlist.childfields.filter(c=> this.deletedFieldIds.indexOf(c.fieldId) < 0); // filter child fields which are deleted
        d.fieldlist.childfields = d.fieldlist.childfields.map(sc => {
          sc.childfields = sc.childfields.filter(c=> this.deletedFieldIds.indexOf(c.fieldId) < 0); // filter subchild which are deleted
          return sc;
        });
        this.fieldStore.dispatch(new fieldActions.DatasetFieldAdd(d)); // update store with the new fieldListContainer after removing the deleted fields
      }
    });
  }

  getFieldsUpdated() {
    // this.fieldStore.dispatch(new fieldActions.RemoveDatasetFieldDeleted());
    this.removeDeletedFields();
    this.markNewFieldsOld();
    this.fieldStore.dispatch(new fieldActions.ResetUpdatedFields());

    this.currentFilterSub.next(this.currentFilter);
    this.infinteScrollLoading = false;
    this.fieldListLoadingState = null;
    this.findCurrentField();
  }

  clearData() {
    // this.datasetFieldList = [];
    // this.filteredDatasetFieldList = [];
    this.currentField = null;
    this.currentField = '';
    this.infinteScrollLoading = false;
    this.hasMoreData = true;
    this.recordsPageIndex = 1;
    // this.fieldIdsWithValidationError = [];
    this.hasFieldError = false;
    this.fieldIdsWithError = [];
    this.dropvalsList = [];
  }

  editDataSet() {
    this.isEditDataSet = true;
    this.router.navigate(['./'], {
      relativeTo: this.route,
      queryParams: { f: 'edit' },
      fragment: 'property-panel',
    });
    if (this.drawer) {
      this.drawer.open();
      this.drawer.closedStart.subscribe((data) => {
        this.isEditDataSet = false;
      })
    }
  }

  /**
   * check if clicked outside widget modal
   */
  clickOutsideDatasetBuilder() {
    if (this.showDataSetFieldList) {
      this.showDataSetFieldList = false;
    }
  }

  dataSetFieldListVisibiltyChange() {
    setTimeout(() => {
      this.showDataSetFieldList = true;
    }, 10);
  }

  /**
   *
   * @returns the max length corresponding to a fieldtype
   */
   getMaxLength(pickList: string) {
     if(pickList === '53' || pickList === '54' || pickList === '38') return 100;
     return 25;
   }

  /**
   * Add control with FieldList datatype with all its fields. add a fieldId with new text at start
   */
  addFieldToList(fieldType) {
    if(!this.moduleId || !this.structureId) { throw new Error('Module or Structure Ids missing');}

    const picklistValue = this.picklistValues.find((d) => d.fieldType === fieldType.value);
    const fldId = `FLD_${this.utilities.generateFieldId(9)}`;
    const newField: Fieldlist = {
      fieldId: fldId,
      attachmentSize: '',
      dataType: picklistValue.dataType,
      dateModified: 0,
      decimalValue: '',
      fileTypes: '',
      pickList: picklistValue.pickList,
      maxChar: this.getMaxLength(picklistValue.pickList),
      isKeyField: false,
      isWorkFlowCriteria: false,
      isNumSettingCriteria: false,
      isPermission: false,
      isTransient: false,
      isHeirarchy: false,
      isCriteriaField: false,
      isDefault: false,
      isWorkFlow: false,
      isGridColumn: false,
      parentField: '',
      isDescription: false,
      textCase: 'None',
      isSearchEngine: false,
      isFutureDate: false,
      isPastDate: false,
      helptexts: {
        en: '',
        fr: '',
      },
      longtexts: {
        en: '',
        fr: '',
      },
      moduleId: this.moduleId,
      shortText: {
        en: {
          description: `Field Name`,
          information: '',
        },
        fr: {
          description: `${fieldType.displayText} Type`,
          information: '',
        },
        ab: {
          description: `${fieldType.displayText} Type`,
          information: '',
        },
      },
      optionsLimit: 1,
      isNoun: false,
      isRejection: false,
      isRequest: false,
      isReference: false,
      referenceSystem: '',
      referenceSystemFld: '',
      displayCriteria: null,
      structureId: this.structureId,
      childfields: [],
      refrules: [],

      fieldType: picklistValue.fieldType,
      icon: picklistValue.icon,
      iconType: picklistValue.iconType,
      isDraft: true,
      isPersisted: false,
      isNew: true,
      isCheckList: false,
      lookupRuleId: null
    };
    const fieldListContainer: FieldlistContainer = {
      fieldId: fldId,
      isNew: true,
      fieldlist: newField,
    };
    const selectedField = this.datasetFieldList.filter(e => e?.fieldId === this.currentFieldId && e.fieldlist?.fieldType === 'grid');
    const isSelectefieldGridType = selectedField?.length === 1 ? true : false;
    if (!isSelectefieldGridType) {
      /* MDMF-1689 isHierarchy can be true based on some logic mentioned in the code. details is available in the code */
      if(this.structureId !== '1' && fieldListContainer.fieldlist.fieldType !== 'grid') {
        fieldListContainer.fieldlist.isHeirarchy = true;
      }
      // this.addOrUpdateField(fieldListContainer);
      this.fieldStore.dispatch(new fieldActions.DatasetFieldAdd(fieldListContainer));

      this.currentFilterSub.next(this.currentFilter);
      this.navigateToRoute({ f: get(newField, 'fieldId', null)}, 'property-panel', false);

    } else if (this.parentSubGridId != null) {
      selectedField[0].fieldlist?.childfields.forEach(ele => {
        if (ele?.fieldId === this.parentSubGridId) {
          if (ele.fieldType === 'grid') {
            newField.parentField = this.parentSubGridId;
            if (ele?.childfields === undefined) {
              ele.childfields = [newField];
            } else {
              ele?.childfields.push(newField)
            }

            this.currentFilterSub.next(this.currentFilter);

          } else {
            this.transientService.open('Child field can only be added to grid type. Please select a grid type field!', 'ok', {
              duration: 2000,
            });
          }

        }
      });
      this.fieldStore.dispatch(new fieldActions.DatasetFieldAdd(selectedField[0]));
      // notify the store that these sub grid fields have new child
      this.fieldStore.dispatch(new fieldActions.SetUpdatedFields({fieldId: selectedField[0].fieldId, isValid: true, structureId: this.structureId}));
      this.fieldStore.dispatch(new fieldActions.SetUpdatedChildFields({fieldId: fldId, isValid: true, structureId: this.structureId}));
    }else {
      newField.isGridColumn = true;
      newField.parentField = selectedField[0].fieldId;
      selectedField[0].fieldlist?.childfields.push(newField);

      this.fieldStore.dispatch(new fieldActions.DatasetFieldAdd(selectedField[0]));
      // notify the store that these grid fields have new child
      this.fieldStore.dispatch(new fieldActions.SetUpdatedFields({fieldId: selectedField[0].fieldId, isValid: true, structureId: this.structureId}));
      this.fieldStore.dispatch(new fieldActions.SetUpdatedChildFields({fieldId: fldId, isValid: true, structureId: this.structureId}));
      this.currentFilterSub.next(this.currentFilter);
    }
  }

  updateDropvalList(saveModel: ListValueSaveModel) {
    const index = this.dropvalsList.findIndex((d) => d.fieldId === saveModel.fieldId);
    if (index >= 0) {
      this.dropvalsList.splice(index, 1, saveModel);
    } else {
      this.dropvalsList.push(saveModel);
    }
    this.ruleService.nextAlreadtUpdatedDropvalListSubject(this.dropvalsList);
  }
  patchFieldList(fieldlistContainer: Partial<FieldlistContainer>) {
    if (fieldlistContainer.childrenId) {
      const parentField = this.datasetFieldList.filter((item: any) => item.fieldId === fieldlistContainer.fieldId);
      const childField = parentField[0].fieldlist.childfields.filter((item: any) => item.fieldId === fieldlistContainer.parentSubGridId);
      const subChildField = childField[0].childfields.filter((item: any) => item.fieldId === fieldlistContainer.childrenId);
      this.patchedDraftedValue(subChildField[0], fieldlistContainer);
      this.fieldStore.dispatch(new fieldActions.DatasetFieldAdd(parentField[0]));
    }else if (fieldlistContainer.parentSubGridId) {
      const parentField = this.datasetFieldList.filter((item: any) => item.fieldId === fieldlistContainer.fieldId);
      const childField = parentField[0].fieldlist.childfields.filter((item: any) => item.fieldId === fieldlistContainer.parentSubGridId);
      this.patchedDraftedValue(childField[0], fieldlistContainer);
      this.fieldStore.dispatch(new fieldActions.DatasetFieldAdd(parentField[0]));
    }else {
      const field = this.datasetFieldList.filter((item: any) => item.fieldId === fieldlistContainer.fieldId);
      this.patchedDraftedValue(field[0].fieldlist, fieldlistContainer);
      this.fieldStore.dispatch(new fieldActions.DatasetFieldAdd(field[0]));
    }

    this.currentFilterSub.next(this.currentFilter);
  }

  patchedDraftedValue(d: Fieldlist, fieldlistContainer: Partial<FieldlistContainer>) {
    this.fieldService.patchedDraftedValue(d, fieldlistContainer);
    d.isDraft = true;
    this.findCurrentField();
  }

  deleteWidget(fieldlistContainer: FieldlistContainer) {
    this.transientService.confirm({
      data: {
        label: $localize`:@@delete_message:Are you sure to delete?`, dialogTitle: 'Confirmation'
      },
      disableClose: true,
      autoFocus: false,
     width: '600px',
     }, (response) => {
      if (response === 'yes') {
        if (fieldlistContainer.isNew) {
          this.fieldStore.dispatch(new fieldActions.RemoveADatasetField(fieldlistContainer.fieldId));
        } else {
          this.markForDelete(fieldlistContainer);
        }
        this.updateValidationStatusRemovingDeletedField(fieldlistContainer.fieldId);
        this.router.navigate(['.'], { relativeTo: this.route, fragment: null, queryParamsHandling: 'preserve' });
      } else {
        return null;
      }
    });
  }
  deleteChildWidget(childField: Fieldlist) {
    this.transientService.confirm({
      data: {
        label: $localize`:@@delete_message:Are you sure to delete?`, dialogTitle: 'Confirmation'
      },
      disableClose: true,
      autoFocus: false,
     width: '600px',
     }, (response) => {
      if (response === 'yes') {
        childField.deleted = true;
        const selectedGrid = this.datasetFieldList.find(e => e?.fieldId === childField.parentField  && e.fieldlist?.fieldType === 'grid');
        if (childField.isNew) {
          const index = selectedGrid.fieldlist.childfields.findIndex(d=> d.fieldId === childField.fieldId);
          selectedGrid.fieldlist.childfields.splice(index, 1);
          this.fieldStore.dispatch(new fieldActions.DatasetFieldAdd(selectedGrid));
          this.currentFilterSub.next(this.currentFilter);
        } else {
          const deletedField = selectedGrid.fieldlist.childfields.find(d=> d.fieldId === childField.fieldId);
          deletedField.deleted = true;
          this.fieldStore.dispatch(new fieldActions.DatasetFieldAdd(selectedGrid));
          this.fieldStore.dispatch(new fieldActions.SetDeletedDatasetFieldList(selectedGrid));
          this.fieldStore.dispatch(new fieldActions.SetDeletedFieldIds(childField.fieldId));
          this.currentFilterSub.next(this.currentFilter);
        }
        this.coreService.nextUpdateFieldFormValidationStatusSubject({
          fieldId: selectedGrid.fieldId,
          isValid: true,
        });
        this.updateValidationStatusRemovingDeletedField(childField.fieldId);
        this.router.navigate(['.'], { relativeTo: this.route, fragment: null, queryParamsHandling: 'preserve' });
      } else {
        return null;
      }
    });
  }

  deleteSubChildWidget($event) {
    const childField = $event.childField;
    const subChildField = $event.subChildField;
    this.globalDialogService.confirm({ label: $localize`:@@delete_message:Are you sure to delete ?` }, (response) => {
      if (response === 'yes') {
        subChildField.deleted = true;
        const selectedGrid = this.datasetFieldList.find(e => e?.fieldId === childField.parentField && e.fieldlist?.fieldType === 'grid');
        if (childField.isNew) {
          const childIndex = selectedGrid.fieldlist.childfields.findIndex(d=> d.fieldId === childField.fieldId);
          const subChildIndex = selectedGrid.fieldlist.childfields[childIndex].childfields.findIndex(d => d.fieldId === subChildField.fieldId);
          selectedGrid.fieldlist.childfields[childIndex].childfields.splice(subChildIndex, 1);
          this.fieldStore.dispatch(new fieldActions.DatasetFieldAdd(selectedGrid));
        } else {
          selectedGrid.fieldlist.childfields.forEach(child => {
            child.childfields.forEach(subChild => {
              if(subChild.fieldId === subChildField.fieldId) {
                subChild.deleted = true;
              }
            });
          });
          this.fieldStore.dispatch(new fieldActions.DatasetFieldAdd(selectedGrid));
          this.fieldStore.dispatch(new fieldActions.SetDeletedDatasetFieldList(selectedGrid));
          this.fieldStore.dispatch(new fieldActions.SetDeletedFieldIds(subChildField.fieldId));
          // this.currentFilterSub.next(this.currentFilter);
        }
        this.coreService.nextUpdateFieldFormValidationStatusSubject({
          fieldId: selectedGrid.fieldId,
          isValid: true,
        });
        this.updateValidationStatusRemovingDeletedField(subChildField.fieldId);
        this.router.navigate(['.'], { relativeTo: this.route, fragment: null, queryParamsHandling: 'preserve' });
        this.toggleDrawerState(false);
      } else {
        return null;
      }
    });
  }

  cloneWidget(fieldlistContainer: FieldlistContainer) {
    const fldId = `FLD_${this.utilities.generateFieldId(9)}`;
    const fieldList = JSON.parse(JSON.stringify(fieldlistContainer.fieldlist));
    const newField = {
      ...fieldList,
      fieldId: fldId,
      isDraft: true,
      isPersisted: false,
    }
    const fieldListContainer: FieldlistContainer = {
      fieldId: fldId,
      isNew: true,
      fieldlist : newField
    };

    const selectedField = this.datasetFieldList.filter(e => e?.fieldId === this.currentFieldId && e.fieldlist?.fieldType === 'grid');
    const isSelectefieldGridType = selectedField?.length === 1 ? true : false;
    if (!isSelectefieldGridType) {
      // this.addOrUpdateField(fieldListContainer);
      this.fieldStore.dispatch(new fieldActions.DatasetFieldAdd(fieldListContainer));
      // this.putDraftField(fieldListContainer);
      // this.currentFilterSub.next(this.currentFilter);
      this.navigateToRoute({ f: get(newField, 'fieldId', null)}, 'property-panel', false);
    } else if (this.parentSubGridId != null) {
      selectedField[0].fieldlist?.childfields.forEach(ele => {
        if (ele?.fieldId === this.parentSubGridId) {
          newField.parentField = this.parentSubGridId;
          if (ele?.childfields === undefined) {
            ele.childfields = [newField];
          } else {
            ele?.childfields.push(newField)
          }
          // this.putDraftField({fieldId: this.currentFieldId});
          // this.currentFilterSub.next(this.currentFilter);
          // this.navigateToRoute({ f: this.currentFieldId, childField: this.parentSubGridId, subChildField: newField.fieldId}, 'property-panel', false);
        }
      });
      this.fieldStore.dispatch(new fieldActions.DatasetFieldAdd(selectedField[0]));
    }else {
      newField.isGridColumn = true;
      newField.parentField = selectedField[0].fieldId;
      selectedField[0].fieldlist?.childfields.push(newField);
      this.fieldStore.dispatch(new fieldActions.DatasetFieldAdd(selectedField[0]));
      // this.putDraftField({fieldId: this.currentFieldId});
      this.currentFilterSub.next(this.currentFilter);
      // this.navigateToRoute({ f: this.currentFieldId, childField: newField.fieldId }, 'property-panel', false);
    }
  }
  cloneChildWidget(fieldList: Fieldlist) {
  fieldList = JSON.parse(JSON.stringify(fieldList));
    const fldId = `FLD_${this.utilities.generateFieldId(9)}`;
    const newField = {
      ...fieldList,
      fieldId: fldId,
      isDraft: true,
      isPersisted: false,
    }
    const fieldListContainer: FieldlistContainer = {
      fieldId: fldId,
      isNew: true,
      fieldlist : newField
    };

    const selectedField = this.datasetFieldList.filter(e => e?.fieldId === this.currentFieldId && e.fieldlist?.fieldType === 'grid');
    const isSelectefieldGridType = selectedField?.length === 1 ? true : false;
    if (!isSelectefieldGridType) {
      // this.addOrUpdateField(fieldListContainer);
      this.fieldStore.dispatch(new fieldActions.DatasetFieldAdd(fieldListContainer));
      // this.currentFilterSub.next(this.currentFilter);
      // this.navigateToRoute({ f: get(newField, 'fieldId', null)}, 'property-panel', false);
    } else if (this.parentSubGridId != null) {
      selectedField[0].fieldlist?.childfields.forEach(ele => {
        if (ele?.fieldId === this.parentSubGridId) {
          if (ele.fieldType === 'grid') {
            newField.parentField = this.parentSubGridId;
            if (ele?.childfields === undefined) {
              ele.childfields = [newField];
            } else {
              ele?.childfields.push(newField)
            }

            this.currentFilterSub.next(this.currentFilter);

          } else {
            this.transientService.open('Child field can only be added to grid type. Please select a grid type field!', 'ok', {
              duration: 2000,
            });
          }
          // newField.parentField = this.currentFieldId;
          // if (ele?.childfields === undefined) {
          //   ele.childfields = [newField];
          // } else {
          //   ele?.childfields.push(newField)
          // }
          // this.putDraftField({fieldId: this.currentFieldId});
          // this.currentFilterSub.next(this.currentFilter);
          // this.navigateToRoute({ f: this.currentFieldId, childField: this.parentSubGridId, subChildField: newField.fieldId}, 'property-panel', false);
        }
      });
      this.fieldStore.dispatch(new fieldActions.DatasetFieldAdd(selectedField[0]));
    }else {
      newField.isGridColumn = true;
      newField.parentField = selectedField[0].fieldId;
      selectedField[0].fieldlist?.childfields.push(newField);
      this.fieldStore.dispatch(new fieldActions.DatasetFieldAdd(selectedField[0]));
      // this.navigateToRoute({ f: this.currentFieldId, childField: newField.fieldId }, 'property-panel', false);
    }
  }

  cloneSubChildWidget($event) {
    const childField = $event.parentField;
    const subChildField = $event.field;
    const fldId = `FLD_${this.utilities.generateFieldId(9)}`;
    const fieldList = JSON.parse(JSON.stringify(subChildField));
    const newField = {
      ...fieldList,
      fieldId: fldId,
      isDraft: true,
      isPersisted: false,
         }
    const selectedField = this.datasetFieldList.filter(e => e?.fieldId === childField.parentField && e.fieldlist?.fieldType === 'grid');
    selectedField[0].fieldlist?.childfields.forEach(ele => {
      if (ele?.fieldId === childField.fieldId) {
        newField.parentField = childField.fieldId;
        if (ele?.childfields === undefined) {
          ele.childfields = [newField];
        } else {
          ele?.childfields.push(newField)
        }
        this.currentFilterSub.next(this.currentFilter);
        // this.navigateToRoute({ f: this.currentFieldId, childField: this.parentSubGridId, subChildField: newField.fieldId}, 'property-panel', false);
      }
    });
  }

  markForDelete(fieldlistContainer: FieldlistContainer) {
    const deletedField = this.datasetFieldList.find(d=> d.fieldId === fieldlistContainer.fieldId);
    deletedField.fieldlist.deleted = true;
    this.fieldStore.dispatch(new fieldActions.DatasetFieldAdd(deletedField));
    this.fieldStore.dispatch(new fieldActions.SetDeletedDatasetFieldList(deletedField));
    this.fieldStore.dispatch(new fieldActions.SetDeletedFieldIds(deletedField.fieldId));
    this.currentFilterSub.next(this.currentFilter);
  }

  updateValidationStatusRemovingDeletedField(fieldId: string) {
    this.fieldStore.dispatch(new fieldActions.RemoveFromUpdatedFields(fieldId));
  }

  onWidgetFieldTypeChanged(widget: FieldlistContainer) {
    const picklistValue = this.picklistValues.find((d) => d.fieldType === widget?.fieldlist.fieldType);

    widget.fieldlist.pickList = picklistValue.pickList;
    widget.fieldlist.dataType = picklistValue.dataType;
    widget.fieldlist.fieldType = picklistValue.fieldType;
    widget.fieldlist.icon = picklistValue.icon;
    widget.fieldlist.iconType = picklistValue.iconType;
    this.isEditDataSet = false;

    this.fieldStore.dispatch(new fieldActions.DatasetFieldAdd(widget));

    this.findCurrentField();
  }

  triggerAddManually(event) {
    this.addManually = true;
  }

  closeDrawer(event) {
    this.toggleDrawerState(!this.drawer.opened);
  }

  ngOnDestroy(): void {
    this.fieldStore.dispatch(new fieldActions.ResetAll());
    this.unsubscribeAll$.next(true);
    this.unsubscribeAll$.unsubscribe();
  }
}

