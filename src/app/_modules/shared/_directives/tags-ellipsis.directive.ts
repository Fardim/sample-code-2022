import { Directive, ElementRef, Input, AfterViewInit, HostListener } from '@angular/core';

@Directive({
  selector: '[prosTagsEllipsis]'
})
export class TagsEllipsisDirective implements AfterViewInit {
  /**
   * List of tags from the service
   */
  @Input() tags;
  html = '';
  constructor(public el: ElementRef) { }

  /**
   * Event Hook
   */
  ngAfterViewInit() {
    this.tags.forEach((tag, index) => {
      if (index < 2) {
        this.html = this.html + `<mat-chip class="mat-chip mat-focus-indicator mat-standard-chip">${tag.value}</mat-chip>`;
      }
    });
    // this will be worked on once the drag and drog changes are done in API
    // this.checkForMoreTags();
    this.el.nativeElement.innerHTML = this.html;
  }

  checkForMoreTags() {
    if (this.tags.length > 2) {
      this.html = this.html + `<button class="mat-focus-indicator moretag mat-icon-button mat-button-base mat-primary" (click)="showAll()">+${this.tags.length - 2}</button>`;
      const moreThantwo = this.tags.splice(2);
      this.html = this.html + `<mat-menu class="mat-menu-panel ng-trigger ng-trigger-transformMenu mat-menu-after mat-elevation-z4 ng-star-inserted mat-menu-above" style="display:none;position: absolute;z-index: 1;">`;
      moreThantwo.forEach((tag) => {
        this.html = this.html + `<a class="mat-focus-indicator mat-menu-item"><mat-chip class="mat-chip mat-focus-indicator mat-standard-chip">${tag.value}</mat-chip></a>`;
      });
      this.html = this.html + `</mat-menu>`;
    }
  }

  @HostListener('click') onClick() {
    const listItem = this.el.nativeElement.children[3] as HTMLElement;
    listItem.style.display = listItem.style.display === 'block' ? 'none' : 'block';
  }
}
