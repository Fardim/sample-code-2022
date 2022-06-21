import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassLanguageListComponent } from './class-language-list.component';

describe('ClassLanguageListComponent', () => {
  let component: ClassLanguageListComponent;
  let fixture: ComponentFixture<ClassLanguageListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ClassLanguageListComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassLanguageListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('ngOnInit(), should call ngOnInit', (() => {
    component.ngOnInit();
    expect(component.ngOnInit).toBeTruthy();
  }));

  it('addLanguage()', () => {
    spyOn(component, 'addLanguage').and.callThrough();
    const language = ['en', 'English'];
    component.addLanguage(language);
    expect(component.addLanguage).toHaveBeenCalled();
  });

  it('checkForLanguageChanges()', () => {
    spyOn(component, 'checkForLanguageChanges').and.callThrough();
    component.checkForLanguageChanges();
    expect(component.checkForLanguageChanges).toHaveBeenCalled();
  });

  it('_filter()', () => {
    spyOn(component, '_filter').and.callThrough();
    component.searchLanguageList = [{ id: 'en', name: 'test' }];
    component._filter('test');
    expect(component._filter).toHaveBeenCalled();
  });
});
