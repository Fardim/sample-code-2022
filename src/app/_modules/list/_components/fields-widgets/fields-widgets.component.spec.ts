import { FieldControlType } from '@models/list-page/listpage';
import { CdkDropList, CdkDragDrop } from '@angular/cdk/drag-drop';
import { SharedModule } from './../../../shared/shared.module';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { FieldsWidgetsComponent } from './fields-widgets.component';

describe('FieldsWidgetsComponent', () => {
  let component: FieldsWidgetsComponent;
  let fixture: ComponentFixture<FieldsWidgetsComponent>;
  let router: Router;
  const queryParams = { f: '1' };
  const routeParams = { moduleId: '1005', fieldId: '1' };
  const mockWidgets = [
    {
      fieldId: '1',
      isNew: false,
      fieldlist: {
        fieldId: '1',
        fieldName: 'First name',
        attachmentSize: '',
        dataType: 'CHAR',
        dateModified: 0,
        decimalValue: '',
        fileTypes: 'grid',
        pickList: '0',
        maxChar: 4,
        isHeirarchy: false,
        isCriteriaField: false,
        isWorkFlow: false,
        isGridColumn: false,
        parentField: '',
        isDescription: false,
        textCase: 'UPPER',
        isSearchEngine: true,
        isFutureDate: false,
        isPastDate: false,
        helptexts: {
          en: 'Material Type',
          fr: 'Material Type Fr',
        },
        longtexts: {
          en: 'Material Type',
          fr: 'Material Type Fr',
        },
        moduleId: '1',
        shortText: {
          en: {
            description: 'Material Type',
            information: 'Material information',
          },
          fr: {
            description: 'Material Type',
            information: 'Material Information',
          },
          ab: {
            description: 'Material Type',
            information: 'Material information',
          },
        },
        optionsLimit: 1,
        isNoun: false,
        displayCriteria: null,
        structureId: '1234',
        childfields: [
          {
            fieldId: '2',
            fieldName: 'First name',
            attachmentSize: '',
            dataType: 'CHAR',
            dateModified: 0,
            decimalValue: '',
            fileTypes: '',
            pickList: '0',
            maxChar: 4,
            isHeirarchy: false,
            isCriteriaField: false,
            isWorkFlow: false,
            isGridColumn: false,
            parentField: '1',
            isDescription: false,
            textCase: 'UPPER',
            isSearchEngine: true,
            isFutureDate: false,
            isPastDate: false,
            helptexts: {
              en: 'Material Type',
              fr: 'Material Type Fr',
            },
            longtexts: {
              en: 'Material Type',
              fr: 'Material Type Fr',
            },
            moduleId: '1',
            shortText: {
              en: {
                description: 'Material Type',
                information: 'Material information',
              },
              fr: {
                description: 'Material Type',
                information: 'Material Information',
              },
              ab: {
                description: 'Material Type',
                information: 'Material information',
              },
            },
            optionsLimit: 1,
            isNoun: false,
            displayCriteria: null,
            structureId: '1234',
            childfields: [
              {
                fieldId: '3',
                fieldName: 'First name',
                attachmentSize: '',
                dataType: 'CHAR',
                dateModified: 0,
                decimalValue: '',
                fileTypes: '',
                pickList: '0',
                maxChar: 4,
                isHeirarchy: false,
                isCriteriaField: false,
                isWorkFlow: false,
                isGridColumn: false,
                parentField: '2',
                isDescription: false,
                textCase: 'UPPER',
                isSearchEngine: true,
                isFutureDate: false,
                isPastDate: false,
                helptexts: {
                  en: 'Material Type',
                  fr: 'Material Type Fr',
                },
                longtexts: {
                  en: 'Material Type',
                  fr: 'Material Type Fr',
                },
                moduleId: '1',
                shortText: {
                  en: {
                    description: 'Material Type',
                    information: 'Material information',
                  },
                  fr: {
                    description: 'Material Type',
                    information: 'Material Information',
                  },
                  ab: {
                    description: 'Material Type',
                    information: 'Material information',
                  },
                },
                optionsLimit: 1,
                isNoun: false,
                displayCriteria: null,
                structureId: '1234',
                childfields: [
                ],
                icon: 'Text',
              }
            ],
            icon: 'Text',
          }
        ],
        icon: 'Text',
      }
    }
  ];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FieldsWidgetsComponent],
      imports: [AppMaterialModuleForSpec, SharedModule, RouterTestingModule],
      providers: [{ provide: ActivatedRoute, useValue: { params: of(routeParams), queryParams: of(queryParams), snapshot: {} } }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldsWidgetsComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    component.selectedStructureId = '1';
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();

    queryParams.f = null;
    component.ngOnInit();
    expect(component.currentdWidgetId).toBeFalsy();
  });
  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();

    queryParams.f = null;
    component.ngOnInit();
    expect(component.currentdWidgetId).toBeFalsy();
  });
  it('onScrollEnd', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('onSelectWidget()', () => {
    spyOn(router, 'navigate');
    component.onSelectWidget(mockWidgets[0]);
    const extras: any = { relativeTo: component.route };
    extras.queryParams = { f: mockWidgets[0].fieldId, s: '1', update: true };
    extras.fragment = 'property-panel';
    extras.preserveFragment = false;
    expect(router.navigate).toHaveBeenCalledWith(['./'], extras);

    component.onSelectWidget(null);
    extras.queryParams = { f: undefined, s: '1', update: true };
    extras.fragment = 'property-panel';
    extras.preserveFragment = false;
    expect(router.navigate).toHaveBeenCalledWith(['./'], extras);
  });
  it('onSelectSubGrid() on select grid', () => {
    spyOn(router, 'navigate');
    const data = mockWidgets[0].fieldlist.childfields[0];
    component.onSelectSubGrid(data);
    const extras: any = { relativeTo: component.route };
    extras.queryParams = { f: mockWidgets[0].fieldId, childField: data.fieldId, update: true, s: '1' };
    extras.fragment = 'property-panel';
    extras.preserveFragment = false;
    expect(router.navigate).toHaveBeenCalledWith(['./'], extras);

    // component.onSelectSubGrid(null);
    // extras.queryParams = {f: '1', childField: undefined, update: true, s: '1' };
    // extras.fragment = 'property-panel';
    // extras.preserveFragment = false;
    // expect(router.navigate).toHaveBeenCalledWith(['./'], extras);
  });
  it('onSelectSubGridchild() on select grid child', () => {
    spyOn(router, 'navigate');
    const data = mockWidgets[0].fieldlist.childfields[0].childfields[0];
    component.currentdWidgetId = mockWidgets[0].fieldId;
    component.onSelectSubGridchild(mockWidgets[0].fieldlist.childfields[0], data);
    const extras: any = { relativeTo: component.route };
    extras.queryParams = { f: mockWidgets[0].fieldlist.childfields[0].parentField, childField: mockWidgets[0].fieldlist.childfields[0].fieldId, subChildField:data.fieldId, update: true, s: '1' };
    extras.fragment = 'property-panel';
    extras.preserveFragment = false;
    expect(router.navigate).toHaveBeenCalledWith(['./'], extras);

    // component.onSelectSubGridchild(null, null);
    // extras.queryParams = { update: true, s: '1', f: undefined, childField: undefined, subChildField: undefined };
    // extras.fragment = 'property-panel';
    // extras.preserveFragment = false;
    // expect(router.navigate).toHaveBeenCalledWith(['./'], extras);
  });
   it('isExpendable() check grid expendable', () => {
    component.expendItemId = [];
    component.isExpendable('1');
    expect(component.expendItemId).toEqual(['1']);
    component.expendItemId = ['10'];
    component.isExpendable('10');
    expect(component.expendItemId).toEqual([]);
   });

  //  it('ngOnChanges modyfy the json', () => {
  //    component.fieldWidgets = mockWidgets;
  //    expect(component).toBeTruthy();
  //  });

  //  it('onBlurMethod()', () => {
  //   //  mockWidgets = mockWidgets[0].fieldlist.description = 'testdata'
  //    component.locale = 'en';
  //    component.onBlurMethod(mockWidgets[0]);
  //    expect(component).toBeTruthy();
  //  });

  it('should handle drop event', () => {

    const previousContainer = {data: ['fields']} as CdkDropList<string[]>;
    const event = {
      previousIndex: 0,
      currentIndex: 1,
      item: undefined,
      container: previousContainer,
      previousContainer,
      isPointerOverContainer: true,
      distance: { x: 0, y: 0 }} as CdkDragDrop<string[]>;

      component.drop(event);
      expect(event.previousContainer).toEqual(previousContainer);
  });

  // it('delete(widget: FieldlistContainer)', async(() => {
  //   spyOn(component.deleteWidget, 'emit');
  //   component.delete(mockWidgets[0]);
  //   expect(component.deleteWidget.emit).toHaveBeenCalled();
  // }));

  // it('changeFieldType()', async(() => {
  //   spyOn(router, 'navigate');
  //   spyOn(component.widgetFieldTypeChanged, 'emit');

  //   const fieldType = { displayText: 'Text', value: FieldControlType.TEXT, explanation: 'Allows storing a value in a text format' };
  //   component.changeFieldType(fieldType, mockWidgets[0]);

  //   expect(component.widgetFieldTypeChanged.emit).toHaveBeenCalled();

  //   const extras: any = { relativeTo: component.route };
  //   extras.queryParams = { f: mockWidgets[0].fieldId, update: true, s: '1' };
  //   extras.fragment = 'property-panel';
  //   extras.preserveFragment = false;
  //   expect(router.navigate).toHaveBeenCalledWith(['./'], extras);
  // }));

  // it('changeGridFieldType()', () => {
  //   spyOn(router, 'navigate');
  //   component.currentdWidgetId = mockWidgets[0].fieldId;
  //   spyOn(component.widgetFieldTypeChanged, 'emit');

  //   const fieldType = { displayText: 'Text', value: FieldControlType.TEXT, explanation: 'Allows storing a value in a text format' };
  //   component.changeGridFieldType(fieldType, mockWidgets[0].fieldlist.childfields[0], 'gridparentChild');
  //   expect(component.widgetFieldTypeChanged.emit).toHaveBeenCalled();

  //   const extras: any = { relativeTo: component.route };
  //   extras.queryParams = {
  //     f: mockWidgets[0].fieldId,
  //     childField: mockWidgets[0].fieldlist.childfields[0].fieldId,
  //     update: true,
  //     s: '1' };
  //   extras.fragment = 'property-panel';
  //   extras.preserveFragment = false;
  //   expect(router.navigate).toHaveBeenCalledWith(['./'], extras);
  // });

  // it('changeGridFieldType()', () => {
  //   spyOn(router, 'navigate');
  //   component.currentdWidgetId = mockWidgets[0].fieldId;
  //   component.subgridId = mockWidgets[0].fieldlist.childfields[0].fieldId;
  //   spyOn(component.widgetFieldTypeChanged, 'emit');

  //   const fieldType = { displayText: 'Text', value: FieldControlType.TEXT, explanation: 'Allows storing a value in a text format' };
  //   component.changeGridFieldType(fieldType, mockWidgets[0].fieldlist.childfields[0].childfields[0], 'gridChild');
  //   expect(component.widgetFieldTypeChanged.emit).toHaveBeenCalled();

  //   const extras: any = { relativeTo: component.route };
  //   extras.queryParams = {
  //     f: mockWidgets[0].fieldId,
  //     childField: mockWidgets[0].fieldlist.childfields[0].fieldId,
  //     subChildField: mockWidgets[0].fieldlist.childfields[0].childfields[0].fieldId,
  //     update: true,
  //     s: '1'
  //   };
  //   extras.fragment = 'property-panel';
  //   extras.preserveFragment = false;
  //   expect(router.navigate).toHaveBeenCalledWith(['./'], extras);
  // });

  it('ngOnDestroy()', () => {
    spyOn(component.unsubscribeAll$, 'unsubscribe');
    component.ngOnDestroy();
    expect(component.unsubscribeAll$.unsubscribe).toHaveBeenCalled();
  });
});
