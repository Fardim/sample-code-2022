import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ClassificationLayoutComponent } from './_components/classification-layout/classification-layout.component'
import { CharacteristicsMutationSideSheetComponent } from '@modules/classifications/_components/class-characteristics/characteristics-mutation-side-sheet/characteristics-mutation-side-sheet.component';
import { ClassTypeMutationSideSheetComponent } from '@modules/classifications/_components/class-type-mutation-side-sheet/class-type-mutation-side-sheet.component';
import { ClassTypeTranslateSideSheetComponent } from '@modules/classifications/_components/class-type-translate-side-sheet/class-type-translate-side-sheet.component';
import { CharacteristicLanguagesComponent } from './_components/class-characteristics/characteristics-mutation-side-sheet/characteristics-mutation/characteristic-languages/characteristic-languages.component';

const routes: Routes = [
  { path: '', component: ClassificationLayoutComponent },
  { path: 'class-types/new', component: ClassTypeMutationSideSheetComponent },
  { path: 'class-types/translate', component: ClassTypeTranslateSideSheetComponent },
  { path: 'characteristics/new', component: CharacteristicsMutationSideSheetComponent },
  { path: 'characteristics/languages', component: CharacteristicLanguagesComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClassificationsRoutingModule { }
