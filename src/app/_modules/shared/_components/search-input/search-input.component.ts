import { Component, OnInit, SimpleChanges, Output, Input, OnChanges, ChangeDetectionStrategy, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'pros-search-input',
  templateUrl: './search-input.component.html',
  styleUrls: ['./search-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchInputComponent implements OnInit, OnChanges {

  constructor() { }

  /**
   * form control declaration
   */
  control: FormControl = new FormControl('');

  /**
   * The label to show in the search input field
   */
  @Input() label = 'Search';

  /**
   * The type of input
   */
  @Input() type: string;

  /**
   * placeholder for input
   */
  @Input() placeholder = 'Search';

  /**
   * Pass the preselected value if needed
   */
  @Input()
  preValue = '';

  /**
   * To emit the value for parent
   */
  @Output() value = new EventEmitter<string>();


  /**
   * ANGULAR HOOK
   */
  ngOnInit(): void {
    this.control.valueChanges
      .pipe(debounceTime(1000))
      .subscribe(value => {
        this.value.emit(value);
      });
  }

  /**
   * To clear search input
   * @param skipEmit disable form control emitEvent
   */
  clearSearch(skipEmit?) {
    this.control.reset('', { emitEvent: !skipEmit });
    // this.value.emit('');
  }

  /**
   * ANGULAR HOOK
   * Detect changes from parent to child
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes.preValue && changes.preValue.previousValue !== changes.preValue.currentValue) {
      this.preValue = changes.preValue.currentValue;
      this.control = new FormControl(this.preValue);
    }
  }
}
