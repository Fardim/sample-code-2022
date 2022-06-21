import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { NounModifierService } from '@services/home/schema/noun-modifier.service';
import { UserService } from '@services/user/userservice.service';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

export enum RequestFor {
  noun = 'noun',
  moifier = 'modifier',
  attribute = 'attribute'
}

@Component({
  selector: 'pros-noun-modifier-autocomplete',
  templateUrl: './noun-modifier-autocomplete.component.html',
  styleUrls: ['./noun-modifier-autocomplete.component.scss']
})
export class NounModifierAutocompleteComponent implements OnInit, OnChanges {


  @Input()
  formCtrl: FormControl;
  dropdownformCtrl: FormControl = new FormControl();

  @Input()
  requestFor: RequestFor;

  @Input()
  data: any[] = [];

  @Input()
  selectedNoun: string;

  @Input()
  selectedModifier: string;

  @Output()
  clickAddNew: EventEmitter<string> = new EventEmitter<string>();

  filteredOptions: Observable<any[]> = of([]);


  @ViewChild('autoCompleteInput', { read: MatAutocompleteTrigger })
  autoComplete: MatAutocompleteTrigger;


  /**
   * Emit the selected ctrl...
   */
  @Output()
  emitSelCtrl: EventEmitter<any> = new EventEmitter<any>();


  constructor(
    private nounModifierService: NounModifierService,
    private userDetailsService: UserService
  ) { }

  ngOnInit(): void {
    this.formCtrl = this.formCtrl ? this.formCtrl : new FormControl('');

    this.formCtrl.valueChanges.pipe(debounceTime(1000)).subscribe(res => {
      this.setDropdownValue(res);
      this.filterAutocompleteOptions(res);
    });
    this.dropdownformCtrl.valueChanges.pipe(debounceTime(1000)).subscribe(res => {
      this.filterAutocompleteOptions(res);
    });

  }

  filterAutocompleteOptions(res) {
    if (typeof res === 'string') {
      if (this.requestFor && this.requestFor === RequestFor.noun) {
        this.getNouns(res.trim());
      } else if (this.requestFor && this.requestFor === RequestFor.moifier) {
        this.getModifiers(res.trim());
      } else if (this.requestFor && this.requestFor === RequestFor.attribute) {
        this.getAttributes(res.trim());
      }
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.data && changes.data.previousValue !== changes.data.currentValue) {
      this.data = changes.data.currentValue;
      this.filteredOptions = of(this.data);
    }

    if (changes && changes.requestFor && changes.requestFor.previousValue !== changes.requestFor.currentValue) {
      this.requestFor = changes.requestFor.currentValue;
    }
    this.setDropdownValue(this.formCtrl?.value);
  }


  /**
   * method to show consistent selected values
   * @param object pass object from which the value should be displayed
   */
  mdoFieldDisplayWith = (object) => {
    if (object) {
      if (this.requestFor && this.requestFor === 'noun') {
        return object.NOUN_CODE ? object.NOUN_CODE : '';
      } else if (this.requestFor && this.requestFor === 'modifier') {
        return object.MODE_CODE ? object.MODE_CODE : '';
      } else if (this.requestFor && this.requestFor === 'attribute') {
        return object.ATTR_CODE ? object.ATTR_CODE : '';
      }
    }
  }


  /**
   * method to prevent re rendering in a list
   * @param fld track by for performance improvement
   */
  suggestedMdoFldTrkBy(object): string {
    if (object) {
      if (this.requestFor && this.requestFor === 'noun') {
        return object.NOUN_CODE ? object.NOUN_CODE : '';
      } else if (this.requestFor && this.requestFor === 'modifier') {
        return object.MODE_CODE ? object.MODE_CODE : '';
      } else if (this.requestFor && this.requestFor === 'attribute') {
        return object.ATTR_CODE ? object.ATTR_CODE : '';
      }
    }
    return null;
  }

  displayDroptext(option: any): string {
    if (option) {
      if (this.requestFor && this.requestFor === 'noun') {
        return option.NOUN_CODE ? option.NOUN_CODE : option.NOUN_LONG;
      } else if (this.requestFor && this.requestFor === 'modifier') {
        return option.MODE_CODE ? option.MODE_CODE : option.MOD_LONG;
      } else if (this.requestFor && this.requestFor === 'attribute') {
        return option.ATTR_DESC || option.ATTR_CODE;
      }
    }
  }

  displayFn(value: any): string {
    return this.displayDroptext(value) || value || this.formCtrl.value;
  }

  getOptionVal(option: any): string {
    if (option) {
      if (this.requestFor && this.requestFor === 'noun') {
        return option.NOUN_CODE || option.NOUN_LONG;
      } else if (this.requestFor && this.requestFor === 'modifier') {
        return option.MODE_CODE || option.MOD_LONG;
      } else if (this.requestFor && this.requestFor === 'attribute') {
        return option.ATTR_CODE || option.ATTR_DESC;
      }
    }
  }

  emitForCreateNew(f: string) {
    this.clickAddNew.emit(f);
    this.autoComplete.closePanel();
  }

  getNouns(serachString: string) {
    this.userDetailsService.getUserDetails().pipe(distinctUntilChanged()).subscribe(user => {
      this.nounModifierService.getLocalNouns(user.plantCode, '', '', serachString).subscribe(res => {
        console.log('Get nounse', serachString, res);
        this.data = res;
        this.filteredOptions = of(res);
      });
    });
  }

  getModifiers(serachString: string) {
    this.userDetailsService.getUserDetails().pipe(distinctUntilChanged()).subscribe(user => {
      this.nounModifierService.getLocalModifier(user.plantCode, this.selectedNoun ? this.selectedNoun : '', serachString).subscribe(res => {
        this.data = res;
        this.filteredOptions = of(res);
      });
    });
  }

  getAttributes(serachString: string) {
    this.userDetailsService.getUserDetails().pipe(distinctUntilChanged()).subscribe(user => {
      this.nounModifierService.getLocalAttribute(this.selectedNoun ? this.selectedNoun : '', this.selectedModifier ? this.selectedModifier : '',
        user.plantCode, serachString).subscribe(res => {
          this.data = res;
          this.filteredOptions = of(res);
        });
    });
  }
  selectOption($event) {
    this.emitSelCtrl.emit($event.option.value);
    this.formCtrl.setValue(this.getOptionVal($event.option.value));
  }

  setDropdownValue(value: any) {
    if (!value) {
      this.dropdownformCtrl.reset();
      return;
    }
    const option = this.data.find(row => row[{
      noun: 'NOUN_CODE',
      modifier: 'MODE_CODE',
      attribute: 'ATTR_CODE'
    }[this.requestFor]] === value);
    this.dropdownformCtrl.setValue(option);
  }
}
