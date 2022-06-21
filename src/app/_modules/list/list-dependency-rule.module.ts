import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, Routes } from '@angular/router';
import { ListDependencyRuleComponent } from './_components/list-dependency-rule/_components/list-dependency-rule.component';
import { SharedModule } from '../../_modules/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RulesComponent } from './_components/list-dependency-rule/_components/rules/rules.component';
import { MdoUiLibraryModule } from 'mdo-ui-library';
import { MatMenuModule } from '@angular/material/menu';

const routes: Routes = [
  {
    path: '',
    component: ListDependencyRuleComponent,
    children: [
      { path: 'rule/:moduleId', component:RulesComponent},
      { path: 'rule', component:RulesComponent},
      { path: 'rule/:moduleId/:groupId/:ruleTitle', component:RulesComponent},
      { path: 'rule/:moduleId/:groupId/:ruleTitle/:new', component:RulesComponent},
    ],
  },
];
@NgModule({
  declarations: [
    ListDependencyRuleComponent,
    RulesComponent,
],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MdoUiLibraryModule,
    // mat modules
    // MatMenuModule,
    // MatIconModule,
    // TransientService,
    // MatSnackBarModule,
    RouterModule.forChild(routes),
  ],
  exports:[MatMenuModule]
})
export class ListDependencyRuleModule { constructor(private router: Router){
}}
