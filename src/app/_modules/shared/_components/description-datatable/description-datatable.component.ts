import { SelectionModel } from '@angular/cdk/collections';
import { Component, ComponentFactoryResolver, ElementRef, Inject, Input, LOCALE_ID, NgZone, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild, ViewContainerRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { ClassificationNounMod, MetadataModeleResponse, Noun, SchemaTableViewFldMap } from '@models/schema/schemadetailstable';
import { ModuleInfo, SchemaListDetails, SchemaNavGrab, SchemaStaticThresholdRes } from '@models/schema/schemalist';
import { Userdetails } from '@models/userdetails';
import { SearchInputComponent } from '@modules/shared/_components/search-input/search-input.component';
import { ContainerRefDirective } from '@modules/shared/_directives/container-ref.directive';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { UserService } from '@services/user/userservice.service';
import { BehaviorSubject, forkJoin, Observable, of, pipe, Subject, Subscription } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, filter, map, skip, take, takeUntil, tap } from 'rxjs/operators';
import { BadgeData, BadgeService, BadgeStatus } from '@services/home/schema/badge.service';
import { CoreService } from '@services/core/core.service';
import { RuleService } from '@services/rule/rule.service';
import { DescriptionDatatableCellEditableComponent } from '../description-datatable-cell-editable/description-datatable-cell-editable.component';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { ChannelIdrequest } from '@modules/chat/_common/chat';
import { WebsocketConnectionStatus, WebsocketService } from '@services/chat/websocket.service';
import { ChatService } from '@services/chat/chat.service';
import { HttpErrorResponse } from '@angular/common/http';
import { TransientService } from 'mdo-ui-library';
import { LanguageList } from '@constants/globals';
import { SchemaService } from '@services/home/schema.service';

@Component({
  selector: 'pros-description-datatable',
  templateUrl: './description-datatable.component.html',
  styleUrls: ['./description-datatable.component.scss']
})
export class DescriptionDatatableComponent implements OnInit, OnChanges, OnDestroy {

  /**
   * Hold the active cell's position
   */
   activeCell: {
    column: string,
    rowIndex: number
  };

  /**
   * Http request status
   */
  requestStatus: BadgeStatus;

  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('schemaId') diwSchemaId: string;

  schemaId: string  = '';

  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('moduleId') diwModuleId: string;

  moduleId: string;

  /**
   * Hold all metada control for header , hierarchy and grid fields ..
   */
  metadata: BehaviorSubject<MetadataModeleResponse> = new BehaviorSubject<MetadataModeleResponse>(null);

  /**
   * Executed statics of schema
   */
  statics: SchemaStaticThresholdRes;

  /**
   * Current schema info ..
   */
  @Input() schemaInfo: SchemaListDetails;

  variantId: string;

  /**
   * All subscription should be here ...
   */
  subsribers: Subscription[] = [];

  /**
   * Store information about noun and modifier ..
   */
  rulesNounMods: ClassificationNounMod = { MRO_CLS_MASTER_CHECK: { info: [] }, MRO_MANU_PRT_NUM_LOOKUP: { info: [] } } as ClassificationNounMod;

  nounModsList: { master: Noun[], connecthubCounts: Noun[], unknowCount: any } = { master: [], connecthubCounts: [], unknowCount: {} };

  /**
   * Store info about user selected field and order
   */
  selectedFieldsOb: BehaviorSubject<SchemaTableViewFldMap[]> = new BehaviorSubject(null);

  /**
   * Static column for actions
   */
  startColumns = ['checkbox_select', '_actions', 'OBJECTNUMBER', 'SHORT_DESC', 'LONG_DESC', 'NOUN_CODE', 'MODE_CODE'];


  dataFrm: string = 'MRO_CLS_MASTER_CHECK' || 'MRO_MANU_PRT_NUM_LOOKUP';

  /**
   * Store data of table for next suggestion
   */
  tableData: any;

  /**
   * arrow mat-icon code
   */
    arrowIcon = 'chevron-left';

    widthOfSchemaNav = 260;
    boxPosition: { left: number, top: number };
    public mousePosition: { x: number, y: number };
    public status: SchemaNavGrab = SchemaNavGrab.OFF;
    @ViewChild('navscroll')navscroll:ElementRef;
    @ViewChild('listingContainer')listingContainer:ElementRef;
    @ViewChild('table') table: MatTable<any>;

  /**
   * Store info about views ..
   * if has correction loaded then value should be correction
   */
  viewOf: BehaviorSubject<string> = new BehaviorSubject<string>('_all');

  displayedColumns: BehaviorSubject<string[]> = new BehaviorSubject(this.startColumns);

  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  selection = new SelectionModel<any>(true, []);

  /**
   * Hold logedin user details
   */
  userDetails: Userdetails;

  /**
   * Store active noun code
   */
  activeNounCode: string;

  /**
   * Store active mode code
   */
  activeModeCode: string;

  activeClassUUID: string;

  isMaster = false;

  /**
   * Store all pre loaded table format data ..
   */
  loadedTableTransData: any;

  /**
   * Store info about last loaded object number
   */
  isLoadMoreEnabled: boolean;

  /**
   * Data table container scroll end
   */
  scrollLimitReached = false;

  /**
   * Skeleton Loader flags
   */
  get loading() {
    return !this.schemaInfo || Object.keys(this.loader).find(x => this.loader[x]);
  }

  loader = {
    schemaDetails: false,
    columnsWithMetadata: false,
    moduleDetails: false,
    metaDataDetails: false,
    userViewFields: false,
    nounModDetails:false,
  };


  /**
   * data table search input
   */
  @ViewChild('tableSearchInput') tableSearchInput: SearchInputComponent;
  @ViewChild('tableContainer') tableContainer: ElementRef;

  /**
   * Inline data table search text
   */
  tableSearchString = '';

  /**
   * data table search input subject
   */
  tableSearchSubject: Subject<string> = new Subject();

