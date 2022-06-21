import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SimpleChange, SimpleChanges } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { CoreService } from '@services/core/core.service';
import { MdoUiLibraryModule } from 'mdo-ui-library';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { ChildDatasetComponent } from './child-dataset.component';

describe('ChildDatasetComponent', () => {
  let component: ChildDatasetComponent;
  let fixture: ComponentFixture<ChildDatasetComponent>;
  let service: CoreService;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ChildDatasetComponent],
      imports: [HttpClientModule, HttpClientTestingModule, RouterTestingModule, SharedModule, MdoUiLibraryModule, AppMaterialModuleForSpec]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChildDatasetComponent);
    component = fixture.componentInstance;
    service = fixture.debugElement.injector.get(CoreService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  // it('on changes', () => {
  //   const changesObj: SimpleChanges = {
  //     parentDatasetId: new SimpleChange('1', '2', false),
  //   };
  //   spyOn(component, 'datasets')
  //   component.ngOnChanges(changesObj);
  //   expect(component.childDatasets.length).toBe(0);
  //   expect(component.childFormsList.length).toBe(0);
  //   expect(component.datasets).toHaveBeenCalled();
  // });
  it('initialization', () => {
    spyOn(component, 'getFormOptions')
    component.ngOnInit();
    expect(component.getFormOptions).toHaveBeenCalled();

  });
  // it('createForm', () => {
  //   component.createForm();
  //   expect(component.childForm.value).not.toBeNull();
  //   expect(component.childForm.value).not.toBeUndefined();
  // });

  // it('writeValue', () => {
  //   component.writeValue({ childDatasetId: '1', childFormId: '1', childDatasetDesc: 'ChildDataset', childFormDesc: 'ChildForm' });
  //   expect(component.childDatasets).toEqual([{ childDatsetId: '1', childDescription: 'ChildDataset' }]);
  //   expect(component.childFormsList).toEqual([{ layoutId: '1', description: 'ChildForm' }]);
  // })

  it('remove', () => {
    spyOn(component.removeDataset, 'emit').and.callFake(() => { return null; })
    component.remove();
    expect(component.removeDataset.emit).toHaveBeenCalledTimes(1);
  })

  // it('getFormTitle', () => {
  //   let title = component.getFormTitle({ description: 'Description' });
  //   expect(title).toBe(title);
  //   title = component.getFormTitle('');
  //   expect(title).toBe(title);
  // })

  // it('getDatasetTitle', () => {
  //   let title = component.getDatasetTitle({ moduleDesc: 'Description' });
  //   expect(title).toBe(title);
  //   title = component.getFormTitle('');
  //   expect(title).toBe(title);
  // })
  it('get datasets', () => {
    const spy = spyOn(service, 'getDataSets').and.callThrough();
    service.getDataSets('a');
    expect(spy).toHaveBeenCalled();
  })

  // it('dataset option selected', () => {
  //   spyOn(component,'getFormOptions')
  //   spyOn(component,'onChange')
  //   const event = {option:{value:{moduleId:'1'}}} as MatAutocompleteSelectedEvent;
  //   component.optionSelected(event);
  //   // expect(component.moduleId).toBe('1');
  //   expect(component.childForm.value.childFormId).toBe('');
  //   expect(component.getFormOptions).toHaveBeenCalled();
  //   expect(component.onChange).toHaveBeenCalled();
  // });

  // it('form option selected', () => {
  //   spyOn(component,'onChange')
  //   const event = {option:{value:{layoutId:'1'}}} as MatAutocompleteSelectedEvent;
  //   component.formSelected(event);
  //   expect(component.formId).toBe('1');
  //   expect(component.onChange).toHaveBeenCalled();
  // });
});
