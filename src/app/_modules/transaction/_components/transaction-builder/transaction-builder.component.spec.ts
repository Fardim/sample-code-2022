import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { Process } from '@modules/transaction/model/transaction';
import { CoreService } from '@services/core/core.service';
import { RuleService } from '@services/rule/rule.service';
import { MdoUiLibraryModule } from 'mdo-ui-library';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { TransactionBuilderComponent } from './transaction-builder.component';

describe('TransactionBuilderComponent', () => {
  let component: TransactionBuilderComponent;
  let fixture: ComponentFixture<TransactionBuilderComponent>;
  let coreService: CoreService;
  let ruleService: RuleService;
  let router: Router;
  let activatedRoute: ActivatedRoute;
  const routeParams = { moduleId: '1', flowId: '1', processId: '1', taskId: '1', layoutId: '1', id: '1', crId: '1' };
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        TransactionBuilderComponent
      ],
      imports: [
        MdoUiLibraryModule,
        AppMaterialModuleForSpec,
        RouterTestingModule,
        SharedModule,
        HttpClientTestingModule
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of(routeParams),
            queryParams: of({ s: 'test' }), snapshot: { queryParams: { f: 'test' } },
            fragment: of('435435')
          }
        },
        {
          provide: Router,
          useValue: {
            url: '/home/list/datatable/627310(sb:sb/transaction/627310/create//7762f76c-b316-4143-b804-9827b7690597/new)',
            events: of(new NavigationEnd(0, 'http://localhost:4200/#//home/list/datatable/627310(sb:sb/transaction/627310/create//7762f76c-b316-4143-b804-9827b7690597/new)', '/home/list/datatable/627310(sb:sb/transaction/627310/create//7762f76c-b316-4143-b804-9827b7690597/BDW43532)')),
            navigate: jasmine.createSpy('navigate')
          }
        }
      ],
    }).compileComponents()
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    activatedRoute = TestBed.inject(ActivatedRoute);
    router = TestBed.inject(Router);
    coreService = TestBed.inject(CoreService);
    ruleService = TestBed.inject(RuleService);
    spyOn(coreService, 'getDatasetFormDetail').and.returnValues(of({
      layoutId: 'string',
      description: 'test description',
      usage: '1',
      type: '1',
      labels: '1',
      helpText: '1',
      dateModified: 123456,
      userModified: '1',
      userCreated: '1',
      dateCreated: 123456,
      descriptionGenerator: false
    }));
    spyOn(ruleService, 'getModuleRules').withArgs('1', {
      pageInfo: {
        pageNumer: 0,
        pageSize: 10
      },
      searchString: ''
    }).and.callFake(() => of({
      response: {
        content: [{
          description: 'test description',
          status: 'active',
          uuid: '12345123',
          groupId: '1',
          moduleId: '1',
        }]
      }
    }));
    spyOn(ruleService, 'getGroupConditions').withArgs('1', 'en', {
      pageInfo: {
        pageNumer: 1,
        pageSize: 1,
      },
      searchString: ''
    }).and.callFake(() => of([{
      response: {
        content: ['test']
      }
    }]));
    spyOn(coreService, 'getAllStructures').and.returnValues(of([
      {
        isHeader: true,
        language: 'en',
        parentStrucId: 1,
        strucDesc: 'des',
        structureId: 1,
        moduleId: '1',
        order: 1
      }
    ]));
    spyOn(coreService, 'getObjectTypeDetails').and.returnValues(of({
      objectid: 1,
      moduleid: 1,
      description: 'test',
      type: 'test',
      objectdesc: 'test'
    }));
    spyOn(coreService, 'getDatasetFormTabs').and.returnValues(of([
      {
        description: 'test',
        isTabHidden: false,
        isTabReadOnly: false,
        tabOrder: 1,
        tabid: 'qwasqw',
        udrId: '1111'
      }
    ]));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // it('should getAllRules()', () => {
  //   component.getAllRules();
  //   expect(component.rulesList.length).toEqual(1);
  // });

  it('should defineTheProcess()', () => {
    component.defineTheProcess();
    expect(component.process).toEqual(Process.create);
  });

  it('should getObjectTypeDetails()', () => {
    component.getObjectTypeDetails();
    expect(component.objectType.objectid).toEqual(1);
    expect(component.objectType.objectdesc).toEqual('test');
    expect(component.objectType.type).toEqual('test');
  });


  it('close()', () => {
    component.close();
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: null } }], {
      preserveFragment: false,
      queryParamsHandling: 'preserve'
    });
  });

  it('ngOnDestroy()', async () => {
    const subscriptionSpy = spyOn(component.unsubscribeAll$, 'unsubscribe').and.callFake(() => null);
    component.ngOnDestroy();
    expect(subscriptionSpy).toHaveBeenCalled();
  });

});
