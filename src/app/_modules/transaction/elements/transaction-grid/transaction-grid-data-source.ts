import { CollectionViewer } from '@angular/cdk/collections';
import { DataSource } from '@angular/cdk/table';
import { Router } from '@angular/router';
import { SchemaTableData } from '@models/schema/schemadetailstable';
import { Utilities } from '@models/schema/utilities';
import { MDORecord, MSGFN } from '@modules/transaction/model/transaction';
import { DataControlService } from '@modules/transaction/_service/data-control.service';
import { TransactionService } from '@modules/transaction/_service/transaction.service';
import { BehaviorSubject, Observable } from 'rxjs';


export class TransactionGridDataSource implements DataSource<SchemaTableData> {

    private dataSourceSubject = new BehaviorSubject<SchemaTableData[]>([]);
    public totalCount = 0;
    private masterRecord: MDORecord;
    public gridRowLength = 0;

    constructor(
      private moduleId: string,
      private gridId: string,
      private isSubGrid,
      private coreCrudService:TransactionService,
      private utilityService: Utilities,
      private router: Router,
      private dataControlService: DataControlService
    ) { }

    public getData(pageIndex, pageSize, searchTerm, parentRowId?) {
        const activeForm = this.dataControlService.activeForm$.getValue();
        this.masterRecord = this.coreCrudService.getMasterData(activeForm.isPrimary, this.moduleId);
        const data = this.masterRecord?.mdoRecordES?.gvs?.[this.gridId];
        let rows = data?.rows || [];
        if(this.isSubGrid) {
            rows = parentRowId ? rows.filter(row => row.PARENT_UUID?.vc[0]?.c?.toString()===parentRowId) : [];
        }
        if(rows && rows.length) {
            this.gridRowLength = rows.length;
            const startIndex = (pageIndex-1)*pageSize;
            const page = searchTerm ? rows : rows.slice(startIndex, startIndex + pageSize);
            const transformedData = this.docsTransformation(page,false,searchTerm);
            this.totalCount = searchTerm ? transformedData.length : rows.length;
            this.dataSourceSubject.next(searchTerm ? transformedData.slice(startIndex, startIndex + pageSize) : transformedData);
        } else {
            this.totalCount = 0;
            this.gridRowLength = 0;
            this.dataSourceSubject.next([]);
        }
    }

    getSubGridDataLength(subgrid) {
        const activeForm = this.dataControlService.activeForm$.getValue();
        this.masterRecord = this.coreCrudService.getMasterData(activeForm.isPrimary, this.moduleId);
        const data = this.masterRecord?.mdoRecordES?.gvs?.[subgrid?.fieldId];
        return data?.rows?.length || 0;
    }

    /**
     * Transformation server index data to Datasource
     * @param res table response from server ..
     */
    public docsTransformation(res: any, formatValue?, searchTerm?): any[] {
        const finalResonse = [];
        if (res && res.length) {

            res.forEach(doc => {
                if(doc.MSGFN && doc.MSGFN?.vc[0]?.c === MSGFN.delete) return;
                const rowData: any = {};

                Object.keys(doc).forEach(col => {
                    const cell: SchemaTableData = new SchemaTableData();
                    cell.fieldId = (col?.toString()?.includes('fld') && this.router?.url?.includes('transaction')) ? this.transformFieldId(col) : col;
                    cell.fieldDesc = doc[col].ls ? doc[col].ls : 'Unknown';
                    if(formatValue) {
                        let dropVal = doc[col].vc ? doc[col].vc.map(map => map.t).toString() : '';
                        dropVal = dropVal ?  dropVal :(doc[col].vc ? doc[col].vc.map(map => map.c).toString() : '');
                        cell.fieldData = dropVal ? dropVal : '';
                    } else {
                        cell.fieldData = doc[col].vc;
                    }

                    const oldVal = (doc[col].bc && doc[col].bc[0].c) ? doc[col].bc[0].c.toString() : '';
                    cell.oldData = oldVal ? oldVal : '';
                    cell.isEdited = false;
                    // cell.updatedVal = doc[col].updatedVal;
                    const colId = (col?.toString()?.includes('fld') && this.router?.url?.includes('transaction')) ? this.transformFieldId(col) : col;
                    rowData[colId] = cell;
                })

                // filter data of grid/subgrid based on search value
                if (searchTerm) {
                    Object.keys(rowData).forEach(field => {
                        if((field.toString().includes('FLD_') || field.toString().includes('fld_'))) {
                            const fieldValue = rowData[field].fieldData[0];
                            if (fieldValue?.c?.toString().toLowerCase().includes(searchTerm.toLowerCase()) || fieldValue?.t?.toString().toLowerCase().includes(searchTerm.toLowerCase())) {
                                finalResonse.push(rowData);
                            }
                        }
                    })
                } else {
                    finalResonse.push(rowData);
                }
            });

        }
        return finalResonse;
    }

