import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuotedReplyComponent } from './quoted-reply.component';

describe('QuotedReplyComponent', () => {
  let component: QuotedReplyComponent;
  let fixture: ComponentFixture<QuotedReplyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuotedReplyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuotedReplyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
