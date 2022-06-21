import { SimpleChanges } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { HighlightPipe } from '@modules/shared/_pipes/highlight.pipe';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { SourceFieldComponent } from './source-field.component';

describe('SourceFieldComponent', () => {
  let component: SourceFieldComponent;
  let fixture: ComponentFixture<SourceFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SourceFieldComponent ],
      imports: [ AppMaterialModuleForSpec, SharedModule ],
      providers: [ HighlightPipe ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SourceFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  // Test case for ngOnInit()
  it('ngOnChanges(), should initiate the search control', () => {
    const changes: SimpleChanges = {
      selected: {
        currentValue: true,
        previousValue: null,
        firstChange: false,
        isFirstChange: () => false
      },
      searchTerm: {
        currentValue: 'search',
        previousValue: null,
        firstChange: false,
        isFirstChange: () => false
      },
      hasMapping: {
        currentValue: true,
        previousValue: null,
        firstChange: false,
        isFirstChange: () => false
      },
    };
    component.ngOnChanges(changes);
    expect(component.selected).toBeTruthy();
    expect(component.searchTerm).toEqual('search');
    expect(component.hasMapping).toBeTruthy();
  });
});
