import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { SharedModule } from '@shared/shared.module';
import { RouterTestingModule } from '@angular/router/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateUrlComponent } from './generate-url.component';

describe('GenerateUrlComponent', () => {
  let component: GenerateUrlComponent;
  let fixture: ComponentFixture<GenerateUrlComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GenerateUrlComponent ],
      imports:  [ AppMaterialModuleForSpec, SharedModule, RouterTestingModule ],
      providers: [
        {
          provide: MatDialogRef,
          useValue: mockDialogRef
        }, 
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerateUrlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
