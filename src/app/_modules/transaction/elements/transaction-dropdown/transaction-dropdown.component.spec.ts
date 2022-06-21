import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RuleService } from '@services/rule/rule.service';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { TransactionDropdownComponent } from './transaction-dropdown.component';

describe('TransactionDropdownComponent', () => {
  let component: TransactionDropdownComponent;
  let fixture: ComponentFixture<TransactionDropdownComponent>;
  let ruleService: RuleService;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AppMaterialModuleForSpec],
      declarations: [ TransactionDropdownComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionDropdownComponent);
    component = fixture.componentInstance;
    ruleService = fixture.debugElement.injector.get(RuleService);

    fixture.detectChanges();

    // component.optionList = [{code:'Value 2 ',text:'DD2',textRef:155099330725317854},{code:'Value 1',text:'DD1',textRef:128709742725411953}];
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should init component', () => {
    spyOn(component, 'getOptions');
    component.ngOnInit();

    expect(component.getOptions).toHaveBeenCalledTimes(1);
  });

  it('should dropdown values', async(() => {

    const values = {content:[{code:'Value 2 ',text:'DD2',textRef:'155099330725317854'},{code:'Value 1',text:'DD1',textRef:'128709742725411953'},{code:'Value 2 ',text:'DD2',textRef:'705138137730960762'},{code:'Value 1',text:'DD1',textRef:'543214023730961475'}],pageable:{sort:{sorted:false,unsorted:true,empty:true},offset:0,pageNumber:0,pageSize:20,unpaged:false,paged:true},last:true,totalElements:4,totalPages:1,sort:{sorted:false,unsorted:true,empty:true},first:true,size:20,number:0,numberOfElements:4,empty:false};

    const dto: { searchString: string; parent: any } = {
      searchString: '',
      parent: {}
    };
    spyOn(ruleService, 'getDropvals').withArgs('500', 'FLD_1639653476214', 'en', dto)
      .and.returnValue(of(values));

    component.getOptions('');

    // expect(component.optionList).toEqual(values.content);
    component.optionList.subscribe(s=>{ expect(s).toEqual(values.content); });
  }));

  it('formatValue, should format the value for dispolay',() => {
    expect(component.formatValue(component.optionList[0])).toEqual('DD2');
  });

  // it('selected(), should select a value for autocomplete', () => {
  //   // component.dropdownControl = new FormControl(null);
  //     const event: MatAutocompleteSelectedEvent = {
  //       option: {
  //         value: {
  //           textRef: '155099330725317854'
  //         }
  //       }
  //     } as MatAutocompleteSelectedEvent;
  //     // component.selected(event);
  //     expect(component.selectedOptions.length).toEqual(1);
  // });
});
