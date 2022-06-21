import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapMdoFieldComponent } from './map-mdo-field.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { MetadataModel } from '@models/schema/schemadetailstable';
import { SharedModule } from '@modules/shared/shared.module';
import { FormControl } from '@angular/forms';

describe('MapMdoFieldComponent', () => {
  let component: MapMdoFieldComponent;
  let fixture: ComponentFixture<MapMdoFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapMdoFieldComponent ],
      imports:[ AppMaterialModuleForSpec, SharedModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapMdoFieldComponent);
    component = fixture.componentInstance;

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit(),', async(() => {
      component.preSelectedFld = 'MATL_GROUP';
      component.mdoFields = [{fieldId:'MATL_GROUP', fieldDescri:'Material Group'} as MetadataModel,{fieldId:'object', fieldDescri:'Module Object Number'} as MetadataModel ];
      component.autoSelectedFld = 'test';
      component.excelField = 'id';
      component.ngOnInit();
      expect(component.ngOnInit).toBeTruthy();

      component.preSelectedFld = '';
      component.autoSelectedFld = 'test';
      component.excelField = 'Material Group';
      component.ngOnInit();
      expect(component.ngOnInit).toBeTruthy();

      component.excelField = 'Mate';
      component.autoSelectedFld = 'test';
      component.ngOnInit();
      expect(component.ngOnInit).toBeTruthy();

      component.preSelectedFld = '';
      component.autoSelectedFld = '';
      component.selectedMdoFldCtrl = new FormControl('Ashish');

      component.ngOnInit();
      expect(component.selectedMdoFldCtrl.value).toEqual('Ashish');

      component.selectedMdoFldCtrl = new FormControl('');
      component.ngOnInit();
      component.selectedMdoFldCtrl.setValue('Material group');
      component.suggestedMdoFldArray.subscribe((field) => {
        expect(field.length).toEqual(2);
      });
  }));

  it('suggestedMdoFldTrkBy(), trackby for suggested field', async(() => {
    expect(component.suggestedMdoFldTrkBy({fieldId:'test'})).toEqual('test');
    expect(component.suggestedMdoFldTrkBy(null)).toEqual(null);
  }));

  it('mdoFieldDisplayWith(), display with for module ', async(() => {
    expect(component.mdoFieldDisplayWith({fieldDescri:'Material'})).toEqual('Material');
    expect(component.mdoFieldDisplayWith(null)).toEqual('');
  }));

  it('emitOptionSelected(), emit the selected fld value', async(() => {
    component.emitOptionSelected({option:null});
    const sel = {option:{value:{fieldId:'MATL_GROUP'}}}
    component.emitOptionSelected(sel);
    expect(component.emitOptionSelected).toBeTruthy();
  }));
});
