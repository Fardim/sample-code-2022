import { datasetFieldsCol2, datasetFieldsCol1, picklistValues, FieldService } from './../field/field-service/field.service';
import { debounce } from 'lodash';
import { CoreService } from '@services/core/core.service';
import { FieldlistContainer, FieldControlType, Fieldlist } from '@models/list-page/listpage';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { FieldLoadingState } from './../field/field.component';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit, Output, EventEmitter, Input, OnDestroy, Inject, LOCALE_ID, ElementRef, ViewChild, OnChanges, SimpleChanges, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { TransientService } from 'mdo-ui-library';

@Component({
  selector: 'pros-fields-widgets',
  templateUrl: './fields-widgets.component.html',
  styleUrls: ['./fields-widgets.component.scss'],
})
export class FieldsWidgetsComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  @Output() widgetFieldTypeChanged: EventEmitter<FieldlistContainer> = new EventEmitter();
  @Output() deleteWidget: EventEmitter<FieldlistContainer> = new EventEmitter();
  @Output() deleteChildWidget: EventEmitter<Fieldlist> = new EventEmitter();
  @Output() deleteSubChildWidget: EventEmitter<{childField: Fieldlist, subChildField: Fieldlist}> = new EventEmitter();
  @Output() cloneWidget: EventEmitter<FieldlistContainer> = new EventEmitter();
  @Output() cloneSubChildWidget: EventEmitter<{parentField: Fieldlist, field: Fieldlist}> = new EventEmitter();
  @Output() cloneChildWidget: EventEmitter<Fieldlist> = new EventEmitter();
  @Output() scrollDown: EventEmitter<boolean> = new EventEmitter();
  @Input() fieldWidgets: FieldlistContainer[] = [];
  @Input() fieldIdsWithError: string[] = [];
  @Input() currentFilter = '';
  @Input() hasFieldError = false;
  @Input() loadingState: FieldLoadingState = null;
  @Input() selectedStructureId = '';
  @Input() readOnlyMode = false;
  @Input() searchString = '';
  /**
   * first column of control types
   */
  datasetFieldsCol1 = datasetFieldsCol1;
  /**
   * second column of control types
   */
  datasetFieldsCol2 = datasetFieldsCol2;
  picklistValues = picklistValues;
  fieldExplanation = '';
  currentdWidgetId: any = null;
  subChildFieldId: any = null;
  selectedField: any = null;
  childFieldId: any = null;
  expendItemId: Array<string> = [];
  unsubscribeAll$: Subject<boolean> = new Subject<boolean>();

  @ViewChild('scrollableContainer', {read: ElementRef}) scrollable : ElementRef<any>;
  @ViewChildren('widgetsContainer') widgetsContainer: QueryList<any>;

  constructor(
    private router: Router,
    public route: ActivatedRoute, @Inject(LOCALE_ID)
    public locale: string,
    private coreService: CoreService,
    private transient: TransientService,
    private fieldService: FieldService) {}
  ngOnDestroy(): void {
    this.unsubscribeAll$.next(true);
    this.unsubscribeAll$.unsubscribe();
  }

  ngOnInit(): void {
    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
    this.route.queryParams.pipe(takeUntil(this.unsubscribeAll$)).subscribe((resp) => {
      this.currentdWidgetId = resp.f || null;
      this.subChildFieldId = resp.subChildField || null
      this.childFieldId = resp.childField ? resp.childField : null;
      this.selectedField = resp.subChildField ? resp.subChildField : resp.childField ? resp.childField : resp.f ? resp.f : null;
    });
  }

  ngAfterViewInit() {
    this.widgetsContainer.changes.subscribe(() => {
      if(this.currentdWidgetId) {
        document.getElementById(this.currentdWidgetId)?.scrollIntoView();
      }
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes.loadingState) { this.loadingState = changes.loadingState.currentValue; }
    if(changes.selectedStructureId) { this.selectedStructureId = changes.selectedStructureId.currentValue; }
  }

  updateFieldAttributes() {
    this.fieldWidgets.forEach(e => {
      if (e.fieldlist?.fieldType === 'grid') {
        let tempArray = [];
        e.fieldlist?.childfields.forEach((i) => {
          // const fieldType = this.fieldService.mapFieldTypeFromPicklist(i);
          const picklistValue = this.picklistValues.find(p => p.pickList === i.pickList && p.dataType === i.dataType);
          i = {
            ...i,
            icon: picklistValue.icon,
            fieldType: picklistValue.fieldType,
            iconType: picklistValue.iconType
          };
          tempArray.push(i);
        });
        e = {
          ...e,
          fieldlist: {
            ...e.fieldlist,
            childfields: [...tempArray]
          }
        };
        // e.fieldlist = {
        //   ...e.fieldlist,
        //   childfields: tempArray
        // };
        // e.fieldlist.childfields = tempArray;
        tempArray = [];
        e.fieldlist.childfields.forEach(q => {
          if (q.fieldType === 'grid') {
            if(q.childfields) {
              q.childfields.forEach(p => {
                // const fieldType = this.fieldService.mapFieldTypeFromPicklist(p);
                const picklistValue = this.picklistValues.find(w => w.pickList === q.pickList && w.dataType === q.dataType);
                p = {
                  ...p,
                  icon: picklistValue.icon,
                  fieldType: picklistValue.fieldType,
                  iconType: picklistValue.iconType
                };
                tempArray.push(p);
              });
              q = {
                ...q,
                childfields: [...tempArray]
              };
            }
            // q.childfields = tempArray;
          }
        });
      }
    });
    console.log(this.fieldWidgets);
  }

  navigateToRoute(queryParams: any, fragment: string, preserveFragment: boolean = false) {
    this.router.navigate(
      ['./'],
      {
        relativeTo: this.route,
        queryParams: { update: true, s: this.selectedStructureId, ...queryParams },
        fragment,
        preserveFragment
      });
  }

  /**
   * update url with param and query param
   */
  onSelectWidget(widget) {
    if (widget?.fieldId === this.currentdWidgetId && !this.childFieldId && !this.subChildFieldId) {
      this.navigateToRoute({}, '');
    }else {
      this.currentdWidgetId = widget?.fieldId;
      this.childFieldId = this.currentdWidgetId;
      this.navigateToRoute({f: widget?.fieldId}, 'property-panel');
    }
  }

  onSelectSubGrid(widget) {
    if (widget?.fieldId === this.childFieldId && !this.subChildFieldId) {
      this.navigateToRoute({}, '');
    }else {
      this.currentdWidgetId = widget?.parentField || this.currentdWidgetId;
      this.navigateToRoute({f: this.currentdWidgetId, childField: widget?.fieldId}, 'property-panel');
    }
  }

  onSelectSubGridchild(widget, field) {
    if (field?.fieldId !== this.subChildFieldId) {
      const parentId = widget?.parentField;
      const childId = widget?.fieldId;
      this.navigateToRoute({f: parentId, childField: childId, subChildField: field?.fieldId}, 'property-panel');
    } else {
      this.navigateToRoute({}, '');
    }
  }

  delete(widget: FieldlistContainer) {
    this.deleteWidget.emit(widget);
  }

  deleteChild(child: Fieldlist) {
    this.deleteChildWidget.emit(child);
  }

  deleteSubChild(child: Fieldlist, subChild: Fieldlist) {
    this.deleteSubChildWidget.emit({childField: child, subChildField: subChild});
  }
  clone(widget: FieldlistContainer) {
    this.cloneWidget.emit(widget);
  }
  cloneChild(child: Fieldlist) {
    this.cloneChildWidget.emit(child);
  }

  cloneSubChild(parentField: Fieldlist, field: Fieldlist){
    this.cloneSubChildWidget.emit({parentField, field});
  }

  changeFieldType(fieldType: { displayText: string; value: FieldControlType; explanation: string }, widge: FieldlistContainer) {
    const picklistValue = this.picklistValues.find((d) => d.fieldType === fieldType.value);
    let widget = {...widge};
    widget.fieldlist.dataType = picklistValue.dataType;
    widget.fieldlist.pickList = picklistValue.pickList;
    widget.fieldlist.fieldType = picklistValue.fieldType;
    widget.fieldlist.icon = picklistValue.icon;
    widget.fieldlist.iconType = picklistValue.iconType;
    widget.fieldlist.childfields = [];

    this.widgetFieldTypeChanged.emit(widget);
    // trigger that the changed field is valid, but can be invalid from the property forms, like, attachment type fields
    this.coreService.nextUpdateFieldFormValidationStatusSubject({
      fieldId: widget.fieldlist.fieldId,
      isValid: true,
    });
    this.coreService.nextUpdateChildFieldFormValidationStatusSubject({
      fieldId: widget.fieldlist.fieldId,
      isValid: true,
    });
    this.currentdWidgetId = widget && widget.fieldId ? widget.fieldId : null;
    this.navigateToRoute({f: widget.fieldId}, 'property-panel');
  }

  isExpendable(id: string) {
    const index = this.expendItemId.indexOf(id);
    if (index !== -1) {
      this.expendItemId.splice(index, 1);
    } else {
      this.expendItemId.push(id);
    }
  }
  /**
   * called on scroll
   */
  onScrollEnd(event) {
    console.log('onScrollEnd(true)');
    this.scrollDown.emit(true);
  }

  /**
   * While drag and drop on list elements
   * @param event dragable elemenet
   */
  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    }
  }

  changeChildFieldType(fieldType: { displayText: string; value: FieldControlType; explanation: string }, widget: Fieldlist, parent: FieldlistContainer) {
    const QueryParams = {
      queryParams: {},
      fragment: widget ? 'property-panel' : null,
    };
    const picklistValue = this.picklistValues.find((d) => d.fieldType === fieldType.value);
    widget.dataType = picklistValue.dataType;
    widget.pickList = picklistValue.pickList;
    widget.fieldType = picklistValue.fieldType;
    widget.icon = picklistValue.icon;
    widget.iconType = picklistValue.iconType;
    widget.childfields = [];
    parent.fieldlist.childfields.forEach(child => {
      if(child.fieldId === widget.fieldId) {
        child = widget;
      }
    });
    this.widgetFieldTypeChanged.emit(parent);
    // trigger that the changed field is valid, but can be invalid from the property forms, like, attachment type fields
    this.coreService.nextUpdateFieldFormValidationStatusSubject({
      fieldId: parent.fieldlist.fieldId,
      isValid: true,
    });
    this.coreService.nextUpdateChildFieldFormValidationStatusSubject({
      fieldId: widget.fieldId,
      isValid: true,
    });
    QueryParams.queryParams = { f: parent.fieldId, childField: widget.fieldId };
    this.navigateToRoute({...QueryParams.queryParams}, QueryParams.fragment);
  }
  changeSubChildFieldType(fieldType: { displayText: string; value: FieldControlType; explanation: string }, widget: Fieldlist, parent: Fieldlist, grandParent: FieldlistContainer) {
    const QueryParams = {
      queryParams: {},
      fragment: widget ? 'property-panel' : null,
    };
    const picklistValue = this.picklistValues.find((d) => d.fieldType === fieldType.value);
    widget.dataType = picklistValue.dataType;
    widget.pickList = picklistValue.pickList;
    widget.fieldType = picklistValue.fieldType;
    widget.icon = picklistValue.icon;
    widget.iconType = picklistValue.iconType;
    widget.childfields = [];
    grandParent.fieldlist.childfields.forEach(child => {
      if(child.fieldId === parent.fieldId) {
        child.childfields.forEach(subChild => {
          if(subChild.fieldId === widget.fieldId) {
            subChild = widget;
          }
        })
      }
    });
    this.widgetFieldTypeChanged.emit(grandParent);
    // trigger that the changed field is valid, but can be invalid from the property forms, like, attachment type fields
    this.coreService.nextUpdateFieldFormValidationStatusSubject({
      fieldId: grandParent.fieldlist.fieldId,
      isValid: true,
    });
    this.coreService.nextUpdateChildFieldFormValidationStatusSubject({
      fieldId: widget.fieldId,
      isValid: true,
    });
    QueryParams.queryParams = widget ? { f: grandParent.fieldId, childField: parent.fieldId, subChildField: widget.fieldId } : null;
    this.navigateToRoute({...QueryParams.queryParams}, QueryParams.fragment);
  }
  // changeGridFieldType(fieldType: { displayText: string; value: FieldControlType; explanation: string }, widget, type: string) {
  //   widget = {
  //     fieldId: this.currentdWidgetId,
  //     fieldlist: widget,
  //     isNew: false
  //   }
  //   const QueryParams = {
  //     queryParams: {},
  //     fragment: widget ? 'property-panel' : null,
  //   };
  //   if (type !== 'gridChild') {
  //     const picklistValue = this.picklistValues.find((d) => d.fieldType === fieldType.value);
  //     widget.fieldlist.dataType = picklistValue.dataType;
  //     widget.fieldlist.pickList = picklistValue.pickList;
  //     widget.fieldlist.fieldType = picklistValue.fieldType;
  //     widget.fieldlist.icon = picklistValue.icon;
  //     this.widgetFieldTypeChanged.emit(widget);
  //     this.childFieldId = widget && widget.fieldlist.fieldId ? widget.fieldlist.fieldId : null;
  //     QueryParams.queryParams = widget ? { f: widget.fieldId, childField: this.childFieldId } : null;
  //   } else {
  //     const picklistValue = this.picklistValues.find((d) => d.fieldType === fieldType.value);
  //     widget.fieldlist.dataType = picklistValue.dataType;
  //     widget.fieldlist.pickList = picklistValue.pickList;
  //     widget.fieldlist.fieldType = picklistValue.fieldType;
  //     widget.fieldlist.icon = picklistValue.icon;
  //     this.widgetFieldTypeChanged.emit(widget);
  //     this.subChildFieldId = widget && widget.fieldlist.fieldId ? widget.fieldlist.fieldId : null;
  //     QueryParams.queryParams = widget ? { f: widget.fieldId, childField: this.childFieldId, subChildField: this.subChildFieldId } : null;
  //   }

  //   this.navigateToRoute({...QueryParams.queryParams}, QueryParams.fragment);
  //   // this.router.navigate(['./'], QueryParams);
  // }

  navigateRouteType(type, widget) {
    this.navigateToRoute(
      {f: widget.fieldId, childField: this.childFieldId, subChildField: (type === 'gridChild') ? this.subChildFieldId : ''},
      widget ? 'property-panel' : null);
    // if (type !== 'gridChild') {
    //   this.router.navigate(['./'], {
    //     relativeTo: this.route,
    //     queryParams: widget ? { f: widget.fieldId, childField: this.childFieldId } : null,
    //     fragment: widget ? 'property-panel' : null,
    //   });
    // } else {
    // this.router.navigate(['./'], {
    //   relativeTo: this.route,
    //   queryParams: widget ? { f: widget.fieldId, childField: this.childFieldId, subChildField: (type === 'gridChild') ? this.subChildFieldId : '' } : null,
    //   fragment: widget ? 'property-panel' : null,
    // });
    // }
  }

  onBlurMethod(widget: FieldlistContainer, child?: Fieldlist) {
    const debounce_widget = debounce((widgetObj) => {
      this.coreService.nextUpdateFieldPropertySubject(widgetObj);
    }, 10);
    debounce_widget(widget);
    this.coreService.nextUpdateFieldFormValidationStatusSubject({
      fieldId: widget.fieldId,
      isValid: (widget.fieldlist.shortText[this.locale].description || '').trim().length > 0 ? true : false
    });
    const len = child ? (child.shortText[this.locale].description || '').trim().length : (widget.fieldlist.shortText[this.locale].description || '').trim().length;
    this.coreService.nextUpdateChildFieldFormValidationStatusSubject({
      fieldId: child && child.fieldId ? child.fieldId: widget.fieldId,
      isValid: len > 0 ? true : false
    });
  }

  /** check field is grid type or not */
  checkIfGrid(widget) {
    return this.expendItemId.includes(widget?.fieldlist?.fieldId) && widget?.fieldlist?.fieldType === 'grid';
  }

  /** apply  the class according to the fields status */
  checkApplicableClass(childField) {
    return { selected: this.selectedField === childField?.fieldId, 'has-error': this.fieldIdsWithError.indexOf(childField.fieldId) >= 0, deleted: childField.deleted, changes: this.currentFilter === 'Changes' }
  }

  /**
   * Get Field type Label
   */
  getFieldTypeLabel(fieldType: string) {
    switch(fieldType) {
      case 'html':
        return 'Rich text editor';
      case 'grid':
        return 'Table';
      default:
        return fieldType;
    }
  }

}
