import { Directive, ElementRef, HostListener, Input, OnDestroy, OnInit } from '@angular/core';

@Directive({
  selector: '[inputPreventKey]',
})
export class InputPreventKeyDirective {
  @Input() keyList: string[] = ['Space'];

  @HostListener('keypress', ['$event']) onKeyDown(event: KeyboardEvent) {
    if (this.keyList?.includes(event.code)) {
      event.preventDefault(); //stop propagation
    }
  }
}
