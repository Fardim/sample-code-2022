import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InfiniteScrollDirective } from './infinite-scroll.directive';

describe('InfiniteScrollDirective', () => {

  let fixture: ComponentFixture<any>;
  let testComponent: ScrollTestComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InfiniteScrollDirective, ScrollTestComponent]
    });

    fixture = TestBed.createComponent(ScrollTestComponent);
    testComponent = fixture.debugElement.componentInstance;
    fixture.detectChanges();
  })

  it('should create an instance', () => {
    const directive = new InfiniteScrollDirective();
    expect(directive).toBeTruthy();
  });

  it('should set scroll coeff', () => {

    testComponent.bufferPercentage = 'wrong value';
    fixture.detectChanges();
    expect(testComponent.scrollInstance.bufferPercentage).toEqual(1);

    testComponent.bufferPercentage = 20;
    fixture.detectChanges();
    expect(testComponent.scrollInstance.bufferPercentage).toEqual(0.8);

  })

  it('should call scroll end', () => {

    /* const scrollContainer = fixture.debugElement.nativeElement.querySelector('div');
    console.log(scrollContainer.clientHeight);
    console.log(scrollContainer.scrollHeight); */
    spyOn(testComponent, 'onScrollEnd');

    const event = {
      target: {
        scrollHeight: 100,
        offsetHeight: 50,
        scrollTop: 90
      }
    };

    testComponent.scrollInstance.onContainerScroll(event);
    testComponent.scrollInstance.onContainerScroll(event);
    expect(testComponent.onScrollEnd).toHaveBeenCalledTimes(1);

  })

});

@Component({
  template: `
  <div
    style="height:20px; width: 200px; overflow-y:scroll"
    prosInfiniteScroll
    [bufferPercentage]="bufferPercentage"
    (scrollEnd)="onScrollEnd()"
  >
  {{ content }}
</div>
  `
})
class ScrollTestComponent {
  @ViewChild(InfiniteScrollDirective) scrollInstance: InfiniteScrollDirective;
  bufferPercentage;
  content = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi. Proin porttitor, orci nec nonummy molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat.'
  onScrollEnd() {}
}
