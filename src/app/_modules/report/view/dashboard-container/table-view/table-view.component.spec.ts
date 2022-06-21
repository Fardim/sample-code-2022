import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { SimpleChanges } from '@angular/core';
import { MdoUiLibraryModule } from 'mdo-ui-library';
import { TableViewComponent } from './table-view.component';

describe('FormCheckboxComponent', () => {
  let component: TableViewComponent;
  let fixture: ComponentFixture<TableViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TableViewComponent],
      imports: [AppMaterialModuleForSpec, MdoUiLibraryModule]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('ngOnIt()', async(() => {
    component.ngOnInit();
    expect(component.ngOnInit).toBeTruthy();

  }));


  it('ngOnChanges()', async(() => {
    component.height = 100;
    const changes: SimpleChanges = {};
    component.ngOnChanges(changes);
    expect(component.ngOnChanges).toBeTruthy();
    const change1: SimpleChanges = {
        height: {
        previousValue: 100,
        currentValue: 200,
        firstChange: false,
        isFirstChange() { return false }
      },
      width : {
        previousValue: 100,
        currentValue: 200,
        firstChange: false,
        isFirstChange() { return false }
      }
    };

    component.ngOnChanges(change1);
    expect(component.height).toEqual(200);
    expect(component.width).toEqual(200);

  }));
});
