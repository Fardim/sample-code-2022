import { SharedModule } from '@modules/shared/shared.module';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmptySpaceRuleComponent } from './empty-space-rule.component';

describe('EmptySpaceRuleComponent', () => {
  let component: EmptySpaceRuleComponent;
  let fixture: ComponentFixture<EmptySpaceRuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmptySpaceRuleComponent ],
      imports: [SharedModule, AppMaterialModuleForSpec],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmptySpaceRuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
