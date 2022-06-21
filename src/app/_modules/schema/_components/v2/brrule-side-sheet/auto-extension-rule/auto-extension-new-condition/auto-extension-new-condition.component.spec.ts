import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoExtensionNewConditionComponent } from './auto-extension-new-condition.component';

describe('AutoExtensionNewConditionComponent', () => {
  let component: AutoExtensionNewConditionComponent;
  let fixture: ComponentFixture<AutoExtensionNewConditionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AutoExtensionNewConditionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AutoExtensionNewConditionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