  /**
   * holds module info
   */
   moduleInfo: ModuleInfo;

   /**
    * Hold the breadcurmb information ...
    */
   innerBreadcurmbtxt = '';

   /**
    * Column header with metada for MRO_CLS_MASTER_CHECK
    */
   colsAndMetadata: any[] = [];

  colsMetadata: any[] = [];

  colsUUID: string[] = [];

  /**
   * Search noun modifier form control
   */
  searchNounNavCtrl: FormControl = new FormControl();

  fieldsInUpdate = [];

  disableSearch = false;

  public masterDataSub = new BehaviorSubject(null);

  updatedAttributes = [];

  /**
   * Data from DIW or ExcelConnect
   */
  @Input()
  dataFrom: 'DIW' | 'EC' = 'EC';

  unsubscribeAll$: Subject<boolean> = new Subject<boolean>();

  channelId: string;

  customProps: string[] = [];

  activeTab = '_all';

  constructor(
    public schemaDetailService: SchemaDetailsService,
    private router: Router,
    private componentFactoryResolver: ComponentFactoryResolver,
    private userService: UserService,
    private ngZone: NgZone,
    private badgeService: BadgeService,
    private activatedRouter: ActivatedRoute,
    private coreService: CoreService,
    private ruleService: RuleService,
    private sharedService: SharedServiceService,
    private chatService: ChatService,
    private websocketService: WebsocketService,
    private transientService: TransientService,
    @Inject(LOCALE_ID) public locale: string,
    private schemaService: SchemaService
  ) {
    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
   }


