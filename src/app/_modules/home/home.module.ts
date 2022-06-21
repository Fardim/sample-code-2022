import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './home-routing.module';
import { SharedModule } from '../shared/shared.module';
import { HomeLayoutComponent } from 'src/app/_modules/home/_components/home-layout/home-layout.component';
import { SecondaryNavbarComponent } from '@modules/home/_components/secondary-navbar/secondary-navbar.component';
import { SystemTrayComponent } from './_components/system-tray/system-tray.component';
import { PrimaryNavigationComponent } from './_components/primary-navigation/primary-navigation.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { WelcomeComponent } from './_components/welcome/welcome.component';
import { WelcomeV2Component } from './_components/welcome-v2/welcome-v2.component';

// Store
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { HomeEffects } from '@store/effects/home.effects';
import { homeReducer } from '@store/reducers/home.reducer';
import { NameShortPipe } from './_components/name-short.pipe';
import { CancelJobConfirmationComponent } from './_components/system-tray/cancel-job-confirmation/cancel-job-confirmation.component';
import { ListModule } from '@modules/list/list.module';
import { SchemaModule } from '@modules/schema/schema.module';
import { TileComponent } from './_components/tile/tile.component';
import { TileItemComponent } from './_components/tile-item/tile-item.component';
import { UserLicenseDialogComponent } from './_components/user-license-dialog/user-license-dialog.component';

@NgModule({
  declarations: [
    SecondaryNavbarComponent,
    HomeLayoutComponent,
    SystemTrayComponent,
    PrimaryNavigationComponent,
    WelcomeComponent,
    WelcomeV2Component,
    NameShortPipe,
    CancelJobConfirmationComponent,
    TileComponent,
    TileItemComponent,
    UserLicenseDialogComponent,
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    MatMenuModule,
    MatListModule,
    SharedModule,
    ListModule,
    SchemaModule,
    StoreModule.forFeature('home', homeReducer),
    EffectsModule.forFeature([HomeEffects]),
  ],
})
export class HomeModule {}
