import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[prosConnectorContainer]'
})
export class ConnectorContainerDirective {

  constructor(public viewContainerRef: ViewContainerRef) {
  }

}
