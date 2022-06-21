import { take, takeUntil } from 'rxjs/operators';
import { Fieldlist, FieldlistContainer } from '@models/list-page/listpage';
import { CoreService } from '@services/core/core.service';
import { ListService } from '@services/list/list.service';
import { FormPropertyComponent } from '../form-property';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Component, OnInit, Inject, LOCALE_ID, OnChanges } from '@angular/core';
import { RuleService } from '@services/rule/rule.service';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { ConnectionService } from '@services/connection/connection.service';
import { Observable, of } from 'rxjs';
import { ConnectionMDOModel } from '@models/connector/connector.model';

@Component({
  selector: 'pros-dropdown-field',
  templateUrl: './dropdown-field.component.html',
  styleUrls: ['./dropdown-field.component.scss'],
})
export class DropdownFieldComponent extends FormPropertyComponent implements OnInit, OnChanges {
  private _fieldlistContainer: FieldlistContainer;

  get fieldlistContainer(): FieldlistContainer { return this._fieldlistContainer };

  set fieldlistContainer(newFieldListContainer: FieldlistContainer) {
    if(this._fieldlistContainer === newFieldListContainer) { return ;}
    this._fieldlistContainer = newFieldListContainer;
    this.onFieldlistContainerChange(this._fieldlistContainer);
  }

  /** keep the selected roles list */
  selectedRolesOptions = []

  listTypeOptionCtrl = new FormControl();
  referenceSystemOptionCtrl = new FormControl();
  referenceListOptionCtrl = new FormControl();
  roleCtrl = new FormControl();

  editorConfig = {
    modules: {
      toolbar: [
        ['bold', 'italic', 'underline', 'strike', { list: 'ordered' }, { list: 'bullet' }, { color: [] }, { background: [] }], // toggle buttons
      ],
    },
    placeholder: 'information for field on mouse hover of input',
    theme: 'snow', // or 'bubble'
  };

  /**
   * store the option fields for list type
   */
  listTypeOptions: any[] = [
    {
      key: 'Dropdown',  value:'Dropdown', tooltip:'Will allow to select from a maintained list of values'
    },
    {
      key: 'Request Type',  value:'Request type', tooltip:'Will allow to capture additional information while submitting or approving a request and decide on the request approvals.  '
    },
    {
      key: 'Status Type',  value:'Status type', tooltip:'Will allow to manage a process driven status for a record'
    },
    {
      key: 'User Selection',  value:'User selection', tooltip:'Will allow to select users of your organization from a list.'
    },
    {
      key: 'Rejection Type',  value:'Rejection type', tooltip:'Will allow to capture additional information when a request is being rejected.'
    },
    {
      key: 'Noun Type',  value:'Noun type', tooltip:'Will allow to select from a list of configured Nouns when description generator is enabled.'
    },
  ];

  // dummy data
  systemTypeOptions = [
    { label: 'CODE', value: 'CODE' },
    { label: 'TEXT', value: 'TEXT' },
    { label: 'CODE AND TEXT', value: 'CODE AND TEXT' },
  ];

  roleOptions: any = []

  /**
   * Obserable for the refrence system...
   */
  referenceSystemObs$: Observable<ConnectionMDOModel[]> = of([]);
  referenceListFieldObs$: Observable<any> = of([]);

  constructor(
    public fb: FormBuilder,
    public router: Router,
    public route: ActivatedRoute,
    public listService: ListService,
    public ruleService: RuleService,
    public coreService: CoreService,
    public sharedService: SharedServiceService,
    @Inject(LOCALE_ID) public locale: string,
    private connectionService: ConnectionService
  ) {
    super(fb, route, router, listService, coreService, locale);
    this.type = 'dropdown';
    this.patchCommonFields(this.fieldlistContainer && this.fieldlistContainer.fieldlist);
    this.createDropdownFormGroup(this.fieldlistContainer && this.fieldlistContainer.fieldlist);
    /**
     * get the tenet user roles list
     */
    const obj = { searchString: '', parent: {} }
    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
    this.ruleService.getTenentRoles(this.locale,obj).subscribe((resp: any) => {
      this.roleOptions = resp?.listPage?.content;
    })
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.sharedService.getAfterDataRefSave().pipe(takeUntil(this.unsubscribeAll$)).subscribe(resp => {
      if(resp) {
        const rules = this.sharedService.getDatasetRefArr(this.fieldId);
        this.formGroup.patchValue({refrules: rules || []});
        this.sharedService.setDataRefDetails(null);
        this.fireValidationStatus();
      }
    });

    // get the connection details
    this.getCPIConnections();
    if(this.fieldlistContainer.fieldlist.referenceSystem) {
      this.getConnectionById(this.fieldlistContainer.fieldlist.referenceSystem);
    }
  }

  onFieldlistContainerChange(changes) {
    this.patchCommonFields(changes.fieldlist);
    this.patchValue(changes.fieldlist);
  }


