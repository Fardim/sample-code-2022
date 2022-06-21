import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { ClassLanguageSideSheetComponent } from './class-language-side-sheet.component';

describe('ClassLanguageSideSheetComponent', () => {
  let component: ClassLanguageSideSheetComponent;
  let fixture: ComponentFixture<ClassLanguageSideSheetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ClassLanguageSideSheetComponent],
      imports: [AppMaterialModuleForSpec, SharedModule],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassLanguageSideSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('close', () => {
    spyOn(component, 'close').and.callThrough();
    component.close();
    expect(component.close).toHaveBeenCalled();
  });
});