    sortRows($event, pageIndex, pageSize, searchTerm, parentRowId?) {
        const activeForm = this.dataControlService.activeForm$.getValue();
        this.masterRecord = this.coreCrudService.getMasterData(activeForm.isPrimary, this.moduleId);
        const data = this.masterRecord?.mdoRecordES?.gvs?.[this.gridId];
        let rows = data?.rows || [];
        if(this.isSubGrid) {
            rows = parentRowId ? rows.filter(row => row.PARENT_UUID?.vc[0]?.c?.toString()===parentRowId) : [];
        }
        if(rows && rows.length) {
            this.gridRowLength = rows.length;
            const transformedData = this.docsTransformation(rows,false,searchTerm);

            const sortedTransformData = transformedData.sort((data1, data2) => {
                const data1Value = data1[$event.active]?.fieldData[0]?.c?.toString().toLowerCase();
                const data2Value = data2[$event.active]?.fieldData[0]?.c?.toString().toLowerCase();

                if ($event.direction === 'asc' && data1Value < data2Value) {
                    return -1;
                }

                if ($event.direction === 'desc' && data1Value > data2Value) {
                    return -1;
                }
                return 0;
            })
            const startIndex = (pageIndex-1)*pageSize;
            const page = sortedTransformData.slice(startIndex, startIndex + pageSize);
            this.dataSourceSubject.next(page);
        } else {
            this.totalCount = 0;
            this.gridRowLength = 0;
            this.dataSourceSubject.next([]);
        }
    }

    /**
     * converts 'fld_' string to uppercase when field id is in lower case
    */
    transformFieldId(fieldId: string) {
        return fieldId?.toString().split('_')[0].toUpperCase() + '_' + fieldId.split('_')[1];
    }

    connect(collectionViewer: CollectionViewer): Observable<SchemaTableData[]> {
        return this.dataSourceSubject.asObservable();
    }


    disconnect(collectionViewer: CollectionViewer): void {
        this.dataSourceSubject.complete();
    }

    deleteRow(pageIndex, pageSize, rowIndex) {
        const activeForm = this.dataControlService.activeForm$.getValue();
        this.masterRecord = this.coreCrudService.getMasterData(activeForm.isPrimary, this.moduleId);
        const data = this.masterRecord?.mdoRecordES.gvs[this.gridId];
        const finalIndex = (pageIndex-1)*pageSize + rowIndex;
        if(data && data.rows && data.rows.length && finalIndex < data.rows.length) {
            if(data.rows[finalIndex]?.MSGFN?.vc[0]?.c !== MSGFN.create) {
                data.rows[finalIndex].MSGFN.vc[0].c = MSGFN.delete;
            }else {
                data.rows.splice(finalIndex, 1);
            }
            this.totalCount--;
        }
    }

    duplicateRow(pageIndex, pageSize, rowIndex) {
        const data = this.masterRecord?.mdoRecordES.gvs[this.gridId];
        const finalIndex = (pageIndex-1)*pageSize + rowIndex;
        if(data && data.rows && data.rows.length && finalIndex < data.rows.length) {
            const rowData = JSON.parse(JSON.stringify(data.rows[finalIndex]));
            rowData.UUID =  {
            bc: null,
            fid: 'UUID',
            ls: null,
            oc: null,
            vc: [{
              c: this.utilityService.generate_UUID(),
              t: ''
            }]};
            data.rows.splice(finalIndex+1, 0, rowData);
            this.totalCount++;
        }
    }

    createRows(newData, pageSize: number) {
        const activeForm = this.dataControlService.activeForm$.getValue();
        this.masterRecord = this.coreCrudService.getMasterData(activeForm.isPrimary, this.moduleId);
        if(!this.masterRecord.mdoRecordES.gvs) {
            this.masterRecord.mdoRecordES.gvs = {[this.gridId]: {rows: []}};
        }
        if(!this.masterRecord.mdoRecordES.gvs[this.gridId]) {
            this.masterRecord.mdoRecordES.gvs[this.gridId] = {rows: []};
        }
        const data = this.masterRecord?.mdoRecordES.gvs[this.gridId];
        data.rows.push(...newData);
        this.getData(1,pageSize,'');
    }

    updateRow(rowDetail, index: number) {
        const activeForm = this.dataControlService.activeForm$.getValue();
        this.masterRecord = this.coreCrudService.getMasterData(activeForm.isPrimary, this.moduleId);
        const data = this.masterRecord?.mdoRecordES.gvs[this.gridId].rows[index];
        for (const key in rowDetail) {
            if (key !== 'UUID' && rowDetail[key]) {
                data[key].vc = rowDetail[key].vc;
                // data[key].updatedVal = true;
            }
        }
    }

    getAllData(parentRowUUID?, subGridId?) {
        const activeForm = this.dataControlService.activeForm$.getValue();
        this.masterRecord = this.coreCrudService.getMasterData(activeForm.isPrimary, this.moduleId);
        const gridFieldId = (subGridId) ? subGridId : this.gridId;

        const data = this.masterRecord?.mdoRecordES.gvs[gridFieldId];
        let rows = data?.rows || [];
        if(this.isSubGrid || subGridId) {
            rows = parentRowUUID ? rows.filter(row => row.PARENT_UUID?.vc[0]?.c?.toString()===parentRowUUID) : [];
        }
        return this.docsTransformation(rows, true);
    }

    /**
     * Return length of doc ..
     */
    docLength(): number {
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
