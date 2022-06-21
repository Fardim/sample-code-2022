import { Pipe, PipeTransform } from '@angular/core';

export interface TransformOptions {
  decimalCharacter?: string;
  separator?: any;
  decimalPlaces?: number;
}

@Pipe({
  name: 'numberTransform'
})
export class NumberTransformPipe implements PipeTransform {

  transform(
    val: any,
    transformOptions: TransformOptions): string {
    if(!val) { return ''; }
    let modifiedStr = '';
    const { decimalCharacter, separator, decimalPlaces} = transformOptions;
    if(decimalCharacter === separator && decimalCharacter && separator) { throw new Error('The thousand and decimal separators cannot be identical'); }

    // const decimalPlaces = `${val}`.split('.')[1]?.length || 0;
    val = val.toLocaleString(undefined, { minimumFractionDigits: decimalPlaces, maximumFractionDigits: decimalPlaces });

    for (let i = 0; i < val.length; i++) {
      if(val.charAt(i) === '.' && !!decimalCharacter) {
        modifiedStr += decimalCharacter;
      } else if(val.charAt(i) === ',' && !!separator) {
        modifiedStr += separator;
      } else {
        modifiedStr += val.charAt(i);
      }
    }

    return modifiedStr;
  }
}
