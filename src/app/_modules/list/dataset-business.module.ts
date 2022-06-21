import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// COMPONENTS
import { BusinessRuleListComponent } from './_components/dataset-business-rule/business-rule-list/business-rule-list.component';

const routes: Routes = [
  {
    path: ':moduleId',
    component: BusinessRuleListComponent,
  },
];

@NgModule({
  declarations: [BusinessRuleListComponent],
  imports: [CommonModule, RouterModule.forChild(routes), SharedModule, FormsModule, ReactiveFormsModule],
})
export class DatasetBusinessModule {}
