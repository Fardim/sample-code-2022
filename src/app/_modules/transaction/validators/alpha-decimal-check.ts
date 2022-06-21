import { AbstractControl } from '@angular/forms';

export const AlphaDecimalCheck = (decimalPos: number) => {
    const countDecimals = (str) => {
        return str.split('.')[1].length
    }
    return (control: AbstractControl) => {
        const val = control.value;

        if (val === null || val === '') return null;

        if (!isNaN(val)) {
            const result = (val - Math.floor(val)) !== 0;
            if (result) {
                if (countDecimals(val) !== decimalPos)
                    return { invalidDecimal: true };
            } else {
                return { invalidDecimal: true };
            }
        }

        return null;
    }
}
