import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordExpandedViewComponent } from './record-expanded-view.component';

describe('RecordExpandedViewComponent', () => {
  let component: RecordExpandedViewComponent;
  let fixture: ComponentFixture<RecordExpandedViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecordExpandedViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecordExpandedViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
