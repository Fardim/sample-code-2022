import { async, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { ConnectorContainerDirective } from './connector-container.directive';

describe('ConnectorContainerDirective', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({ declarations: [StubComponent] }).compileComponents();
  }));

  it('should create an instance', () => {
    const fixture = TestBed.createComponent(StubComponent);
    const component = fixture.debugElement.componentInstance;

    const directive = new ConnectorContainerDirective(component);
    expect(directive).toBeTruthy();
  });
});


@Component({ selector: 'pros-app-stub', template: '' })
class StubComponent {}
