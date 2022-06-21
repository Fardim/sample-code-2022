import { ElementRef, Renderer2 } from '@angular/core';
import { CorrectedValueDirective } from './corrected-value.directive';

describe('CorrectedValueDirective', () => {
  const elRef = new ElementRef({ elementRef: true });
  const renderer2: any = Renderer2;
  it('should create an instance', () => {
    const directive = new CorrectedValueDirective(elRef, renderer2);
    expect(directive).toBeTruthy();
  });
});
