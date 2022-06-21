import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { FlatTreeControl } from '@angular/cdk/tree';
import { AfterViewInit, ChangeDetectorRef, Component, Inject, LOCALE_ID, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { MatTree, MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { ActivatedRoute, Router } from '@angular/router';
import { DatasetFormCreateDto } from '@models/list-page/listpage';
import { Class, ClassType } from '@modules/classifications/_models/classifications';
import { CoreService } from '@services/core/core.service';
import { GlobaldialogService } from '@services/globaldialog.service';
import { RuleService } from '@services/rule/rule.service';
import { sortBy } from 'lodash';
// import { picklistValues } from '../../field/field.component';
import { TransientService } from 'mdo-ui-library';
import { combineLatest, Subject, Subscription, throwError } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, take, takeUntil, takeWhile } from 'rxjs/operators';
import { DatasetForm, FieldControlType, FormTab, IconType, TabField, TabFieldsResponse, UnassignedFieldsResponse } from './../../../../../_models/list-page/listpage';

interface ClassTypeNode {
  uuid: string;
  name: string;
  description: string;
  fieldType: string,
  icon: string,
  fieldId: string,
  children?: ClassTypeNode[];
}
interface LoadMoreFlatNode {
  expandable: boolean;
  uuid: string;
  name: string;
  level: number;
}
@Component({
  selector: 'pros-edit-dataset-form',
  templateUrl: './edit-dataset-form.component.html',
  styleUrls: ['./edit-dataset-form.component.scss'],
})
export class EditDatasetFormComponent implements OnInit, AfterViewInit, OnDestroy {
  /**
   * moduleId from param
   */
  hasFieldError = false;
  unsubscribeAll$: Subject<boolean> = new Subject<boolean>();
  subscriptionsList: Subscription[] = [];
  /**
   * possible 3 form types. 2,3,4
   */
  formTypeId = '';
  openPropertyPanel = false;
  // current active property panel: form, section, field
  activePropertyPanel = 'form';
  /**
   * moduleId from param
   */
  moduleId = '';
  /**
   * formId from param
   */
  formId = '';
  @ViewChild('drawer') drawer: MatDrawer;
  /**
   * fields search by string
   */
  searchFieldSub: Subject<string> = new Subject();
  searchTerm = '';
  tabFieldsPageIndex = 0;
  tabFieldsPageSize = 50;
  unassignedTabFieldsPageIndex = 0;
  unassignedTabFieldsPageSize = 0;
  tabFields: TabFieldsResponse[] = [];
  unassignedTabFields: UnassignedFieldsResponse[] = [];
  assignedFieldsTabs: any[] = [];
  classData: ClassType[] = [];

  updateDatasetFormModel: {
    formId: string;
    form: DatasetFormCreateDto;
    isValid: boolean
  } = null;
  sectionProperty: any = {};
  tabIndex: number;
  searchString = '';
  page = 1;
  formTabs: any = [];
  gridFieldProperty: any = {};
  dataLoaders = {
    loadFormTabs: false
  }

  saving = false;
  @ViewChild('treeSelector') tree: MatTree<ClassTypeNode>;
  @ViewChild('scrollableTree') scrollableTree: CdkVirtualScrollViewport;
  hasChild = (_: number, node: LoadMoreFlatNode) => node.expandable;
 // Flat tree data source
 dataSource: MatTreeFlatDataSource<ClassTypeNode, LoadMoreFlatNode>;
 treeControl = new FlatTreeControl<LoadMoreFlatNode>(node => node.level, node => node.expandable);
 treeFlattener: MatTreeFlattener<ClassTypeNode, LoadMoreFlatNode>;
 _selectedNode: ClassTypeNode;
 treeData: ClassTypeNode[] = [];
 datasetValue = [];

 currentDropItem: {
    data: any,
    index: number,
 } = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private coreService: CoreService,
    private cdr: ChangeDetectorRef,
    private transientService: TransientService,
    private ruleService: RuleService,
    private globalDialogService: GlobaldialogService,
    @Inject(LOCALE_ID) public locale: string
  ) {
    this.treeFlattener = new MatTreeFlattener(this._transformer, node => node.level, node => node.expandable, node => node.children);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  }

  private _transformer = (node: ClassTypeNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      uuid: node.uuid,
      name: node.name,
      level,
      fieldId: node.uuid,
      description: node.description,
      fieldType: 'CLASS TYPE',
      icon: 'table',
      children: [],
    };
  }

  /**
   * Go back to the previous route and close the current sidesheeet
   */
  closeSidesheet(reloadFormList?: boolean) {
    this.router.navigate([{ outlets: { outer: null } }], {
      queryParams: {
        reloadFormList
      }
    });
  }

  ngOnInit(): void {
    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
    this.route.params.pipe(takeUntil(this.unsubscribeAll$)).subscribe((resp) => {
      this.moduleId = resp.moduleId;
      this.formId = resp.formId;
      if (this.formId && this.formId !== 'new') {
        this.getFormTabsDetails();
      } else {
        this.createDefaultTab();
      }
      this.searchTabFields();
      this.getClassData();
      this.searchUnassignedTabFields();
    });

    this.coreService.updateDatasetFormSubject$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((resp) => {
      this.updateDatasetFormModel = resp;
    });

    this.searchFieldSub.pipe(debounceTime(1000), distinctUntilChanged()).subscribe((searchString) => {
      this.searchTerm = searchString;
      this.tabFieldsPageIndex = 0;
      this.unassignedTabFieldsPageIndex = 0;
      // this.datasetValue = [];
      this.dataSource.data = [];
      this.treeData = [];
      this.searchTabFields();
      this.searchClassType();
      this.searchUnassignedTabFields();
    });

    this.detectFieldGridProperty();
  }

  ngAfterViewInit(): void {
    this.drawer.open();
    combineLatest([this.route.fragment.pipe(takeUntil(this.unsubscribeAll$)), this.route.queryParams.pipe(takeUntil(this.unsubscribeAll$))])
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe(
        (resp) => {
          this.formTypeId = resp[1].t;
          this.tabIndex = resp[1].tab;
          this.activePropertyPanel = resp[1].p || 'form';
          if (this.tabIndex) {
            this.sectionProperty = this.formTabs[this.tabIndex];
          }

          if (resp[1]?.gridFieldId) {
            if (resp[1].parentFieldId) {
              const gridField = this.formTabs[this.tabIndex]?.fields.filter(tabField => tabField.fieldId === resp[1]?.parentFieldId)[0];
              this.gridFieldProperty = gridField?.childs.filter(tabField => tabField.fieldId === resp[1]?.gridFieldId)[0];
            } else {
              this.gridFieldProperty = this.formTabs[this.tabIndex]?.fields.filter(tabField => tabField.fieldId === resp[1]?.gridFieldId)[0];
            }
            this.gridFieldProperty = {...this.gridFieldProperty, ...((resp[1].parentFieldId) && {parentFieldId: resp[1].parentFieldId})};
          }
          this.cdr.detectChanges();
        },
        (err) => {
          console.log(err);
        }
      );
  }

  /**
   * Function to search tab fields
   */
  searchTabFields() {
    this.assignedFieldsTabs = [];
    this.formTabs.forEach(tab => {
      let matchedFields = [];
      if (tab.fields && tab.fields.length) {
        matchedFields = tab.fields.filter(field => {
          const description = field.description || (field.metadata && field.metadata[0]?.description) || '';
          return description.toLowerCase().includes(this.searchTerm.toLowerCase());
        });
      }
      if (matchedFields.length) {
        this.assignedFieldsTabs.push({ ...tab, fields: matchedFields });
      }
    });
  }

  /**
   * Handles the drop item when it has entered the dropzone
   * and the click hasn't been released yet
   * @param event - The event object
   * @param index - The index of the drop item
   */
  dropItemEntered(event: CdkDragDrop<any>, index: number) {
    const tabData = event.item.data;
    const fieldPickListDetails = picklistValues.find((fieldDetails) => tabData?.pickList === fieldDetails.pickList);

    const tabField = {} as TabField | any;
    tabField.description = tabData?.description;
    tabField.fieldType = fieldPickListDetails?.fieldType;
    tabField.dataType = tabData?.dataType;
    tabField.structureId = tabData?.structureId;
    tabField.pickList = tabData?.pickList;
    tabField.metadata = null;
    tabField.isHidden = false;
    tabField.icon = fieldPickListDetails?.icon;

    this.currentDropItem = {
      data: tabField,
      index,
    }
  }

  /**
   * Function to search unassigned tab fields
   */
  searchUnassignedTabFields() {
    this.coreService
      .searchUnassignedTabFields(
        this.moduleId,
        this.formId,
        this.locale,
        this.unassignedTabFieldsPageIndex,
        this.unassignedTabFieldsPageSize,
        this.searchTerm
      )
      .pipe(take(1))
      .subscribe((resp) => {
        if (resp && resp.length) {
          const responseHeaderData = resp.filter(fields => fields.headerStructure);
          const otherFields = resp.filter(fields => fields.hierarchyId || fields.hierarchyDesc);
          const data = [
            { headerFields: responseHeaderData },
            ...otherFields
          ]
          this.unassignedTabFields = [...data];
        } else if (this.searchTerm) {
          this.unassignedTabFields = [];
        }
      });
  }
  discard() { }

  /**
   * Function to save form fields
   */
  save() {
    // check required form description
    if (!this.updateDatasetFormModel.isValid) {
      this.transientService.open('Form name is required !', null, { duration: 2000, verticalPosition: 'bottom' });
      // open form properties panel if description is missing
      this.router.navigate(['./'], {
        relativeTo: this.route,
        queryParams: { p: 'form' },
        fragment: 'property-panel',
        queryParamsHandling: 'merge'
      });
      return;
    }
    this.formTabs.forEach((tab, index) => {
      tab.tabOrder = index;
      tab.fields.forEach((field, fieldIndex) => {
        field.order = fieldIndex;
        field.moduleId = this.moduleId
      });
    });

    if (this.updateDatasetFormModel && this.updateDatasetFormModel.formId === 'new') {
      this.saving = true;
      this.coreService
        .createDatasetForm(this.moduleId, this.updateDatasetFormModel.form)
        .pipe(switchMap(resp => {
          if (resp && resp.layoutId) {
            this.formTabs.forEach(tab => tab.layoutId = resp.layoutId);
            return this.coreService.saveDatasetFormTabsDetails(this.formTabs, this.moduleId, resp.layoutId, this.locale)
          } else {
            throwError('Something went wrong !');
          }
        }))
        .subscribe((resp) => {
          this.getNewFormDetails(resp[0]?.layoutId);
        }, error => {
          console.error(`Error:: ${error.message}`);
          this.saving = false;
        });
    } else if (
      this.updateDatasetFormModel &&
      this.updateDatasetFormModel.formId !== 'new'
    ) {
      this.saving = true;
      this.coreService
        .updateDatasetForm(this.moduleId, this.formId, this.updateDatasetFormModel.form)
        .pipe(switchMap(resp => {
          if (resp && resp.layoutId) {
            this.formTabs.forEach(tab => tab.layoutId = resp.layoutId);
            return this.coreService.saveDatasetFormTabsDetails(this.formTabs, this.moduleId, resp.layoutId, this.locale)
          } else {
            throwError('Something went wrong!');
          }
        }))
        .subscribe((resp) => {
          this.closeSidesheet(true);
          this.transientService.open('Successfully saved!', null, { duration: 2000, verticalPosition: 'bottom' });
          this.saving = false;
        }, error => {
          console.error(`Error:: ${error.message}`);
          this.saving = false;
        });
    }
  }

  /**
   * Function to get form fields
   */
  getNewFormDetails(formId: string) {
    this.coreService
      .getDatasetFormDetail(this.moduleId, formId)
      .pipe(take(1))
      .subscribe((resp: DatasetForm) => {
        this.updateDatasetFormModel = {
          formId: resp.layoutId,
          form: {
            description: resp.description,
            helpText: resp.helpText,
            labels: resp.labels,
            type: resp.type,
            usage: resp.usage,
          },
          isValid: true
        }

        this.formId = resp.layoutId;
        this.closeSidesheet(true);
        this.transientService.open('Successfully saved!', null, { duration: 2000, verticalPosition: 'bottom' });
        this.coreService.nextUpdateFormCount(true);
        this.saving = false;
      }, error => {
        console.error(`Error:: ${error.message}`);
        this.saving = false;
      });
  }

  /**
   * Discard all the changes
   */
  close() {
    this.transientService.open('Discarded successfully!', null, { duration: 500, verticalPosition: 'bottom' });
    this.router.navigate([{ outlets: { sb: `sb/list/dataset-settings/${this.moduleId}/forms/${this.moduleId}` } }]);
  }

  /**
   * Function to get form tab details
   */
  getFormTabsDetails() {
    this.dataLoaders.loadFormTabs = true;
    this.coreService
      .getDatasetFormTabsDetails(this.moduleId, this.formId, this.locale)
      .pipe(take(1))
      .subscribe((resp) => {
        this.dataLoaders.loadFormTabs = false;
        if (resp) {
          this.formTabs =resp.sort((a,b) => a?.tabOrder - b?.tabOrder);
        }
        if(this.formTabs.length !== 0) {
          this.formTabs.forEach( e => {
            e?.fields.sort((a,b) => a?.order - b?.order);
          })
        }
        if (this.formTabs.length === 0) {
          this.createDefaultTab();
        }
      }, error => {
        this.dataLoaders.loadFormTabs = false;
        console.error(`Error:: ${error.message}`);
        this.createDefaultTab();
      });
  }

  /**
   * Function to detect field grid property
   */
  detectFieldGridProperty() {
    this.subscriptionsList.push(
    this.coreService.updateFormGridPermissions$.subscribe(fieldInfo => {
      if (fieldInfo) {
        this.activePropertyPanel = 'grid_field';
        this.gridFieldProperty = fieldInfo.tabField;
        this.tabIndex = fieldInfo.parentTabIndex;

        this.router.navigate(['./'], {
          relativeTo: this.route,
          queryParams: { p: 'grid_field', tab: this.tabIndex, gridFieldId: fieldInfo.tabField.fieldId,  ...((fieldInfo.isChildField) && {parentFieldId: fieldInfo.parentFieldId}) },
          fragment: 'property-panel'
        });
        this.coreService.updateFormGridPermissions.next(null);
      }
    }))
  }

  /**
   * Function to update field grid property
   */
  updateFieldProperty($event) {
    if ($event?.index && !$event?.fieldProperty?.parentFieldId) {
      const fieldProperty = this.formTabs[$event.index];
      const index = fieldProperty.fields.findIndex(field => field.fieldId === $event.fieldProperty.fieldId);
      if (index !== -1) {
        const field = fieldProperty.fields[index];
        const permission = $event.fieldProperty.permissions;
        field.permissions = permission;
        field.isMandatory = permission.required;

      }
    } else if ($event?.index && $event?.fieldProperty?.parentFieldId) {
      const fieldProperty = this.formTabs[$event.index];
      const parentIndex = fieldProperty.fields.findIndex(field => field.fieldId === $event.fieldProperty.parentFieldId);
      const index = fieldProperty.fields[parentIndex].childs.findIndex(field => field.fieldId === $event.fieldProperty.fieldId);
      const childGrid = fieldProperty.fields[parentIndex].childs[index];
      const subGridPermission = $event.fieldProperty.permissions;
      childGrid.permissions = subGridPermission;
      childGrid.isMandatory = subGridPermission.required;
    }
  }

  /**
   * Function to add new form tab or section
   */
  addFormTab(tabIndex?: number) {
    const formTab = {
      tabText: `New Section`,
      isTabReadOnly: false,
      isTabHidden: false,
      fields: [],
      tabOrder: this.formTabs.length,
      layoutId: this.formId,
      isEditable: false
    };
    if (tabIndex !== undefined) {
      this.formTabs.splice(tabIndex, 0, formTab);
    } else {
      this.formTabs.push(formTab);
    }
    // Display newly added section properties on property panel if it's already opened
    if (this.drawer.opened) {
      const index = (tabIndex !== undefined) ? tabIndex : this.formTabs.length - 1;
      this.onSelectSection(formTab, index);
    }
  }

  /**
   * Function to update form tab or section
   */
  updateFormTabName(formTab, valueInput) {
    valueInput ?
      formTab.tabText = valueInput :
      formTab.description = valueInput;
  }

  /**
   * Function is called when you select any section
   */
  onSelectSection(formTab: object, index: number) {
    this.sectionProperty = formTab;
    this.tabIndex = index
    this.router.navigate(['./'], {
      relativeTo: this.route,
      queryParams: { p: 'section', tab: this.tabIndex },
      fragment: 'property-panel',
      queryParamsHandling: 'merge'
    });
  }

  /**
   * Function to update section property
   */
  updateSectionProperty(event: { index: string | number; sectionProperty: any; }) {
    if (event?.index) {
      this.formTabs[event.index] = event.sectionProperty;
    }
  }

  /**
   * Function to delete form tab
   */
  deleteFormTab(tabIndex: number) {
    this.globalDialogService.confirm(
      {
        label: 'Are you sure you want to remove the section? Please note this action cannot be reversed.'
      },
      (response) => {
        if (response && response === 'yes') {
          this.formTabs.splice(tabIndex, 1);
        }
      }
    );
  }

  /**
   * Function to delete field
   */
  deleteField(tabIndex: number, fieldIndex: number) {
    let field = this.formTabs[tabIndex].fields[fieldIndex];
    this.formTabs[tabIndex].fields.splice(fieldIndex, 1);
    this.unassignedTabFields.map((fld) => {
      const metadata = field?.metadata?.length? field.metadata[0] : {};
      field = {...field, ...metadata};

      if (field.structureId === 1 && fld?.headerFields) {
        fld.headerFields.push({fields: [field], headerStructure: 'headerData'});
      } else if (parseInt(fld.hierarchyId, 10) === field.structureId) {
        fld.fields.push(field);
      }
    });


  }

  /**
   * Function to get field Icon
   */
  getFieldIcon(field: TabField) {
    const find = picklistValues.find(f => f.dataType === field.dataType && f.pickList === field.pickList);
    return find ? find.icon : 'text';
  }

  /**
   * Function to check that is field is droppable or not
   */
  canDrop(event: CdkDragDrop<any[]>) {
    if (event.container.id.startsWith('source_panel')) {
      return false;
    }
    if ((event.previousContainer.id.startsWith('source_panel') || event.previousContainer.id.startsWith('target_form_tab')
      || event.previousContainer.id.startsWith('form_tab_components'))
      && event.container.id.startsWith('target_form_tab')) {
      return true;
    }
    return false;
  }

  /**
   * Function called when you drop field in section or tab
   */
  dropFormField(event: CdkDragDrop<any>){
    if(event.container.id === event.previousContainer.id) {
      moveItemInArray(event?.container?.data, event.previousIndex, event.currentIndex);
      return;
    }
    const isExit = this.formTabs.some((element) => {
      const alreadyAvailableItem = element?.fields.filter((ele) => {
        if(ele?.description && event.item.data?.description) {
          return ele?.description == event?.item?.data?.description;
        }

        return false;
      });
      if(alreadyAvailableItem?.length) {
        moveItemInArray(event?.container?.data, event.previousIndex, event.currentIndex);
        this.transientService.open('Cannot pick this item, already available',null,{ duration: 2000, verticalPosition: 'bottom' });
        return true;
      }
    });
    if(isExit) return;
    this.currentDropItem = null;
    if (this.canDrop(event)) {
      // TODO update field tabFieldUuid if required
      if (event.previousContainer.id.startsWith('target_form_tab')) {
        const srcField = event.previousContainer.data[event.previousIndex] as TabField;
        const targetFormTab = event.container.data as TabField[];
        if (event.previousContainer.id === event.container.id) {
          moveItemInArray(event.container.data,
            event.previousIndex,
            event.currentIndex);
        }
        else if (srcField.fieldType !== 'FIELD' || !targetFormTab.some(field => field.fieldId === srcField.fieldId)) {
          /**
           * clear tabFieldUuid when moving a field from one tab to another. because it is a new field of the new tab
           */
          event.previousContainer.data[event.previousIndex].tabFieldUuid = null;
          transferArrayItem(event.previousContainer.data,
            event.container.data,
            event.previousIndex,
            event.currentIndex);
        }
      }
      else if (event.previousContainer.id.startsWith('source_panel')) {
        const srcField = event.item.data as TabField;
        const targetArr = event.container.data as TabField[];
        this.unassignedTabFields.forEach((data: UnassignedFieldsResponse) => {
          if (data.headerFields) {
            data.headerFields = data.headerFields.filter(headerDataField => {
              const index = headerDataField.fields.findIndex(field => field.fieldId === srcField.fieldId);
              return index === -1
            })
          }

          if (data.hierarchyId || data.hierarchyDesc) {
            data.fields = data.fields.filter(hierarchyData => {
              return hierarchyData.fieldId !== srcField.fieldId
            });
          }
        })

        if (!targetArr.some(f => f.fieldId === srcField.fieldId)) {
          targetArr.splice(event.currentIndex, 0, JSON.parse(JSON.stringify(srcField)));
        }
      } else if (event.previousContainer.id.startsWith('form_tab_components')) {
        // TODO handle the other tab components: image, custom field,...
        this.addStaticField(event);
      }
      if (this.searchTerm) {
        this.searchTabFields();
      }
    }
  }


  /**
   * Function to create default data
   */
  createDefaultTab() {
    const tab = {
      tabText: 'Header data',
      isTabHidden: false,
      isTabReadOnly: false,
      fields: []
    } as FormTab;
    this.formTabs.push(tab);
  }

  /**
   * Function to duplicate form tab
   */
  duplicateFormTab(tabIndex: number) {
    const tab = this.formTabs[tabIndex];
    if (tab) {
      const newTab = JSON.parse(JSON.stringify(tab));
      // all the ids will be null except the layoutid
      newTab.tabid = null;
      newTab.tcode = null;
      // delete the fields tabFieldUuid
      newTab.fields.forEach(field => {
        field.tabFieldUuid = null;
      });
      // TODO duplicate tab display criteria
      this.formTabs.splice(tabIndex + 1, 0, newTab);
      // this.formTabs.push(JSON.parse(JSON.stringify(tab)));
    }
  }

  /**
   * Function to predicate that field will drop in which section
   */
  dropListEnterPredicate(item: CdkDrag, list: CdkDropList) {
    if (list.id.startsWith('source_panel')) {
      return false;
    }
    if ((item.dropContainer.id.startsWith('source_panel') || item.dropContainer.id.startsWith('target_form_tab'))
      && list.id.startsWith('target_form_tab')) {
      const srcField = item.data;
      const targetTabFields = list.data as TabField[];
      // alert(srcField.fieldType)
      if ((srcField.fieldType !== 'FIELD' && srcField.fieldType !== 'CLASS TYPE') || !targetTabFields.some(f => f.fieldId === srcField.fieldId)) {
        return true;
      } else {
        const tabElement = document.getElementById(list.id);
        tabElement.classList.add('greyed-tab');
        return false;
      }
    }
    if (item.dropContainer.id.startsWith('form_tab_components') && list.id.startsWith('target_form_tab')) {
      return true;
    }
    return false;
  }

  /**
   * Function to move field to section
   */
  moveFieldToSection(previousIndex, currentIndex, fieldIndex) {
    const srcTab = this.formTabs[previousIndex];
    const targetTab = this.formTabs[currentIndex];
    if (srcTab.fields[fieldIndex].fieldType !== 'FIELD' || !targetTab.fields.some(field => field.fieldId === srcTab.fields[fieldIndex].fieldId)) {
      transferArrayItem(srcTab.fields,
        targetTab.fields,
        fieldIndex,
        targetTab.fields.length);
    }
  }

  /**
   * Function called when you drop from tab
   */
  dropFormTab(event) {
    if (event.previousContainer.id.startsWith('tabs_list')) {
      moveItemInArray(event.container.data,
        event.previousIndex,
        event.currentIndex);
    } else if (event.previousContainer.id.startsWith('form_components')) {
      // TODO handle other form components drop
      this.addFormTab(event.currentIndex);
    }
  }

  /**
   * Function to get Id of target in which you drop the field
   */
  getTargetDropIds(sourceListId) {

    if (sourceListId.startsWith('source_panel') || sourceListId.startsWith('target_form_tab')
      || sourceListId.startsWith('form_tab_components')) {
      return this.formTabs.map((tab, index) => `target_form_tab_${index}`);
    }
  }

  /**
   * Function to enable all target form tabs
   */
  enableAllTargetFormTabs(event) {
    this.currentDropItem = null;
    this.formTabs.forEach((tab, index) => {
      const tabElement = document.getElementById(`target_form_tab_${index}`);
      tabElement.classList.remove('greyed-tab');
    });
  }

  /**
   * Function to add static field
   */
  addStaticField(event) {
    const staticField = {
      description: '',
      fieldType: event.item.data,
      structureId: 1
    } as TabField;

    const targetTabFields = event.container.data as TabField[];
    targetTabFields.splice(event.currentIndex, 0, staticField);
  }

  /**
   * Function to edit data set
   */
  editDataSet() {
    this.router.navigate(['./'], {
      relativeTo: this.route,
      queryParams: { t: this.formTypeId },
      fragment: 'property-panel',
    });
  }

  /**
   * Function to open display criteria sheet
   */
  openDisplayCriteriaSheet() {
    const udrId = (this.sectionProperty?.udrId) ? this.sectionProperty.udrId : 'new';
    this.router.navigate([{
      outlets: {
        sb: `sb/list/dataset-settings/${this.moduleId}/forms/${this.moduleId}/${this.formId}`,
        outer: `outer/list/display-criteria/${this.moduleId}/${udrId}`
      }
    }], {
      queryParamsHandling: 'preserve',
      preserveFragment: true,
    });
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next(true);
    this.unsubscribeAll$.unsubscribe();
    this.subscriptionsList.forEach(sub => sub.unsubscribe());
  }

  /**
   * Function to get class data
   */
  getClassData(selectedId: string = '', autoSelect = true) {
    this.ruleService.getAllClassTypes(this.page, 100, this.searchTerm, [this.moduleId]).pipe(debounceTime(1000), distinctUntilChanged(), takeWhile(() => true)).subscribe((data) => {
      if (data?.response) {
        data.response?.forEach((item: ClassType) => {
          if(item.nountype){
            this.classData.push(item);
            const node: ClassTypeNode = {
              uuid: item.uuid,
              fieldId: item.uuid,
              name: item.className,
              description: item.className,
              fieldType: 'CLASS TYPE',
              icon: 'table',
              children: [],
            };
            this.bindChildren(node, item.classes);
            this.treeData.push(node);
          }
        });
        this.dataSource.data = this.treeData;

        if (selectedId) {
          const selectedNode = this.findNode(this.treeData, selectedId);
          this._selectedNode = selectedNode || this.treeData[0];;
        } else if (autoSelect) {
          this._selectedNode = this.treeData[0];
        }

        if (this._selectedNode) {
          const index = this.treeControl.dataNodes.findIndex(n => n.uuid === this._selectedNode.uuid);

          if (index >= 0) {
            const node = this.treeControl.dataNodes[index];

            this.onNodeSelect(node);
            this.maintainExpandState();


            this.scrollableTree?.scrollToIndex(index);
          }
        } else {
          this.onNodeSelect(null);
        }
      }
    });
  }

  /**
   * Function to bind class children
   */
  bindChildren(item: ClassTypeNode, classes: Class[]) {
    classes?.forEach((c) => {
      const node: ClassTypeNode = {
        uuid: c.uuid,
        fieldId: c.uuid,
        name: c.description,
        description: c.description,
        fieldType: 'CLASS TYPE',
        icon: 'table',
        children: [],
      }
      item.children.push(node);
      this.bindChildren(node, c.classes || []);
    });
  }

  /**
   * Function to select node
   */
  onNodeSelect(node) {
    this._selectedNode = node;
  }

  /**
   * Function to expand parent node
   */
  maintainExpandState() {
    let parent: LoadMoreFlatNode;
    let shouldExpand = false;

    for (const node of this.treeControl.dataNodes) {
      if (node.expandable) {
        parent = node;
      }

      if (node.uuid === this._selectedNode.uuid) {
        shouldExpand = node.expandable || node.level > parent?.level;
      }

      if (parent && shouldExpand) {
        this.treeControl.expand(parent);

        break;
      }
    }
  }

  /**
   * Function to find node
   */
  findNode(children: ClassTypeNode[], id: string): ClassTypeNode | null {
    let data: ClassTypeNode | null;
    for (const item of children || []) {
      data = this.findNodeChild(item, id);

      if (data) {
        break;
      }
    }

    return data;
  }

  /**
   * Function to find child node
   */
  findNodeChild(node: ClassTypeNode, id: string): ClassTypeNode | null {
    if (node.uuid === id) {
      return node;
    }

    let data: ClassTypeNode | null;
    for (const item of node.children || []) {
      data = this.findNodeChild(item, id);

      if (data) {
        break;
      }
    }

    return data;
  }

  /**
   * Function to search class type
   */
  searchClassType(){
    if(this.searchTerm.trim()){
      this.classData?.forEach((item: ClassType) => {
        if(item.className.toLowerCase().includes(this.searchTerm.toLowerCase())){
          const node: ClassTypeNode = {
            uuid: item.uuid,
            fieldId: item.uuid,
            name: item.className,
            description: item.className,
            fieldType: 'CLASS TYPE',
            icon: 'table',
            children: [],
          };
          this.bindChildren(node, item.classes);
          this.treeData.push(node);
        }else{
          let isInsideClassMatch = false;
          item?.classes?.forEach((classItem)=>{
            if(classItem.description.toLowerCase().includes(this.searchTerm.toLowerCase())){
              isInsideClassMatch = true;
            }
          })
          if(isInsideClassMatch){
            const node: ClassTypeNode = {
              uuid: item.uuid,
              fieldId: item.uuid,
              name: item.className,
              description: item.className,
              fieldType: 'CLASS TYPE',
              icon: 'table',
              children: [],
            };
            this.bindChildren(node, item.classes);
            this.treeData.push(node);
          }
        }
      });
      this.dataSource.data = this.treeData;
      this.treeControl.expandAll()
    }else{
      this.classData?.forEach((item: ClassType) => {
        const node: ClassTypeNode = {
          uuid: item.uuid,
          fieldId: item.uuid,
          name: item.className,
          description: item.className,
          fieldType: 'CLASS TYPE',
          icon: 'table',
          children: [],
        };
        this.bindChildren(node, item.classes);
        this.treeData.push(node);
      });
      this.dataSource.data = this.treeData;
      this.maintainExpandState()
    }
  }
}

