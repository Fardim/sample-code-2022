import { Directive, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Directive({
  selector: '[prosInfiniteScroll]',
})
export class InfiniteScrollDirective {
  @Input()
  set bufferPercentage(value) {
    if (value && !isNaN(value) && value < 100) {
      this.ratio = (100 - value) / 100;
    }
  }
  get bufferPercentage(): any {
    return this.ratio;
  }

  @Output()
  scrollEnd: EventEmitter<boolean> = new EventEmitter();

  @Output()
  scrollToTop: EventEmitter<boolean> = new EventEmitter();

  scrollLimitReached = false;

  private ratio = 1;

  constructor() {}

  @HostListener('scroll', ['$event'])
  onContainerScroll(event) {
    const scrollHeight = event.target.scrollHeight;
    const offsetHeight = event.target.offsetHeight;
    const scrollTop = event.target.scrollTop;

    if (scrollTop === 0) {
      this.scrollToTop.emit();
    }

    if (scrollTop >= (scrollHeight - offsetHeight) * this.ratio) {
      if (!this.scrollLimitReached) {
        this.scrollLimitReached = true;
        this.scrollEnd.emit(true);
      }
    } else {
      this.scrollLimitReached = false;
    }
  }
}
