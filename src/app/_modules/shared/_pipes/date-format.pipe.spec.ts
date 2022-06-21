import { DateFormatPipe } from './date-format.pipe';

describe('DateFormatPipe', () => {
  it('create an instance', () => {
    const pipe = new DateFormatPipe('');
    expect(pipe).toBeTruthy();
  });

  it('transform: test transform method', () => {
    const tableHeader = new DateFormatPipe('en-US');
    const mockString = '1561634896415';
    const dateformat = 'MM.dd.yyyy'
    const actualString =  tableHeader.transform(mockString, dateformat);
    expect(actualString).toEqual('06.27.2019');
  });
});
