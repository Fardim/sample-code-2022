import { ControlValueAccessor } from '@angular/forms';

export default abstract class FormField implements ControlValueAccessor {
    constructor() {}

    /**
     * onChange handler for change event
     * @param value pass the current state(string)
     */
    onChange = (value: any): void => { };

    /**
     * Register touched event
     */
    onTouched = (): void => { };

    /**
     * Method gets called when formcontrol value changes
     * inside a formGroup
     * @param val Pass the current value(string)
     */
    writeValue(..._: any[]) {
    }

    /**
     * Angular method to register the change event
     * to be active only inside a formGroup
     * @param onChange function passed on change
     */
    registerOnChange(onChange: (value: any) => void): void {
        this.onChange = onChange;
    }

    /**
     * Angular method to register the touched event
     * to be active only inside a formGroup
     * @param fn function passed on touched
     */
    registerOnTouched(onTouched: () => void): void {
        this.onTouched = onTouched;
    }


}