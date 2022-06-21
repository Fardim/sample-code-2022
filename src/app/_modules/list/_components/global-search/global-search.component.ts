import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FieldMetaData } from '@models/core/coreModel';
import { FilterCriteria } from '@models/list-page/listpage';
import { SchemaTableData } from '@models/schema/schemadetailstable';
import { ListService } from '@services/list/list.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize, map } from 'rxjs/operators';

@Component({
  selector: 'pros-global-search',
  templateUrl: './global-search.component.html',
  styleUrls: ['./global-search.component.scss']
})
export class GlobalSearchComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {

  @Input()
  moduleId: string;

  @Input()
  fieldsMetadata: FieldMetaData[] = [];

  @Input()
  searchString = '';

  @Output()
  upsertFilterCriteria: EventEmitter<any> = new EventEmitter();

  @ViewChild(MatSort, {static: true}) sort: MatSort;

  mappedFieldsMetadata: any[] = [];

  staticColumns: string[] = ['OBJECTNUMBER']

  displayedColumns: BehaviorSubject<string[]> = new BehaviorSubject(this.staticColumns);

  pageIndex = 1;

  previewData: MatTableDataSource<any> = new MatTableDataSource<any>();

  subscriptions: Subscription[] = [];

  searchSub: BehaviorSubject<string> = new BehaviorSubject('');

  isLoading = true;


  constructor(private listService: ListService) { }

  ngOnChanges(changes: SimpleChanges): void {

    if(changes && changes.fieldsMetadata && changes.fieldsMetadata.currentValue !== changes.fieldsMetadata.previousValue) {
      this.mappedFieldsMetadata = this.fieldsMetadata.map(field => {
        return {
          esFieldPath: `hdvs.${field.fieldId}`,
          fieldId: field.fieldId,
          sort: 'ASC'
        }
      });
    }

    if(changes && changes.searchString && changes.searchString.currentValue !== changes.searchString.previousValue) {
      this.searchSub.next(changes.searchString.currentValue);
    }
  }

  ngOnInit(): void {
    this.searchSub.pipe(
      debounceTime(1000),
      distinctUntilChanged()
    ).subscribe(searchString => {
      if(searchString && searchString.length >= 3) {
        this.findDataByGlobalSearch();
      }
    });
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(res => {
      const field = this.mappedFieldsMetadata.find(f => f.fieldId === res.active);
      if (field) {
        field.sort = res.direction || null;
        this.findDataByGlobalSearch();
      }
    });
  }

  applyFilter() {
    const fc: FilterCriteria = new FilterCriteria();
    fc.operator = 'CONTAINS';
    fc.fieldId = 'MTL_GRP';
    fc.esFieldPath = 'hdvs.MTL_GRP';
    /* fc.fieldId = this.mappedFieldsMetadata[0].fieldId;
    fc.esFieldPath = this.mappedFieldsMetadata[0].esFieldPath; */
    fc.values = this.searchSub.getValue().split(',');
    this.upsertFilterCriteria.emit(fc);
  }

  findDataByGlobalSearch(loadMore?) {
    if(loadMore) {
      this.pageIndex++;
    } else {
      this.pageIndex = 1;
    }

    this.isLoading = !loadMore;
    const sub = this.listService.findDataByGlobalSearch(this.moduleId, this.mappedFieldsMetadata, this.pageIndex, this.searchString)
    .pipe(
      map(data => this.mapSearchData(data)),
      finalize(() => this.isLoading = false)
    )
    .subscribe(data => {
      console.log(data);
      if (data && data.length) {
        if (loadMore) {
          this.previewData = new MatTableDataSource([...this.previewData.data, ...data]);
        } else {
          this.previewData = new MatTableDataSource(data);
        }
      } else if (loadMore) {
        this.pageIndex--;
      }
      }, err => {
        console.error(`Error:: ${err.message}`);
    });
    this.subscriptions.push(sub);
  }

  onTableScrollEnd() {
    this.findDataByGlobalSearch(true);
  }

  /**
   * get field description based on field id
   * @param fieldId field id
   * @returns field description
   */
   getFieldDesc(fieldId: string): string {
    const field = this.fieldsMetadata.find(f => f.fieldId === fieldId);
    return field ? field.fieldDescri || 'Unkown' : fieldId || 'Unkown';
  }

  mapSearchData(res: any): any[] {
    const finalResonse = [];
    if (res && res.length) {

        res.forEach(doc => {
            const rowData: any = {};

            // object number
            const objnr: SchemaTableData = new SchemaTableData();
            objnr.fieldData = doc.id;
            objnr.fieldId = 'OBJECTNUMBER';
            objnr.fieldDesc = 'Object Number';
            objnr.isReviewed = doc.isReviewed ? doc.isReviewed : false;
            rowData.OBJECTNUMBER = objnr;

            const hdvs = doc.hdvs ? doc.hdvs : {};
            for (const hdfld in hdvs) {
                if (hdvs.hasOwnProperty(hdfld)) {
                    const cell: SchemaTableData = new SchemaTableData();
                    cell.fieldId = hdfld;
                    cell.fieldDesc = hdvs[hdfld].ls ? hdvs[hdfld].ls : 'Unknown';

                    const dropVal = hdvs[hdfld].vc ? hdvs[hdfld].vc.map(v => v.c).toString() : '';
                    cell.fieldData = dropVal ? dropVal : '';

                    rowData[hdfld] = cell;
                }

            }
            finalResonse.push(rowData);
        });

    }
    return finalResonse;
  }

  close() {
    this.upsertFilterCriteria.emit(null);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    })
  }

}
