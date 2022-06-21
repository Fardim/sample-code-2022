import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[prosContainerRef]',
  exportAs: 'prosContainerRef'
})
export class ContainerRefDirective {

  constructor(public viewContainerRef : ViewContainerRef) { }

}
