import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {FormControl} from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import {Observable } from 'rxjs';
import {map} from 'rxjs/operators';

export interface PeriodicElement {
  Description: string;
  ModuleName: string;
  Direction: string;
  System: string;
}


const ELEMENT_DATA: PeriodicElement[] = [
  {ModuleName: 'BOM', Description: 'GreenFoods Bill of Materials', Direction: 'Outbound', System: '-'},
  {ModuleName: 'Function Location', Description: 'Material Download', Direction: 'Inbound', System: '-'},
  {ModuleName: 'Material', Description: 'GreenFoods Info Record Creation', Direction: 'Outbound', System: '-'},
  {ModuleName: 'Alt Labels', Description: 'GreenFoods Contracts Creation', Direction: 'Outbound', System: '-'},
  {ModuleName: 'Partner Function', Description: 'GreenFoods Source List Creation', Direction: 'Outbound', System: '-'},
  {ModuleName: 'Inheritance Data', Description: 'GreenFoods Material Master', Direction: 'Outbound', System: '-'},
  {ModuleName: 'Price File', Description: 'BOM download', Direction: 'Outbound', System: '-'},
  {ModuleName: 'Material', Description: 'Material Outbound Prospecta Tenant', Direction: 'Outbound', System: '-'},
  {ModuleName: 'Material', Description: 'Price File WS', Direction: 'Outbound', System: '-'},
  {ModuleName: 'Material', Description: 'PROS FLOC CREATE', Direction: 'Outbound', System: '-'},
];

@Component({
  selector: 'pros-interfaces',
  templateUrl: './interfaces.component.html',
  styleUrls: ['./interfaces.component.scss']
})
export class InterfacesComponent implements OnInit {

  displayedColumns: string[] = ['star', 'position', 'name', 'weight', 'symbol'];
  dataSource = ELEMENT_DATA;

  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  fruitCtrl = new FormControl();
  filteredFruits: Observable<string[]>;
  fruits: string[] = ['Lemon'];
  allFruits: string[] = ['Apple', 'Lemon', 'Lime', 'Orange', 'Strawberry'];
  resultsLength = 0;

  @ViewChild('fruitInput') fruitInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  constructor() {
    this.filteredFruits = this.fruitCtrl.valueChanges.pipe(
        // startWith(null),
        map((fruit: string | null) => fruit ? this._filter(fruit) : this.allFruits.slice()));
  }

  add(event: MatChipInputEvent): void {
    // Add fruit only when MatAutocomplete is not open
    // To make sure this does not conflict with OptionSelected Event
    if (!this.matAutocomplete.isOpen) {
      const input = event.input;
      const value = event.value;

      // Add our fruit
      if ((value || '').trim()) {
        this.fruits.push(value.trim());
      }

      // Reset the input value
      if (input) {
        input.value = '';
      }

      this.fruitCtrl.setValue(null);
    }
  }

  remove(fruit: string): void {
    const index = this.fruits.indexOf(fruit);

    if (index >= 0) {
      this.fruits.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.fruits.push(event.option.viewValue);
    this.fruitInput.nativeElement.value = '';
    this.fruitCtrl.setValue(null);
  }

  _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.allFruits.filter(fruit => fruit.toLowerCase().indexOf(filterValue) === 0);
  }

  ngOnInit() {
  }
}
