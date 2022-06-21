import { of } from 'rxjs';
import { SimpleChange, SimpleChanges } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { VirtualDatasetService } from '@services/list/virtual-dataset/virtual-dataset.service';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { DatasetTable, DatasetTableColumn } from '../table-columns/table-columns.component';

import { JoinStepComponent } from './join-step.component';
import { SharedModule } from '@modules/shared/shared.module';
import { RouterTestingModule } from '@angular/router/testing';

describe('JoinStepComponent', () => {
  let component: JoinStepComponent;
  let fixture: ComponentFixture<JoinStepComponent>;
  let router: Router;
  let virtualDatasetService: VirtualDatasetService;
  const routeParams = { id: '1005' };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [JoinStepComponent],
      imports: [AppMaterialModuleForSpec, RouterTestingModule, SharedModule],
      providers: [
        { provide: ActivatedRoute, useValue: { params: of(routeParams) } },
      ]
    })
    .compileComponents();
    router = TestBed.inject(Router);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JoinStepComponent);
    component = fixture.componentInstance;
    virtualDatasetService = fixture.debugElement.injector.get(VirtualDatasetService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call ngOnChanges', async () => {
    const tables1: DatasetTable[] = [];
    const tables2: DatasetTable[] = [
      {
        id: '1001',
        name: 'Material',
        moduleId: '',
        filterType: 'MODULE',
      },
      {
        id: '1002',
        name: 'Customer',
        moduleId: '',
        filterType: 'MODULE',
      }
    ];

    const columns1: DatasetTableColumn[] = [
      {
        id: 'materialId',
        name: 'Material Id',
        dataType: 'CHAR',
        maxLength: '20',
      },
      {
        id: 'materialName',
        name: 'Material Name',
        dataType: 'VARCHAR',
        maxLength: '250',
      }
    ];

    const columns2: DatasetTableColumn[] = [
      {
        id: 'customerId',
        name: 'Customer Id',
        dataType: 'CHAR',
        maxLength: '20',
      },
      {
        id: 'customerName',
        name: 'Customer Name',
        dataType: 'VARCHAR',
        maxLength: '250',
      }
    ];

    const changesObj: SimpleChanges = {
      tables: new SimpleChange(tables1, tables2, true),
    };

    let selectedIndex: number;
    let selectedTable: DatasetTable;

    component.deleteTable.subscribe((resp) => {
      selectedIndex = resp.index;
      selectedTable = resp.table
    });

    component.tables = tables1;
    component.columns = [columns1, columns2];
    component.filterCounts = [0, 1];

    spyOn(component, 'ngOnChanges').and.callThrough();
    component.ngOnChanges(changesObj);
    fixture.detectChanges();
    expect(component.ngOnChanges).toHaveBeenCalled();

    component.removeTable(0, tables2[0]);

    fixture.whenStable();

    expect(selectedIndex).toBe(0);
    expect(selectedTable).toEqual(tables2[0]);
  });
});
