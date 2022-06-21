import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@modules/shared/shared.module';
import { DaxeProgramListComponent } from './daxe-program-list/daxe-program-list.component';
import { DaxeChangeHistoryComponent } from './daxe-change-history/daxe-change-history.component';
import { DaxeInputComponent } from './daxe-input/daxe-input.component';
import { DaxeCreationComponent } from './daxe-creation/daxe-creation.component';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { DaxeEffects } from '@store/effects/daxe.effects';
import { daxeReducers, DAXE_STATE_NAME } from '@store/state/daxe.state';
import { MonacoEditorModule } from '@materia-ui/ngx-monaco-editor';

const EXPORTABLE_COMPONENTS = [
  DaxeProgramListComponent,
  DaxeChangeHistoryComponent,
  DaxeInputComponent,
  DaxeCreationComponent
];

@NgModule({
  declarations: [...EXPORTABLE_COMPONENTS],
  imports: [
    CommonModule,
    SharedModule,
    StoreModule.forFeature(DAXE_STATE_NAME, daxeReducers),
    EffectsModule.forFeature([DaxeEffects]),
    MonacoEditorModule
  ],
  exports: [...EXPORTABLE_COMPONENTS]
})
export class DaxeModule {}
