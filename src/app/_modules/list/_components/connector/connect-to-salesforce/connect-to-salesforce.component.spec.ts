import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { SharedModule } from '@modules/shared/shared.module';
import { ConnectToSalesforceComponent } from './connect-to-salesforce.component';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SalesforceAdaptorService } from '@services/salesforce-adaptor.service';
import { of } from 'rxjs';

describe('ConnectToSalesforceComponent', () => {
  let component: ConnectToSalesforceComponent;
  let fixture: ComponentFixture<ConnectToSalesforceComponent>;
  let sfAdapatorService: SalesforceAdaptorService;

  beforeEach(async(() => {
    const windowMock: Window = {
      location: { 
        search: 'https://stackoverflow.com/questions/69537614?c=12334'
      },
      opener: {
        location: { 
          href: 'https://stackoverflow.com/questions/69537614?c=12334'
        },
        postMessage: (message, target) => {}
      }
    } as any;
    TestBed.configureTestingModule({
      declarations: [ ConnectToSalesforceComponent ],
      imports: [AppMaterialModuleForSpec, SharedModule],
      providers: [
        { provide: 'window', useValue: windowMock }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectToSalesforceComponent);
    component = fixture.componentInstance;
    sfAdapatorService = fixture.debugElement.injector.get(SalesforceAdaptorService);
  });
  
  it('should create', () => {
    spyOn(component, 'ngAfterViewInit');
    spyOn(sfAdapatorService, 'consumeAuthCode').and.returnValue(of('400').toPromise());
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
