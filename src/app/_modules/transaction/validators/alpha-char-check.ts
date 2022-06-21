import { AbstractControl } from '@angular/forms';

export const AlphaCharCheck = (charType: string) => {
    const camalize = (str) => {
        return str
            .replace(/\s(.)/g, (a) => {
                return a.toUpperCase();
            })
            .replace(/^(.)/, (b) => {
                return b.toLowerCase();
            });
    }

    return (control: AbstractControl) => {
        const { value } = control;

        if (value === null || value === '') return null;
        if ((charType === 'upper' && value !== value.toUpperCase()) || (charType === 'lower' && value !== value.toLowerCase()) || (charType === 'camel' && value !== camalize(value))) {
            return {
                invalidCharCase: true
            };
        }

        return null;
    };
};
