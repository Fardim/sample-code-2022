import { Component, forwardRef, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import FormField from '@models/form-field';
import { EventFieldData, eventList } from '../notification-rule.modal';

@Component({
  selector: 'pros-event-trigger',
  templateUrl: './event-trigger.component.html',
  styleUrls: ['./event-trigger.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => EventTriggerComponent)
    }]
})
export class EventTriggerComponent extends FormField implements OnInit {

  eventList = eventList;
  submitted = false;
  eventFormGroup: FormGroup;
  eventFormControl = new FormControl('');
  constructor(
    private fb: FormBuilder
  ) {
    super();
   }

  ngOnInit(): void {
    this.eventFormGroup = this.fb.group({
      event: ['', Validators.required]
    })

    this.eventFormGroup.valueChanges.subscribe(value => {
      this.onChange({payload: value?.event?.value, isFormValid: this.eventFormGroup.valid && value?.event?.hasOwnProperty('value')})
    })
  }

  displayWith(event: { label: string, value: string }) {
    return event?.label || '';
  }

  writeValue(data: EventFieldData): void {
    if (data.hasOwnProperty('isFormSaved')) {
      this.submitted = data?.isFormSaved || false;
    }
    if (data?.isUpdated) {
      this.eventFormGroup.get('event').setValue(data.event || '');
    }
  }
}
