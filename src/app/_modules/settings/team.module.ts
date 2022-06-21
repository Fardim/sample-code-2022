import { MultiSortModule } from '../shared/_pros-multi-sort/multi-sort.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from './../shared/shared.module';
import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamComponent } from './_components/team/team.component';
import { TeamInviteComponent } from './_components/team/team-invite/team-invite.component';
import { UserProfileComponent } from './_components/team/user-profile/user-profile.component';
import { DatasetRecordMappingComponent } from './_components/team/dataset-record-mapping/dataset-record-mapping.component';

const routes: Routes = [
  {
    path: '',
    component: TeamComponent,
  },
  {
    path: 'invite',
    component: TeamInviteComponent,
  },
  {
    path: 'dataset-record-mapping',
    component: DatasetRecordMappingComponent,
  },
  {
    path: 'user-profile/:username',
    component: UserProfileComponent,
  },
];

@NgModule({
  declarations: [TeamComponent, TeamInviteComponent, DatasetRecordMappingComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MultiSortModule
  ]
})
export class TeamModule {}
