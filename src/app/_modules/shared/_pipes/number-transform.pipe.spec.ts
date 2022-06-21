import { NumberTransformPipe } from './number-transform.pipe';

describe('NumberTransformPipe', () => {
  it('create an instance', () => {
    const pipe = new NumberTransformPipe();
    expect(pipe).toBeTruthy();
  });

  it('transform: test transform method', (() => {
    const pipeObject = new NumberTransformPipe();
    const value = 854854.987456;
    const actualString =  pipeObject.transform(value, { decimalCharacter: '*', separator: '__', decimalPlaces: 6});
    expect(actualString).toEqual('854__854*987456');
  }));
});
