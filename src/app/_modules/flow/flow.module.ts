import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FlowRoutingModule } from './flow-routing.module';
import { FlowHomeComponent } from './_components/flow-home/flow-home.component';
import { FlowListComponent } from './_components/flow-home/flow-list/flow-list.component';
import { SharedModule } from '@modules/shared/shared.module';
import { NewFlowBtnComponent } from './_components/new-flow-btn/new-flow-btn.component';
import { FlowSidesheetComponent } from './_components/flow-sidesheet/flow-sidesheet.component';
import { StepFormUpdateComponent } from './_components/flow-sidesheet/step-form-update/step-form-update.component';
import { StepRulesUpdateComponent } from './_components/flow-sidesheet/step-rules-update/step-rules-update.component';
import { MapProcessVariableComponent } from './_components/flow-sidesheet/map-process-variable/map-process-variable.component';
import { MaintainProcessComponent } from './_components/flow-sidesheet/maintain-process/maintain-process.component';
import { ChildDatasetComponent } from './_components/flow-sidesheet/child-dataset/child-dataset.component';
import { ProcessVariableComponent } from './_components/flow-sidesheet/process-variable/process-variable.component';
import { StepInterfaceUpdateComponent } from './_components/flow-sidesheet/step-interface-update/step-interface-update.component';
import { InterfaceComponent } from './_components/flow-sidesheet/interface/interface.component';
import { NotificationComponent } from './_components/flow-sidesheet/notification/notification.component';
import { StepPartnerUpdateComponent } from './_components/flow-sidesheet/step-partner-update/step-partner-update.component';

@NgModule({
  declarations: [FlowHomeComponent,FlowListComponent, NewFlowBtnComponent, FlowSidesheetComponent, StepFormUpdateComponent, StepRulesUpdateComponent, MapProcessVariableComponent, MaintainProcessComponent, ChildDatasetComponent, ProcessVariableComponent, StepInterfaceUpdateComponent, InterfaceComponent, NotificationComponent, StepPartnerUpdateComponent],
  imports: [
    CommonModule,
    FlowRoutingModule,
    SharedModule
  ]
})
export class FlowModule { }
