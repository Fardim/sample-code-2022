import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { MapFieldsSideSheetComponent } from './map-fields-side-sheet.component';

describe('MapFieldsSideSheetComponent', () => {
    let component: MapFieldsSideSheetComponent;
    let fixture: ComponentFixture<MapFieldsSideSheetComponent>;
    let router: Router;
    const routeParams = { id: '1005' };

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MapFieldsSideSheetComponent],
            imports: [AppMaterialModuleForSpec, HttpClientTestingModule, RouterTestingModule, SharedModule],
            providers: [
                { provide: ActivatedRoute, useValue: { params: of(routeParams) } },
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MapFieldsSideSheetComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ngOnInit(), should call ngOnInit', (() => {
        component.ngOnInit();
        expect(component.ngOnInit).toBeTruthy();
    }));

    it('it should close the dialog', () => {
        spyOn(router, 'navigate');
        component.close();
        expect(router.navigate).toHaveBeenCalled();
    });

    it('it should call viewResults()', () => {
        spyOn(router, 'navigate');
        component.viewResults();
        expect(router.navigate).toHaveBeenCalled();
    });

});
