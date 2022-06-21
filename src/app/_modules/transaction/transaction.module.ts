import { ExpansionViewEffect } from '@store/effects/expansion-view.effects';
import { EffectsModule } from '@ngrx/effects';
import { EXPANSION_VIEW_MODULE_STATE_NAME } from '@store/selectors/expansion-view.selector';
import { StoreModule } from '@ngrx/store';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionRoutingModule } from './transaction-routing.module';
import { TransactionInputComponent } from './elements/transaction-input/transaction-input.component';

import { SharedModule } from '@modules/shared/shared.module';
import { ChatModule } from '@modules/chat/chat.module';
import { TransactionGridModule } from './transaction-grid.module'

import { TransactionCheckboxComponent } from './elements/transaction-checkbox/transaction-checkbox.component';
import { TransactionTextareaComponent } from './elements/transaction-textarea/transaction-textarea.component';
import { TransactionDatePickerComponent } from './elements/transaction-date-picker/transaction-date-picker.component';
import { TransactionDropdownComponent } from './elements/transaction-dropdown/transaction-dropdown.component';
import { TransactionRadioGroupComponent } from './elements/transaction-radio-group/transaction-radio-group.component';
import { TransactionToggleComponent } from './elements/transaction-toggle/transaction-toggle.component';
import { TransactionHierarchyListComponent } from './_components/transaction-hierarchy-list/transaction-hierarchy-list.component';
import { TransactionTabsComponent } from './_components/transaction-tabs/transaction-tabs.component';
import { TransactionTabComponent } from './_components/transaction-tab/transaction-tab.component';
import { TransactionBuilderComponent } from './_components/transaction-builder/transaction-builder.component';
import { TransactionErrorsComponent } from './_components/transaction-errors/transaction-errors.component';
import { TransactionHtmlEditorComponent } from './elements/transaction-html-editor/transaction-html-editor.component';
import { TransactionStaticTextComponent } from './elements/transaction-static-text/transaction-static-text.component';
import { TransactionDatarefComponent } from './elements/transaction-dataref/transaction-dataref.component';
import { TransactionGenerateDescriptionComponent } from './elements/transaction-generate-description/transaction-generate-description.component';
import { TransactionGenerateDescriptionAddComponent } from './elements/transaction-generate-description-add/transaction-generate-description-add.component';
import { TransactionDatasetTabComponent } from './_components/transaction-dataset-tab/transaction-dataset-tab.component';
import { TransactionDateTimePickerComponent } from './elements/transaction-date-time-picker/transaction-date-time-picker.component';
import { TransactionImageComponent } from './elements/transaction-image/transaction-image.component';
import { DuplicateRecordsDatatableComponent } from './_components/duplicate-records-datatable/duplicate-records-datatable.component';
import { DuplicateDatatableColumnsSettingComponent } from './_components/duplicate-datatable-columns-setting/duplicate-datatable-columns-setting.component';
import { ExpansionViewComponent } from './_components/expansion-view/expansion-view.component';
import { expansionviewReducer } from '@store/models/expansion-view.model';
import { GenerateDescriptionExpansionViewComponent } from './_components/generate-description-expansion-view/generate-description-expansion-view.component';

@NgModule({
  declarations: [
    TransactionTabComponent,
    TransactionTabsComponent,
    TransactionInputComponent,
    TransactionCheckboxComponent,
    TransactionTextareaComponent,
    TransactionDatePickerComponent,
    TransactionDropdownComponent,
    TransactionRadioGroupComponent,
    TransactionToggleComponent,
    TransactionHierarchyListComponent,
    TransactionTabsComponent,
    TransactionBuilderComponent,
    TransactionErrorsComponent,
    TransactionDatarefComponent,
    TransactionHtmlEditorComponent,
    TransactionStaticTextComponent,
    TransactionGenerateDescriptionComponent,
    TransactionGenerateDescriptionAddComponent,
    TransactionDatasetTabComponent,
    TransactionDateTimePickerComponent,
    ExpansionViewComponent,
    DuplicateRecordsDatatableComponent,
    DuplicateDatatableColumnsSettingComponent,
    TransactionImageComponent,
    GenerateDescriptionExpansionViewComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    TransactionRoutingModule,
    ChatModule,
    StoreModule.forFeature(EXPANSION_VIEW_MODULE_STATE_NAME, expansionviewReducer),
    EffectsModule.forFeature([ExpansionViewEffect]),
    TransactionGridModule
  ]
})
export class TransactionModule { }
