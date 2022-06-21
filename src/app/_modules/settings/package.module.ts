import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from './../shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from '../shared/_components/page-not-found/page-not-found.component';
import { PackageListComponent } from './_components/package/package-list.component';
import { PackageComponent } from './_components/package/package/package.component';
import { PackageViewComponent } from './_components/package/package-view/package-view.component';
import { CreatedPackageComponent } from './_components/package/created-package/created-package.component';
import {PublishingPackageFormComponent} from './_components/package/publishing-package-form/publishing-package-form.component';
import { ConnekthubPackageComponent } from './_components/package/connekthub-packages/connekthub-packages.component';

const routes: Routes = [
  { path: '', component: PackageListComponent },
  { path: 'created-package', component: CreatedPackageComponent },
  {path: 'new-packages', component: PackageComponent},
  { path: '**', component: PageNotFoundComponent }
]

@NgModule({
  declarations: [PackageListComponent, PackageComponent, PackageViewComponent,CreatedPackageComponent, PublishingPackageFormComponent, ConnekthubPackageComponent],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
  ]
})

export class PackageModule { }
