import { Directive, Input, ElementRef, OnInit, Injectable, OnDestroy } from '@angular/core';
import { distinctUntilChanged } from 'rxjs/operators';
import { Subscription, Observable } from 'rxjs';
@Injectable()
@Directive({
  selector: '[prosResizeable]'
})
export class ResizeableDirective implements OnInit, OnDestroy {

  @Input() summaryShown: Observable<any>;
  @Input() resizableGrabWidth = 2;
  @Input() resizableMinWidth = 10;
  @Input() selectedTaskId;

  dragging: boolean;
  commonSubsription: Subscription;

  mouseMoveG = (evt) => {
    if (!this.dragging) {
      return;
    }
    this.newWidth(evt.clientX - this.el.nativeElement.offsetLeft)
    evt.stopPropagation();
  };

  newWidth = (wid) => {
    const updatedWidth = Math.max(this.resizableMinWidth, wid);
    this.el.nativeElement.style.width = (updatedWidth) + 'px';
  }

  preventGlobalMouseEvents() {
    document.body.style['pointer-events'] = 'none';
  }

  restoreGlobalMouseEvents() {
    document.body.style['pointer-events'] = 'auto';
  }

  mouseUpG = (evt) => {
    if (!this.dragging) {
      return;
    }
    this.restoreGlobalMouseEvents();
    this.dragging = false;
    evt.stopPropagation();
  };

  mouseDown = (evt) => {
    if (this.inDragRegion(evt)) {
      this.dragging = true;
      this.preventGlobalMouseEvents();
      evt.stopPropagation();
    }
  };

  mouseMove = (evt) => {
    if ((this.inDragRegion(evt) || this.dragging)) {
      this.el.nativeElement.style.cursor = 'col-resize';
    } else {
      this.el.nativeElement.style.cursor = 'default';
    }
  }


  constructor(public el: ElementRef) {
    document.addEventListener('mousemove', this.mouseMoveG, true);
    document.addEventListener('mouseup', this.mouseUpG, true);
    this.preventGlobalMouseEvents();
    this.restoreGlobalMouseEvents();
  }

  ngOnInit(): void {
    this.summaryShown.pipe(distinctUntilChanged()).subscribe((value) => {
      this.el.nativeElement.style['border-right'] = value ? this.resizableGrabWidth + 'px solid rgba(0, 0, 0, 0.12)' : null;
      this.el.nativeElement.addEventListener('mousedown', this.mouseDown, true);
      this.el.nativeElement.addEventListener('mousemove', this.mouseMove, true);
    })
  }

  inDragRegion(evt) {
    if (this.el.nativeElement) {
      return (this.el.nativeElement.clientWidth - evt.clientX + this.el.nativeElement.offsetLeft) < this.resizableGrabWidth;
    }
  }

  ngOnDestroy() {
    if (this.commonSubsription) {
      this.commonSubsription.unsubscribe();
    }
  }
}

