import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { EmptyViewComponent } from './empty-view.component';

describe('EmptyViewComponent', () => {
    let component: EmptyViewComponent;
    let fixture: ComponentFixture<EmptyViewComponent>;
    let router: Router;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [EmptyViewComponent],
            imports: [AppMaterialModuleForSpec, HttpClientTestingModule, RouterTestingModule, SharedModule],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EmptyViewComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('it should open the dialog', () => {
        spyOn(router, 'navigate');
        component.openDialog();
        expect(router.navigate).toHaveBeenCalled();
    });
});
