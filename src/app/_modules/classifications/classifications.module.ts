import { ClassTypeMutationComponent } from './_components/class-type-mutation/class-type-mutation.component';
import { ClassTypeTranslateComponent } from './_components/class-type-translate/class-type-translate.component';
import { ClassCharacteristicsEmptyViewComponent } from './_components/class-characteristics/class-characteristics-empty-view/class-characteristics-empty-view.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '@modules/shared/shared.module';
import { ClassificationsRoutingModule } from '@modules/classifications/classifications-routing.module';
import { ClassificationLayoutComponent } from './_components/classification-layout/classification-layout.component';
import { TopBarComponent } from './_components/classification-layout/top-bar/top-bar.component';
import { NavBarComponent } from './_components/classification-layout/nav-bar/nav-bar.component';
import { ClassTypeDetailComponent } from './_components/class-type-detail/class-type-detail.component';
import { ClassCharacteristicsComponent } from './_components/class-characteristics/class-characteristics.component';
import { CharacteristicsMutationComponent } from './_components/class-characteristics/characteristics-mutation-side-sheet/characteristics-mutation/characteristics-mutation.component';
import { CharacteristicsMutationSideSheetComponent } from './_components/class-characteristics/characteristics-mutation-side-sheet/characteristics-mutation-side-sheet.component';
import { CharacteristicsMutationRowComponent } from './_components/class-characteristics/characteristics-mutation-side-sheet/characteristics-mutation/characteristics-mutation-row/characteristics-mutation-row.component';
import { CharacteristicLanguagesComponent } from './_components/class-characteristics/characteristics-mutation-side-sheet/characteristics-mutation/characteristic-languages/characteristic-languages.component';
import { ClassTypeMutationSideSheetComponent } from './_components/class-type-mutation-side-sheet/class-type-mutation-side-sheet.component';
import { CharacteristicsExpansionViewDialogComponent } from './_components/class-characteristics/characteristics-expansion-view-dialog/characteristics-expansion-view-dialog.component';
import { ClassMutationComponent } from './_components/class-mutation/class-mutation.component';
import { ClassMutationSideSheetComponent } from './_components/class-mutation-side-sheet/class-mutation-side-sheet.component';
import { EmptyViewComponent } from './_components/classification-layout/empty-view/empty-view.component';
import { ClassLanguageComponent } from './_components/class-language/class-language.component';
import { ClassLanguageSideSheetComponent } from './_components/class-language-side-sheet/class-language-side-sheet.component';
import { MdoUiLibraryModule } from 'mdo-ui-library';
import { DimensionsUomSideSheetComponent } from './_components/dimensions-uom-side-sheet/dimensions-uom-side-sheet.component';
import { DimensionsUomComponent } from './_components/dimensions-uom/dimensions-uom.component';
import { DimensionsUomSyncComponent } from './_components/dimensions-uom-sync/dimensions-uom-sync.component';
import { DimensionAddComponent } from './_components/dimension-add/dimension-add.component';
import { ClassLanguageListComponent } from './_components/class-language-list/class-language-list.component';
import { CharacteristicsDetailComponent } from './_components/characteristics-detail/characteristics-detail.component';
import { ClassDetailComponent } from './_components/class-detail/class-detail.component';
import { CharacteristicEditComponentComponent } from './_components/characteristic-edit-component/characteristic-edit-component.component';
import { MapClassSideSheetComponent } from './_components/map-class-side-sheet/map-class-side-sheet.component';
import { CommonMappingModule } from '@modules/mapping/_common/common-mapping.module';
import { CharacteristicsReorderComponent } from './_components/characteristics-reorder/characteristics-reorder.component';
import { ClassComponent } from './_components/class/class.component';
import { CharacteristicsListComponent } from './_components/characteristics-list/characteristics-list.component';
import { CharacteristicsMutationNewLanguageComponent } from './_components/class-characteristics/characteristics-mutation-side-sheet/characteristics-mutation/characteristics-mutation-new-language/characteristics-mutation-new-language.component';
import { CharacteristicsDetailDialogComponent } from './_components/characteristics-detail-dialog/characteristics-detail-dialog.component';
import { CharacteristicsDetailSideSheetComponent } from './_components/characteristics-detail-side-sheet/characteristics-detail-side-sheet.component';
import { ClassificationLayoutService } from "./_services/classification-layout.service";
import { ClassTypeTranslateSideSheetComponent } from './_components/class-type-translate-side-sheet/class-type-translate-side-sheet.component';

@NgModule({
  declarations: [
    ClassificationLayoutComponent,
    TopBarComponent,
    NavBarComponent,
    EmptyViewComponent,
    ClassTypeDetailComponent,
    ClassCharacteristicsComponent,
    ClassCharacteristicsEmptyViewComponent,
    CharacteristicsMutationComponent,
    CharacteristicsMutationSideSheetComponent,
    CharacteristicsMutationRowComponent,
    CharacteristicsExpansionViewDialogComponent,
    CharacteristicLanguagesComponent,
    ClassTypeMutationComponent,
    ClassTypeTranslateComponent,
    ClassTypeMutationSideSheetComponent,
    ClassTypeTranslateSideSheetComponent,
    ClassLanguageComponent,
    ClassLanguageSideSheetComponent,
    ClassMutationComponent,
    ClassMutationSideSheetComponent,
    ClassLanguageListComponent,
    ClassComponent,
    CharacteristicsListComponent,
    CharacteristicEditComponentComponent,
    MapClassSideSheetComponent,
    ClassDetailComponent,
    CharacteristicsDetailComponent,
    CharacteristicsReorderComponent,
    CharacteristicsMutationNewLanguageComponent,
    CharacteristicsDetailDialogComponent,
    CharacteristicsDetailSideSheetComponent,
    DimensionsUomSideSheetComponent,
    DimensionsUomComponent,
    DimensionsUomSyncComponent,
    DimensionAddComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    ClassificationsRoutingModule,
    MdoUiLibraryModule,
    CommonMappingModule
  ],
  providers: [
    ClassificationLayoutService,
  ]
})
export class ClassificationsModule { }
