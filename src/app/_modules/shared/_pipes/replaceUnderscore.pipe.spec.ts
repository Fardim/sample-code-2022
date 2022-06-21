import { ReplaceUnderscorePipe } from './replaceUnderscore.pipe';
import { async } from '@angular/core/testing';

describe('ReplaceUnderscorePipe', () => {
    it('create an instance', () => {
      const pipe = new ReplaceUnderscorePipe();
      expect(pipe).toBeTruthy();
    });

    it('transform: test transform method', async(() => {
      const pipeObject = new ReplaceUnderscorePipe();
      const mockString = 'test_string_with_underscore';
      const actualString =  pipeObject.transform(mockString);
      expect(actualString).toEqual('test string with underscore');
    }));
  });