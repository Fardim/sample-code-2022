import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ValidationError } from '@models/schema/schema';
import { CheckCodeModel } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { SchemaService } from '@services/home/schema.service';
import { TransientService } from 'mdo-ui-library';

@Component({
    selector: 'pros-check-code-sidesheet',
    styleUrls: ['./check-code-sidesheet.component.scss'],
    templateUrl: 'check-code-sidesheet.component.html'
})
export class CheckCodeSidesheetComponent {
    form: FormGroup;
    submitted = false;
    /**
     * To hold information about validation error.
     */
    validationError: ValidationError = {
        status: false,
        message: ''
    }
    @Output() closeDialog = new EventEmitter<CheckCodeModel>();
    @Input() set newCheckCode(code: string) {
        this.form.patchValue({
            code,
            shortDesc: code,
            additionalInfo: ''
        });
    }
    constructor(
        private schemaService: SchemaService,
        private transientService: TransientService
    ) {
        this.initializeForm();
    }

    initializeForm() {
        this.form = new FormGroup({
            code: new FormControl('', [Validators.required, Validators.maxLength(10)]),
            shortDesc: new FormControl('', [Validators.required, Validators.maxLength(40)]),
            additionalInfo: new FormControl('')
        });
    }
    save() {
        this.submitted = true;
        if (!this.form.valid) {
            this.showValidationError('Please complete the required fields!');
            return false;
        }
        this.validationError = {
            status: false,
            message: ''
        };
        const code: CheckCodeModel = this.form.value;
        this.schemaService.saveCheckCode(code).subscribe(() => {
            this.transientService.open('Code has been saved!');
            this.closeDialogComponent(code);
        }, (error) => {
            this.transientService.open('Error occured while saving code!');
            console.error('Error occured while saving code', error);
        });
        return true;
    }

    closeDialogComponent(code?: any) {
        this.closeDialog.emit(code);
    }

    /**
     * Function to hide validation error
     * @param message: error message to display..
     */
    showValidationError(message: string) {
        this.validationError.status = true;
        this.validationError.message = message;
        setTimeout(() => {
            this.validationError.status = false;
        }, 3000)
    }
}