  ngOnDestroy(): void {
    this.subsribers.forEach(sub=>{
      sub.unsubscribe();
    });
    this.unsubscribeAll$.next(true);
    this.unsubscribeAll$.unsubscribe();
    this.displayedColumns.complete();
    this.displayedColumns.unsubscribe();
    this.viewOf.complete();
    this.viewOf.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {

    if(this.dataFrom === 'DIW') {
      console.log('changes ', changes);
      let refresh = false;

      if(changes && changes.diwModuleId && changes.diwModuleId.currentValue !== changes.diwModuleId.previousValue) {
        this.moduleId = changes.diwModuleId.currentValue;
        refresh = true;
      }

      if(changes && changes.diwSchemaId && changes.diwSchemaId.currentValue !== changes.diwSchemaId.previousValue) {
        this.schemaId = changes.diwSchemaId.currentValue;
        refresh = true;
      }

      if (refresh) {
        this.getModuleInfo(this.moduleId);
        this.getNounModTree();
        // get the static ...
        this.getSchemaStatics();
        this.startColumns = Array.from(new Set(['checkbox_select', '_actions'].concat(this.startColumns)));
        this.displayedColumns.next(this.startColumns);
      }
    }
  }

  ngOnInit(): void {

    if(this.dataFrom === 'EC') {
      this.activatedRouter.params.pipe(takeUntil(this.unsubscribeAll$)).subscribe(params => {
        let refresh = false;
        if (params.moduleId && params.moduleId !== this.moduleId) {
          this.moduleId = params.moduleId;
          refresh = true;
        }

        if (params.schemaId && params.schemaId !== this.schemaId) {
          this.subsribers.forEach(sub=>{
            sub.unsubscribe();
          });
          this.subsribers = [];
          refresh = true;
        }
        this.schemaId = params.schemaId || '';

        if (refresh) {
          this.getModuleInfo(this.moduleId);
          this.getNounModTree();
          this.getSchemaStatics();
          this.startColumns = this.startColumns.filter(col => col != 'checkbox_select' && col != '_actions' );
          this.displayedColumns.next(this.startColumns);
        }
      });
    }

    this.userService.getUserDetails().pipe(
      filter(resp => !!resp.userId),
      take(1),
    ).subscribe(res=>{
      this.userDetails = res;
      // Initialize websocket connection and do jwtLogin
      this.initiateSocketConnection().subscribe((response: WebsocketConnectionStatus) => {
        if (response?.connected) {
          // If connected request channel id and get all the previous messages
          this.prepareChannelIdrequest().then((payload: ChannelIdrequest) => {
            console.log('Prepare channel request ', payload);
            this.getChannelId(payload);
          }).catch((error) => {
            console.error(`Error while preparing channel id request:`,  error);
          });
        }
      });
    }, err=> console.error(`Error ${err.message}`));


    this.searchNounNavCtrl.valueChanges.pipe(distinctUntilChanged(), debounceTime(750)).subscribe(va=> {
      this.getNounModTree(va);
    });

    this.sharedService.getTClassificationData().subscribe(data => {
      console.log('Data received from Excel ', data);
      this.masterDataSub.next(data);
      this.getNounModTree();
    })

    this.sharedService.getClassificationReqData().pipe(take(1)).subscribe(req => {
      this.updatedAttributes = req || [];
    });

    this.viewOf.pipe(
      skip(1),
      distinctUntilChanged()
    ).subscribe(view => {
      this.activeTab = view;
      this.activeNounCode = ''; this.activeModeCode = ''; this.activeClassUUID = '';
      this.getNounModTree();
    })
  }

  applyFilter(nounCode: string, modifierCode: string, uuid: string, isMaster=true, isSearchActive?: boolean) {

    if(this.activeNounCode === nounCode && this.activeModeCode === modifierCode && this.activeClassUUID === uuid) {
      return;
    }
    this.activeNounCode = nounCode; this.activeModeCode = modifierCode; this.activeClassUUID = uuid;
    this.isMaster = isMaster;

    if(!isSearchActive && this.tableSearchInput) {
      this.tableSearchString = '';
      this.tableSearchInput.clearSearch(true);
    }

    let obsArray = [];
    if (nounCode !== 'Unknown') {
      obsArray.push(
        this.ruleService.getCharacteristicsList(uuid, 1).pipe(catchError((err) => of([])))
      )
    } else {
      obsArray.push(of([]));
    }
    obsArray.push(
      this.getDatatable(this.activeNounCode, this.activeModeCode, isMaster).pipe(catchError((err) => of([])))
    )
    this.dataSource = new MatTableDataSource<any>([]);
    const sub = forkJoin(obsArray).subscribe((resp: any[]) => {
          if(resp.length) {
            this.selection.clear();
            this.colsAndMetadata = resp[0]?.response || [];

            const data = resp[1] || [];
            const actualData = this.transformTableData(data, this.colsAndMetadata);
            this.loadedTableTransData = actualData;
            this.dataSource = new MatTableDataSource<any>(actualData);
            const columns = actualData.length ? Object.keys(actualData[0]) : [];
            this.displayedColumns.next(Array.from(new Set(this.startColumns.concat(columns.filter(col => !this.isStaticColumn(col))))));
          }
    }, err => {
      console.error(`Exception while getting data : ${err.message}`);
    });
    this.subsribers.push(sub);
    console.log(`nounCode : ${nounCode} and modifier ${modifierCode}`)
  }

  transformTableData(data, metadata: any): any {
    const rows = [];
    if (data?.length) {
      data.forEach(rec => {
          const rowData: any = {};
          const objctNumber = rec.id;

          rowData.OBJECTNUMBER = {
            fieldId: 'OBJECTNUMBER',
            fieldDesc: 'Object number',
            fieldValue: objctNumber,
            isEditable: false,
            isReviewed: rec.isReviewed
          };

          rowData.NOUN_CODE = {
            fieldId: 'NOUN_CODE',
            fieldDesc: 'Noun',
            fieldValue: this.activeNounCode,
            isEditable: false
          };

          rowData.MODE_CODE = {
            fieldId: 'MODE_CODE',
            fieldDesc: 'Modifier',
            fieldValue: this.activeModeCode,
            isEditable: false
          };

          rowData.SHORT_DESC = {
            fieldId: 'SHORT_DESC',
            fieldDesc: 'Short description',
            fieldValue: '',
            isEditable: false
          };

          rowData.LONG_DESC = {
            fieldId: 'LONG_DESC',
            fieldDesc: 'Long description',
            fieldValue: '',
            isEditable: false
          };

          this.colsUUID = [];
          metadata.forEach(attribute => {
            const fieldId = attribute.uuid;
            this.colsUUID.push(attribute.uuid);
            const ob = {
              fieldId,
              uuid: attribute.uuid,
              fieldDesc: attribute.labels?.find(label => label.language === this.locale)?.label,
              fieldValue: this.getAttributeValue(this.activeNounCode, this.activeModeCode, fieldId, objctNumber)?.c,
              fieldText: this.getAttributeValue(this.activeNounCode, this.activeModeCode, fieldId, objctNumber)?.t,
              uomCodevc: '',
              isEditable: true
            };
            rowData[fieldId] = ob;
          });

          rows.push(rowData);
      })
    }
    return rows;
  }

  getAttributeValue(nounCode, modeCode, fieldId, objctNumber) {
    const attribute = this.getAttributeData(nounCode, modeCode, fieldId, objctNumber);
    return attribute?.vc?.length ? attribute.vc[0] : {t: null, c: ''}
  }

  getAttributeData(nounCode, modeCode, fieldId, objctNumber) {
    const req = this.updatedAttributes.find(noun => {
      return noun.descriptions.length &&
      noun.descriptions[0].classCode === nounCode && noun.descriptions[0].classMode === modeCode
      && noun.strId === objctNumber
    });
    if(req) {
      if(req.descriptions[0]?.attributes && req.descriptions[0]?.attributes[this.locale].attrs?.hasOwnProperty(fieldId)) {
        const attribute = req.descriptions[0]?.attributes[this.locale].attrs[fieldId];
        return attribute;
      }
    }
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'}`;
  }



  /**
   *
   * @param fldid editable field id
   * @param row entire row should be here
   */
  editCurrentCell(fldid: string, row: any, rIndex: number,containerRef: ContainerRefDirective) {

    // Return if a NOUN CODE change is already processing
    if(this.isNounProcessing()) { return; };

    this.requestStatus = null;

    const objNr = row.OBJECTNUMBER ? row.OBJECTNUMBER.fieldValue : '';

    const selcFldCtrl = row[fldid] ? row[fldid].isEditable : null;
    if(selcFldCtrl === null || !selcFldCtrl) {
      console.log(`Can\'t edit not editable `);
      return false;
    }

    if(document.getElementById('inpctrl_'+fldid + '_' + rIndex)) {
      const inpCtrl = document.getElementById('inpctrl_'+fldid + '_'+ rIndex) as HTMLDivElement;
      const viewCtrl = document.getElementById('viewctrl_'+fldid + '_' + rIndex) as HTMLSpanElement;
      // const inpValCtrl = document.getElementById('inp_'+ fldid + '_' + rIndex) as HTMLInputElement;

      inpCtrl.style.display = 'block';
      // inpValCtrl.focus();
      viewCtrl.style.display = 'none';

      // add a dynamic cell input component
      this.addDynamicInput(fldid, row, rIndex,objNr,containerRef);

      this.fieldsInUpdate = this.fieldsInUpdate.filter(x => !(x.fldId === fldid && x.rIndex === rIndex));
    }
  }

  /**
   * After value change on & also call service for do correction
   * @param fldid fieldid that have blur triggered
   * @param value current changed value
   * @param row row data ..
   */
  emitEditBlurChng(fldid: string, value: any, row: any, rIndex: number, viewContainerRef? : ViewContainerRef) {
    this.activeCellPosition(fldid, rIndex);
    const text = value?.TEXT || value;
    value = value?.CODE || value;
    if(document.getElementById('inpctrl_'+fldid + '_' + rIndex)) {

      // DOM control after value change ...
      const inpCtrl = document.getElementById('inpctrl_'+fldid + '_'+ rIndex) as HTMLDivElement;
      const viewCtrl = document.getElementById('viewctrl_'+fldid + '_' + rIndex) as HTMLSpanElement;

      // DO correction call for data
      const objctNumber = row.OBJECTNUMBER.fieldValue;

      const nounCode = row.NOUN_CODE.fieldValue ? row.NOUN_CODE.fieldValue : '';
      const modeCode = row.MODE_CODE.fieldValue ? row.MODE_CODE.fieldValue : '';

      const oldVal = row[fldid] ? row[fldid].fieldValue : '';
      const oldText = row[fldid] ? row[fldid].fieldText || row[fldid].fieldValue : '';

      // clear the dynamic cell input component
      viewContainerRef.clear();
      inpCtrl.style.display = 'none';
      viewCtrl.style.display = 'block';

      if(value == null) {
        console.log(`Noun or Modifer value can't be null or undefined!`);
        return false;
      }

      const doc = this.getDoc(nounCode, modeCode, objctNumber);
      doc.hdvs? doc.hdvs[fldid] = {fId: fldid, vc: [{c: value, t: text}]} : doc.hdvs = {[fldid]: {fId: fldid, vc: [{c: value, t: text}]}};
      this.schemaDetailService.validateCell(this.moduleId, this.schemaId, doc, fldid, objctNumber)
        .subscribe(resp => {
          if(resp && resp.status === 'SUCCESS') {
            const correctionReq = {
              id: objctNumber,
              fldId: fldid,
              vc: value,
              vt: text,
              suggestions: [{
                nounCodevc: nounCode,
                nounCodeoc: nounCode,
                modCodevc: modeCode,
                modCodeoc: modeCode,
                attributeCorReq: [{attributeCodevc: fldid, attributeValvc: value}]
              }]
            };
            this.schemaDetailService.doClassificationCorrection(this.schemaId, correctionReq).subscribe(corResponse => {
              if(corResponse) {
                viewCtrl.innerText = text;
                row[fldid].fieldText = text;
                row[fldid].fieldValue = value;
                this.updateMasterData(row, fldid, oldVal, nounCode, modeCode, objctNumber);
                if(this.statics?.correctedCnt) {
                  this.statics.correctedCnt++;
                }
              }
            })
          } else {
            this.transientService.open('Invalid attribute value !', null, {
              duration: 1000
            });
          }
        }, err => {
          console.log(`Error:: ${err.message}`);
      })
    }
  }

  updateMasterData(row: any, fieldId, oldValue, nounCode, modeCode, objctNumber) {

    const req = this.updatedAttributes.find(noun => {
      return noun.descriptions.length &&
      noun.descriptions[0].classCode === nounCode && noun.descriptions[0].classMode === modeCode
      && noun.strId === objctNumber
    });
    if(req) {
      if(req.descriptions[0]?.attributes && req.descriptions[0]?.attributes[this.locale].attrs?.hasOwnProperty(row[fieldId].uuid)) {
        const attribute = req.descriptions[0]?.attributes[this.locale].attrs[row[fieldId].uuid];
        attribute.oc = attribute.vc;
        attribute.vc = [{t: row[fieldId].fieldText, c: row[fieldId].fieldValue}];
      } else {
        req.descriptions[0].attributes[this.locale].attrs[row[fieldId].uuid] = {
          vc: [{t: row[fieldId].fieldText, c: row[fieldId].fieldValue}],
          oc: [{t: null, c: oldValue}]
        }
      }
    } else {

      const reqFromMasterData: any = this.getReqFromMasterData(nounCode, modeCode, objctNumber);
      if(reqFromMasterData) {
        reqFromMasterData.descriptions[0].attributes[this.locale] = {
          attrs: {
            [row[fieldId].uuid]: {
              vc: [{t: row[fieldId].fieldText, c: row[fieldId].fieldValue}],
              oc: [{t: null, c: oldValue}]
            }
          }
        }
        this.updatedAttributes.push(reqFromMasterData);
      }
    }

  }

  getDoc(nounCode, modCode, objctNumber) {
    if(this.dataFrom === 'DIW') {
      const masterData = this.masterDataSub.getValue();
      const doc = masterData?.find(rec => rec.id === objctNumber);
      return doc || {};
    } else {
      const data = this.masterDataSub.getValue().masterCounts;
      const records = data.find(noun => noun.ccode === nounCode)?.mods?.
        find(modifier => modifier.mcode === modCode)?.rcs || [];
        return records.find(rec => rec.id === objctNumber) || {};
    }
  }

  getReqFromMasterData(nounCode, modCode, objctNumber?) {
    if(this.dataFrom === 'EC') {
      const noun = this.masterDataSub.getValue().masterCounts?.find(row => row.ccode === nounCode);
      if(noun) {
        const mod = noun?.mods?.find(modifier => modifier.mcode === modCode);
        return {
          strId: objctNumber,
          hdvs: mod.hdvs || {},
          hyvs: mod.hyvs || {},
          descriptions: [{
            classCode: nounCode,
            classMode: modCode,
            attributes: {
              [this.locale]: {}
            }
          }]
        }
      }
    } else {
      const doc = this.getDoc(nounCode, modCode, objctNumber);
      return {
        strId: objctNumber,
        hdvs: doc.hdvs || {},
        hyvs: doc.hyvs || {},
        descriptions: [{
          classCode: nounCode,
          classMode: modCode,
          attributes: {
            [this.locale]: {}
          }
        }]
      }
    }
  }

  setBadgeState(fldId, rIndex, state) {
    const badgeFld = this.fieldsInUpdate.find(x => (x.fldId === fldId && x.rIndex === rIndex));
    if (badgeFld) {
      badgeFld.badge = state;
      setTimeout(() => {
        badgeFld.badge = '';
        this.fieldsInUpdate = this.fieldsInUpdate.filter(x => !(x.fldId === fldId && x.rIndex === rIndex));
      }, 2000);
    }
  }

  addDynamicInput(fldid: string, row: any, rIndex: number,objectNumber: string, containerRef: ContainerRefDirective){

    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(
      DescriptionDatatableCellEditableComponent
    );

    let isDropdown = false;
    // check whether the editable is dropdown or normal value
    const hasFld = this.colsAndMetadata.find(f => f.uuid === fldid);
    if(hasFld && hasFld.fieldType === 'DROPDOWN') {
      isDropdown = true;
    }

    let val;
    if(isDropdown) {
      val = row[fldid].fieldValue ? {CODE: row[fldid].fieldValue, TEXT: row[fldid].fieldText} : null;
    } else {
      val = row[fldid].fieldValue;
    }

    // add the input component to the cell
    const componentRef = containerRef.viewContainerRef.createComponent(componentFactory);

    this.tableContainer.nativeElement.onscroll = () => {
      componentRef.instance.inputAutoCompleteEl?.closePanel();
      componentRef.instance.input.nativeElement.blur();
    };
    // binding dynamic component inputs/outputs
    componentRef.instance.fieldId = fldid;
    componentRef.instance.moduleId = this.moduleId;
    componentRef.instance.schemaId = this.schemaId;
    componentRef.instance.objectNumber = objectNumber;
    componentRef.instance.value = val;
    componentRef.instance.controlType = isDropdown ? 'dropdown' : 'inputText';
    componentRef.instance.inputBlur.subscribe(value => this.emitEditBlurChng(fldid, value, row, rIndex, containerRef.viewContainerRef));

  }


  onTableScroll(e) {
    const tableViewHeight = e.target.offsetHeight // viewport: ~500px
    const tableScrollHeight = e.target.scrollHeight // length of all table
    const scrollLocation = e.target.scrollTop; // how far user scrolled

    // If the user has scrolled within 200px of the bottom, add more data
    const buffer = 200;
    const limit = tableScrollHeight - tableViewHeight - buffer;
    if ((scrollLocation > limit) && !this.scrollLimitReached) {
       this.scrollLimitReached = true;
       if(this.isLoadMoreEnabled) {
        const keys =  Object.keys(this.tableData);
        const objAfter = keys[keys.length -1] ? keys[keys.length -1] : '';
        // this.applyFilter(this.activeNounCode, this.activeModeCode);
       }
    } else {
      this.scrollLimitReached = false;
    }
  }

  columnName(columnId): string {
    return this.dataSource.data.length ? this.dataSource.data[0][columnId].fieldDesc || 'Unknown': 'Unknown';
  }

  toggleSideBar() {
    if (this.arrowIcon === 'chevron-left') {
      this.arrowIcon = 'chevron-right';
      this.widthOfSchemaNav=0;

    }
    else {
      this.arrowIcon = 'chevron-left';
      this.widthOfSchemaNav=246;
    }
  }

  // @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent){
    this.mousePosition = { x: event.clientX, y: event.clientY };
    if (this.status === SchemaNavGrab.RESIZE) {
      this.resize();
      this.navscroll.nativeElement.style.cursor = 'col-resize';
    }
    else {
      this.navscroll.nativeElement.style.cursor = 'default';
    }
  }

