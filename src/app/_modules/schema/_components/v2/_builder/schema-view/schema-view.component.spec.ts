import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { SchemaViewComponent } from './schema-view.component';

describe('SchemaViewComponent', () => {
  let component: SchemaViewComponent;
  let fixture: ComponentFixture<SchemaViewComponent>;
  // let schemaDetailsService: SchemaDetailsService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SchemaViewComponent ],
      imports:[
        HttpClientTestingModule,
        AppMaterialModuleForSpec
      ]

    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SchemaViewComponent);
    component = fixture.componentInstance;
    // schemaDetailsService = fixture.debugElement.injector.get(SchemaDetailsService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // it('checkGlobalErrorState(), should call http and check the error messages ', async(()=>{
  //   spyOn(schemaDetailsService, 'schemaErrorStateCheck').and.returnValue(of());
  //   spyOn(console, 'log');
  //   component.checkGlobalErrorState();
  //   expect(schemaDetailsService.schemaErrorStateCheck).toHaveBeenCalled();
  //   expect(console.log).toHaveBeenCalled();

  // }));

  // it('checkGlobalErrorState(), if server return some error then should be visiable error state  ', async(()=>{
  //   spyOn(schemaDetailsService, 'schemaErrorStateCheck').and.throwError('Something not good');
  //   spyOn(console, 'error');
  //   component.checkGlobalErrorState();
  //   expect(schemaDetailsService.schemaErrorStateCheck).toHaveBeenCalled();
  //   expect(console.error).toHaveBeenCalled();

  // }));
});
