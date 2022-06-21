import { TranslationRuleComponent } from './_components/translation-rule/translation-rule.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MappingComponent } from './mapping.component';
import { FieldMappingComponent } from './_components/field-mapping/field-mapping.component';

const routes: Routes = [
  {
    path: '',
    component: MappingComponent,
    children: [
      {
        path: 'field-mapping/:moduleId/:scenarioId',
        component: FieldMappingComponent
      },
      {
        path: 'field-value-transform/:fieldId/:translationRuleId',
        component: TranslationRuleComponent
      },
      {
        path: 'field-mapping/:moduleId/:scenarioId/:hasTranslationRuleSection',
        component: FieldMappingComponent
      },
      {
        path: '',
        redirectTo: 'field-mapping',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MappingRoutingModule { }
