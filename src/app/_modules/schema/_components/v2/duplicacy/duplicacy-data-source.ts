import { CollectionViewer } from '@angular/cdk/collections';
import { DataSource } from '@angular/cdk/table';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { CatalogCheckService } from '@services/home/schema/catalog-check.service';
import { RequestForCatalogCheckData, RECORD_STATUS, RECORD_STATUS_KEY, MASTER_RULE_STATUS_KEY } from '@models/schema/duplicacy';
import { SchemaTableData } from '@models/schema/schemadetailstable';
import { TransientService } from 'mdo-ui-library';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { finalize } from 'rxjs/operators';

export class DuplicacyDataSource implements DataSource<SchemaTableData> {

    private dataSourceSubject = new BehaviorSubject<SchemaTableData[]>([]);

    private mdoRecordResponseSub = new BehaviorSubject<any[]>([]);

    constructor(private catalogCheckService: CatalogCheckService,
        private snackBar: TransientService, private sharedService: SharedServiceService) {

    }

    /**
     * Get the row based on the objectnumber
     * @param objNr find by the objectnumber ...
     * @returns the doc with gvs & hyvs ...
     */
     getRow(objNr: string): any {
        return this.mdoRecordResponseSub.getValue()?.find(f=> f.id === objNr);
    }

    /**
     * Update the actual doc value ....
     * @param docId objectnumber for that doc
     * @param fieldId the current fieldid
     * @param value entered value ..
     * @param where will be either hdvs | hyvs | gvs bydefault will be hdvs
     * @param gvsId the grid id
     * @param hyvsId the hierarchy id
     * @param objnr the hyvs or gvs objnr ...
     * @returns will thow some error ....
     */
    updateDoc(docId: string, fieldId: string, value: string, code: string) {
        const doc = this.getRow(docId);
        if(!doc) {
            return throwError(`Doc not exits for id ${docId}`)
        }
        const fldObj = doc?.hdvs?.fldid;
        doc.hdvs[fieldId]= {fId:fieldId,vc:[{c: code, t: value}],oc:null,ls:fldObj?.ls,isInError:fldObj?.isInError,errmsgs:fldObj?.errmsgs,isCorrected:fldObj?.isCorrected};
        const val = this.mdoRecordResponseSub.getValue();
        const idIndex = val.findIndex(f => f.id === docId);
        val[idIndex] = doc;
        this.mdoRecordResponseSub.next(val);
    }

    /**
     * Get datatable data ....
     * if isLoadMore then newRes should append on oldData..
     *
     * @param request Global table request for load datatable data
     */
    public getTableData(request: RequestForCatalogCheckData, isLoadingMore) {

        const obs = this.catalogCheckService.getCatalogCheckRecords(request);
        obs.pipe(finalize(() => { this.sharedService.setSchemaDetailsTableDataAPICallState('false') })).subscribe(res => {

            /* const result = this.docsTransformation(res);

            console.log(result);
            this.dataSourceSubject.next(result); */
            if (isLoadingMore) {
                const loadedData = this.docValue();
                const newData = this.docsTransformation(res);
                loadedData.push(...newData);
                this.dataSourceSubject.next(loadedData);
                this.mdoRecordResponseSub.next(this.mdoRecordResponseSub.getValue() ? this.mdoRecordResponseSub.getValue().concat(res?.doc) : []);
            } else {
                this.dataSourceSubject.next(this.docsTransformation(res));
                this.mdoRecordResponseSub.next(res?.doc);
            }

        }, error => {
            this.dataSourceSubject.next([]);
            this.snackBar.open('Something went wrong !', 'close', {duration:5000});
            console.error(`Error : ${error.message}`);
        });
        return obs;
    }