  public setNavDivPositions() {
    const { left, top } = this.navscroll.nativeElement.getBoundingClientRect();
    this.boxPosition = { left, top };
  }

  public resize() {
    const maxWidth=this.listingContainer.nativeElement.clientWidth/3;
    this.widthOfSchemaNav = Number(this.mousePosition.x > this.boxPosition.left) ?
      Number(this.mousePosition.x - this.boxPosition.left < maxWidth) ?
        this.mousePosition.x - this.boxPosition.left : maxWidth : 0;
        this.widthOfSchemaNav<30 ? this.arrowIcon='chevron-right': this.arrowIcon='chevron-left';
  }

  public setStatus(event: MouseEvent, status: number) {
    if (status === 1) event.stopPropagation();
    else this.setNavDivPositions();
    this.status = status;
  }

  public enableResize(){
    const grabberElement = document.createElement('div');
    grabberElement.style.height = '100%';
    grabberElement.style.width = '2px';
    grabberElement.style.backgroundColor = '#ffffff';
    grabberElement.style.position = 'absolute';
    grabberElement.style.cursor = 'col-resize';
    grabberElement.style.resize = 'horizontal';
    grabberElement.style.overflow = 'auto';
    grabberElement.style.right = '0%';
    this.navscroll.nativeElement.appendChild(grabberElement);

  }

