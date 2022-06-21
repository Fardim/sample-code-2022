import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormatPipe'
})
export class DateFormatPipe extends DatePipe implements PipeTransform {

  transform(value: any, dateFormat?: any): any {
    return super.transform(value, dateFormat);
  }

}
