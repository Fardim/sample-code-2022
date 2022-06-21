import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CoreSchemaBrInfo, TargetSystemModel } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { SchemaService } from '@services/home/schema.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'pros-setup-web-service-call',
    styleUrls: ['./setup-web-service-call.component.scss'],
    templateUrl: './setup-web-service-call.component.html'
})

export class SetupWebServiceCallComponent implements OnInit, OnChanges, OnDestroy {
    form: FormGroup;
    targetSystemList: Array<TargetSystemModel> = [];
    targetSystemFiltered: Array<TargetSystemModel> = [];

    /**
     * input property for business rule
     */
    @Input()
    coreSchemaBrInfo: CoreSchemaBrInfo;
    @Input() submitted = false;
    @Output() formChange = new EventEmitter<any>();
    subscriptions: Array<Subscription> = [];
    constructor(
        private schemaService: SchemaService
    ) {
        this.initializeForm();
    }

    initializeForm() {
        this.form = new FormGroup({
            check_code: new FormGroup({
                code: new FormControl('', [Validators.required]),
                description: new FormControl('', [Validators.required])
            }),
            target_system: new FormControl('', [Validators.required])
        });;
    }

    ngOnInit() {
        this.formChange.emit(this.form);
        this.getTargetSystemList();
    }
    ngOnDestroy() {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    searchTargetSystem(searchStr: string = '') {
        searchStr = searchStr.toLowerCase();
        this.targetSystemFiltered = this.targetSystemList.filter((row) => { return !searchStr || row.name.toLowerCase().includes(searchStr) });
    }

    displayTargetSystemFn(connid) {
        return this.targetSystemList.find(ts => `${ts.connid}` === `${connid}`)?.name || '';
    }

    ngOnChanges(changes) {
        if (changes.coreSchemaBrInfo) {
            const metaData = this.coreSchemaBrInfo.lookupRuleMetadata;
            if (metaData) {
                this.patchValue({
                    target_system: metaData.targetSystem,
                    check_code: {
                        code: metaData.checkCodes?.[0],
                        description: metaData.checkCodeDesc
                    }
                });
            }
        }
    }

    patchValue(values: any) {
        this.form.patchValue(values);
    }

    getTargetSystemList() {
        this.subscriptions.push(
            this.schemaService.getTargetSystemList().subscribe((res) => {
                this.targetSystemList = res;
                this.searchTargetSystem('');
            })
        );
    }
}