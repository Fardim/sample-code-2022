import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nameShort'
})
export class NameShortPipe implements PipeTransform {

  transform(fullName: string): any {
    return fullName
      .split(' ')
      .map(n => n[0])
      .join('');
  }

}
