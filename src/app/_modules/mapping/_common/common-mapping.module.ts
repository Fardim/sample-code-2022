import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@modules/shared/shared.module';
import { MdoUiLibraryModule } from 'mdo-ui-library';
import { FieldValueTransformationComponent } from '../_components/field-value-transformation/field-value-transformation.component';
import { MappingFiltersComponent } from '../_components/mapping-filters/mapping-filters.component';
import { MappingWrapperComponent } from '../_components/mapping-wrapper/mapping-wrapper.component';
import { SourceFieldComponent } from '../_components/source-field/source-field.component';
import { SourceSectionComponent } from '../_components/source-section/source-section.component';
import { TargetFieldComponent } from '../_components/target-field/target-field.component';
import { TargetSectionComponent } from '../_components/target-section/target-section.component';

const EXPORTABLE_COMPONENTS = [
    MappingFiltersComponent,
    SourceFieldComponent,
    TargetFieldComponent,
    FieldValueTransformationComponent,
    TargetSectionComponent,
    SourceSectionComponent,
    MappingWrapperComponent
];
@NgModule({
  declarations: [
    ...EXPORTABLE_COMPONENTS,
  ],
  imports: [
    CommonModule,
    MdoUiLibraryModule,
    SharedModule,
  ],
  exports: [
    ...EXPORTABLE_COMPONENTS
  ]
})
export class CommonMappingModule { }