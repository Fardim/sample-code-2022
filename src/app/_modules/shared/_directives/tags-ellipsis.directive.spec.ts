import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TagsEllipsisDirective } from './tags-ellipsis.directive';
import { Injectable, Component, ElementRef, ChangeDetectorRef } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

@Injectable()
export class MockElementRef {
  nativeElement: {}
}

@Component({
  template: ``
})
class DummyComponent {
}

export class MockChangeDetectorRef implements ChangeDetectorRef {
  markForCheck(): void { }
  detach(): void { }
  detectChanges(): void { }
  checkNoChanges(): void { }
  reattach(): void { }
}

describe('TagsEllipsisDirective', () => {
  const elRef = new ElementRef({ elementRef: true });
  let directive: TagsEllipsisDirective;
  let fixture: ComponentFixture<DummyComponent>;

  beforeEach(async(() => {
    TestBed
      .configureTestingModule({
        imports: [
          RouterTestingModule,
          AppMaterialModuleForSpec
        ],
        providers: [
          { provide: ChangeDetectorRef, useClass: MockChangeDetectorRef },
        ],
      })
      .compileComponents();
  }));

  beforeEach(async () => {
    fixture = TestBed.createComponent(DummyComponent);
    directive = new TagsEllipsisDirective(elRef);
    fixture.detectChanges();
    fixture.whenStable();
  });


  it('should create an instance', async () => {
    expect(directive).toBeTruthy();
  });

  it('ngAfterViewInit() should manupilate HTML', async () => {
    directive.tags = [{
      name: 'tag1',
      color: 'red'
    }]
    directive.ngAfterViewInit();
    directive.checkForMoreTags();
    expect(directive.html).not.toBeNull()
  });

  it('should create tags for more than 2', async () => {
    directive.tags = [{
      name: 'tag1',
      color: 'red'
    }, {
      name: 'tag2',
      color: 'blue'
    }, {
      name: 'tag3',
      color: 'blue'
    }];
    directive.checkForMoreTags()
    expect(directive.html).not.toBe(null)
  })
});
