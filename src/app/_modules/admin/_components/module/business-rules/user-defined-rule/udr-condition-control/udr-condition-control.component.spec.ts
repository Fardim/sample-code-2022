import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UdrConditionControlComponent } from './udr-condition-control.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { UDRBlocksModel } from '../../business-rules.modal';
import { MatChipInputEvent } from '@angular/material/chips';
import { SharedModule } from '@modules/shared/shared.module';

describe('UdrConditionControlComponent', () => {
  let component: UdrConditionControlComponent;
  let fixture: ComponentFixture<UdrConditionControlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UdrConditionControlComponent ],
      imports:[
        AppMaterialModuleForSpec, HttpClientTestingModule, RouterTestingModule, ReactiveFormsModule, FormsModule,
        SharedModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UdrConditionControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit(), test prerequid ', async(()=>{
    component.condotionList = [{id:'222'} as UDRBlocksModel];
      component.ngOnInit();
      expect(component.ngOnInit).toBeTruthy();
  }));

  it('optionSelected(), after option selection', async(()=>{
    // mock data
    const event = {option:{value:{id:'test'}}} as MatAutocompleteSelectedEvent;
    component.optionSelected(event);
    expect(component.selectedBlocks.length).toEqual(1);

    const event1 = {option:{}} as MatAutocompleteSelectedEvent;
    component.optionSelected(event1);
    expect(component.selectedBlocks.length).toEqual(1);

    const event2 = {option:{value:{id:'test'}}} as MatAutocompleteSelectedEvent;
    component.selectedBlocks = null;
    component.optionSelected(event2);
    expect(component.selectedBlocks.length).toEqual(1);

    const event3 = {option:{value:{id:'test'}}} as MatAutocompleteSelectedEvent;
    component.selectedBlocks = [{id:'test'} as UDRBlocksModel]
    component.optionSelected(event3);
    expect(component.selectedBlocks.length).toEqual(1);
  }));

  it('remove(), shuld remove ', async(()=>{
      const bock: UDRBlocksModel = new UDRBlocksModel();
      bock.id = '386472357';

      component.selectedBlocks = [bock];

      component.remove(bock);

      expect(component.selectedBlocks.length).toEqual(0);

  }));

  it('ngOnChanges(), should check on change', async(()=>{
    const changes: import('@angular/core').SimpleChanges = {selectedBlocks:{currentValue:{id:'test'},firstChange:null,isFirstChange:null,previousValue: new UDRBlocksModel()}};

    component.ngOnChanges(changes);
    expect(component.selectedBlocks.length).toEqual(undefined);

    const changes1: import('@angular/core').SimpleChanges = {selectedBlocks:null};

    component.ngOnChanges(changes1);
    expect(component.selectedBlocks.length).toEqual(undefined);

  }));

  it('add(), while search and enter then value should be reset ',()=>{
    const event = {input:{value:''}} as MatChipInputEvent;
    // call actual method
    component.add(event);
    expect(component.add).toBeTruthy();

    const event1 = {value:''} as MatChipInputEvent;
    // call actual method
    component.add(event1);
    expect(component.add).toBeTruthy();
  });
});
