import { SharedModule } from '@shared/shared.module';
import { DashMenuComponent } from './_components/email-templates-setting/dash-menu/dash-menu.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashMenuBaseComponent } from './_components/email-templates-setting/dash-menu/dash-menu-base';



@NgModule({
  declarations: [DashMenuComponent],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [DashMenuComponent]
})
export class SettingsSharedModule { }
