import { CollectionViewer } from '@angular/cdk/collections';
import { DataSource } from '@angular/cdk/table';
import { SchemaTableData } from '@models/schema/schemadetailstable';
import { ListService } from '@services/list/list.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';


export class ListDataSource implements DataSource<SchemaTableData> {

    private dataSourceSubject = new BehaviorSubject<SchemaTableData[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);
    public $loading = this.loadingSubject.asObservable();

    constructor(private listService: ListService) { }

    /**
     * get table data
     * @param moduleId module id
     * @param viewId active view id
     * @param pageId page index
     */
    public getData(moduleId, viewId, pageIndex, filterCriterias) {
        // if (viewId !== 'default') {
            this.loadingSubject.next(true);
            this.listService.getTableData(moduleId, viewId, pageIndex, filterCriterias, '').pipe(finalize(() => this.loadingSubject.next(false))).subscribe(res => {
                this.dataSourceSubject.next(this.docsTransformation(res));
            }, error => {
                this.loadingSubject.next(false);
                this.dataSourceSubject.next([]);
                console.error(`Error : ${error.message}`);
            });
        // } else {
        //     this.dataSourceSubject.next(this.docsTransformation([]));
        // }
    }

    /**
     * Transformation server index data to Datasource
     * @param res table response from server ..
     */
    public docsTransformation(res: any): any[] {
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

                        // only code is visiable
                        // TODO on based on display criteria
                        let dropVal = hdvs[hdfld].vc ? hdvs[hdfld].vc.map(map => map.t).toString() : '';
                        dropVal = dropVal ?  dropVal :(hdvs[hdfld].vc ? hdvs[hdfld].vc.map(map => map.c).toString() : '');
                        cell.fieldData = dropVal ? dropVal : '';

                        rowData[hdfld] = cell;
                    }

                }
                finalResonse.push(rowData);
            });

        }
        return finalResonse;
    }



    connect(collectionViewer: CollectionViewer): Observable<SchemaTableData[]> {
        return this.dataSourceSubject.asObservable();
    }


    disconnect(collectionViewer: CollectionViewer): void {
        this.dataSourceSubject.complete();
        this.loadingSubject.complete();
    }

    /**
     * Return length of doc ..
     */
    docLength(): number {
        return this.dataSourceSubject.getValue().length;
    }

    /**
     * Return all dcument that have on this subject
     */
    docValue() {
        return this.dataSourceSubject.getValue();
    }

    /**
     * reset data source
     */
    reset() {
        this.dataSourceSubject.next([]);
    }

}