export const picklistValues: { pickList: string; dataType: string; fieldType: string; icon: string, iconType?: string }[] = [
  {
    pickList: '0',
    dataType: 'CHAR',
    fieldType: FieldControlType.TEXT,
    icon: 'text',
    iconType: IconType.MATERIAL
  },
  {
    pickList: '55',
    dataType: 'CHAR',
    fieldType: FieldControlType.URL,
    icon: 'globe',
    iconType: IconType.MATERIAL
  },
  {
    pickList: '0',
    dataType: 'PASS',
    fieldType: FieldControlType.PASSWORD,
    icon: 'parking',
    iconType: IconType.MATERIAL
  },
  {
    pickList: '0',
    dataType: 'EMAIL',
    fieldType: FieldControlType.EMAIL,
    icon: 'at',
    iconType: IconType.MATERIAL
  },
  {
    pickList: '0',
    dataType: 'NUMC',
    fieldType: FieldControlType.NUMBER,
    icon: 'hashtag',
    iconType: IconType.MATERIAL
  },
  {
    pickList: '1',
    dataType: 'CHAR',
    fieldType: FieldControlType.LIST, // Dropdown
    icon: 'list',
    iconType: IconType.MATERIAL
  },
  {
    pickList: '0',
    dataType: 'STATUS',
    fieldType: FieldControlType.LIST, // FieldControlType.STATUS
    icon: 'list',
    iconType: IconType.MATERIAL
  },
  {
    pickList: '0',
    dataType: 'DEC',
    fieldType: FieldControlType.DECIMAL,
    icon: 'hashtag',
    iconType: IconType.MATERIAL
  },
  {
    pickList: '2',
    dataType: 'CHAR',
    fieldType: FieldControlType.CHECKBOX,
    icon: 'check',
    iconType: IconType.MATERIAL
  },
  {
    pickList: '4',
    dataType: 'CHAR',
    fieldType: FieldControlType.RADIO,
    icon: 'scrubber',
    iconType: IconType.MATERIAL
  },
  {
    pickList: '22',
    dataType: 'CHAR',
    fieldType: FieldControlType.TEXT_AREA,
    icon: 'align-center',
    iconType: IconType.MATERIAL
  },
  {
    pickList: '31',
    dataType: 'CHAR',
    fieldType: FieldControlType.HTML,
    icon: 'edit',
    iconType: IconType.MATERIAL
  },
  {
    pickList: '37',
    dataType: 'CHAR',
    fieldType: FieldControlType.LIST, // FieldControlType.USERSELECTION,
    icon: 'list',
    iconType: IconType.MATERIAL
  },
  {
    pickList: '38',
    dataType: 'CHAR',
    fieldType: FieldControlType.ATTACHMENT,
    icon: 'paperclip',
    iconType: IconType.MATERIAL
  },
  {
    pickList: '40',
    dataType: 'CHAR',
    fieldType: FieldControlType.GEOLOCATION,
    icon: 'map-marker-alt',
    iconType: IconType.MATERIAL
  },
  {
    pickList: '44',
    dataType: 'CHAR',
    fieldType: FieldControlType.DIGITALSIGNATURE,
    icon: 'pen-nib',
    iconType: IconType.MATERIAL
  },
  {
    pickList: '51',
    dataType: 'CHAR',
    fieldType: FieldControlType.ALTN,
    icon: 'hashtag',
    iconType: IconType.MATERIAL
  },
  {
    pickList: '52',
    dataType: 'NUMC',
    fieldType: FieldControlType.DATE,
    icon: 'calendar',
    iconType: IconType.MATERIAL
  },
  {
    pickList: '53',
    dataType: 'NUMC',
    fieldType: FieldControlType.DATE_TIME,
    icon: 'calendar',
    iconType: IconType.MATERIAL
  },
  {
    pickList: '54',
    dataType: 'TIMS',
    fieldType: FieldControlType.TIME,
    icon: 'clock',
    iconType: IconType.MATERIAL
  },
  {
    pickList: '15',
    dataType: 'CHAR',
    fieldType: FieldControlType.GRID,
    icon: 'th',
    iconType: IconType.MATERIAL
  },
  {
    pickList: '36',
    dataType: 'CHAR',
    fieldType: FieldControlType.ACTIVATE_DEACTIVATE,
    icon: 'scrubber',
    iconType: IconType.MATERIAL
  },
];
