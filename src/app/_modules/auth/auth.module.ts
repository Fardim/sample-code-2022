import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './_components/login/login.component';
import { SharedModule } from '../shared/shared.module';
import { SessionExpiredComponent } from './_components/session-expired/session-expired/session-expired.component';
import { InviteUserLoginComponent } from './_components/invite-user-login/invite-user-login.component';

@NgModule({
  declarations: [LoginComponent, InviteUserLoginComponent, SessionExpiredComponent],
  imports: [
    CommonModule,
    AuthRoutingModule,
    SharedModule
  ]
})
export class AuthModule { }
