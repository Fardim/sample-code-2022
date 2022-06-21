import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FlowHomeComponent } from './_components/flow-home/flow-home.component';
import { FlowSidesheetComponent } from './_components/flow-sidesheet/flow-sidesheet.component';
import { MaintainProcessComponent } from './_components/flow-sidesheet/maintain-process/maintain-process.component';
import { MapProcessVariableComponent } from './_components/flow-sidesheet/map-process-variable/map-process-variable.component';
import { NotificationComponent } from './_components/flow-sidesheet/notification/notification.component';
import { StepFormUpdateComponent } from './_components/flow-sidesheet/step-form-update/step-form-update.component';
import { StepInterfaceUpdateComponent } from './_components/flow-sidesheet/step-interface-update/step-interface-update.component';
import { StepPartnerUpdateComponent } from './_components/flow-sidesheet/step-partner-update/step-partner-update.component';
import { StepRulesUpdateComponent } from './_components/flow-sidesheet/step-rules-update/step-rules-update.component';

const routes: Routes = [
  { path: '_all', component: FlowHomeComponent},
  { path: 'sidesheet/:id', component: FlowSidesheetComponent},
  { path: 'form/:id/:stepId/:outlet',pathMatch:'full', component: StepFormUpdateComponent },
  {path:'rules/:id/:stepId/:outlet',component:StepRulesUpdateComponent},
  {path:'mapvariable/:id/:datasetId/:outlet',component:MapProcessVariableComponent},
  {path:'maintainprocess/:id/:datasetId/:outlet',component:MaintainProcessComponent},
  {path:'interface/:id/:stepId/:outlet',component:StepInterfaceUpdateComponent},
  {path:'notification/:id/:stepId/:outlet',component:NotificationComponent},
  {path:'partnerUpdate/:id/:stepId/:outlet',component: StepPartnerUpdateComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FlowRoutingModule { }