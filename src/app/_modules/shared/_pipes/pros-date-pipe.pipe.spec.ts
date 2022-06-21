import { DatePipe } from '@angular/common';
import { ProsDatePipe } from './pros-date-pipe.pipe';

describe('DateAgoPipe', () => {
  it('create an instance', () => {
    const pipe = new ProsDatePipe('');
    expect(pipe).toBeTruthy();
  });

  it('transform called with null value', () => {
    const dateAgoPipe = new ProsDatePipe('en-US');
    const result = dateAgoPipe.transform(null);
    expect(result).toBeNull();
  });

  it('transform: exact similar to Angular Date pipe', () => {
    const dateAgoPipe = new ProsDatePipe('en-US');
    const timestamp = +new Date();
    const dateformat = 'MM.dd.yyyy';
    const actualString =  dateAgoPipe.transform(timestamp, dateformat);
    const actualDate = new Date(timestamp);
    expect(actualString).toEqual(('0'+`${actualDate.getMonth()+1}`).slice(-2)+'.'+('0'+`${actualDate.getDate()}`).slice(-2)+'.'+`${actualDate.getFullYear()}`);
  });

  it('isTimestamp(n)', () => {
    const dateAgoPipe = new ProsDatePipe('en-US');
    spyOn(dateAgoPipe, 'isTimestamp');
    const timestamp = +new Date();
    const dateformat = null;
    dateAgoPipe.transform(timestamp, dateformat);
    expect(dateAgoPipe.isTimestamp).toHaveBeenCalledWith(timestamp);
    const dateAgoPipe2 = new ProsDatePipe('en-US');
    const result = dateAgoPipe2.isTimestamp(timestamp);
    expect(result).toBeTruthy();
    const result2 = dateAgoPipe.isTimestamp('2018-05-08T17:58:47Z');
    expect(result2).toBeFalsy();
  });

  it('transform() getPreviousText()', () => {
    const dateAgoPipe = new ProsDatePipe('en-US');
    const dateformat = null;
    let timestamp = +new Date(Date.now() - 30 * 1000); // 30 seconds
    let result = dateAgoPipe.transform(timestamp, dateformat);
    expect(result).toEqual('Just Now');

    timestamp = +new Date(Date.now() - 30 * 60 * 1000); // 30 minute
    result = dateAgoPipe.transform(timestamp, dateformat);
    expect(result).toEqual('30 min(s) ago');

    timestamp = +new Date(Date.now() - 3 * 60 * 60 * 1000); // 3 hour
    result = dateAgoPipe.transform(timestamp, dateformat);
    expect(result).toEqual('3 hour(s) ago');

    timestamp = +new Date(Date.now() - 24 * 60 * 60 * 1000); // 1 day
    result = dateAgoPipe.transform(timestamp, dateformat);
    expect(result).toEqual('24 hour(s) ago');

    let angularDateFormat = new DatePipe('en-US').transform(+new Date(Date.now() - 3 * 24 * 60 * 60 * 1000));
    timestamp = +new Date(Date.now() - 3 * 24 * 60 * 60 * 1000); // 3 days
    result = dateAgoPipe.transform(timestamp, dateformat);
    expect(result).toEqual('3 day(s) ago');

    timestamp = +new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 1 week
    result = dateAgoPipe.transform(timestamp, dateformat);
    expect(result).toEqual('7 day(s) ago');

    angularDateFormat = new DatePipe('en-US').transform(+new Date(Date.now() - 14 * 24 * 60 * 60 * 1000));
    timestamp = +new Date(Date.now() - 14 * 24 * 60 * 60 * 1000); // 2 weeks
    result = dateAgoPipe.transform(timestamp, dateformat);
    expect(result).toEqual('2 week(s) ago');

    timestamp = +new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 1 month
    result = dateAgoPipe.transform(timestamp, dateformat);
    expect(result).toEqual('4 week(s) ago');

    angularDateFormat = new DatePipe('en-US').transform(+new Date(Date.now() - 60 * 24 * 60 * 60 * 1000));
    timestamp = +new Date(Date.now() - 60 * 24 * 60 * 60 * 1000); // 2 month
    result = dateAgoPipe.transform(timestamp, dateformat);
    expect(result).toEqual('2 month(s) ago');

    timestamp = +new Date(Date.now() - 365 * 24 * 60 * 60 * 1000); // 1 year
    result = dateAgoPipe.transform(timestamp, dateformat);
    expect(result).toEqual('12 month(s) ago');

    angularDateFormat = new DatePipe('en-US').transform(+new Date(Date.now() - 730 * 24 * 60 * 60 * 1000));
    timestamp = +new Date(Date.now() - 730 * 24 * 60 * 60 * 1000); // 2 year
    result = dateAgoPipe.transform(timestamp, dateformat);
    expect(result).toEqual('2 year(s) ago');

    // angularDateFormat = new DatePipe('en-US').transform(+new Date(Date.now() - 730 * 24 * 60 * 60 * 1000));
    // timestamp = +new Date(Date.now() - 730 * 24 * 60 * 60 * 1000); // 2 years
    // result = dateAgoPipe.getPreviousText('', 0, timestamp);
    // expect(result).toEqual(angularDateFormat);

  });

  it('transform() getFutureText()', () => {
    const dateAgoPipe = new ProsDatePipe('en-US');
    const dateformat = null;
    let timestamp = +new Date(Date.now() + 30 * 1000); // 30 seconds
    let result = dateAgoPipe.transform(timestamp, dateformat);
    expect(result).toEqual('Just Now');

    timestamp = +new Date(Date.now() + 30 * 60 * 1000); // 30 minute
    result = dateAgoPipe.transform(timestamp, dateformat);
    expect(result).toEqual('In 30 min(s)');

    timestamp = +new Date(Date.now() + 3 * 60 * 60 * 1000 + 60000); // 3 hour 1min
    result = dateAgoPipe.transform(timestamp, dateformat);
    expect(result).toEqual('In 3 hour(s)');

    timestamp = +new Date(Date.now() + 24 * 60 * 60 * 1000 + 60000); // 1 day 1min
    result = dateAgoPipe.transform(timestamp, dateformat);
    expect(result).toEqual('In 24 hour(s)');

    let angularDateFormat = new DatePipe('en-US').transform(+new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 60000));
    timestamp = +new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 60000); // 3 days 1min
    result = dateAgoPipe.transform(timestamp, dateformat);
    expect(result).toEqual('In 3 day(s)');

    timestamp = +new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 60000); // 1 week 1min
    result = dateAgoPipe.transform(timestamp, dateformat);
    expect(result).toEqual('In 7 day(s)');

    angularDateFormat = new DatePipe('en-US').transform(+new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 60000));
    timestamp = +new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 60000); // 2 weeks 1min
    result = dateAgoPipe.transform(timestamp, dateformat);
    expect(result).toEqual('In 2 week(s)');

    timestamp = +new Date(Date.now() + 30 * 24 * 60 * 60 * 1000 + 60000); // 1 month 1min
    result = dateAgoPipe.transform(timestamp, dateformat);
    expect(result).toEqual('In 4 week(s)');

    angularDateFormat = new DatePipe('en-US').transform(+new Date(Date.now() + 60 * 24 * 60 * 60 * 1000));
    timestamp = +new Date(Date.now() + 60 * 24 * 60 * 60 * 1000 + 60000); // 2 month 1min
    result = dateAgoPipe.transform(timestamp, dateformat);
    expect(result).toEqual('In 2 month(s)');

    timestamp = +new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 + 60000); // 1 year 1min
    result = dateAgoPipe.transform(timestamp, dateformat);
    expect(result).toEqual('In 12 month(s)');

    angularDateFormat = new DatePipe('en-US').transform(+new Date(Date.now() + 730 * 24 * 60 * 60 * 1000));
    timestamp = +new Date(Date.now() + 730 * 24 * 60 * 60 * 1000 + 60000); // 2 year 1min
    result = dateAgoPipe.transform(timestamp, dateformat);
    expect(result).toEqual('In 2 year(s)');

    // angularDateFormat = new DatePipe('en-US').transform(+new Date(Date.now() + 730 * 24 * 60 * 60 * 1000));
    // timestamp = +new Date(Date.now() + 730 * 24 * 60 * 60 * 1000 + 60000); // 2 years 1min
    // result = dateAgoPipe.getFutureText('', 0, timestamp);
    // expect(result).toEqual(angularDateFormat);

  });
});
