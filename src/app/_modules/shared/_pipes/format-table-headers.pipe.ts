import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatTableHeaders'
})
export class FormatTableHeadersPipe implements PipeTransform {

  transform(value: string): string {
    return value.replace('_', ' ');
  }

}
