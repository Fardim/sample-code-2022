import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@modules/shared/shared.module';
import { ChatModule } from '@modules/chat/chat.module';

import { TransactionGridFormViewComponent } from './_components/transaction-grid-form-view/transaction-grid-form-view.component';
import { FormViewDropdownComponent } from './elements/form-view-dropdown/form-view-dropdown.component';
import { TransactionGridComponent } from './elements/transaction-grid/transaction-grid.component';
import { FormViewRadioGroupComponent } from './elements/form-view-radio-group/form-view-radio-group.component';
import { FromViewAttachmentComponent } from './elements/from-view-attachment/from-view-attachment.component';
import { TransactionAttachmentComponent } from './elements/transaction-attachment/transaction-attachment.component';
import { TransactionTimePickerComponent } from './elements/transaction-time-picker/transaction-time-picker.component';
import { TransactionUrlComponent } from './elements/transaction-url/transaction-url.component';

@NgModule({
    declarations: [
        TransactionTimePickerComponent,
        TransactionUrlComponent,
        TransactionGridComponent,
        TransactionGridFormViewComponent,
        FormViewDropdownComponent,
        FormViewRadioGroupComponent,
        FromViewAttachmentComponent,
        TransactionAttachmentComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        ChatModule
    ],
    exports: [
        TransactionGridComponent,
        TransactionGridFormViewComponent,
        FormViewDropdownComponent,
        FormViewRadioGroupComponent,
        FromViewAttachmentComponent,
        TransactionAttachmentComponent,
        TransactionTimePickerComponent,
        TransactionUrlComponent,
    ]
})
export class TransactionGridModule { }