  /**
   * add control according to control type
   */
   createDropdownFormGroup(data?: any) {
    this.formGroup.addControl(
      'dataType',
      new FormControl(data && data.dataType ? data.dataType : dropdownFieldDataTypes.CHAR, [Validators.required])
    );
    this.formGroup.addControl('isKeyField', new FormControl(data && data.isKeyField ? data.isKeyField : false, []));
    this.formGroup.addControl('isSearchEngine', new FormControl(data && data.isSearchEngine ? data.isSearchEngine : false, []));
    this.formGroup.addControl('isTransient', new FormControl(data && data.isTransient ? data.isTransient : false, []));
    this.formGroup.addControl('isWorkFlow', new FormControl(data && data.isWorkFlow ? data.isWorkFlow : false, []));
    this.formGroup.addControl('isNumSettingCriteria', new FormControl(data && data.isNumSettingCriteria ? data.isNumSettingCriteria : false, []));
    this.formGroup.addControl('isPermission', new FormControl(data && data.decimalValue ? data.isPermission : 0, []));
    this.formGroup.addControl('isReference', new FormControl(data && data.isReference ? data.isReference : 0, []));
    this.formGroup.addControl('isCheckList', new FormControl(data && data.isCheckList ? data.isCheckList : false, []));
    this.formGroup.addControl('isRejection', new FormControl(data && data.isRejection ? data.isRejection : false, []));
    this.formGroup.addControl('isRequest', new FormControl(data && data.isRequest ? data.isRequest : false, []));
    this.formGroup.addControl('pickList', new FormControl(data && data.pickList ? data.pickList : '1', [Validators.required]));
    this.formGroup.addControl('isNoun', new FormControl(data && data.isNoun ? data.isNoun : false, []));
    this.formGroup.addControl('displayCriteria', new FormControl(data && data.displayCriteria ? data.displayCriteria : null, []));
    this.formGroup.addControl('refrules', new FormControl(data && data.refrules ? data.refrules : null, []));
    this.listTypeOptionCtrl.setValue(this.listTypeOptionCtrl.value === ('' || null) ? 'Dropdown' : this.listTypeOptionCtrl.value);
    this.formGroup.addControl('referenceSystem', new FormControl(data && data.referenceSystem ? data.referenceSystem : null, []));
    this.formGroup.addControl('referenceSystemFld', new FormControl(data && data.referenceSystemFld ? data.referenceSystemFld : null, []));
  }

  fireValidationStatus(event?: any) {
    super.fireValidationStatus(this.fieldlistContainer);
  }

  /**
   * patch form with new fieldList data. after ngonchange call this method to update with data.
   */
  patchValue(data?: any) {
    this.formGroup.patchValue({
      dataType: data && data.dataType ? data.dataType : dropdownFieldDataTypes.CHAR,
      isNumSettingCriteria: data && data.isNumSettingCriteria ? data.isNumSettingCriteria : false,
      isSearchEngine: data && data.isSearchEngine ? data.isSearchEngine : false,
      isReference: data && data.isReference ? data.isReference : false,
      referenceSystem: data && data.referenceSystem ? data.referenceSystem : null,
      referenceSystemFld: data && data.referenceSystemFld ? data.referenceSystemFld : null,
      isPermission: data && data.isPermission ? data.isPermission : false,
      isTransient: data && data.isTransient ? data.isTransient : false,
      isCheckList: data && data.isCheckList ? data.isCheckList : false,
      isRejection: data && data.isRejection ? data.isRejection : false,
      isRequest: data && data.isRequest ? data.isRequest : false,
      pickList: data && data.pickList ? data.pickList : '1',
      isNoun: data && data.isNoun ? data.isNoun : false,
      displayCriteria: data && data.displayCriteria ? data.displayCriteria : null,
      refrules: data && data.refrules ? data.refrules : null,
      isWorkFlow: data && data.isWorkFlow ? data.isWorkFlow : false,
    });

    if(data && data.structureId !== '1') {
      this.formGroup.patchValue({
        isKeyField: data && data.isKeyField ? data.isKeyField : false,
      });
    }

    this.findListType(data);
  }

  findListType(data?: Fieldlist) {
    if (data.isRequest) {
      this.listTypeOptionCtrl.setValue('Request type');
    }else if (data.isRejection) {
      this.listTypeOptionCtrl.setValue('Rejection type');
    }else if (data.isNoun) {
      this.listTypeOptionCtrl.setValue('Noun type');
    }else if(data.pickList === '1' && data.dataType === dropdownFieldDataTypes.CHAR) {
      this.listTypeOptionCtrl.setValue('Dropdown');
    } else if(data.pickList === '0' && data.dataType === dropdownFieldDataTypes.STATUS) {
      this.listTypeOptionCtrl.setValue('Status type');
    } else if(data.pickList === '37' && data.dataType === dropdownFieldDataTypes.CHAR) {
      this.listTypeOptionCtrl.setValue('User selection');
    }
  }

  /**
   * open the side sheet for the edit value
   */
  openListvaluePanel(syncData?: boolean) {
    this.router.navigate([{ outlets: { sb: `sb/list/dropdown-values/${this.listTypeOptionCtrl.value}/${this.moduleId}/${this.fieldlistContainer.fieldId.replace('new', '')}` }}], {
      queryParams:{syncData},
      queryParamsHandling: 'merge',
      preserveFragment: true
    });
  }

