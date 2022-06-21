import { SharedModule } from '@modules/shared/shared.module';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZeroRuleComponent } from './zero-rule.component';

describe('ZeroRuleComponent', () => {
  let component: ZeroRuleComponent;
  let fixture: ComponentFixture<ZeroRuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ZeroRuleComponent ],
      imports: [
        AppMaterialModuleForSpec,
        SharedModule
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ZeroRuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
