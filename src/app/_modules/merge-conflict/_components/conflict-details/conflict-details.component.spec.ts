import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { ConflictDetailsComponent } from './conflict-details.component';

describe('ConflictDetailsComponent', () => {
  let component: ConflictDetailsComponent;
  let fixture: ComponentFixture<ConflictDetailsComponent>;
  const routeParams = { crId: '1705', massId:'' };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConflictDetailsComponent ],
      imports: [ AppMaterialModuleForSpec, SharedModule, RouterTestingModule ],
      providers: [
        { provide: ActivatedRoute, useValue: { params: of(routeParams)}}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConflictDetailsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggleMergeSelection', () => {

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

    component.toggleMergeSelection(field, 'base');
    expect(field.base.isChecked).toBeTrue();

    component.toggleMergeSelection(field, 'cr');
    expect(field.cr.isChecked).toBeTrue();

  });

  it('should getMergeSelection', () => {

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

    expect(component.getMergeSelection(field)).toEqual('base');

    component.toggleMergeSelection(field, 'cr');
    expect(component.getMergeSelection(field)).toEqual('cr');
  });

  it('should globalToggleMergeSelection', () => {

    component.conflictedRecordDetails = {
      header: {
        fields : [
        {
          fieldId: 'MATL_GRP',
          fieldDesc: 'Material group',
          base: {
            value: '1701',
            isChecked: true,
            enabled: true
          },
          cr: {
            value: '1702',
            isChecked: true,
            enabled: true
          }
        },
        {
          fieldId: 'Color',
          fieldDesc: 'Color',
          base: {
            value: 'blue',
            isChecked: false,
            enabled: true
          },
          cr: {
            value: 'red',
            isChecked: false,
            enabled: true
          }
        }
      ],
      grids: []
      },
      hierarchy: [
        {
          hierarchyId: 'PLANT_A',
          hierarchyDesc: 'Plant A',
          fields: [
            {
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
            }
          ],
          childs: [
            {
              hierarchyId: 'VALUATION_A',
              hierarchyDesc: 'Valuation A',
              fields: [
                {
                  fieldId: 'V_Field',
                  fieldDesc: 'child field',
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
                }
              ],
              childs: [
                {
                  hierarchyId: 'SubChild_hierarchy',
                  hierarchyDesc: 'SubChild hierarchy',
                  fields: [
                    {
                      fieldId: 'SubChild_Field',
                      fieldDesc: 'SubChild field',
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
                    }
                  ],
                  childs: [],
                  grids: []
                }
              ],
              grids: []
            }
          ],
          grids: []
        }
      ]
    };

    component.globalToggleMergeSelection('base');
    expect(component.conflictedRecordDetails.header.fields[0].base.isChecked).toBeTrue();

    component.globalToggleMergeSelection('cr');
    expect(component.conflictedRecordDetails.header.fields[0].cr.isChecked).toBeTrue();
  });

  it('should hasFieldPermission', () => {

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

    expect(component.hasFieldPermission(field)).toBeTrue();

    field.base.enabled = false;
    expect(component.hasFieldPermission(field)).toBeFalse();
  });
});