  /**
   * get module info based on module id
   * @param id module id
   */
   getModuleInfo(id) {
    this.loader.moduleDetails = true;
    const obsv = this.coreService.searchAllObjectType({lang: this.locale,fetchsize: 1,fetchcount: 0,description: ''},[id]);
    const sub = obsv.subscribe(res => {
      if (res && res.length) {
        this.moduleInfo = res[0];
      }
      this.loader.moduleDetails = false;
    }, error => {
      this.loader.moduleDetails = false;
      console.log(`Error:: ${error.message}`)
    });
    this.subsribers.push(sub);
    return obsv;
  }

  /**
   * Check whether column is mandatory or not
   * @param colId mostily the atrribute
   * @returns If the column is mandatory then return true otherwise false
   */
  isMandatory(colId: string): boolean {
    const hasKey = this.colsAndMetadata.find(f=> f.colId === colId);
    return hasKey && hasKey.mandatory ? true : false;
  }

  /**
   * Validate the row before sending for generate desc
   * @param row current row
   */
  _valid(row: any): any {
    const msgs = {};
    // check bor mandatory
    const allMandatory = this.colsAndMetadata.filter(f=> f.mandatory);
    allMandatory.forEach(m=>{
      if(row[m.colId] && !row[m.colId].fieldValue) {
        msgs[m.colId] = 'Please enter the value';
      }
    });

    // check for numeric
    const allNumeric = this.colsAndMetadata.filter(f=> f.fieldType === 'NUMERIC');
    allNumeric.forEach(f=>{
      if(row[f.colId] && !msgs[f.colId] && !row[f.colId].fieldValue.match('^[0-9]*$')) {
        msgs[f.colId] = 'Invalid type , Only numeric allowed';
      }
    });
    return Object.keys(msgs).length >0 ? msgs : null;
  }

