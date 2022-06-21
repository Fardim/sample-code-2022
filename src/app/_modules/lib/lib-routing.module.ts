import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LibLayoutComponent } from './_components/lib-layout/lib-layout.component';
import { PageNotFoundComponent } from '@modules/shared/_components/page-not-found/page-not-found.component';
import { MdoGenericComponentsComponent } from './_components/mdo-generic-components/mdo-generic-components.component';

const routes: Routes = [
  {
    path: '', component: LibLayoutComponent,
    children: [
      { path: ':id', component: MdoGenericComponentsComponent }
    ]
  },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LibRoutingModule { }