  /**
   * open side sheet for the data referencing.
   */
  openDataReferencing() {
    this.sharedService.setDataRefDetails(this.formGroup.value?.refrules || []);
    this.router.navigate([{ outlets: { sb: `sb/list/data-referencing/${this.moduleId}/${this.fieldlistContainer.fieldId.replace('new', '')}` } }], {
      queryParamsHandling: 'preserve',
      preserveFragment: true,
    });
  }

  /**
   * close the side sheet
   */
  close() {
    this.coreService.nextUpdateFieldPropertySubject({fieldId: this.fieldlistContainer.fieldId, isNew: this.fieldlistContainer.isNew, fieldlist: this.formGroup.value});
    this.coreService.closeEditDatasetFormDrawe(true);
    this.router.navigate(['.'], { relativeTo: this.route, fragment: null, queryParamsHandling: 'preserve' });
  }

  /**
   * set the list type values.
   */
  onSelectListType(event): any{
    switch (event.option.value) {
      case 'Request type': {
        this.formGroup.patchValue({isRequest: true});
        this.formGroup.patchValue({isRejection: false});
        this.formGroup.patchValue({isNoun: false});
        break;
      }
      case 'Rejection type': {
        this.formGroup.patchValue({isRequest: false});
        this.formGroup.patchValue({isRejection: true});
        this.formGroup.patchValue({isNoun: false});
        break;
      }
      case 'Noun type': {
        this.formGroup.patchValue({isRequest: false});
        this.formGroup.patchValue({isRejection: false});
        this.formGroup.patchValue({isNoun: true});
        break;
      }
      case 'Dropdown': {
        this.formGroup.patchValue({isRequest: false});
        this.formGroup.patchValue({isRejection: false});
        this.formGroup.patchValue({isNoun: false});
        this.formGroup.patchValue({pickList: '1'});
        this.formGroup.patchValue({dataType: dropdownFieldDataTypes.CHAR});
        break;
      }
      case 'Status type': {
        this.formGroup.patchValue({isRequest: false});
        this.formGroup.patchValue({isRejection: false});
        this.formGroup.patchValue({isNoun: false});
        this.formGroup.patchValue({pickList: '0'});
        this.formGroup.patchValue({dataType: dropdownFieldDataTypes.STATUS});
        break;
      }
      case 'User selection': {
        this.formGroup.patchValue({isRequest: false});
        this.formGroup.patchValue({isRejection: false});
        this.formGroup.patchValue({isNoun: false});
        this.formGroup.patchValue({pickList: '37'});
        this.formGroup.patchValue({dataType: dropdownFieldDataTypes.CHAR});
        break;
      }
      default: {
        this.fieldlistContainer.fieldlist.isRequest = false;
        this.fieldlistContainer.fieldlist.isRejection = false;
      }
      break;
    }

    this.fireValidationStatus();
  }

  /**
   * set the the selected roles
   */
  selected(data): any{
    const index = this.selectedRolesOptions.indexOf(data);
    if (index === -1) {
      this.selectedRolesOptions.push(data);
    }
  }

  /**
   * remove the selected roles
   */
  remove(data) {
    const index = this.selectedRolesOptions.indexOf(data);
    if (index !== -1) {
      this.selectedRolesOptions.splice(index, 1);
    }
  }

  getQuillEditorId(): string {
    if (!this.fieldlistContainer) return '';
    else if (this.fieldlistContainer.childrenId) return this.fieldlistContainer.childrenId;
    else if (this.fieldlistContainer.parentSubGridId) return this.fieldlistContainer.parentSubGridId;
    else return this.fieldlistContainer.fieldId;
  }

  /**
   * Get all the connection details ...
   */
  getCPIConnections() {
    this.referenceSystemObs$ = this.connectionService.getCPIConnections();
  }

  /**
   * if fieldlistcontainer has the referenceSystem, then fetch cpi connection by id and update the referenceSystemOptionCtrl to display the value
   */
  getConnectionById(uuid: string) {
    this.connectionService.getConnectionById(uuid).pipe(take(1)).subscribe(resp => {
      this.referenceSystemOptionCtrl.setValue(resp);
    }, err =>  console.log(err));
  }

  /**
   * The selected name
   * @param ele the selected element
   * @returns will return the name
   */
  referenceSystemDisplayWith(ele: any) {
    return ele?.connectionName || '';
  }

  referenceListDisplayWith(ele: any) {
    return ele?.fieldname || '';
  }

  /**
   * Set the system id ...
   * @param opt the selected option ..
   */
  referenceSystemSelect(opt: any) {
    this.formGroup.get('referenceSystem').patchValue(opt.option.value.connectionId);
    this.fireValidationStatus();
  }

  referenceListFieldSelect(opt: any) {
    this.formGroup.get('referenceSystemFld').patchValue(opt?.option.value.fieldId);
    this.fireValidationStatus();
  }

}

export enum dropdownFieldDataTypes {
  CHAR = 'CHAR',
  REQ = 'REQ',
  STATUS = 'STATUS',
  CLASS = 'CLASS',
}
