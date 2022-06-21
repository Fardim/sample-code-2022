import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CheckCodeModel } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { GlobaldialogService } from '@services/globaldialog.service';
import { SchemaService } from '@services/home/schema.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
    selector: 'pros-check-code-control',
    styleUrls: ['./check-code-control.component.scss'],
    templateUrl: 'check-code-control.component.html'
})

export class CheckCodeControlComponent implements OnInit, OnDestroy {
    searchStringSub = new BehaviorSubject('');
    subscriptions: Array<Subscription> = [];
    @ViewChild('codeInput') codeInput: ElementRef;
    @Input() submitted = false;
    @Input() formGroup: FormGroup;
    @Input() disabled = false;
    checkCodeList: Array<CheckCodeModel> = [];
    newCheckCode = '';
    displaySidesheet = false;
    get checkCodeSearchStr() {
        return this.searchStringSub.value;
    }
    constructor(
        private schemaService: SchemaService,
        public globaldialogService: GlobaldialogService
    ) { }

    ngOnInit() {
        this.getCheckCodeList();
        this.subscriptions.push(this.searchStringSub.pipe(debounceTime(700), distinctUntilChanged()).subscribe((searchStr) => {
            if (searchStr) {
                this.newCheckCode = searchStr;
            }
            this.getCheckCodeList(searchStr);
        }));
    }

    selectCheckCode(codeObj: CheckCodeModel) {
        if (codeObj) {
            this.formGroup.get('description').setValue(codeObj.shortDesc);
            this.formGroup.get('code').setValue(codeObj.code);
        }
    }

    getCheckCodeList(searchString = '') {
        this.schemaService.getCheckCodeList(searchString).subscribe((res) => {
            this.checkCodeList = res;
        }, () => {
            this.checkCodeList = [];
        });
    }

    ngOnDestroy() {
        this.subscriptions.forEach((sub) => sub.unsubscribe());
    }

    createNewCheckCode() {
        const code = this.newCheckCode;
        if (code) {
            this.openNewCheckCodeSidesheet(code);
            const codeObj = {
                code,
                additionalInfo: '',
                shortDesc: ''
            };
            this.checkCodeList.push(codeObj);
        }
    }

    openNewCheckCodeSidesheet(code: string) {
        this.displaySidesheet = true;
        this.codeInput?.nativeElement.blur();
    }

    updateCheckcodeSelected(codeObject?: CheckCodeModel) {
        this.displaySidesheet = false;
        this.selectCheckCode(codeObject);
    }

    searchCode($event: any) {
        this.searchStringSub.next($event.value);
    }
}