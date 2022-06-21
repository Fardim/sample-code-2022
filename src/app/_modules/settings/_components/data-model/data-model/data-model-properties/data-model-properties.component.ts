import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'pros-data-model-properties',
  templateUrl: './data-model-properties.component.html',
  styleUrls: ['./data-model-properties.component.scss']
})
export class DataModelPropertiesComponent implements OnInit {

  @Output() showProperties = new EventEmitter();
  numCtrl2 = new FormControl();
  filteredNumbers2: Observable<string[]>;
  allNumbers: string[] = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
  @ViewChild('numInput2') numInput2: ElementRef<HTMLInputElement>;
    /**
   * Selected value for single select
   */
     selectedValue: any;

     formRelationShip = this.fb.group({
      dataRelationShip: this.fb.array([])
  });

  constructor(private router: Router,private fb:FormBuilder) {
    this.filteredNumbers2 = this.numCtrl2.valueChanges.pipe(
      startWith(''),
      map((num: string | null) => num ? this._filter(num) : this.allNumbers.slice()));
   }

  ngOnInit(): void {
    this.addRelationShip();
  }

  get dataModelRelation() {
    return this.formRelationShip.controls["dataRelationShip"] as FormArray;
  }

  addRelationShip() {
    const Form = this.fb.group({
      parent: ['parent', Validators.required],
      child: ['child', Validators.required]
    });
    this.dataModelRelation.push(Form);
  }

  deleteRelationShip(Index: number) {
    this.dataModelRelation.removeAt(Index);
  }



    /**
   * method to add item to selected items
   * for single sleect
   * @param event item
   */
     selectSingle(event: MatAutocompleteSelectedEvent): void {
      this.selectedValue = event.option.value;
    }

     /**
   * mehtod to filter items based on the searchterm
   * @param value searchTerm
   * @returns string[]
   */
  _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.allNumbers.filter(num => num.toLowerCase().indexOf(filterValue) === 0);
  }

  close() {
    this.showProperties.emit(false);
  }

  conditionButtonHandler() {
    this.router.navigate(
      [
        '',
        {
          outlets: {
            sb: `sb/settings/data-model`,
            outer: `outer/data-model/new-data-model`,
            sb3: `sb3/data-model/data-model-condtion`
          }
        }
      ]);
  }
}


