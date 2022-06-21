import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassCharacteristicsComponent } from './class-characteristics.component';

describe('ClassCharacteristicsComponent', () => {
  let component: ClassCharacteristicsComponent;
  let fixture: ComponentFixture<ClassCharacteristicsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ClassCharacteristicsComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassCharacteristicsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
