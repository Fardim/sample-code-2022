import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NonavRoutingModule } from './nonav-routing.module';
import { NonavLayoutComponent } from './_layouts/nonav-layout/nonav-layout.component';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [NonavLayoutComponent],
  imports: [
    CommonModule,
    NonavRoutingModule,
    SharedModule
  ]
})
export class NonavModule { }
