import { Directive, ElementRef, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[prosStatusBadge]'
})
export class StatusBadgeDirective implements OnInit, OnChanges {

  /**
   * the curent icon font being used
   */
  fontSet = 'mdo-icons';

  /**
   * Specify the icon to show
   */
  @Input()
  badgeIcon: string;

  /**
   * badge zindex
   */
  @Input()
  badgeZindex: number;

  /**
   * Specify the text to show
   */
   @Input()
   badgeText: string;

  /**
   * Set the icon type
   */
  @Input()
  set badgeType(val: string) {
    this.type = '';
    if (['info', 'warning', 'error', 'success'].indexOf(val) > -1) {
      this.type = val;
    }
  };

  /**
   * Specify the icon type
   */
  type = '';

  /**
   * Hold the position values
   */
  @Input()
  statusBadgePosition:any;

  /**
   * Set the icon font type e.g. solid | light | brand | duotone
   */
  @Input()
  set badgeIconFont(font: string) {
    if (font && font.trim()) {
      this.fontSet = `mdo-icons-${font.toLowerCase()}`;
    } else {
      this.fontSet = `mdo-icons`;
    }
  }

  constructor(private el: ElementRef) { }

  ngOnInit() {
    this.createBadge();
  }


  /**
   * Method to create a badge and inject it in the host element
   * @returns null;
   */
  createBadge() {
    const badge = this.el.nativeElement.querySelector('.mat-badge-content');

    if(!this.badgeIcon && !this.badgeText) {
      badge.style.display = 'none';
      return;
    }

    badge.style.display = 'flex';
    badge.style.alignItems = 'center';
    badge.style.backgroundColor = '#fff';
    badge.style.justifyContent = 'center';
    badge.style.boxShadow = '0px 0px 3px rgba(108, 124, 139, 0.5)';
    badge.style.zIndex = this.badgeZindex;

    if(this.statusBadgePosition) {
      badge.style.top = this.statusBadgePosition.top !== null && this.statusBadgePosition.top !== undefined? `${this.statusBadgePosition.top}px`: 'unset';
      badge.style.bottom = this.statusBadgePosition.bottom !== null && this.statusBadgePosition.bottom !== undefined? `${this.statusBadgePosition.bottom}px`: 'unset';
      badge.style.left = this.statusBadgePosition.left !== null && this.statusBadgePosition.left !== undefined? `${this.statusBadgePosition.left}px`: 'unset';
      badge.style.right = this.statusBadgePosition.right !== null && this.statusBadgePosition.right !== undefined? `${this.statusBadgePosition.right}px`: 'unset';
    }

    badge.innerHTML = `<i class="${this.fontSet} status-badge-icon ${this.type}">${this.badgeIcon}</i>`;
  }

  /**
   * Remove the current badge and create a new one
   */
  updateBadge() {
    const badge = this.el.nativeElement.querySelector('.status-badge-icon');

    badge?.remove();
    setTimeout(() => {
      this.createBadge();
    });
  }

  /**
   * Angular hook for detecting any changes
   * @param changes Interface containing all the input parameters
   */
  ngOnChanges(changes: SimpleChanges) {
    if(changes.badgeIcon && changes.badgeIcon.currentValue !== undefined) {
      this.updateBadge();
    }
  }
}
