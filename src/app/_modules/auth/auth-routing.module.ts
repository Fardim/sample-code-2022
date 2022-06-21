import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InviteUserLoginComponent } from './_components/invite-user-login/invite-user-login.component';
import { LoginComponent } from './_components/login/login.component';
import { SessionExpiredComponent } from './_components/session-expired/session-expired/session-expired.component';

const routes: Routes = [
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'session/expired', component: SessionExpiredComponent },
  { path: 'invite', component: InviteUserLoginComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
