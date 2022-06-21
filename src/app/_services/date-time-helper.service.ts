import { Injectable } from '@angular/core';
import { DATE_FILTERS_METADATA } from '@models/list-page/listpage';
import * as moment from 'moment';

interface DateRange {
  startDate: any,
  endDate: any
}

@Injectable({
  providedIn: 'root'
})
export class DateTimeHelperService {

  constructor() { }

  public dateUnitToDateRange(unit): DateRange {

    const unitMetadata = DATE_FILTERS_METADATA.find(u => u.options.some(op => op.value === unit));

    if(unitMetadata) {
      const option = unitMetadata.options.find(op => op.value === unit);
      const startUnit = option.startUnit as moment.unitOfTime.Base;
      const endUnit = option.startUnit as moment.unitOfTime.Base;
      const startDate = moment().subtract(option.startAmount, startUnit).startOf(startUnit).toDate().getTime();
      const endDate = moment().subtract(option.endAmount, endUnit).endOf(endUnit).toDate().getTime();

      return {
        startDate,
        endDate
      }
    }

    return {
      startDate: moment().startOf('day').toDate().getTime(),
      endDate: moment().endOf('day').toDate().getTime(),
    };
  }
}
