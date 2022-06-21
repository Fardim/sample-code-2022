import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { MdoUiLibraryModule } from 'mdo-ui-library';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { NewConnectionComponent } from './new-connection.component';

describe('NewConnectionComponent', () => {
  let component: NewConnectionComponent;
  let fixture: ComponentFixture<NewConnectionComponent>;
  const connectionDetails = {
    description: 'SAP description',
    height: 45,
    i18n_subtitle: '@@sap_odata_subtitle',
    i18n_title: '@@sap_odata',
    iconTitle: 'SAP',
    id: 'sap_cpi',
    isSelectedCard: false,
    selectLink: '#',
    subtitle: 'About this adapter',
    title: 'SAP CPI',
    viewPort: '0 0 90 45'
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewConnectionComponent ],
      imports: [ SharedModule, RouterTestingModule, AppMaterialModuleForSpec ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewConnectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('filter, should filter connection list based on search string', () => {
      const filterList = component.filter('sap');
      expect(filterList).toEqual([connectionDetails]);
  })

  it('selectConnector', () => {
      spyOn(component.connectionChange,'emit');
      spyOn(component.navigate,'emit');
      component.selectConnector(connectionDetails);
      expect(component.connectionChange.emit).toHaveBeenCalledWith(connectionDetails);
      expect(component.navigate.emit).toHaveBeenCalledWith('connection-description');
  })
});
