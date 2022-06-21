import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MappingRoutingModule } from './mapping-routing.module';
import { MappingComponent } from './mapping.component';
import { MdoUiLibraryModule } from 'mdo-ui-library';
import { SharedModule } from '@modules/shared/shared.module';
import { CommonMappingModule } from '@modules/mapping/_common/common-mapping.module';
import { FieldMappingComponent } from './_components/field-mapping/field-mapping.component';
import { TranslationRuleComponent } from './_components/translation-rule/translation-rule.component';
import { TargetFieldTransformationRuleComponent } from './_components/target-field-transformation-rule/target-field-transformation-rule.component';

@NgModule({
  declarations: [
    FieldMappingComponent,
    MappingComponent,
    TranslationRuleComponent
  ],
  imports: [
    CommonModule,
    MappingRoutingModule,
    MdoUiLibraryModule,
    SharedModule,
    CommonMappingModule
  ],
  bootstrap: [MappingComponent]
})
export class MappingModule { }
