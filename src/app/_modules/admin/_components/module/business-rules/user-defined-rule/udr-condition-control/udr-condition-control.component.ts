import { Component, OnInit, Input, OnChanges, EventEmitter, Output } from '@angular/core';
import { UDRBlocksModel } from '../../business-rules.modal';
import { Observable, of } from 'rxjs';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';

@Component({
  selector: 'pros-udr-condition-control',
  templateUrl: './udr-condition-control.component.html',
  styleUrls: ['./udr-condition-control.component.scss']
})
export class UdrConditionControlComponent implements OnInit, OnChanges {


  @Input()
  condotionList: UDRBlocksModel[];

  @Input()
  selectedBlocks: UDRBlocksModel[] = [];

  @Output()
  evtSelected: EventEmitter<UDRBlocksModel[]> = new EventEmitter<UDRBlocksModel[]>();

  condotionListOb: Observable<UDRBlocksModel[]> = of([]);
  inpFrmCtrl: FormControl = new FormControl();

  constructor() {}

  ngOnChanges(changes: import('@angular/core').SimpleChanges): void {
    if(changes.selectedBlocks) {
      this.selectedBlocks = changes.selectedBlocks.currentValue;
    }
  }

  ngOnInit(): void {
    if(this.condotionList) {
      this.condotionListOb = of(this.condotionList);
    }

    this.inpFrmCtrl.valueChanges.subscribe(val=>{
      if(val && typeof val === 'string') {
        this.condotionListOb = of(this.condotionList.filter(fill=> fill.blockDesc.toLocaleLowerCase().indexOf(val.toLocaleLowerCase()) !== -1));
      } else {
        this.condotionListOb = of(this.condotionList);
      }
    });
  }

  /**
   * Track the dropdown value changes
   * @param event mat event option selection change
   */
  optionSelected(event: MatAutocompleteSelectedEvent) {
    console.log(event.option.value);
    const udr: UDRBlocksModel = event.option.value;
    if(event.option.value) {
      if(this.selectedBlocks) {
        if(!this.selectedBlocks.filter(fill=> fill.id === udr.id).length) {
          this.selectedBlocks.push(udr);
        }
      } else {
        this.selectedBlocks = [udr];
      }
    }
    this.evtSelected.emit(this.selectedBlocks);
  }

  add(event: MatChipInputEvent): void {
    const input = event.input;

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }
  /**
   * Remove block from selectedBlocks
   * After remove  should emit the changes values
   * @param block its block that we want to remove from selectedBlocks
   */
  remove(block: UDRBlocksModel) {
    const index = this.selectedBlocks.indexOf(block);
    this.selectedBlocks.splice(index, 1);
    this.evtSelected.emit(this.selectedBlocks);
  }
}