  isEditEnabled(fldid: string, row: any, rIndex: number) {
    // const selectedFields = this.selectedFieldsOb.getValue() || [];
    // const field = selectedFields.find(f => f.fieldId === fldid);
    if (fldid && row[fldid] && !row[fldid].isEditable) {
      return false;
    }

    const el = document.getElementById('inpctrl_' + fldid + '_' + rIndex);

    if (el) {
      const inpCtrl = document.getElementById('inpctrl_' + fldid + '_' + rIndex) as HTMLDivElement;
      if (inpCtrl.style.display === 'block') {
        return true;
      }
    }

    return false;
  }

  /**
   * method to check if the user is admin for this schema
   * and whether the user can refine the schema
   * @returns boolean
   */
   isAdmin(): boolean {
    if(this.schemaInfo?.collaboratorModels && this.userDetails) {
      const isAdmin = this.schemaInfo.collaboratorModels.isAdmin;
      const isSameUser = this.schemaInfo.createdBy === this.userDetails.userName;
      return isAdmin || isSameUser;
    }

    return false;
  }

  /**
   * use this method to update the UI after dynamic columns are displayed
   */
   updateTableColumnSize() {
    this.ngZone.onMicrotaskEmpty.pipe(take(3)).subscribe(() => this.table.updateStickyColumnStyles());
    this.activeCell = null;
  }

  /**
   * Get badge status
   * @param rowIndex index for the row
   * @param column column name
   * @returns BadgeData
   */
  badge(column: string, rowIndex: number): BadgeData {
    const isActive = this.isActive(column, rowIndex);

      return this.badgeService.getBadgeByStatus(isActive? this.requestStatus : null);
  }

  getBadgeState(fldid, rIndex) {
    const badgeFld = this.fieldsInUpdate.find(x => (x.fldId === fldid && x.rIndex === rIndex));
    const state = badgeFld ? badgeFld.badge : null;
    return this.badgeService.getBadgeByStatus(state);
  }

  /**
   * Tocheck if the current cell is active
   * @param column column name
   * @param rowIndex row index
   * @returns boolean
   */
  isActive(column: string, rowIndex: number): boolean {
    if(column && rowIndex > -1 && this.activeCell) {
      return column === this.activeCell.column && rowIndex === this.activeCell.rowIndex;
    }

    return false;
  }

  /**
   * Hold the active cell position using column and row values
   * @param column column name
   * @param rowIndex row index
   */
   activeCellPosition(column: string, rowIndex: number): void {
    if(this.isNounProcessing()) { return };
    this.requestStatus = null;
    this.activeCell = {column, rowIndex};
  }

  isNounProcessing(): boolean {
    return this.activeCell?.column === 'NOUN_CODE' && this.requestStatus === BadgeStatus.PENDING;
  }

  submit() {

  }

  getNounModTree(searchString?) {
    const treeObs = this.dataFrom === 'DIW' ? this.ruleService.getClassificationHierarchyTree(this.schemaId, searchString, this.activeTab==='_correction')
      : this.masterDataSub.pipe(
        take(1),
        map(masterCounts => ({masterCounts, connecthubCounts: []})),
        tap(data => this.masterDataSub.next(data))
        );

    this.selection.clear();
    this.dataSource = new MatTableDataSource<any>([]);
    treeObs.subscribe( (data: any) => {
      this.nounModsList.master = this.mapNounsModsData(data?.masterCounts, searchString) ;
      this.nounModsList.connecthubCounts = this.mapNounsModsData(data?.connecthubCounts) ;
      this.nounModsList.unknowCount = data?.unknowCount;

      if(!this.activeNounCode || !this.activeModeCode) {
        let activeNoun = this.nounModsList.master.find(noun => noun.modifier.length);
        if(!activeNoun) {
          activeNoun = this.nounModsList.connecthubCounts.find(noun => noun.modifier.length);
        }
        if(activeNoun) {
          this.applyFilter(activeNoun.nounCode, activeNoun.modifier[0].modCode, (activeNoun.modifier[0] as any).uuid);
        }
      }
    });
  }

  mapNounsModsData(rawData: any[], searchString?) {
    const nounsList: Noun[] = [];
    if(rawData)  {
      if(searchString && searchString.trim()) {
        rawData.forEach(noun => {
          if(noun.desc?.toLowerCase().includes(searchString.toLowerCase())) {
            nounsList.push({
              doc_cnt: noun.cnt,
              nounCode: noun.ccode,
              nounDesc: noun.desc || noun.ccode,
              nounSortDesc: null,
              modifier: noun.mods?.map(mod => ({doc_cnt: mod.cnt, modCode: mod.mcode, modText: mod.mcode, modDesc: mod.mcode, uuid: mod.uuid})),
              nounId: null
            });
          } else {
            const filteredMods = noun.mods.filter(mod => mod.mcode?.toLowerCase().includes(searchString.toLowerCase()));
            if(filteredMods.length) {
              nounsList.push({
                doc_cnt: noun.cnt,
                nounCode: noun.ccode,
                nounDesc: noun.desc || noun.ccode,
                nounSortDesc: null,
                modifier: filteredMods.map(mod => ({doc_cnt: mod.cnt, modCode: mod.mcode, modText: mod.mcode, modDesc: mod.mcode, uuid: mod.uuid})),
                nounId: null
              });
            }
          }
        })
      } else {
        rawData.forEach(noun => {
          nounsList.push({
            doc_cnt: noun.cnt,
            nounCode: noun.ccode,
            nounDesc: noun.desc || noun.ccode,
            nounSortDesc: null,
            modifier: noun.mods?.map(mod => ({doc_cnt: mod.cnt, modCode: mod.mcode, modText: mod.mcode, modDesc: mod.mcode, uuid: mod.uuid})),
            nounId: null
          });
        });
      }
    };
    return nounsList;
  }

