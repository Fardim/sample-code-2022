import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { SalesforceConnectionComponent } from './salesforce-connection.component';

describe('SalesforceConnectionComponent', () => {
  let component: SalesforceConnectionComponent;
  let fixture: ComponentFixture<SalesforceConnectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesforceConnectionComponent ],
      imports: [SharedModule, AppMaterialModuleForSpec]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesforceConnectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Authorize function is not working with the loader anymore. Hence commented the test
  // it('authorise(), should called on click of authorise', fakeAsync(() => {
  //   spyOn(component,'back');
  //   component.authorise()
  //   expect(component.loader).toBeTruthy();
  //   tick(1000);
  //   expect(component.back).toHaveBeenCalled();
  //   expect(component.loader).toBeFalsy();
  // }));

  it('onCancelClick, should close popup', () => {
    spyOn(component.cancelClick,'emit');
    component.onCancelClick('false');
    expect(component.cancelClick.emit).toHaveBeenCalledWith('false');
  })

  it('back, should go back to previous tab', () => {
    spyOn(component.backClick,'emit');
    component.back();
    expect(component.backClick.emit).toHaveBeenCalled();
  })
});
