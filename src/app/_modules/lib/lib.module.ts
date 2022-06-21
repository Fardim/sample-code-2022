import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LibRoutingModule } from './lib-routing.module';
import { LibLayoutComponent } from './_components/lib-layout/lib-layout.component';
import { SharedModule } from '@shared/shared.module';
import { SchemaModule } from '@modules/schema/schema.module';
import { MdoGenericComponentsComponent } from './_components/mdo-generic-components/mdo-generic-components.component';

@NgModule({
  declarations: [
    LibLayoutComponent,
    MdoGenericComponentsComponent
  ],
  imports: [
    CommonModule,
    LibRoutingModule,
    SharedModule,
    SchemaModule
  ],
  exports:[]
})
export class LibModule { }
