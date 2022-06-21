
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from './../shared/shared.module';
import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GroupConditionsComponent } from './_components/list-dependency-rule/_components/group-conditions/group-conditions.component';

const routes: Routes = [
  {
    path: ':moduleId/:groupId/:ruleTitle',
    component: GroupConditionsComponent,
  },
  {
    path: ':moduleId/:groupId/:ruleTitle/:mappingId',
    component: GroupConditionsComponent,
  }
];

@NgModule({
  declarations: [
    GroupConditionsComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    FormsModule,
    ReactiveFormsModule],
})
export class GroupConditionsModule {
  constructor(){
  }
}