  getDatatable(nounCode: string, modCode: string, isMaster=true): Observable<any> {
    if(this.dataFrom === 'EC') {
      const data = this.masterDataSub.getValue().masterCounts;
      return of(data.find(noun => noun.ccode === nounCode)?.mods?.
        find(modifier => modifier.mcode === modCode)?.rcs || []);
    } else {
      const req = {
        schemaId: this.schemaId,
        classCode: nounCode,
        classMode: modCode,
        isMaster,
        pageNo: 0,
        pageSize: 10
      };
      return ( this.activeTab === '_all' ? this.ruleService.getClassificationData(req, nounCode === 'Unknown') : this.ruleService.getClassificationCorrData(req))
        .pipe(tap(data => this.masterDataSub.next(data)));
    }
  }

  isStaticColumn(fieldId) {
    return staticColumns.includes(fieldId);
  }

  generateDescription() {
    console.log(this.updatedAttributes);
    this.ruleService.generateDescription(this.updatedAttributes, this.moduleId, this.channelId, this.userDetails?.userId)
      .subscribe(resp => {
        console.log(resp);
      })
  }

  openExpansionView() {
    if(this.dataFrom === 'EC') {
      this.sharedService.setClassificationReqData(this.updatedAttributes);
      this.router.navigateByUrl('/excelconnect/generatedialog');
    }
  }

  closeExpansionView() {
    if(this.dataFrom === 'EC') {
      this.router.navigateByUrl(`/nonav/generate-description/${this.moduleId}`);
    }
  }

  get isExpansionViewActive() {
    return this.router.url.includes('excelconnect/generatedialog');
  }

  /**
   * Initialize the socket connection
   * @returns Observable<WebsocketConnectionStatus>
   */
  initiateSocketConnection(): Observable<WebsocketConnectionStatus> {
    return new Observable((observer) => {
      this.chatService.jwtLogin().subscribe(
        (res: any) => {
          this.websocketService._connect().subscribe(
            (response: WebsocketConnectionStatus) => {
              observer.next(response);
              observer.complete();
            },
            (err) => {
              observer.error(err);
              observer.complete();
            }
          );
        },
        (error) => {
          observer.error(error);
          observer.complete();
        }
      );
    });
  }

  /**
   * Prepare channel id request body
   * @param customPayload pass the custom payload to override default payload
   * @returns Promise<ChannelIdrequest>
   */
  prepareChannelIdrequest(customPayload: ChannelIdrequest | any = {}): Promise<ChannelIdrequest> {
    return new Promise((resolve, reject) => {
      let payload: ChannelIdrequest = {
        pageId: customPayload?.pageId || 'na',
        moduleId: customPayload?.moduleId || this.moduleId,
        recordId: customPayload?.recordId || '',
        crId: customPayload?.crId || 'na',
        schemaId: customPayload?.schemaId || this.schemaId,
        massId: customPayload?.massId || '',
      };

      try {
        for (let prop = 0; prop < 10; prop++) {
          const customProps = customPayload[`customProp${prop + 1}`];
          payload[`customProp${prop + 1}`] = customProps? customProps : this.customProps[prop] || 'na';
        }
      } catch (error) {
        reject(error);
      }

      resolve(payload);
    });
  }

  /**
   * Method to get all the previous messages
   * based on user details, schema and module id
   */
   getChannelId(payload: ChannelIdrequest): void {
    this.getOrCreateChannelId(payload).subscribe(
      (res: any) => {
        if (res?.channelId) {
          this.channelId = res.channelId;
          this.subscribeToChannel(res.channelId);
          // this.websocketService._activeUsers(res.channelId);
        } else {
          console.error(`Error getting channel id: `, res);
        }
      },
      (error: HttpErrorResponse) => {
        console.log('Error while requesting channel id', error);
      }
    );
  }

  /**
   * get channel id
   * @param payload ChannelIdrequest
   * @returns Observable<any>
   */
  getOrCreateChannelId(payload: ChannelIdrequest): Observable<any> {
    return new Observable((observer) => {
      this.chatService.getOrCreateChannelId(payload).subscribe(
        (res) => {
          observer.next(res);
          observer.complete();
        },
        (err) => {
          console.error(`Error getting channel id: ${err}`);
          observer.error(err);
          observer.complete();
        }
      );
    });
  }

  /**
   * Subscribe to a channel using channel ID
   * @param channelId pass the channel ID
   */
   subscribeToChannel(channelId: string): void {
    this.websocketService.subscribePublic(channelId);
    this.websocketService._messages().subscribe((message) => {
      console.log(message);
      if(message) {
        const parsed = JSON.parse(JSON.parse(message));
      }
    });
  }

