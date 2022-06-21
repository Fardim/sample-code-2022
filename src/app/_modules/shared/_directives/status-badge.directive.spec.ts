import { Component, DebugElement, ViewChild, ViewEncapsulation } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatBadgeModule } from '@angular/material/badge';
import { By } from '@angular/platform-browser';
import { StatusBadgeDirective } from './status-badge.directive';

describe('StatusBadgeDirective', () => {
  let fixture: ComponentFixture<any>;
  let badgeNativeElement: HTMLElement;
  let badgeDebugElement: DebugElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StatusBadgeDirective, BadgeTestComponent ],
      imports: [ MatBadgeModule ]
    })
    .compileComponents();


    fixture = TestBed.createComponent(BadgeTestComponent);
    fixture.detectChanges();


    badgeDebugElement = fixture.debugElement.query(By.directive(StatusBadgeDirective));
    badgeNativeElement = badgeDebugElement.nativeElement;
  }));

  it('should create an instance', () => {
    const directive = new StatusBadgeDirective(BadgeTestComponent as any);
    expect(directive).toBeTruthy();
  });

  it('prosStatusBadge, should set the value of badge', async () => {
    const badgeElement = badgeNativeElement.querySelector('.status-badge-icon');
    expect(badgeElement.textContent).toContain('plus');
  });
});



/** Test component that contains a MatBadge. */
@Component({
  // Explicitly set the view encapsulation since we have a test that checks for it.
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <span matBadge
          prosStatusBadge
          badgeIcon="plus"
          [statusBadgePosition]="{ top: 10, right: -11 }"
          badgeIconFont="solid"
          badgeType="error">
      home
    </span>
  `
})
class BadgeTestComponent {
  @ViewChild(StatusBadgeDirective) badgeInstance: StatusBadgeDirective;

}
