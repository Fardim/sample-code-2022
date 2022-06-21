import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { Package, PackageType, PublishPackage } from '@modules/connekthub/_models';
import { ConnekthubService } from '@modules/connekthub/_services/connekthub.service';
import { SharedModule } from '@modules/shared/shared.module';
import { WidgetService } from '@services/widgets/widget.service';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { PublishToConnekthubComponent } from './publish-to-connekthub.component';

describe('PublishToConnekthubComponent', () => {
  let component: PublishToConnekthubComponent;
  let fixture: ComponentFixture<PublishToConnekthubComponent>;
  let widgetService: WidgetService;
  
  let connekthubService: ConnekthubService;
  const mockDialogRef = {
    close: jasmine.createSpy('close'),
    open: jasmine.createSpy('open'),
    afterClosed: of({ result: 'yes' }),
    addPanelClass: (abc) => { }
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PublishToConnekthubComponent],
      imports: [
        AppMaterialModuleForSpec,
        RouterTestingModule,
        SharedModule
      ],
      providers: [
        ConnekthubService,
        {
          provide: MatDialogRef,
          useValue: mockDialogRef
        }, {
          provide: MAT_DIALOG_DATA, useValue: new PublishPackage()
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PublishToConnekthubComponent);
    component = fixture.componentInstance;
    widgetService = fixture.debugElement.injector.get(WidgetService);
    connekthubService = fixture.debugElement.injector.get(ConnekthubService);
    component.parentData = new PublishPackage();
    component.parentData.id = 1234;
    component.parentData.type = PackageType.DASHBOARD;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('close(), should close the dialog', () => {
    component.close();
    expect(mockDialogRef.close).toHaveBeenCalledWith({ successfully: false, returnId: undefined });
  });

  it('should change screen', () => {
    component.authorise();
    expect(component.screen).toBe('LOGIN');

    component.configScreen();
    expect(component.screen).toBe('CONFIG');

    component.existingPackageScreen();
    expect(component.screen).toBe('EXISTING_PACKAGE');
  });

  it('addItem() and removeItem()', () => {
    component.addItem('imageUrls');
    expect(component.imageUrls.controls.length).toBe(2);

    component.addItem('docUrls');
    expect(component.docUrls.controls.length).toBe(2);

    component.addItem('videoUrls');
    expect(component.videoUrls.controls.length).toBe(2);

    component.removeItem('imageUrls', 1);
    expect(component.imageUrls.controls.length).toBe(1);

    component.removeItem('docUrls', 1);
    expect(component.docUrls.controls.length).toBe(1);

    component.removeItem('videoUrls', 0);
    expect(component.videoUrls.controls.length).toBe(1);
  });

  it('publish(), should create new package', () => {
    component.form.get('name').setValue('test');
    component.form.get('brief').setValue('test');
    component.form.get('whatsNew').setValue('test');
    spyOn(widgetService,'exportReport').withArgs('1234', 'test').and.returnValue(of('test'));
    spyOn(connekthubService,'createPackage').and.returnValue(of(''));
    component.publish();
    expect(component.uploadPackage).not.toBeUndefined();
  });

  it('publish(), should update existing package', () => {
    const data: Package = new Package();
    data.id = '123';
    component.selectPackage(data);
    component.newPackage = false;
    component.form.get('name').setValue('test');
    component.form.get('brief').setValue('test');
    component.form.get('whatsNew').setValue('test');
    spyOn(widgetService,'exportReport').withArgs('1234', 'test').and.returnValue(of('test'));
    spyOn(connekthubService,'updatePackage').and.returnValue(of('success'));
    component.publish();
    expect(component.uploadPackage).not.toBeUndefined();
  });

  it('catchError(), should catch error', () => {
    const data: Package = new Package();
    data.id = '123';
    data.name = 'test';
    data.brief = 'test';
    data.whatsNew = 'test';
    data.imageUrls = ['test'];
    data.videoUrls = ['test'];
    data.docUrls = [];
    component.selectPackage(data);
    component.newPackage = false;
    component.setFormValue();
    expect(component.screen).toBe('CONFIG');
  });

  it('setFormValue(), should add form data', () => {
    const data: Package = new Package();
    data.id = '123';
    data.name = 'test';
    data.brief = 'test';
    data.whatsNew = 'test';
    data.imageUrls = ['test'];
    data.videoUrls = ['test'];
    data.docUrls = [];
    component.selectPackage(data);
    component.newPackage = false;
    component.setFormValue();
    expect(component.screen).toBe('CONFIG');
  });

  it('changeNewPackage(), should set newPackage', () => {
    spyOn(component, 'configScreen')
    component.changeNewPackage(true);
    expect(component.configScreen).toHaveBeenCalled();
    spyOn(component, 'existingPackageScreen')
    component.changeNewPackage(false);
    expect(component.existingPackageScreen).toHaveBeenCalled();
  });

  it('searchPackages(), should call getPackages', () => {
    spyOn(connekthubService, 'getPackages').and.returnValue(of([new Package()]));
    component.searchPackages();
    expect(connekthubService.getPackages).toHaveBeenCalled();
    expect(component.packages).not.toBeUndefined();
  });
});
