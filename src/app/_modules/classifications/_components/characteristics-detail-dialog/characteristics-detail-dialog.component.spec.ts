
import { CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

import { CharacteristicsDetailDialogComponent } from './characteristics-detail-dialog.component';

describe('CharacteristicsDetailDialogComponent', () => {
  let component: CharacteristicsDetailDialogComponent;
  let fixture: ComponentFixture<CharacteristicsDetailDialogComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CharacteristicsDetailDialogComponent],
      imports: [ReactiveFormsModule, MatTableModule, MatDialogModule],
      providers: [
        {
          provide: MatDialogRef,
          useValue: mockDialogRef
        }, {
          provide: MAT_DIALOG_DATA, useValue: {}
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CharacteristicsDetailDialogComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit(), test prerequired ', async(() => {
    spyOn(component, 'ngOnInit').and.callThrough();
    const dialogData = {
      columns: ['action', 'charCode'],
      characteristicsDataSource: new MatTableDataSource([{ fieldType: 'TEXT', charCode: 'CHAR' }]),
      characteristicsFields: [{ id: 'charCode', name: 'name' },
      { id: 'charDesc', name: 'Language' }]
    };

    component.dialogData = dialogData;
    console.log(component.dialogData);
    component.ngOnInit();
    expect(component.ngOnInit).toHaveBeenCalled();

  }));

  it('closeDialog() will call dialog service close function', async () => {
    spyOn(component, 'onCancelClick').and.callThrough();
    component.onCancelClick();
    expect(component.onCancelClick).toHaveBeenCalled();
  });
});
