import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { RuleService } from '@services/rule/rule.service';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { TopBarComponent } from './top-bar.component';

describe('TopBarComponent', () => {
  let component: TopBarComponent;
  let fixture: ComponentFixture<TopBarComponent>;
  let ruleService: RuleService;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TopBarComponent],
      imports: [AppMaterialModuleForSpec, HttpClientTestingModule, RouterTestingModule, SharedModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TopBarComponent);
    component = fixture.componentInstance;
    ruleService = fixture.debugElement.injector.get(RuleService);
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit(), should call ngOnInit', (() => {
    component.ngOnInit();
    component.searchSub.subscribe();
    component.searchSub.next('test');
    component.subscriptionEnabled = true;
    expect(component.ngOnInit).toBeTruthy();
  }));

  it('filterData()', () => {
    const data = {
      response: [{ uuid: '67jh78ffj87gfhg', classType: 'Class Type A' }],
      classes: [{ uuid: '67jh78ffj87gfhg', code: 'Class A' }]
    };
    spyOn(component, 'filterData').and.callThrough();
    spyOn(ruleService, 'getAllClassTypes').and.returnValue(of(data));
    component.filterData();
    expect(component.filterData).toHaveBeenCalled();
  });

  it('openDialog(), should open new class type', () => {
    spyOn(component, 'openDialog').and.callThrough();
    component.openDialog('NEW_CLASS_TYPE', '');
    expect(component.openDialog).toHaveBeenCalled();
  });

  it('openDialog(),should open new class', () => {
    spyOn(component, 'openDialog').and.callThrough();
    const data = {
      response: [{ uuid: '67jh78ffj87gfhg', classType: 'Class Type A' }],
      classes: [{ uuid: '67jh78ffj87gfhg', code: 'Class A' }]
    };
    component.openDialog('NEW_CLASS', data.response[0]);
    expect(component.openDialog).toHaveBeenCalled();
  });

  it('loadData()', () => {
    const data = {
      response: [{ uuid: '67jh78ffj87gfhg', classType: 'Class Type A' }],
      classes: [{ uuid: '67jh78ffj87gfhg', code: 'Class A' }]
    };
    spyOn(component, 'loadData').and.callThrough();
    spyOn(ruleService, 'getAllClassTypes').and.returnValue(of(data));
    spyOn(router, 'navigate');
    component.loadData(false);
    expect(component.loadData).toHaveBeenCalled();
  });

  it('onScroll()', () => {
    const event = {
      target: {
        offsetHeight: 30,
        scrollTop: 70,
        scrollHeight: 100
      }
    }
    spyOn(component, 'onScroll').and.callThrough();
    component.onScroll(event);
    expect(component.onScroll).toHaveBeenCalled();
  });
});
