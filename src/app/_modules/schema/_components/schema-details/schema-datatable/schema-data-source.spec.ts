import { SchemaDataSource } from './schema-data-source';
import { async, TestBed } from '@angular/core/testing';
import { SchemaDetailsService } from 'src/app/_services/home/schema/schema-details.service';
import { Any2tsService } from 'src/app/_services/any2ts.service';
import { RequestForSchemaDetailsWithBr, SchemaBrInfo } from 'src/app/_models/schema/schemadetailstable';
import { Observable, of, throwError } from 'rxjs';
import { BlockType } from '@modules/admin/_components/module/business-rules/user-defined-rule/udr-cdktree.service';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';

describe('SchemaDataSource', () => {
    let schemaDetailSerSpy: jasmine.SpyObj<SchemaDetailsService>;
    let schemaDataSourceService: SchemaDataSource;
    let sharedService: SharedServiceService;
    beforeEach(async(() => {
        const schemaSerSpy = jasmine.createSpyObj('SchemaDetailsService', ['getSchemaTableDetailsByBrId', 'getCorrectedRecords', 'getLastBrErrorRecords', 'getSchemaBrInfoList', 'getSchemaTableData']);
        const any2tsSpy = jasmine.createSpyObj('Any2tsService', ['any2DataTable', 'any2SchemaTableData']);
        TestBed.configureTestingModule({
            providers: [
                { provide: SchemaDetailsService, useValue: schemaSerSpy },
                { provide: Any2tsService, useValue: any2tsSpy }
            ]
        }).compileComponents();
        schemaDetailSerSpy = TestBed.inject(SchemaDetailsService) as jasmine.SpyObj<SchemaDetailsService>;
        schemaDetailSerSpy.getSchemaBrInfoList.withArgs('12345').and.returnValue(new Observable<SchemaBrInfo[]>());
    }));

    beforeEach(() => {
        sharedService = new SharedServiceService();
        schemaDataSourceService = new SchemaDataSource(schemaDetailSerSpy, null, '12345', sharedService);
    });

    it('should create an instance', () => {
        expect(new SchemaDataSource(schemaDetailSerSpy, null, '12345', sharedService)).toBeTruthy();
    });

    it('connect(), should be return []  ', async(() => {
        const response = schemaDataSourceService.connect(null);
        response.subscribe(data => {
            expect(data).toEqual([]);
        });
    }));

    it('disconnect(), complete the dataSource Observale', async(() => {
        expect(schemaDataSourceService.disconnect(null)).toEqual(undefined);
    }));

    it('docLength()', async(() => {
        expect(schemaDataSourceService.docLength()).toEqual(0);
    }));

    it('docValue()', async(() => {
        expect(schemaDataSourceService.docValue()).toEqual([]);
    }));

    it('setDocValue()', async(() => {
        expect(schemaDataSourceService.setDocValue([])).toBeUndefined();
    }));

    it('getTableData()', async(() => {
        const req = new RequestForSchemaDetailsWithBr();
        schemaDetailSerSpy.getSchemaTableData.withArgs(req).and.returnValue(new Observable<any>());
        expect(schemaDataSourceService.getTableData(req)).toBeTruthy();
    }));

    it('docsTransformation()', async(() => {
        const req = new RequestForSchemaDetailsWithBr();
        expect(schemaDataSourceService.docsTransformation(null, req)).toEqual([]);
    }));

    it('getTableData()', async(() => {
        const req = new RequestForSchemaDetailsWithBr();
        const res: any = {
            loadMore: true
        };
        schemaDetailSerSpy.getSchemaTableData.withArgs(req).and.returnValue(of(res as Observable<any>));
        expect(schemaDataSourceService.getTableData(req)).toBeTruthy();

        req.isLoadMore = true;
        schemaDetailSerSpy.getSchemaTableData.withArgs(req).and.returnValue(of(res as Observable<any>));
        expect(schemaDataSourceService.getTableData(req)).toBeTruthy();

        schemaDetailSerSpy.getSchemaTableData.withArgs(req).and.returnValue(throwError({message: 'api error'}));
        expect(schemaDataSourceService.getTableData(req)).toBeTruthy();
    }));

    it('create instance', async(() => {
        const res: SchemaBrInfo = {
            brType: 'BR_TRANSFORMATION',
            dynamicMessage: '',
            brId: '',
            schemaId: '',
            refId: '',
            fields: '',
            schemaOrder: 0,
            brDescription: '',
            udrblocks: [],
            transformationModel: [
                {
                    transformationRuleType: 'LOOKUP',
                    sourceFld: '',
                    targetFld: '',
                    excludeScript: '',
                    includeScript: '',
                    parameter: {
                        id: '',
                        udrid: '',
                        conditionFieldId: '',
                        conditionValueFieldId: '',
                        conditionFieldValue: '',
                        conditionFieldStartValue: '',
                        conditionFieldEndValue: '',
                        blockType: BlockType.AND,
                        conditionOperator: '',
                        blockDesc: '',
                        objectType: ''
                    }
                }
            ]
        }
        schemaDetailSerSpy.getSchemaBrInfoList.withArgs('12345').and.returnValue(of([res] as SchemaBrInfo[]));
        expect(new SchemaDataSource(schemaDetailSerSpy, null, '12345', sharedService)).toBeTruthy();

        res.transformationModel[0].transformationRuleType = '';
        schemaDetailSerSpy.getSchemaBrInfoList.withArgs('12345').and.returnValue(of([res] as SchemaBrInfo[]));
        expect(new SchemaDataSource(schemaDetailSerSpy, null, '12345', sharedService)).toBeTruthy();

        res.brType = '';
        schemaDetailSerSpy.getSchemaBrInfoList.withArgs('12345').and.returnValue(of([res] as SchemaBrInfo[]));
        expect(new SchemaDataSource(schemaDetailSerSpy, null, '12345', sharedService)).toBeTruthy();

        schemaDetailSerSpy.getSchemaBrInfoList.withArgs('12345').and.returnValue(throwError({message: 'api error'}));
        expect(new SchemaDataSource(schemaDetailSerSpy, null, '12345', sharedService)).toBeTruthy();
    }));

    it('docsTransformation()', async(() => {
        const req: RequestForSchemaDetailsWithBr = {
            schemaId: '',
            runId: '',
            brId: '',
            plantCode: '',
            variantId: '',
            requestStatus: 'error',
            executionStartDate: '',
            selectedFields: [],
            fetchSize: 0,
            fetchCount: 0,
            gridId: [],
            hierarchy: [],
            schemaThreshold: 0,
            afterKey: false,
            filterCriterias: [],
            sort: {},
            isLoadMore: false,
            nodeId: 'plant_code',
            nodeType: 'HEIRARCHY'
        };
        const res = {
            docs: [
                {
                    id : '1234',
                    isReviewed: true,
                    _score: 50,
                    hdvs: []
                }
            ]
        };
        let response = schemaDataSourceService.docsTransformation(res, req);
        expect(response.length).toEqual(1);

        const res1 = {
            docs: [
                {
                    id : '1234',
                    isReviewed: false,
                    _score: 0
                }
            ]
        };
        response = schemaDataSourceService.docsTransformation(res1, req);
        expect(response.length).toEqual(1);

        const res2: any = {
            docs: [
                {
                    id : '1234',
                    isReviewed: false,
                    _score: 0,
                    hdvs: {
                        test: {
                            ls: 0,
                            vc: [],
                            oc: []
                        }
                    }
                }
            ]
        };
        response = schemaDataSourceService.docsTransformation(res2, req);
        expect(response.length).toEqual(1);

        res2.docs[0].hdvs.test = {
            ls: 1,
            vc: [
                {
                    c: 1
                }
            ],
            isInError: true,
            errmsgs: 'test',
            oc: [
                {
                    c: 2
                }
            ]
        };
        response = schemaDataSourceService.docsTransformation(res2, req);
        expect(response.length).toEqual(1);

        req.requestStatus = '';
        res2.docs[0].hdvs.test = {
            ls: 1,
            isInError: true,
            errmsgs: 'test',
            oc: [
                {
                    c: 2
                }
            ]
        };
        response = schemaDataSourceService.docsTransformation(res2, req);
        expect(response.length).toEqual(1);

        res2.docs[0].hyvs = {
            plant_code: {
                rows: []
            }
        };
        response = schemaDataSourceService.docsTransformation(res2, req);
        expect(response.length).toEqual(0);

        res2.docs[0].hyvs = {
            plant_code : {}
        }
        response = schemaDataSourceService.docsTransformation(res2, req);
        expect(response.length).toEqual(0);

        res2.docs[0].hyvs = {
            plant_code : {
                rows: [
                    {
                        test: {
                            ls: 1,
                            vc: [
                                {
                                    c: 1
                                }
                            ],
                            oc: [
                                {
                                    c: 1
                                }
                            ]
                        }
                    }
                ]
            }
        };
        req.requestStatus = 'error';
        response = schemaDataSourceService.docsTransformation(res2, req);
        expect(response.length).toEqual(1);

        res2.docs[0].hyvs.plant_code.rows[0].test = {
            ls: 0,
            isInError: true,
            errmsgs: 'test'
        };
        response = schemaDataSourceService.docsTransformation(res2, req);
        expect(response.length).toEqual(1);

        req.requestStatus = '';
        response = schemaDataSourceService.docsTransformation(res2, req);
        expect(response.length).toEqual(1);

        req.nodeType = 'GRID';
        res2.docs[0] = {
            gvs: {
                plant_code: {
                    rows: [
                        {
                            test: {
                                ls: 1,
                                vc: [
                                    {
                                        c: 1
                                    }
                                ],
                                oc: [
                                    {
                                        c: 1
                                    }
                                ]
                            }
                        }

                    ]
                }
            }
        };
        req.requestStatus = 'error';
        response = schemaDataSourceService.docsTransformation(res2, req);
        expect(response.length).toEqual(1);
    }));

    it('updateDoc(), update the doc with the edited value for hdvs... ', async(()=>{
        // mock data for header cell editing
        spyOn(schemaDataSourceService,'getRow').withArgs('RAC001').and.returnValue({id:'RAC001',hdvs:{test:{vs:[{c:'hello'}]}}});
        schemaDataSourceService.updateDoc('RAC001','test','h',null,null);

        expect(schemaDataSourceService.getRow).toHaveBeenCalledWith('RAC001');
    }));

    it('updateDoc(), update the doc with the edited value for hyvs... ', async(()=>{
        // mock data for header cell editing
        spyOn(schemaDataSourceService,'getRow').withArgs('RAC001').and.returnValue({id:'RAC001',hyvs:{1:{rows:[{test:{vs:[{c:'hello'}]}},{objnr:{vs:[{c:'123'}]}}]}}});
        schemaDataSourceService.updateDoc('RAC001','test','h','heirarchy','grid','1','123');

        expect(schemaDataSourceService.getRow).toHaveBeenCalledWith('RAC001');

    }));

});

