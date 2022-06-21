import { async, TestBed } from '@angular/core/testing';
import { Injectable, Component, ElementRef, ChangeDetectorRef } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { ResizeableDirective } from './resizeable.directive';

@Injectable()
export class MockElementRef extends ElementRef {
    nativeElement: ElementRef
}

export class MockChangeDetectorRef implements ChangeDetectorRef {
    markForCheck(): void { }
    detach(): void { }
    detectChanges(): void { }
    checkNoChanges(): void { }
    reattach(): void { }
}

@Injectable()
@Component({
    template: '<button appTrackClick>Test</button>'
})
export class DummyComponent { }

describe('ResizeableDirective', () => {
    let directive: ResizeableDirective;
    let fixture;
    const elementRef = new ElementRef({
        style: {
            width: 0,
            clientWidth: 20000,
            offsetLeft: 1000
        }
    })

    beforeEach(async(() => {
        TestBed
            .configureTestingModule({
                imports: [
                    RouterTestingModule
                ],
                providers: [
                    ResizeableDirective,
                    { provide: ChangeDetectorRef, useClass: MockChangeDetectorRef },
                    { provide: ElementRef, useClass: MockElementRef },
                ],
                declarations: [
                    ResizeableDirective
                ]
            })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DummyComponent);
        directive = new ResizeableDirective(elementRef);
    });

    it('should call ngOnInit', async () => {
        fixture.detectChanges();
        expect(directive).toBeTruthy();
    });

    // it('should call newWidth()', async () => {
    //     directive.newWidth('200');
    //     expect(directive.el.nativeElement.style.width).toBe('200px')
    // });

    it('should call inDragRegion()', async () => {
        const evt = {
            clientX: 100
        }
        expect(directive.inDragRegion(evt)).toBe(false)
    });

    it('should call restoreGlobalMouseEvents()', async () => {
        const spy = spyOn(directive, 'restoreGlobalMouseEvents');
        directive.dragging = true;
        directive.mouseUpG(new Event('click'));
        fixture.detectChanges();
        expect(spy).toHaveBeenCalled();
    });


    it('should call mouseMove', async () => {
        directive.dragging = true;
        fixture.detectChanges();
        directive.mouseMove(new Event('click'));
        expect(directive.el.nativeElement.style.cursor).toBe('col-resize')
    });

    it('should call mouseDown', async () => {
        elementRef.nativeElement.style.clientWidth = 1000;
        elementRef.nativeElement.style.offsetLeft = 20;
        directive.mouseDown(new Event('click'));
        directive.resizableGrabWidth = 100;
        fixture.detectChanges();
        expect(directive.dragging).toEqual(undefined);
    });
});
