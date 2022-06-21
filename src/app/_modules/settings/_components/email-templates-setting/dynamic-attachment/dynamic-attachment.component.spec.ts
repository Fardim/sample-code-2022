import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicAttachmentComponent } from './dynamic-attachment.component';

describe('DynamicAttachmentComponent', () => {
  let component: DynamicAttachmentComponent;
  let fixture: ComponentFixture<DynamicAttachmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DynamicAttachmentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicAttachmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
