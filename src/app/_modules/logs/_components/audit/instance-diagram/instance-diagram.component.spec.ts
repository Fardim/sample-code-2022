import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstanceDiagramComponent } from './instance-diagram.component';

describe('InstanceDiagramComponent', () => {
  let component: InstanceDiagramComponent;
  let fixture: ComponentFixture<InstanceDiagramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InstanceDiagramComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InstanceDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
