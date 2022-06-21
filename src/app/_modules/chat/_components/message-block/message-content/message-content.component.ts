import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MessageDetails } from '@modules/chat/_common/chat';
import { Block, BlockElementTypes } from 'mdo-ui-library';

@Component({
  selector: 'pros-message-content',
  templateUrl: './message-content.component.html',
  styleUrls: ['./message-content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessageContentComponent implements OnChanges {

  @Input() message: MessageDetails;
  constructor() { }

  /**
   * Detect changes and update the message
   * @param changes SimpleChanges
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.message?.currentValue) {
      this.message = changes.message.currentValue;
    }
  }
}
