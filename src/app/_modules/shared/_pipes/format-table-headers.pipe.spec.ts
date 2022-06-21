import { FormatTableHeadersPipe } from './format-table-headers.pipe';

describe('FormatTableHeadersPipe', () => {
  it('create an instance', () => {
    const pipe = new FormatTableHeadersPipe();
    expect(pipe).toBeTruthy();
  });

  it('transform: test transform method', () => {
    const tableHeader = new FormatTableHeadersPipe();
    const mockString = '_';
    const actualString =  tableHeader.transform(mockString);
    expect(actualString).toEqual(' ');
  });
});
