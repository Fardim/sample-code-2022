import { Directive, HostListener } from '@angular/core';
import { MatExpansionPanelHeader } from '@angular/material/expansion';

@Directive({
  selector: '[prosExpansionPanelToggleHandler]'
})
export class ExpansionPanelToggleHandlerDirective {

  constructor(private matExpansionPanel: MatExpansionPanelHeader) { }

  @HostListener('click', ['$event'])
  onToggle(event) {
    this.matExpansionPanel._toggle();
    if (this._isExpansionIndicator(event.target)) {
      this.matExpansionPanel._toggle();
    }
  }

  private _isExpansionIndicator(target: EventTarget | any): boolean {
    const expansionIndicatorClass = 'mat-expansion-indicator';
    return (
      target.classList && target.classList.contains(expansionIndicatorClass)
    );
  }

}