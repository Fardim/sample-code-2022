import { Location } from '@angular/common';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CharacteristicsMutationSideSheetComponent } from './characteristics-mutation-side-sheet.component';

describe('CharacteristicsMutationSideSheetComponent', () => {
  let component: CharacteristicsMutationSideSheetComponent;
  let fixture: ComponentFixture<CharacteristicsMutationSideSheetComponent>;
  let location: Location;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CharacteristicsMutationSideSheetComponent]
    })
      .compileComponents();
    location = TestBed.inject(Location);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CharacteristicsMutationSideSheetComponent);
    component = fixture.componentInstance;
  });

  it('ngOnInit(), should call ngOnInit', (() => {
    component.ngOnInit();
    expect(component.ngOnInit).toBeTruthy();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('it should close the dialog', () => {
    spyOn(location, 'back');
    component.closeComponent();
    expect(location.back).toHaveBeenCalledTimes(1);
  });
});
