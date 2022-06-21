import { FieldEffect } from '@store/effects/field.effect';
import { fieldReducers } from '@store/models/field.model';
import { FIELD_MODULE_STATE_NAME } from '@store/selectors/field.selector';
import { DropdownFieldComponent } from './_components/forms/dropdown-field/dropdown-field.component';
import { UrlFieldsComponent } from './_components/forms/url-fields/url-fields.component';
import { GridTypeFieldsComponent } from './_components/forms/grid-type-fields/grid-type-fields.component';
import { TextFieldComponent } from './_components/forms/text-field/text-field.component';
import { AttachmentFieldComponent } from './_components/forms/attachment-field/attachment-field.component';
import { CheckboxFieldComponent } from './_components/forms/checkbox-field/checkbox-field.component';
import { RichTextEditorFieldComponent } from './_components/forms/rich-text-editor-field/rich-text-editor-field.component';
import { EmailFieldComponent }  from './_components/forms/email-field/email-field.component';
import { FieldsWidgetsComponent } from './_components/fields-widgets/fields-widgets.component';
import { FieldsPropertiesComponent } from './_components/fields-properties/fields-properties.component';
import { DataBuilderNullstateComponent } from './_components/data-builder-nullstate/data-builder-nullstate.component';
import { HierarchyListComponent } from './_components/field/hierarchy-list/hierarchy-list.component';
import { EditLabelComponent } from './_components/field/hierarchy-list/edit-label/edit-label.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from './../shared/shared.module';
import { FieldComponent } from './_components/field/field.component';
import { FieldResolver } from './_components/field/field.resolver';
import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateFieldComponent } from './_components/forms/date-field/date-field.component';
import { DateTimeFieldComponent } from './_components/forms/date-time-field/date-time-field.component';
import { TimeFieldComponent } from './_components/forms/time-field/time-field.component';
import { ActivateDeactivateFieldComponent } from './_components/forms/activate-deactivate-field/activate-deactivate-field.component';
import { RadioButtonFieldComponent } from './_components/forms/radio-button-field/radio-button-field.component';
import { EditDatasetComponent } from './_components/field/edit-dataset/edit-dataset.component';
import { DatasetReferenceFieldComponent } from './_components/forms/dataset-reference-field/dataset-reference-field.component';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

const routes: Routes = [
  {
    path: ':moduleId',
    component: FieldComponent,
    runGuardsAndResolvers: 'pathParamsChange',
    resolve: {
      fieldData: FieldResolver
    }
  },
  {
    path: ':moduleId/:type',
    component: FieldComponent,
    runGuardsAndResolvers: 'pathParamsChange',
    resolve: {
      fieldData: FieldResolver
    }
  }
];

@NgModule({
  declarations: [
    FieldComponent,
    DataBuilderNullstateComponent,
    CheckboxFieldComponent,
    FieldsPropertiesComponent,
    FieldsWidgetsComponent,
    TextFieldComponent,
    DropdownFieldComponent,
    UrlFieldsComponent,
    HierarchyListComponent,
    EditLabelComponent,
    AttachmentFieldComponent,
    EmailFieldComponent,
    GridTypeFieldsComponent,
    AttachmentFieldComponent,
    RichTextEditorFieldComponent,
    DateFieldComponent,
    DateTimeFieldComponent,
    TimeFieldComponent,
    ActivateDeactivateFieldComponent,
    RadioButtonFieldComponent,
    EditDatasetComponent,
    DatasetReferenceFieldComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    StoreModule.forFeature(FIELD_MODULE_STATE_NAME, fieldReducers),
    EffectsModule.forFeature([FieldEffect]),
  ],
})
export class FieldsModule {}
