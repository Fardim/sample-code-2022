import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { ClassMutationSideSheetComponent } from './class-mutation-side-sheet.component';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('ClassMutationSideSheetComponent   ', () => {
    let component: ClassMutationSideSheetComponent;
    let fixture: ComponentFixture<ClassMutationSideSheetComponent>;
    let location: Location;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ClassMutationSideSheetComponent],
            imports: [AppMaterialModuleForSpec, HttpClientTestingModule, SharedModule],
            providers: [{
                provide: ActivatedRoute,
                useValue: {
                    params: of({
                        classId: '87ggh78658hgd',
                    }),
                    queryParams: of({})
                },
            }]
        }).compileComponents();
        location = TestBed.inject(Location);
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ClassMutationSideSheetComponent);
        component = fixture.componentInstance;
        window.history.pushState({
            classType: { classType: 'Test', nountype: true }
        }, '', '');
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ngOnInit(), should call ngOnInit', (() => {
        fixture.detectChanges();
        component.ngOnInit();
        expect(component.ngOnInit).toBeTruthy();
    }));

    it('it should close the dialog', () => {
        spyOn(location, 'back').and.callThrough();
        component.close();
        expect(location.back).toHaveBeenCalledTimes(1);
    });
});
