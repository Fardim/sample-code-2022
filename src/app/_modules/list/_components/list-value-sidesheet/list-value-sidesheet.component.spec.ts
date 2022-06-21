import { RuleService } from './../../../../_services/rule/rule.service';
import { ListValue, ListValueResponse } from './../../../../_models/list-page/listpage';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from './../../../shared/shared.module';
import { Router, ActivatedRoute } from '@angular/router';
import { GlobaldialogService } from './../../../../_services/globaldialog.service';
import { async, ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { TransientService } from 'mdo-ui-library';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { ListValueSidesheetComponent } from './list-value-sidesheet.component';

describe('ListValueSidesheetComponent', () => {
  let component: ListValueSidesheetComponent;
  let fixture: ComponentFixture<ListValueSidesheetComponent>;
  let ruleService: RuleService;
  let globalDialogService: GlobaldialogService;
  let router: Router;
  const queryParams = { f: '1' };
  const routeParams = { moduleId: '1005', fieldId: '1' };
  const panel = 'property-panel';
  const mockResponse: ListValueResponse = {
    content: [
      {
        code: 'New Code',
        text: 'New Text',
        language: 'New Language',
        textRef: '272545505559192171',
      },
      {
        code: 'New Code 2',
        text: 'New Text 2',
        language: 'New Language',
        textRef: '559906146559193266',
      },
    ],
    pageable: {
      sort: {
        sorted: false,
        unsorted: true,
        empty: true,
      },
      pageNumber: 0,
      pageSize: 20,
      offset: 0,
      paged: true,
      unpaged: false,
    },
    totalElements: 10,
    last: true,
    totalPages: 1,
    sort: {
      sorted: false,
      unsorted: true,
      empty: true,
    },
    number: 0,
    numberOfElements: 10,
    first: true,
    size: 20,
    empty: false,
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ListValueSidesheetComponent],
      imports: [AppMaterialModuleForSpec, SharedModule, RouterTestingModule],
      providers: [
        TransientService,
        { provide: ActivatedRoute, useValue: { params: of(routeParams), queryParams: of(queryParams), fragment: of(panel), snapshot: {} } },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListValueSidesheetComponent);
    component = fixture.componentInstance;
    ruleService = fixture.debugElement.injector.get(RuleService);
    globalDialogService = fixture.debugElement.injector.get(GlobaldialogService);
    router = TestBed.inject(Router);

    spyOn(ruleService, 'getDropvals').and.callFake(() => of(mockResponse));
  });

  it('should create', async(() => {
    expect(component).toBeTruthy();
  }));

  it('getListValues(), should get All ListValues', async(() => {
    fixture.detectChanges();
    expect(ruleService.getDropvals).toHaveBeenCalled();

    expect(component.listValues.length).toEqual(2);
    expect(component.infinteScrollLoading).toEqual(false);
    expect(component.hasMoreData).toEqual(true);
  }));

  it('searchFieldSub emit value', fakeAsync(() => {
    component.ngOnInit();
    component.searchFieldSub.next('Material');
    tick(1005);
    expect(component.fieldsSearchString).toEqual('Material');
    expect(component.recordsPageIndex).toEqual(0);

    component.searchFieldSub.next('');
    tick(1005);
    expect(component.fieldsSearchString).toEqual('');
    flush();
  }));

  // it('scroll(), should get tags on scroll down', async(() => {
  //   spyOn(component, 'getListValues');
  //   component.ngOnInit();
  //   component.scroll(true);
  //   expect(component.recordsPageIndex).toEqual(1);
  //   expect(component.getListValues).toHaveBeenCalled();

  //   component.infinteScrollLoading = false;
  //   component.scroll(false);
  //   expect(component.recordsPageIndex).toEqual(0);

  //   const result = component.scroll(true);
  //   expect(result).toBeNull();
  // }));

  it('deleteSelectedListValues(), confirmation dialog return yes', fakeAsync(() => {
    spyOn(globalDialogService, 'confirm').and.callFake(({ }, cb) => {
      expect(typeof cb).toBe('function');
      cb('yes');
    });

    component.ngOnInit();
    const listValue: ListValue = {
      code: 'New Code',
      text: 'New Text',
      language: 'New Language',
    };

    component.deleteSelectedListValues(listValue);
    expect(component.listValues.length).toEqual(2);

    flush();
  }));

  it('deleteSelectedListValues(), confirmation dialog return no', fakeAsync(() => {
    spyOn(globalDialogService, 'confirm').and.callFake(({ }, cb) => {
      expect(typeof cb).toBe('function');
      cb('no');
    });

    const listValue: ListValue = {
      code: 'New Code',
      text: 'New Text',
      language: 'New Language',
      textRef: '272545505559192171',
    };
    const result = component.deleteSelectedListValues(listValue);
    expect(result).toBeFalsy();

    flush();
  }));

  it('addNewListValue(), should add new tag in tags list at top', async(() => {
    fixture.detectChanges();
    component.addNewListValue();
    expect(component.listValues.length).toEqual(3);
  }));

  it('cloneListValues(), should clone the listvalue in listvalues list immediate next position', async(() => {
    fixture.detectChanges();
    component.cloneListValues(component.listValues[0], 0);
    expect(component.listValues.length).toEqual(3);
  }));

  it('should close sidesheet', () => {
    spyOn(router, 'navigate');
    component.close();
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: null } }], { preserveFragment: true, queryParamsHandling: 'preserve' });
  });
  it('listValueCode(), trackBy', () => {
    component.ngOnInit();
    const result = component.listValueCode(0, mockResponse.content[0]);
    expect(result).toEqual('New Code');
  });
});