    /**
     * Transformation server index data to Datasource
     * @param res table response from server ..
     */
    public docsTransformation(res: any, reqTye?: string): any[] {
        const finalResonse = [];
        if (res && res.doc) {
            const docs = res.doc;
            docs.forEach(doc => {
                const rowData: any = {};

                // object number
                const objnr: SchemaTableData = new SchemaTableData();
                objnr.fieldData = doc.id;
                objnr.fieldId = 'OBJECTNUMBER';
                objnr.fieldDesc = 'Object Number';
                objnr.isReviewed = doc.isReviewed ? doc.isReviewed : false;

                // add flg for deletion as well
                objnr.delFlag = doc.delFlag ? doc.delFlag : false;

                rowData.OBJECTNUMBER = objnr;
                rowData.ignoreGrp = doc?.ignoreGrp || false;
                rowData._groupDesc = {
                    fieldData: `Group ${doc.___groupDesc}`
                };

                // record status
                const status: SchemaTableData = new SchemaTableData();
                status.fieldData = doc.ignoreGrp? RECORD_STATUS.NOT_DUPLICATE : doc.masterRecord === '1' ? RECORD_STATUS.MASTER : doc.delFlag ? RECORD_STATUS.DELETABLE : RECORD_STATUS.NOT_DELETABLE;
                status.fieldId = RECORD_STATUS_KEY ;
                status.fieldDesc = 'Status';
                rowData[RECORD_STATUS_KEY] = status;

                // add masterRecord & masterByUser
                status.masterRecord = doc.masterRecord ? doc.masterRecord : '0';
                status.masterByUser = doc.masterByUser ? doc.masterByUser : '0';
                // Copy Master rule status array
                const masterRecordStatusList = (Array.isArray(doc[MASTER_RULE_STATUS_KEY]) ? doc[MASTER_RULE_STATUS_KEY] : []).sort((row1, row2) => {
                    const a = `${!Boolean(row1.status)}-${row1.ruleDesc || row1.rule}`;
                    const b = `${!Boolean(row2.status)}-${row2.ruleDesc || row2.rule}`;
                    return a >b ? 1 : b > a ? -1 : 0;
                });
                rowData[MASTER_RULE_STATUS_KEY] = masterRecordStatusList;

                const hdvs = doc.hdvs ? doc.hdvs : {};
                for (const hdfld in hdvs) {
                    if (hdvs.hasOwnProperty(hdfld)) {
                        const cell: SchemaTableData = new SchemaTableData();
                        cell.fieldId = hdfld;
                        cell.fieldDesc = hdvs[hdfld].ls ? hdvs[hdfld].ls : 'Unknown';

                        // only code is visiable
                        // TODO on based on display criteria
                        const dropVal = hdvs[hdfld].vc ? hdvs[hdfld].vc.map(map => map.t || map.c).toString() : '';
                        cell.fieldData = dropVal ? dropVal : '';
                        const dropCode = hdvs[hdfld].vc ? hdvs[hdfld].vc.map(map => map.c).toString() : '';
                        cell.fieldCode = dropCode || '';

                        // check cell is in error
                        /* if (reqTye === 'error') {
                            const errCell =  this.checkFieldIsInError(hdfld);
                            cell.isInError = hdvs[hdfld].isInError ? hdvs[hdfld].isInError : false;
                            cell.errorMsg = hdvs[hdfld].message ? hdvs[hdfld].message.toString() : '';
                        } */


                        // check for old values
                        if (hdvs[hdfld].oc && hdvs[hdfld].oc.length > 0) {
                            const oldVal = hdvs[hdfld].oc ? hdvs[hdfld].oc : '';
                            // .map(map => map.c).toString() : '';
                            cell.oldData = oldVal;
                            // cell.isCorrected = cell.oldData === cell.fieldData ? false : true;
                            cell.isCorrected = true;
                        }
                        rowData[hdfld] = cell;
                    }

                }
                finalResonse.push(rowData);
            });

        }
        return finalResonse;
    }



    connect(collectionViewer?: CollectionViewer): Observable<SchemaTableData[]> {
        return this.dataSourceSubject.asObservable();
    }


    disconnect(collectionViewer: CollectionViewer): void {
        this.dataSourceSubject.complete();
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