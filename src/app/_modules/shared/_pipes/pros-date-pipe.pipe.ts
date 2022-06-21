import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'prosDatePipe'
})
export class ProsDatePipe extends DatePipe implements PipeTransform {
  transform(value: any, dateFormat?: any): any {
    if(value) {
      const angularDate = super.transform(value, dateFormat);
      if(dateFormat) {
        return angularDate;
      } else {
        const isTimeStamp = this.isTimestamp(value);
        let miliseconds = 0;
        if(isTimeStamp) {
          miliseconds = +new Date() - +value;
        } else {
          miliseconds = +new Date() - +new Date(Number(value));
        }
        if(miliseconds>=0) {
          return this.getInterval(Math.abs(miliseconds));
        } else {
          return this.getInterval(Math.abs(miliseconds), 'future');
        }
      }
    } else {
      return value;
    }
  }

  getInterval(milliseconds, type = 'past') {
    const sec = Math.abs(Math.floor(milliseconds/1000));
    if (sec <= 60) {
      return $localize `:@@just_now:Just Now`;
    }

    const min = Math.abs(Math.floor(sec/60));
    if (min <= 60) {
      return type === 'past' ? (`${min} ` + $localize `:@@mins_ago:min(s) ago`) : $localize `:@@in_mins:In ${min}:in_mins_val: min(s)`;
    }

    const hrs = Math.abs(Math.floor(min/60));
    if (hrs <= 24) {
      return type === 'past' ? (`${hrs} ` + $localize `:@@hrs_ago:hour(s) ago`) : $localize `:@@in_hrs:In ${hrs}:in_hrs_val: hour(s)`;
    }

    const days = Math.abs(Math.floor(hrs/24));
    if (days <= 7) {
      return type === 'past' ? (`${days} ` + $localize `:@@days_ago:day(s) ago`) : $localize `:@@:In ${days}:in_days_val: day(s)`;
    }

    const weeks = Math.abs(Math.floor(days/7));
    if (weeks <= 4) {
      return type === 'past' ? (`${weeks} ` + $localize `:@@weeks_ago:week(s) ago`) : $localize `:@@:In ${weeks}:in_weeks_val: week(s)`;
    }

    const month = Math.abs(Math.floor(days/30));
    if (month <= 12) {
      return type === 'past' ? (`${month} ` + $localize `:@@months_ago:month(s) ago`) : $localize `:@@:In ${month}:in_months_val: month(s)`;
    }

    const year = Math.abs(Math.floor(month/12));
    return type === 'past' ? (`${year} ` + $localize `:@@years_ago:year(s) ago`) : $localize `:@@:In ${year}:in_years_val: year(s)`;
  }

  isTimestamp(n): boolean {
    const parsed = parseFloat(n);
    return !Number.isNaN(parsed) && Number.isFinite(parsed) && /^\d+\.?\d+$/.test(n);
  }

}
