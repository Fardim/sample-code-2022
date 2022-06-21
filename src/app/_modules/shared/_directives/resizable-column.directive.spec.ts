import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResizableColumnDirective } from './resizable-column.directive';


describe('ResizableColumnDirective', () => {

  let fixture: ComponentFixture<any>;
  let testComponent: ResizeTestComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ResizableColumnDirective, ResizeTestComponent]
    });

    fixture = TestBed.createComponent(ResizeTestComponent);
    testComponent = fixture.debugElement.componentInstance;
    fixture.detectChanges();

  });

  it('should set col index', () => {

    testComponent.index = 2;
    fixture.detectChanges();
    expect(testComponent.resizeInstance.index).toEqual(2);

  });

})

@Component({
  template: `
  <div prosResizableColumn [index]="index"
       (widthChanged)="widthChanged($event)">
  content
</div>
  `
})
class ResizeTestComponent {
  @ViewChild(ResizableColumnDirective) resizeInstance: ResizableColumnDirective;
  index = 1;
  widthChanged() {}
}