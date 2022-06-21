import { SubstringPipe } from './substringpipe.pipe';
import { async } from '@angular/core/testing';

describe('SubstringPipe', () => {
  it('create an instance', () => {
    const pipe = new SubstringPipe();
    expect(pipe).toBeTruthy();
  });

  it('transform: test transform method', async(() => {
    const pipeObject = new SubstringPipe();
    const mockString = 'Function Location for  Group(s) testing';
    const actualString =  pipeObject.transform(mockString);
    expect(actualString).toEqual('Function Location for  Group(s) te..');
    const mockString1 = 'Prospecta';
    const actualString1 =  pipeObject.transform(mockString1);
    expect(actualString1).toEqual('Prospecta');
    const mockString2 = '';
    const actualString2 =  pipeObject.transform(mockString2);
    expect(actualString2).toEqual('');

  }));
});
