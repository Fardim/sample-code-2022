import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MetadataModel } from 'src/app/_models/schema/schemadetailstable';
import { Observable, of } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

export interface SelectedMdoField {
  index: number;
  fieldId: string;
  fieldDesc: string;
  execlFld: string;
}
@Component({
  selector: 'pros-map-mdo-field',
  templateUrl: './map-mdo-field.component.html',
  styleUrls: ['./map-mdo-field.component.scss']
})
export class MapMdoFieldComponent implements OnInit {

  @Input()
  cellIndex: number;

  @Input()
  excelField: string;

  @Input()
  mdoFields: MetadataModel[] = [];

  @Input()
  preSelectedFld: string;

  @Input()
  autoSelectedFld: string;

  @Output()
  optionSelectedEmit: EventEmitter<SelectedMdoField> = new EventEmitter<SelectedMdoField>();

  selectedMdoFldCtrl: FormControl;
  suggestedMdoFldArray: Observable<MetadataModel[]>;
  constructor() {
    this.selectedMdoFldCtrl = new FormControl();
    this.suggestedMdoFldArray = of([]);
  }

  ngOnInit(): void {
    this.suggestedMdoFldArray = this.selectedMdoFldCtrl.valueChanges
      .pipe(startWith(''),
        map(value => typeof value === 'string' ? value : value.fieldId),
        map(name => name ?
          (this.mdoFields.filter(fill => fill.fieldDescri.toLocaleLowerCase().indexOf(name.toLocaleLowerCase()) !== -1)) :
          this.mdoFields));

    this.selectedMdoFldCtrl.valueChanges.subscribe(val => {
      if (typeof val === 'string' && val === '') {
        this.optionSelectedEmit.emit({ fieldDesc: '', fieldId: '', index: this.cellIndex, execlFld: this.excelField });
      }
      else if (val) {
        this.optionSelectedEmit.emit({ fieldDesc: val.fieldDescri, fieldId: val.fieldId, index: this.cellIndex, execlFld: this.excelField });
      } else {
        console.error(`Mapping not found: ${val} `);
      }
    });

    // set preselected autocomplete
    if (this.preSelectedFld) {
      const fld = this.mdoFields.filter(fill => fill.fieldId === this.preSelectedFld)[0];
      this.selectedMdoFldCtrl.setValue(fld);
    }

    if (this.autoSelectedFld) {
      let fld;
      if (this.excelField === 'id') {
        fld = this.mdoFields.filter(fill => fill.fieldDescri.toLocaleLowerCase() === ('Module Object Number').toLocaleLowerCase())[0]
      } else {
        fld = this.mdoFields.filter(fill => fill.fieldDescri.toLocaleLowerCase() === this.excelField.toLocaleLowerCase())[0];
        if (!fld) {
          fld = this.mdoFields.filter(fill => fill.fieldDescri.toLocaleLowerCase().indexOf(this.excelField.toLocaleLowerCase()) !== -1)[0];
        }
      }
      this.selectedMdoFldCtrl.setValue(fld);
      this.selectedMdoFldCtrl.disable({ onlySelf: true, emitEvent: true })
    }
  }

  suggestedMdoFldTrkBy(fld): string {
    if (fld) {
      return fld.fieldId;
    }
    return null;
  }
  mdoFieldDisplayWith(object): string {
    return object ? object.fieldDescri : '';
  }

  emitOptionSelected(sel: any) {
    const selectedFld: MetadataModel = sel.option ? sel.option.value : {} as MetadataModel;
    this.optionSelectedEmit.emit({ fieldDesc: selectedFld.fieldDescri, fieldId: selectedFld.fieldId, index: this.cellIndex, execlFld: this.excelField });
  }

}