  inlineGenerateDesc(row) {
    const nounCode = row.NOUN_CODE.fieldValue;
    const modCode = row.MODE_CODE.fieldValue;
    const objctNumber = row.OBJECTNUMBER.fieldValue;
    const index = this.updatedAttributes.findIndex(noun => {
      return noun.descriptions.length &&
      noun.descriptions[0].classCode === nounCode && noun.descriptions[0].classMode === modCode
      && noun.strId === objctNumber
    });

    if(index === -1) {
      console.log('Row not corrected !');
      return;
    }

    const rowDetails = this.updatedAttributes[index];

    let attributeCorReqDesList = [];
    if(rowDetails.descriptions?.length) {
      const attributes = rowDetails.descriptions[0].attributes[this.locale]?.attrs;
      if(attributes) {
        Object.keys(attributes).forEach(attr => {
          attributeCorReqDesList.push({
            attributeCodevc: attr,
            attributeValvc: attributes[attr].vc[0]?.c,
            uomCodevc: attributes[attr].uom || 'UOM'
          })
        });
      }
    }

    const req = {
      moduleId: this.moduleId,
      nounCodevc: nounCode,
      modCodevc: modCode,
      recordES: {
        strId: objctNumber,
        hdvs: rowDetails.hdvs || {},
        hyvs: rowDetails.hyvs || {},
        gvs: rowDetails.gvs || {}
      },
      attributeCorReqDesList,
      languageList: LanguageList
    }
    console.log('Unit description req ', req);
    this.ruleService.getGenDescription(req).subscribe(res => {
      this.updatedAttributes.splice(index, 1);
      const correctionReq = {
        id: objctNumber,
        fldId: null,
        vc: '',
        vt: '',
        suggestions: [{
          nounCodevc: nounCode,
          nounCodeoc: nounCode,
          modCodevc: modCode,
          modCodeoc: modCode,
          attributeCorReq: []
        }]
      };
      if(res?.response?.allLangDesc?.length) {
        const rowDesc = res?.response?.allLangDesc.find(desc => desc.lang === this.locale);
        if(rowDesc) {
          row.SHORT_DESC.fieldValue = rowDesc.shortDesc;
          row.LONG_DESC.fieldValue = rowDesc.longDesc;
        }
      }
      this.schemaDetailService.doClassificationCorrection(this.schemaId, correctionReq).subscribe(corResponse => {
        console.log(corResponse);
      })
    })
  }

  /**
   * Call service for get schema statics based on schemaId and latest run
   */
   getSchemaStatics() {
    const sub = this.schemaService.getSchemaThresholdStaticsV2(this.schemaId, this.variantId,[],[]).subscribe(res => {
      this.statics = res;
      // this.updateTableColumnSize();
    }, error => {
      this.statics = new SchemaStaticThresholdRes();
      console.error(`Error : ${error}`);
    });
    this.subsribers.push(sub);
  }

  /**
   * Approve schema corrected records ..
   * @param type type of request is inline or submit all
   * @param row if request  type is inline then submit single rec..
   */
  approveRecords(type: string, row?: any) {
    const ids: string[] = [];
    if (type === 'inline') {
      const docId = row ? row.OBJECTNUMBER.fieldValue : '';
      if (docId) {
        ids.push(docId);
      }
    } else {
      if (this.selection.selected.length) {
        const selected = this.selection.selected.filter(sel => !sel.OBJECTNUMBER.isReviewed);
        selected.forEach(sel => {
          const docId = sel.OBJECTNUMBER.fieldValue;
          ids.push(docId);
        });

      }
    }
    const sub = this.schemaDetailService.approveCorrectedRecords(this.schemaId, ids, this.userDetails?.currentRoleId).subscribe(res => {
      if (res === true) {
        if (type === 'inline') {
          row.OBJECTNUMBER.isReviewed = true;
        } else {
          this.selection.selected.forEach(record => {
            record.OBJECTNUMBER.isReviewed = true;
          })
        }
        this.selection.clear();
        this.transientService.open('Correction is approved', '', { duration: 2000 });
        this.getSchemaStatics();
      }
    }, error => {
      this.transientService.open(`${error?.error?.message}`, '', { duration: 2000 });
      console.error(`Error :: ${error.message}`);
    });
    this.subsribers.push(sub);
  }

  /**
   * Reject schema corrected records ..
   * @param row which are going to reset ..
   * @param type from where ..
   */
   rejectRecords(type: string, row?: any) {
    const id: string[] = [];
    if (type === 'inline') {
      const docId = row ? row.OBJECTNUMBER.fieldValue : '';
      if (docId) {
        id.push(docId);
      }
    } else {
      if (this.selection.selected.length) {
        const selected = this.selection.selected.filter(sel => !sel.OBJECTNUMBER.isReviewed);
        selected.forEach(sel => {
          const docId = sel.OBJECTNUMBER.fieldValue;
          id.push(docId);
        });
      }
    }
    const sub = this.schemaDetailService.resetCorrectionRecords(this.schemaId, this.schemaInfo?.runId || '', id).subscribe(res => {
      if (res && res.acknowledge) {
        this.transientService.open('Correction is rejected', '', { duration: 2000 });
        this.getSchemaStatics();
        this.selection.clear();
        if (type === 'inline') {
          row.OBJECTNUMBER.isReviewed = true;
        } else {
          this.selection.selected.forEach(record => {
            record.OBJECTNUMBER.isReviewed = true;
          })
        }
      }
    }, error => {
      this.transientService.open(`Error :: ${error}`, '', { duration: 2000 });
      console.error(`Error :: ${error.message}`);
    });
    this.subsribers.push(sub);

  }

}

const staticColumns = ['checkbox_select', '_actions', 'OBJECTNUMBER', 'SHORT_DESC', 'LONG_DESC', 'NOUN_CODE', 'MODE_CODE']



const definedColumnsMetadata = {
  OBJECTNUMBER: {
    fieldId: 'OBJECTNUMBER',
    fieldDesc: 'Material number',
    fieldValue: ''
  }, SHORT_DESC: {
    fieldId: 'SHORT_DESC',
    fieldDesc: 'Short description',
    fieldValue: ''
  },
  MGROUP_DESC: {
    fieldId: 'MGROUP_DESC',
    fieldDesc: 'Material group',
    fieldValue: ''
  }, NOUN_CODE: {
    fieldId: 'NOUN_CODE',
    fieldDesc: 'Noun code',
    fieldValue: '',
    isEditable: true
  } ,MODE_CODE: {
    fieldId: 'MODE_CODE',
    fieldDesc: 'Modifier code',
    fieldValue: '',
    isEditable: true
  },
  PARTNO: {
    fieldId: 'PARTNO',
    fieldDesc: 'Part number',
    fieldValue: ''
  }
}

