import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomTriggerComponent } from './custom-trigger.component';

describe('CustomTriggerComponent', () => {
  let component: CustomTriggerComponent;
  let fixture: ComponentFixture<CustomTriggerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomTriggerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomTriggerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
