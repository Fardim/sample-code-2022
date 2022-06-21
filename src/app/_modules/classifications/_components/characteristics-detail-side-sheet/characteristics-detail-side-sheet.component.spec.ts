import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { CharacteristicsDetailSideSheetComponent   } from './characteristics-detail-side-sheet.component';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('CharacteristicsDetailSideSheetComponent  ', () => {
    let component: CharacteristicsDetailSideSheetComponent  ;
    let fixture: ComponentFixture<CharacteristicsDetailSideSheetComponent  >;
    let location: Location;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CharacteristicsDetailSideSheetComponent  ],
            imports: [AppMaterialModuleForSpec, HttpClientTestingModule, SharedModule],
            providers: [
                {
                  provide: ActivatedRoute,
                  useValue: {
                    params: of({
                      classTypeId: '87ggh78658hgd',
                    }),
                  },
                },
              ],
        }).compileComponents();
        location = TestBed.inject(Location);
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CharacteristicsDetailSideSheetComponent  );
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ngOnInit', () => {
        component.ngOnInit();
        expect(component.ngOnInit).toBeTruthy();
    });

    it('it should close the dialog', () => {
        spyOn(location, 'back');
        component.close();
        expect(location.back).toHaveBeenCalledTimes(1);
    });
});
