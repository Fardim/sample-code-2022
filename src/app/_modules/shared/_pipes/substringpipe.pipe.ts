import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'substringpipe'
})
export class SubstringPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    let returnData: string = value;
    if (value !== undefined && value !== '' && value.length >= 35) {
      returnData = returnData.substring(0, 34);
      returnData += '..';
    }
    return returnData;
  }

}
