import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteReasonDialogComponent } from './delete-reason-dialog.component';

describe('DeleteReasonDialogComponent', () => {
  let component: DeleteReasonDialogComponent;
  let fixture: ComponentFixture<DeleteReasonDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeleteReasonDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteReasonDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
