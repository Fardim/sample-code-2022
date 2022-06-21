import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';

export class UpdateValue {
  currentValue: string;
  previousValue: string;
}
@Component({
  selector: 'pros-edit-label',
  templateUrl: './edit-label.component.html',
  styleUrls: ['./edit-label.component.scss']
})
export class EditLabelComponent implements OnInit, AfterViewInit {
  inputControl: FormControl = new FormControl('', {updateOn: 'blur'});

  @Input()
  value: string;

  @Output()
  valueChange: EventEmitter<UpdateValue> = new EventEmitter(null);

  @ViewChild('input') input: ElementRef;

  constructor() { }

  ngOnInit(): void {
    this.inputControl.setValue(this.value);
    this.subscribeinputControl();
  }

  ngAfterViewInit() {
    this.input.nativeElement.focus();
  }

  subscribeinputControl() {
    this.inputControl.valueChanges.subscribe((value: string) => {
      this.inputBlur(value);
    });
  }

  inputBlur(value: string = this.value) {
    this.valueChange.emit({
      currentValue: value,
      previousValue: this.value
    });
  }

  emitBlur() {
    this.inputBlur();
  }
}
