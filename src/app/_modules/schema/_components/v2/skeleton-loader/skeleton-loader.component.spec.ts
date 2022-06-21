import { ComponentFixture, async, TestBed } from '@angular/core/testing';
import { MdoUiLibraryModule } from 'mdo-ui-library';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { SkeletonLoaderComponent } from './skeleton-loader.component';

describe('SchemaDetailsComponent', () => {
    let component: SkeletonLoaderComponent;
    let fixture: ComponentFixture<SkeletonLoaderComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SkeletonLoaderComponent],
            imports: [
                AppMaterialModuleForSpec,
                MdoUiLibraryModule
            ], providers: []
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SkeletonLoaderComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('loader should be visible', () => {
        component.loading = true;
        expect(component.className).toEqual('visible');
    });

    it('ngAfterViewInit should work without error', () => {
        expect(component.ngAfterViewInit()).toBeUndefined();
    });
});
