import { TestBed } from '@angular/core/testing';
import * as moment from 'moment';

import { DateTimeHelperService } from './date-time-helper.service';

describe('DateTimeHelperService', () => {
  let helper: DateTimeHelperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    helper = TestBed.inject(DateTimeHelperService);
  });

  it('should be created', () => {
    expect(helper).toBeTruthy();
  });

  it('should get Yesterday date range', () => {

    const result = {
      startDate: moment().subtract(1, 'day').startOf('day').toDate().getTime(),
      endDate: moment().subtract(1, 'day').endOf('day').toDate().getTime()
    }

    expect(helper.dateUnitToDateRange('Yesterday')).toEqual(result);

  });

  it('should return today as default date range', () => {

    const result = {
      startDate: moment().startOf('day').toDate().getTime(),
      endDate: moment().endOf('day').toDate().getTime()
    }

    expect(helper.dateUnitToDateRange('other')).toEqual(result);

  });



});
