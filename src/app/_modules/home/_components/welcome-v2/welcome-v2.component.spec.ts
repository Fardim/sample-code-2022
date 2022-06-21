import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { WelcomeV2Component } from './welcome-v2.component';

describe('WelcomeV2Component', () => {
  let component: WelcomeV2Component;
  let fixture: ComponentFixture<WelcomeV2Component>;
  let router: Router;
  const mockDialogRef = {
    open: jasmine.createSpy('open'),
    afterClosed: jasmine.createSpy('close'),
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WelcomeV2Component ],
      imports:[RouterTestingModule, AppMaterialModuleForSpec, SharedModule],
      providers:[{
        provide: MatDialogRef,
        useValue: mockDialogRef,
      },
      { provide: MAT_DIALOG_DATA, useValue: {} },]
    })
    .compileComponents();
    router = TestBed.inject(Router);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WelcomeV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to edit profile page' , () => {
    spyOn(router, 'navigate');
    component.redirectToSubPage('edit');
    expect(router.navigate).toHaveBeenCalledWith(['', { outlets: { sb: `sb/settings/profile` } }]);
  });

  it('should redirect to invite page' , () => {
    spyOn(router, 'navigate');
    component.redirectToSubPage('invite');
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: `sb/settings/teams`, outer: `outer/teams/invite` } }], { queryParamsHandling: 'preserve' });
  });

  it('should redirect to connekthub page' , () => {
    spyOn(component,'importConnekthub');
    component.redirectToSubPage('connectHub');
    expect(component.importConnekthub).toHaveBeenCalled();
  });

  it('should redirect to data page' , () => {
    spyOn(router, 'navigate');
    component.modules = [
      {
        moduleId: '502',
        moduleDesc: 'Ashish Mode',
        schemaLists: []
      },
      {
        moduleId: '1005',
        moduleDesc: 'Ashish testing',
        schemaLists: []
      }
    ];
    component.redirectToSubPage('data');
    expect(router.navigate).toHaveBeenCalledWith(['/home/list/datatable', '502']);
  });

  it('should redirect to open page' , () => {
    spyOn(router, 'navigate');
    component.redirectToSubPage('open');
    expect(router.navigate).toHaveBeenCalledWith(['home', 'schema', 'list', '_overview']);
  });
});
