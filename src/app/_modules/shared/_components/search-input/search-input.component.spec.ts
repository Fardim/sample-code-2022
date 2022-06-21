import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchInputComponent } from './search-input.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { SimpleChanges } from '@angular/core';

describe('SearchInputComponent', () => {
  let component: SearchInputComponent;
  let fixture: ComponentFixture<SearchInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchInputComponent ],
      imports: [AppMaterialModuleForSpec]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchInputComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should clear search text', () => {
    component.control.setValue('text')
    component.clearSearch();
    expect(component.control.value).toBeFalsy();
  });

  it('update on inputs changes', () => {
    const changes:SimpleChanges = {preValue:{currentValue:'new value', previousValue: '', firstChange:null, isFirstChange:null}};
    component.ngOnChanges(changes);
    expect(component.preValue).toEqual('new value');
    expect(component.control.value).toEqual('new value');
  });

});
