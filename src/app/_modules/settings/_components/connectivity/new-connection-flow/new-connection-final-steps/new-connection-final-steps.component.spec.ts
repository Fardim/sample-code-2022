import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { NewConnectionFinalStepsComponent } from './new-connection-final-steps.component';

describe('NewConnectionFinalStepsComponent', () => {
  let component: NewConnectionFinalStepsComponent;
  let fixture: ComponentFixture<NewConnectionFinalStepsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewConnectionFinalStepsComponent ],
      imports:  [ SharedModule, RouterTestingModule, AppMaterialModuleForSpec ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewConnectionFinalStepsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
