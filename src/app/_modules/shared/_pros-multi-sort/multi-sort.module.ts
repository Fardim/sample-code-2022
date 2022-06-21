import { NgModule } from '@angular/core';
import { MultiSortDirective } from './multi-sort.directive';
import { MultiSortHeaderComponent } from './multi-sort-header/multi-sort-header.component';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatCommonModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { MultiSortTableSettingsComponent } from './multi-sort-table-settings/multi-sort-table-settings.component';
import {MatDialogModule} from '@angular/material/dialog';


@NgModule({
  declarations: [
    MultiSortHeaderComponent,
    MultiSortDirective,
    MultiSortTableSettingsComponent
  ],
  exports: [
    MultiSortHeaderComponent,
    MultiSortDirective,
    MultiSortTableSettingsComponent
  ],
  imports: [
    CommonModule,
    MatCommonModule,
    MatDividerModule,
    DragDropModule,
    MatIconModule,
    MatCheckboxModule,
    MatMenuModule,
    MatButtonModule,
    FormsModule,
    MatChipsModule,
    MatTooltipModule,
    MatDialogModule
  ]
})
export class MultiSortModule {
}
