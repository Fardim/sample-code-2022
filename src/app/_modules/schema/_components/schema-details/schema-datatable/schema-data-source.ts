import { DataSource } from '@angular/cdk/table';
import { CollectionViewer } from '@angular/cdk/collections/collection-viewer';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { SchemaTableData, RequestForSchemaDetailsWithBr, SchemaBrInfo } from 'src/app/_models/schema/schemadetailstable';
import { SchemaDetailsService } from 'src/app/_services/home/schema/schema-details.service';
import { EndpointsClassicService } from '@services/_endpoints/endpoints-classic.service';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { finalize } from 'rxjs/operators';

export class SchemaDataSource implements DataSource<SchemaTableData> {

    private dataSourceSubject = new BehaviorSubject<SchemaTableData[]>([]);

    private mdoRecordResponseSub = new BehaviorSubject<any[]>([]);

    public brMetadata: BehaviorSubject<SchemaBrInfo[]> = new BehaviorSubject<SchemaBrInfo[]>(null);

    public targetField = '';

    private bufferData: Array<any> = [];
    public fetchCount = 0;

    constructor(
        private schemaDetailService: SchemaDetailsService,
        private endpointService: EndpointsClassicService,
        private schemaId: string,
        private sharedService: SharedServiceService
    ) {
        this.schemaDetailService.getSchemaBrInfoList(this.schemaId).subscribe(res=>{
            this.brMetadata.next(res);
            // if rule type is transformation then should have tragetField
            const lookupTransformation = res.filter(r=> r.brType === 'BR_TRANSFORMATION');
            if(lookupTransformation && lookupTransformation.length>0) {
                const lastBr = lookupTransformation[lookupTransformation.length-1];
                const lookUpInfo = lastBr.transformationModel.filter(t=> t.transformationRuleType === 'LOOKUP')[0];
                this.targetField = lookUpInfo ? lookUpInfo.targetFld : '';
            }
        }, error=>{
            console.error('Error : ', error.message);
        })
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
     * Set row data .
     * @param rows set rows..
     */
    setDocValue(rows: any) {
        this.dataSourceSubject.next(rows);
    }

    /**
     * Get the row based on the objectnumber
     * @param objNr find by the objectnumber ...
     * @returns the doc with gvs & hyvs ...
     */
    getRow(objNr: string): any {
        return this.mdoRecordResponseSub.getValue().find(f=> f.id === objNr);
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
    updateDoc(docId: string, fieldId: string, value: string, code: string, where = 'hdvs', gvsId?: string , hyvsId?: string, objnr?: string) {
        const doc = this.getRow(docId);
        if(!doc) {
            return new Error(`Doc not exits for id ${docId}`)
        }
        switch (where) {
            default:
                const fldObj = doc?.hdvs?.fldid;
                doc.hdvs[fieldId]= {fId:fieldId,vc:[{c: code, t: value}],oc:null,ls:fldObj?.ls,isInError:fldObj?.isInError,errmsgs:fldObj?.errmsgs,isCorrected:fldObj?.isCorrected};
                break;

            case 'grid':
                const gvsObj = doc?.gvs?.[gvsId];
                if(!gvsObj) {
                    return new Error(`Grid  ${gvsId} not exits !!`)
                }
                const rows = doc.gvs[gvsId].rows || [];
                const indx = rows.findIndex(f=> f.objnr?.vc?.[0]?.c === objnr);
                rows[indx][fieldId] = {fId:fieldId,vc:[{c:value}],oc:null,ls:fldObj?.ls,isInError:fldObj?.isInError,errmsgs:fldObj?.errmsgs,isCorrected:fldObj?.isCorrected};
                break;
            case 'heirarchy':
                const hyvsObj = doc?.hyvs?.[hyvsId];
                if(!hyvsObj) {
                    return new Error(`Hyvs  ${hyvsId} not exits !!`)
                }
                const hRows = doc.hyvs[hyvsId].rows || [];
                const hIndx = hRows.findIndex(f=> f.objnr?.vc?.[0]?.c === objnr);
                hRows[hIndx][fieldId] = {fId:fieldId,vc:[{c: code, t: value}],oc:null,ls:fldObj?.ls,isInError:fldObj?.isInError,errmsgs:fldObj?.errmsgs,isCorrected:fldObj?.isCorrected};
                break;
        }
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
    public getTableData(request: RequestForSchemaDetailsWithBr, useCache = false) {
        this.fetchCount = request.fetchCount;
        let bufferData = [];
        if(request.isLoadMore) {
            bufferData = this.bufferData.splice(0, request.fetchSize);
            if (bufferData.length >= request.fetchSize) {
                const newData = this.docValue();
                this.populateData(bufferData);
                newData.push(...bufferData);
                this.dataSourceSubject.next(newData);
                this.mdoRecordResponseSub.next(this.mdoRecordResponseSub.getValue());
                return;
            }
        } else {
            this.bufferData = [];
        }
        const obs = (useCache && !request.isLoadMore && this.mdoRecordResponseSub.getValue().length) ? of({
            docs: this.mdoRecordResponseSub.getValue().slice(0, request.fetchSize),
            cache: true
        }) : this.schemaDetailService.getSchemaTableData(request);
        obs.pipe(finalize(() => { this.sharedService.setSchemaDetailsTableDataAPICallState('false') })).subscribe(res=>{
            let newData = [];
            const receivedData = this.docsTransformation(res, request);
            const selectedData = receivedData.splice(0, request.fetchSize);
            if(request.isLoadMore) {
                newData = this.docValue();
                this.mdoRecordResponseSub.next(this.mdoRecordResponseSub.getValue() ? this.mdoRecordResponseSub.getValue().concat(res?.docs) : []);
            } else {
                this.mdoRecordResponseSub.next(res?.docs);
            }
            const selectedNewData = [...bufferData, ...selectedData];
            this.populateData(selectedNewData);
            newData.push(...selectedNewData);
            this.bufferData.push(...receivedData);
            this.dataSourceSubject.next(newData);
            this.fetchCount = request.fetchCount + 1;
        }, error=>{
            this.dataSourceSubject.next([]);
            console.error(`Error : ${error.message}`);
        });
        return obs;
    }

    populateData = (list?: SchemaTableData[]) => {}
    /**
     * Transformation server index data to Datasource
     * @param res table response from server ..
     */
     public docsTransformation(res: any, req: RequestForSchemaDetailsWithBr): any[] {
        const reqTye = req.requestStatus;
        const finalResonse = [];
        const addDoc = (doc) => finalResonse.push(JSON.parse(JSON.stringify(doc)));
        if(res && res.docs) {
            const docs = res.docs;
            docs.forEach(doc => {
                const rowData : any = {};

                // object number
                const objnr: SchemaTableData = new SchemaTableData();
                objnr.fieldData = doc.id;
                objnr.fieldId = 'OBJECTNUMBER';
                objnr.fieldDesc = 'Object Number';
                objnr.isReviewed = doc.isReviewed ? doc.isReviewed : false;
                rowData.OBJECTNUMBER = objnr;

                // score column
                const score: SchemaTableData = new SchemaTableData();
                score.fieldData = String(doc._score ? (doc._score * 100).toFixed(2) : 0);
                score.fieldId = '_score_weightage';
                score.fieldDesc = 'Score';
                rowData._score_weightage = score;


                const hdvs = doc.hdvs ? doc.hdvs : {};
                // hdvs = this.checkFieldIsInError(hdvs);
                for(const hdfld in hdvs ) {
                    if(hdvs.hasOwnProperty(hdfld)) {
                        const cell: SchemaTableData = new SchemaTableData();
                        cell.fieldId = hdfld;
                        cell.fieldDesc = hdvs[hdfld].ls ? hdvs[hdfld].ls : 'Unknown';

                        // only code is visiable
                        // TODO on based on display criteria
                        const dropVal = hdvs[hdfld].vc ?  hdvs[hdfld].vc.map(map => map.t || map.c).toString() : '';
                        cell.fieldData = dropVal ? dropVal : '';
                        const dropCode = hdvs[hdfld].vc ?  hdvs[hdfld].vc.map(map => map.c).toString() : '';
                        cell.fieldCode = dropCode || '';

                        // check cell is in error
                        if(reqTye === 'error') {
                            // const errCell =  this.checkFieldIsInError(hdfld);
                            cell.isInError = hdvs[hdfld].isInError ? hdvs[hdfld].isInError : false;
                            cell.errorMsg = hdvs[hdfld].errmsgs ? hdvs[hdfld].errmsgs.toString() : '';
                        }

                        // check for old values
                        if(hdvs[hdfld].oc && hdvs[hdfld].oc.length>0) {
                            const oldVal = hdvs[hdfld].oc ?  hdvs[hdfld].oc.map(map => map.t || map.c).toString() : '';
                            cell.oldData = oldVal;
                            // cell.isCorrected = cell.oldData === cell.fieldData ? false : true;
                            cell.isCorrected = true;
                        } else if(hdvs[hdfld].isCorrected) {
                            cell.isCorrected = true;
                        }
                        rowData[hdfld] =cell;
                    }

                }
                if(req.nodeType === 'HEIRARCHY') {
                    const hyvs = doc.hyvs ? doc.hyvs : {};
                    // hyvs = this.checkFieldIsInError(hyvs);
                    if(hyvs.hasOwnProperty(req.nodeId)) {
                        const rows = hyvs[req.nodeId].rows ? hyvs[req.nodeId].rows : [];
                        for(const r of rows) {
                            const _rrData = {...rowData};
                            for(const robj in r) {
                                if(r.hasOwnProperty(robj)) {
                                    const cell: SchemaTableData = new SchemaTableData();
                                    cell.fieldId = robj;
                                    cell.fieldDesc = r[robj].ls ? r[robj].ls : 'Unknown';
                                    // only code is visiable
                                    // TODO on based on display criteria
                                    const dropVal = r[robj].vc ?  r[robj].vc.map(map => map.t || map.c).toString() : '';
                                    cell.fieldData = dropVal ? dropVal : '';
                                    const dropCode = r[robj].vc ?  r[robj].vc.map(map => map.c).toString() : '';
                                    cell.fieldCode = dropCode || '';

                                    // check cell is in error
                                    if(reqTye === 'error') {
                                        // const errCell =  this.checkFieldIsInError(hdfld);
                                        cell.isInError = (r[robj] && r[robj].isInError) ? r[robj].isInError : false;
                                        cell.errorMsg = (r[robj] && r[robj].errmsgs) ? r[robj].errmsgs.toString() : '';
                                    }

                                    // check for old values
                                    if(r[robj].oc && r[robj].oc.length>0) {
                                        const oldVal = r[robj].oc ?  r[robj].oc.map(map => map.t || map.c).toString() : '';
                                        cell.oldData = oldVal;
                                        // cell.isCorrected = cell.oldData === cell.fieldData ? false : true;
                                        cell.isCorrected = true;
                                    } else if(r[robj].isCorrected) {
                                        cell.isCorrected = true;
                                    }
                                    _rrData[robj] =cell;
                                }
                            }
                            addDoc(_rrData);
                        }

                    } else {
                        addDoc(rowData);
                    }

                } else if (req.nodeType === 'GRID') {
                    const gvs = doc.gvs ? doc.gvs : {};
                    // gvs = this.checkFieldIsInError(gvs);
                    if(gvs.hasOwnProperty(req.nodeId)) {
                        const rows = gvs[req.nodeId].rows ? gvs[req.nodeId].rows : [];
                        for(const r of rows) {
                            const _rrData = {...rowData};
                            for(const robj in r) {
                                if(r.hasOwnProperty(robj)) {
                                    const cell: SchemaTableData = new SchemaTableData();
                                    cell.fieldId = robj;
                                    cell.fieldDesc = r[robj].ls ? r[robj].ls : 'Unknown';

                                    // only code is visiable
                                    // TODO on based on display criteria
                                    const dropVal = r[robj].vc ?  r[robj].vc.map(map => map.t || map.c).toString() : '';
                                    cell.fieldData = dropVal ? dropVal : '';
                                    const dropCode = r[robj].vc ?  r[robj].vc.map(map => map.c).toString() : '';
                                    cell.fieldCode = dropCode || '';

                                    // check cell is in error
                                    if(reqTye === 'error') {
                                        // const errCell =  this.checkFieldIsInError(hdfld);
                                        cell.isInError = (r[robj] && r[robj].isInError) ? r[robj].isInError : false;
                                        cell.errorMsg = (r[robj] && r[robj].errmsgs) ? r[robj].errmsgs.toString() : '';
                                    }

                                    // check for old values
                                    if(r[robj].oc && r[robj].oc.length>0) {
                                        const oldVal = r[robj].oc ?  r[robj].oc.map(map =>map.t || map.c).toString() : '';
                                        cell.oldData = oldVal;
                                        // cell.isCorrected = cell.oldData === cell.fieldData ? false : true;
                                        cell.isCorrected = true;
                                    } else if(r[robj].isCorrected) {
                                        cell.isCorrected = true;
                                    }
                                    _rrData[robj] =cell;
                                }
                            }
                            addDoc(_rrData);
                        }

                    } else {
                        addDoc(rowData);
                    }
                } else {
                    addDoc(rowData);
                }

            });

        }
        return finalResonse;
    }

    /**
     * Transform data after error check .. and update mesage
     * @param rowData checkable fields
     */
    // checkFieldIsInError(rowData: any) {

    //     const brMetadata = this.brMetadata.getValue();
    //     if(brMetadata) {
    //         brMetadata.forEach(br=>{
    //             // check with udr
    //             const errorMessage = br.dynamicMessage ? br.dynamicMessage : br.brDescription;
    //             if(br.udrblocks) {
    //                 const fields = br.udrblocks.map(map => map.conditionFieldId);
    //                 fields.forEach(brFld=>{
    //                     if(rowData.hasOwnProperty(brFld)) {
    //                         rowData[brFld].isInError = true;
    //                         const exitingMsg =  rowData[brFld].message ? rowData[brFld].message : [];
    //                         if(exitingMsg.indexOf(errorMessage) === -1) {
    //                             exitingMsg.push(errorMessage);
    //                         }
    //                         rowData[brFld].message = exitingMsg;
    //                     } else {
    //                         rowData[brFld] = {fId: brFld,vc: [{c: '',t: ''}],ls: '', isInError:true,message:[br.dynamicMessage ? br.dynamicMessage : br.brDescription]};
    //                     }
    //                 });
    //             } else {
    //                 const brfldarray = br.fields.split(',');
    //                 brfldarray.forEach(brFld=>{
    //                     if(rowData.hasOwnProperty(brFld)) {
    //                         rowData[brFld].isInError = true;
    //                         const exitingMsg =  rowData[brFld].message ? rowData[brFld].message : [];
    //                         if(exitingMsg.indexOf(errorMessage) === -1) {
    //                             exitingMsg.push(errorMessage);
    //                         }
    //                         rowData[brFld].message = exitingMsg;
    //                     } else {
    //                         rowData[brFld] = {fId: brFld,vc: [{c: '',t: ''}],ls: '', isInError:true,message:[br.dynamicMessage ? br.dynamicMessage : br.brDescription]};
    //                     }
    //                 });
    //             }
    //         });
    //     }
    //     // console.log(rowData);
    //     return rowData;
    // }

}



