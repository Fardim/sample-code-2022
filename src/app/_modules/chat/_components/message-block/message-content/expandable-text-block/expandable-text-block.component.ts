import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'pros-expandable-text-block',
  templateUrl: './expandable-text-block.component.html',
  styleUrls: ['./expandable-text-block.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpandableTextBlockComponent implements OnChanges, OnInit {
  /**
   * actual message text
   */
  @Input() text: string;

  /**
   * message text limit
   * default value is 200
   */
  @Input() textLimit = 200;

  /**
   * toggle to show/hide hidden text
   */
  showHiddenText = false;
  constructor() {}

  ngOnInit(): void {
    this.showHiddenText = !this.showViewMoreBtn(this.text);
  }

  /**
   * detect changes and update the text
   * @param changes SimpleChanges
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.text) {
      this.text = changes.text.currentValue;
      this.showHiddenText = !this.showViewMoreBtn(this.text);
    }
  }

  /**
   * to check if we can show view more button for particular message
   * @param messageHTML current message HTML
   * @returns true/false
   */
  showViewMoreBtn(messageHTML: string): boolean {
    const span = document.createElement('span');
    span.innerHTML = messageHTML;
    return span.innerText.length > this.textLimit ? true : false;
  }

  /**
   * limit message string if it exceeds the limit
   * @param text message string
   * @returns limited message string
   */
  getMessageText(text: string) {
    const message =  text === '<p></p>' || text === '<p><br></p>' ? '' : text;
    return this.limitValue? message.substring(0, this.limitValue): message;
  }

  /**
   * reference to text limit
   */
  get limitValue(): number | null {
    return this.showHiddenText? null: this.textLimit;
  }
}
