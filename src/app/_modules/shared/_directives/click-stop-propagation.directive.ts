import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[prosClickStopPropagation]'
})
export class ClickStopPropagationDirective {

  constructor() { }

  @HostListener('click', ['$event'])
  public onClick(event: Event): void {
    event.stopPropagation();
  }

}

