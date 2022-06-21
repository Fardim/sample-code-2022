import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { SharedModule } from '../../../../../_modules/shared/shared.module';
import { ListDependencyRuleComponent } from './list-dependency-rule.component';

describe('ListDependencyRuleComponent', () => {
  let component: ListDependencyRuleComponent;
  let fixture: ComponentFixture<ListDependencyRuleComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListDependencyRuleComponent ],
      imports:[RouterTestingModule,HttpClientTestingModule,SharedModule,AppMaterialModuleForSpec]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListDependencyRuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
