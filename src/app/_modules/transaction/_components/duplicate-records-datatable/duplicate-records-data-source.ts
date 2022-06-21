import { CollectionViewer } from '@angular/cdk/collections';
import { DataSource } from '@angular/cdk/table';
import { SchemaTableData } from '@models/schema/schemadetailstable';
import { TransactionService } from '@modules/transaction/_service/transaction.service';
import { BehaviorSubject, Observable } from 'rxjs';


export class DuplicateRecordsDataSource implements DataSource<SchemaTableData> {

    private dataSourceSubject = new BehaviorSubject<SchemaTableData[]>([]);
    private totalCount = 0;

    constructor(private coreCrudService:TransactionService) { }

    public getData(pageIndex, pageSize, searchTerm) {
        const rows = this.coreCrudService.duplicateRecordsDetails.getValue()?.resultList;
        if(rows?.length) {
            this.totalCount = rows.length;
            const startIndex = (pageIndex-1)*pageSize;
            const page = rows.slice(startIndex, startIndex + pageSize);
            this.dataSourceSubject.next(this.docsTransformation(page));
        } else {
            this.dataSourceSubject.next([]);
        }
    }

    /**
     * Transformation server index data to Datasource
     * @param res table response from server ..
     */
    public docsTransformation(res: any): any[] {
        const finalResonse = [];
        if (res && res.length) {

            res.forEach(row => {
                const rowData: any = {};

                rowData.score = {fieldId: 'score', fieldData: row.score, fieldDesc: 'Match'};
                rowData.OBJECTNUMBER = {fieldId: 'OBJECTNUMBER', fieldData: row.record?.id, fieldDesc: 'Object Number'};
                rowData._duplicatedFields = {fieldId: '_duplicatedFields', fieldData: row.fields?.toString(), fieldDesc: 'Duplicated fields'};

                Object.keys(row?.record?.hdvs).forEach(col => {
                    const doc = row.record?.hdvs[col];
                    const cell: SchemaTableData = new SchemaTableData();
                    cell.fieldId = col;
                    cell.fieldDesc = doc.ls ? doc.ls : 'Unknown';

                    let dropVal = doc.vc ? doc.vc.map(map => map.t).toString() : '';
                    dropVal = dropVal ?  dropVal :(doc.vc ? doc.vc.map(map => map.c).toString() : '');
                    cell.fieldData = dropVal ? dropVal : '';

                    const oldVal = (doc.bc && doc.bc[0].c) ? doc.bc[0].c.toString() : '';
                    cell.oldData = oldVal ? oldVal : '';
                    rowData[col] = cell;
                })
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
    }

    getAllData() {
        const rows = this.coreCrudService.duplicateRecordsDetails.getValue()?.resultList;
        return this.docsTransformation(rows);
    }

    /**
     * Return length of doc ..
     */
    get docLength() {
        return this.totalCount;
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