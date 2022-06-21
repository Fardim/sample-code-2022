import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'pros-null-state',
  templateUrl: './null-state.component.html',
  styleUrls: ['./null-state.component.scss']
})
export class NullStateComponent implements OnInit {

  /**
   * Pass the custom icon path to show on the null state
   */
  @Input()
  iconPath = './assets/images/empty-table.svg';

  /**
   * configuration for icon width
   */
  @Input()
  iconWidth = 140;

  /**
   * pass the subtitle or sub text
   */
  @Input()
  subtext = 'Nothing to see here';

  /**
   * Pass the custom message to show
   */
  @Input()
  message = 'Your data check did not return any results. Please modify your parameters and try again.';

  /**
   * data to be used for button includes the icon and text to show
   */
  @Input()
  button = {
    text: 'Check Data',
    icon: 'wand'
  };

  /**
   * Event emitter for the button click event
   */
  @Output()
  action: EventEmitter<any> = new EventEmitter();
  constructor() { }

  ngOnInit(): void {
  }

  /**
   * Emit the click event
   */
  emitAction(){
    this.action.emit();
  }
}
