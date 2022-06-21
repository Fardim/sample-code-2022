import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FromViewAttachmentComponent } from './from-view-attachment.component';

describe('FromViewAttachmentComponent', () => {
  let component: FromViewAttachmentComponent;
  let fixture: ComponentFixture<FromViewAttachmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FromViewAttachmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FromViewAttachmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
