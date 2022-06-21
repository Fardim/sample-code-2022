import { TestBed, async } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { HighlightPipe } from './highlight.pipe';

describe('HighlightPipe', () => {

  let pipe: HighlightPipe;
  let sanitized: DomSanitizer;

  beforeEach(async() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: DomSanitizer,
          useValue: {
            sanitize: (ctx: any, val: string) => val,
            bypassSecurityTrustHtml: (val: string) => val,
          }
        }
      ]
    });
    sanitized = TestBed.inject(DomSanitizer);
    // pipe = new HighlightPipe(sanitized);
  });

  it('create an instance', () => {
    pipe = new HighlightPipe(sanitized);
    expect(pipe).toBeTruthy();
  });

  it('transform()', async(() => {
    pipe = new HighlightPipe(sanitized);
    const transformed = pipe.transform('HTML', 'ht');
    expect(transformed).toEqual('<mark>HT</mark>ML');

    const transformed1 = pipe.transform('HTML', '');
    expect(transformed1).toEqual('HTML');

    const transformed2 = pipe.transform('HTML', 'hg');
    expect(transformed2).toEqual('HTML');
  }));

});
