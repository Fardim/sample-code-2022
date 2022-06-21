import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { ChartsModule } from 'ng2-charts';
import { MultiSortModule } from '../shared/_pros-multi-sort/multi-sort.module';
import { SharedModule } from './../shared/shared.module';
import { BusinessHoursComponent } from './_components/organization/business-hours/business-hours.component';
import { CompanyDetailsComponent } from './_components/organization/company-details/company-details.component';
import { DataManagementComponent } from './_components/organization/data-management/data-management.component';
import { HolidayCalendarComponent } from './_components/organization/holiday-calendar/holiday-calendar.component';
import { OrganizationComponent } from './_components/organization/organization.component';
import { UsageComponent } from './_components/organization/usage/usage.component';
import { MergeTagDialogComponent } from './_components/tag-tab/merge-tag-dialog/merge-tag-dialog.component';
import { TenantListComponent } from './_components/organization/tenant-list/tenant-list.component';
import { TenantComponent } from './_components/organization/tenant-list/tenant/tenant.component';
import { LicensingInformationComponent } from './_components/organization/licensing-information/licensing-information.component';
const routes: Routes = [
  {
    path: '',
    component: OrganizationComponent,
  },
];

@NgModule({
  declarations: [
    OrganizationComponent,
    CompanyDetailsComponent,
    BusinessHoursComponent,
    HolidayCalendarComponent,
    UsageComponent,
    DataManagementComponent,
    TenantListComponent,
    TenantComponent,
    LicensingInformationComponent
  ],
  imports: [CommonModule, RouterModule.forChild(routes), SharedModule, FormsModule, ReactiveFormsModule, MultiSortModule, ChartsModule],
  providers: [MergeTagDialogComponent],
})
export class OrganizationModule {}
