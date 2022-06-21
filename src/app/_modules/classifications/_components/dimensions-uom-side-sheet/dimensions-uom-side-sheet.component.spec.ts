import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DimensionsUomSideSheetComponent } from './dimensions-uom-side-sheet.component';

describe('DimensionsUomSideSheetComponent', () => {
  let component: DimensionsUomSideSheetComponent;
  let fixture: ComponentFixture<DimensionsUomSideSheetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DimensionsUomSideSheetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DimensionsUomSideSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('close',() =>{
    spyOn(component,'close').and.callThrough();

    component.close();
    expect(component.close).toHaveBeenCalled();
  });
});
