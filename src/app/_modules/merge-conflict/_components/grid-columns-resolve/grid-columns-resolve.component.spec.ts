import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { GridColumnsResolveComponent } from './grid-columns-resolve.component';

describe('GridColumnsResolveComponent', () => {
  let component: GridColumnsResolveComponent;
  let fixture: ComponentFixture<GridColumnsResolveComponent>;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GridColumnsResolveComponent ],
      imports: [ AppMaterialModuleForSpec, SharedModule, RouterTestingModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GridColumnsResolveComponent);
    component = fixture.componentInstance;

    router = fixture.debugElement.injector.get(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggleMergeSelection', () => {
    component.conflictedRow = {
      _action: {
        selectedRow: '',
        isRetain: false
      },
      fields: [
        {
          fieldId: 'field1',
          fieldDesc: 'Field 1',
          base: {
            value: 'base_value',
            isChecked: true,
            enabled: true
          },
          cr: {
            value: 'cr_value',
            isChecked: false,
            enabled: true
          }
        },
        {
          fieldId: 'field2',
          fieldDesc: 'Field 2',
          base: {
            value: 'base_value',
            isChecked: true,
            enabled: true
          },
          cr: {
            value: 'cr_value',
            isChecked: false,
            enabled: true
          }
        }
      ]
    };
    const field = {
      fieldId: 'Field',
      fieldDesc: 'Field 1',
      base: {
        value: 'base value',
        isChecked: false,
        enabled: true
      },
      cr: {
        value: 'cr value',
        isChecked: false,
        enabled: true
      }
    };

    component.toggleMergeSelection(field, 'BASE');
    expect(field.base.isChecked).toBeTrue();

    component.toggleMergeSelection(field, 'CR');
    expect(field.cr.isChecked).toBeTrue();

  });

  it('should getMergeSelection', () => {
    component.conflictedRow = {
      _action: {
        selectedRow: '',
        isRetain: false
      },
      fields: [
        {
          fieldId: 'field1',
          fieldDesc: 'Field 1',
          base: {
            value: 'base_value',
            isChecked: true,
            enabled: true
          },
          cr: {
            value: 'cr_value',
            isChecked: false,
            enabled: true
          }
        },
        {
          fieldId: 'field2',
          fieldDesc: 'Field 2',
          base: {
            value: 'base_value',
            isChecked: true,
            enabled: true
          },
          cr: {
            value: 'cr_value',
            isChecked: false,
            enabled: true
          }
        }
      ]
    };
    const field = {
      fieldId: 'Field',
      fieldDesc: 'Field 1',
      base: {
        value: 'base value',
        isChecked: true,
        enabled: true
      },
      cr: {
        value: 'cr value',
        isChecked: false,
        enabled: true
      }
    };

    expect(component.getMergeSelection(field)).toEqual('BASE');

    component.toggleMergeSelection(field, 'CR');
    expect(component.getMergeSelection(field)).toEqual('CR');
  });

  it('should globalToggleMergeSelection', () => {

    component.conflictedRow = {
      _action: {
        selectedRow: '',
        isRetain: false
      },
      fields: [
        {
          fieldId: 'field1',
          fieldDesc: 'Field 1',
          base: {
            value: 'base_value',
            isChecked: true,
            enabled: true
          },
          cr: {
            value: 'cr_value',
            isChecked: false,
            enabled: true
          }
        },
        {
          fieldId: 'field2',
          fieldDesc: 'Field 2',
          base: {
            value: 'base_value',
            isChecked: true,
            enabled: true
          },
          cr: {
            value: 'cr_value',
            isChecked: false,
            enabled: true
          }
        }
      ]
    };

    component.globalToggleMergeSelection('BASE');
    expect(component.conflictedRow._action.selectedRow).toEqual('BASE');

    component.globalToggleMergeSelection('CR');
    expect(component.conflictedRow._action.selectedRow).toEqual('CR');
  });

  it('Should close', () => {
    spyOn(router, 'navigate');
    component.close();
    expect(router.navigate).toHaveBeenCalledWith([{outlets: {outer: null}}], { queryParamsHandling: 'preserve'});
  });

});
