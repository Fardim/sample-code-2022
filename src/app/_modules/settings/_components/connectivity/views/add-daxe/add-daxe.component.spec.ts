import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { MdoUiLibraryModule } from 'mdo-ui-library';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { AddDaxeComponent } from './add-daxe.component';

describe('AddDaxeComponent', () => {
  let component: AddDaxeComponent;
  let fixture: ComponentFixture<AddDaxeComponent>;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddDaxeComponent ],
      imports: [ SharedModule, RouterTestingModule, AppMaterialModuleForSpec, MdoUiLibraryModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddDaxeComponent);
    component = fixture.componentInstance;
    router = fixture.debugElement.injector.get(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('segmentChanged, should show new form', () => {
    component.segmentChanged('newDaxe');
    expect(component.showSelectedForm).toEqual('new');
  })

  it('segmentChanged, should show existing form', () => {
    component.segmentChanged('existing');
    expect(component.showSelectedForm).toEqual('existing');
  })

  it('close, should close add-daxe sidesheet', () => {
    spyOn(router, 'navigate');
    component.close();
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { outer: null } }], { queryParamsHandling: 'preserve' })
  })
});
