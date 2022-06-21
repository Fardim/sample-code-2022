import { AfterViewInit, Component, ElementRef, HostBinding, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
    selector: 'pros-skeleton-loader',
    styleUrls: ['./skeleton-loader.component.scss'],
    templateUrl: 'skeleton-loader.component.html'
})

export class SkeletonLoaderComponent implements AfterViewInit {
    private _loading = false;
    @Input() set loading(value: boolean) {
        if (value) {
            this._loading = value;
        }
        this.loadingSubject.next(value);
    }
    @Input() tableView = false;
    @HostBinding('class') get className() {
        return this._loading ? 'visible' : 'hidden';
    }
    scrollOffset = 0;
    @HostBinding('style') get hostStyle() {
        const marginTop = 100;
        let style: any = {
            top: `${marginTop}px`
        };
        if (this.tableView) {
            let marginLeft = (document.querySelector('.dataset-grid-navigation,.listset-navigation') as HTMLElement)?.offsetWidth;
            marginLeft = marginLeft ? marginLeft + 20 : 0;
            style = {
                marginLeft: `${marginLeft}px`,
                top: `${marginTop + 100}px`,
                width: `calc(100% - ${marginLeft + 20}px)`,
                height: `calc(100% - 200px)`
            };
        }
        return style;
    }
    private loadingSubject = new Subject<boolean>();
    constructor(
        private elementRef: ElementRef
    ) {
        this.loadingSubject.pipe(debounceTime(1000)).subscribe((value: boolean) => {
            this._loading = value;
        });
    }
    ngAfterViewInit() {
        // Subscribe to parent element's scroll event
        const parent: HTMLElement = this.elementRef?.nativeElement.offsetParent;
        if(parent) {
            parent.addEventListener('scroll', () => {
                this.scrollOffset = parent.scrollTop;
            });
        }
    }
}