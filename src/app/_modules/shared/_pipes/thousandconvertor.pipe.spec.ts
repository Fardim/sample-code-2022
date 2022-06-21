import { ThousandconvertorPipe } from './thousandconvertor.pipe';
import { async } from '@angular/core/testing';

describe('ThousandconvertorPipe', () => {
  const pipeObj = new ThousandconvertorPipe();
  it('create an instance', () => {
    const pipe = new ThousandconvertorPipe();
    expect(pipe).toBeTruthy();
  });

  it('should display in k format', () => {
    const pipe = new ThousandconvertorPipe();
    const mockvalue = 675467;
    const result = pipe.transform(mockvalue);
    expect(result).toEqual('675k');
    const mockvalue1 = undefined;
    const result1 = pipe.transform(mockvalue1);
    expect(result1).toEqual('0');
    const mockvalue2 = 72823726;
    const result2 = pipe.transform(mockvalue2);
    expect(result2).toEqual('72M');
    const mockvalue3 = 76545768952;
    const result3 = pipe.transform(mockvalue3);
    expect(result3).toEqual('76B');
  });

  it('convertNumber(), should convert number ', async(()=>{
    const mockvalue = 675467;
    const result = pipeObj.transform(mockvalue);
    expect(result).toEqual('675k');
    const mockvalue1 = undefined;
    const result1 = pipeObj.transform(mockvalue1);
    expect(result1).toEqual('0');
    const mockvalue2 = 72823726;
    const result2 = pipeObj.transform(mockvalue2);
    expect(result2).toEqual('72M');
    const mockvalue3 = 76545768952;
    const result3 = pipeObj.transform(mockvalue3);
    expect(result3).toEqual('76B');
    const mockvalue4 = 376;
    const result4 = pipeObj.transform(mockvalue4);
    expect(result4).toEqual('376');
  }));
});

