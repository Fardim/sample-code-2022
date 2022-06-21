import { A11yModule } from '@angular/cdk/a11y';
import { CdkAccordionModule } from '@angular/cdk/accordion';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CloseScrollStrategy, Overlay, OverlayModule } from '@angular/cdk/overlay';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MAT_AUTOCOMPLETE_SCROLL_STRATEGY } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatLineModule, MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';
import { RouterModule } from '@angular/router';
import { BrConditionalFieldsComponent } from '@modules/admin/_components/module/business-rules/br-conditional-fields/br-conditional-fields.component';
import { UdrConditionOperatorsComponent } from '@modules/admin/_components/module/business-rules/user-defined-rule/udr-condition-operators/udr-condition-operators.component';
import { PayloadTestExpansionViewComponent } from '@modules/settings/_components/connectivity/views/payload-test/payload-test-form/payload-test-expansion-view/payload-test-expansion-view.component';
import { PayloadTestFormComponent } from '@modules/settings/_components/connectivity/views/payload-test/payload-test-form/payload-test-form.component';
import { PayloadTestTableComponent } from '@modules/settings/_components/connectivity/views/payload-test/payload-test-form/payload-test-table/payload-test-table.component';
import { Chart, registerables } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import zoomPlugin from 'chartjs-plugin-zoom';
import { MdoUiLibraryModule } from 'mdo-ui-library';
import { ChartsModule } from 'ng2-charts';
import { CookieService } from 'ngx-cookie-service';
import { AddFilterMenuComponent } from './_components/add-filter-menu/add-filter-menu.component';
import { AddTileComponent } from './_components/add-tile/add-tile.component';
import { BlockComponent } from './_components/block/block.component';
import { BlocksHierarchyComponent } from './_components/blocks-hierarchy/blocks-hierarchy.component';
import { BreadcrumbComponent } from './_components/breadcrumb/breadcrumb.component';
import { CheckCodeControlComponent } from './_components/check-code-control/check-code-control.component';
import { CheckCodeSidesheetComponent } from './_components/check-code-control/check-code-sidesheet/check-code-sidesheet.component';
import { ChipsInputComponent } from './_components/chips-input/chips-input.component';
import { ClassificationDatatableCellEditableComponent } from './_components/classification-datatable-cell-editable/classification-datatable-cell-editable.component';
import { ConfirmationDialogComponent } from './_components/confirmation-dialog/confirmation-dialog.component';
import { DatasetSearchComponent } from './_components/dataset-search/dataset-search.component';
import { DateFormatDropdownComponent } from './_components/date-format-dropdown/date-format-dropdown.component';
import { DatePickerFieldComponent } from './_components/date-picker-field/date-picker-field.component';
import { ErrorStateComponent } from './_components/error-state/error-state.component';
import { FilterValuesComponent } from './_components/filter-values/filter-values.component';
import { FormInputAutoselectComponent } from './_components/form-input-autoselect/form-input-autoselect.component';
import { FormInputComponent } from './_components/form-input/form-input.component';
import { FormattedTableCellComponent } from './_components/formatted-table-cell/formatted-table-cell.component';
import { GenericFieldControlComponent } from './_components/generic-field-control/generic-field-control.component';
import { GeoLocationMapComponent } from './_components/geo-location-map/geo-location-map.component';
import { RichTextEditorComponent } from './_components/html-editor/rich-text-editor.component';
import { InlineTableColumnFilterComponent } from './_components/inline-table-column-filter/inline-table-column-filter.component';
import { LookupConfigComponent } from './_components/lookup/lookup-config/lookup-config.component';
import { LookupRuleComponent } from './_components/lookup/lookup.component';
import { OptionFilterComponent } from './_components/lookup/option-filter/option-filter.component';
import { NavigationDropdownComponent } from './_components/navigation-dropdown/navigation-dropdown.component';
import { NullStateComponent } from './_components/null-state/null-state/null-state.component';
import { OverlayLoaderComponent } from './_components/overlay-loader/overlay-loader.component';
import { PageNotFoundComponent } from './_components/page-not-found/page-not-found.component';
import { QuillEditorComponent } from './_components/quill-editor/quill-editor.component';
import { RejectModuleComponent } from './_components/reject-module/reject-module.component';
import { ResumeSessionComponent } from './_components/resume-session/resume-session.component';
import { ScheduleDialogComponent } from './_components/schedule-dialog/schedule-dialog.component';
import { ScheduleSyncValueComponent } from './_components/schedule-sync-value/schedule-sync-value.component';
import { ScheduleComponent } from './_components/schedule/schedule.component';
import { SearchInputComponent } from './_components/search-input/search-input.component';
import { SelectComponent } from './_components/select/select.component';
import { SchemaExecutionTrendComponent } from './_components/statistics/schema-execution-trend/schema-execution-trend.component';
import { SubscriberInviteSidesheetComponent } from './_components/subscriber-invite-sidesheet/subscriber-invite-sidesheet.component';
import { SubscriberInviteComponent } from './_components/subscriber-invite/subscriber-invite.component';
import { SvgIconComponent } from './_components/svg-icon/svg-icon.component';
import { TableCellInputComponent } from './_components/table-cell-input/table-cell-input.component';
import { TableColumnSettingsComponent } from './_components/table-column-settings/table-column-settings.component';
import { TransformationRuleComponent } from './_components/transformation-rule/transformation-rule.component';
import { UDRValueControlComponent } from './_components/udr-value-control/udr-value-control.component';
import { AutoCompleteScrollDirective } from './_directives/auto-complete-scroll.directive';
import { ClickStopPropagationDirective } from './_directives/click-stop-propagation.directive';
import { ContainerRefDirective } from './_directives/container-ref.directive';
import { CorrectedValueDirective } from './_directives/corrected-value.directive';
import { ExpansionPanelToggleHandlerDirective } from './_directives/expansion-panel-toggle-handler.directive';
import { InfiniteScrollDirective } from './_directives/infinite-scroll.directive';
import { ResizableColumnDirective } from './_directives/resizable-column.directive';
import { ResizeableDirective } from './_directives/resizeable.directive';
import { StatusBadgeDirective } from './_directives/status-badge.directive';
import { TableCellFormatterDirective } from './_directives/table-cell-formatter.directive';
import { TagsEllipsisDirective } from './_directives/tags-ellipsis.directive';
import { DataSizePipe } from './_pipes/datasize.pipe';
import { DateFormatPipe } from './_pipes/date-format.pipe';
import { FormatTableHeadersPipe } from './_pipes/format-table-headers.pipe';
import { HighlightPipe } from './_pipes/highlight.pipe';
import { NumberTransformPipe } from './_pipes/number-transform.pipe';
import { ProsDatePipe } from './_pipes/pros-date-pipe.pipe';
import { ReplaceUnderscorePipe } from './_pipes/replaceUnderscore.pipe';
import { SubstringPipe } from './_pipes/substringpipe.pipe';
import { ThousandconvertorPipe } from './_pipes/thousandconvertor.pipe';
import { DropdownFilterComponent } from './_components/dropdown-filter/dropdown-filter.component';
import { ListFilterFieldElementsComponent } from '@modules/list/_components/list-filter-field-elements/list-filter-field-elements.component';
import { ConstantRuleComponent } from './_components/constant-rule/constant-rule.component';
import { ZeroRuleComponent } from './_components/zero-rule/zero-rule.component';
import { EmptySpaceRuleComponent } from './_components/empty-space-rule/empty-space-rule.component';
import { InputPreventKeyDirective } from './_directives/input-prevent-key.directive';
import { ListItemSkeletonComponent } from './_skeletons/list-item-skeleton/list-item-skeleton.component';
import { NavTitleSkeletonComponent } from './_skeletons/nav-title-skeleton/nav-title-skeleton.component';
import { SecondaryNavSkeletonComponent } from './_skeletons/secondary-nav-skeleton/secondary-nav-skeleton.component';
import { ToolbarSkeletonComponent } from './_skeletons/toolbar-skeleton/toolbar-skeleton.component';
import { SkeletonTitleComponent } from './_skeletons/skeleton-title/skeleton-title.component';
import { DeleteReasonDialogComponent } from './_components/delete-reason-dialog/delete-reason-dialog.component';
import { TargetFieldTransformationRuleComponent } from '@modules/mapping/_components/target-field-transformation-rule/target-field-transformation-rule.component';
import { ListFilterComponent } from '@modules/list/_components/list-filter/list-filter.component';
import { DescriptionDatatableComponent } from './_components/description-datatable/description-datatable.component';
import { DescriptionDatatableCellEditableComponent } from './_components/description-datatable-cell-editable/description-datatable-cell-editable.component';
Chart.register(...registerables);
Chart.register(zoomPlugin);
Chart.register(annotationPlugin);

Chart.register(...registerables);
Chart.register(zoomPlugin);
Chart.register(annotationPlugin);

@NgModule({
  declarations: [
    // directives
    ClickStopPropagationDirective,
    TagsEllipsisDirective,
    ContainerRefDirective,
    InfiniteScrollDirective,
    ResizableColumnDirective,
    ExpansionPanelToggleHandlerDirective,
    TableCellFormatterDirective,
    // pipes
    SubstringPipe,
    ReplaceUnderscorePipe,
    ThousandconvertorPipe,
    DateFormatPipe,
    DataSizePipe,
    // shared components
    DeleteReasonDialogComponent,
    PageNotFoundComponent,
    BreadcrumbComponent,
    AddTileComponent,
    SvgIconComponent,
    TableColumnSettingsComponent,
    FormatTableHeadersPipe,
    ResizeableDirective,
    BrConditionalFieldsComponent,
    UdrConditionOperatorsComponent,
    SearchInputComponent,
    FormInputComponent,
    AddFilterMenuComponent,
    NavigationDropdownComponent,
    FilterValuesComponent,
    ConfirmationDialogComponent,
    ResumeSessionComponent,
    ScheduleComponent,
    DatePickerFieldComponent,
    TableCellInputComponent,
    NullStateComponent,
    FormInputAutoselectComponent,
    ScheduleDialogComponent,
    TransformationRuleComponent,
    LookupRuleComponent,
    LookupConfigComponent,
    SubscriberInviteComponent,
    ClassificationDatatableCellEditableComponent,
    SubscriberInviteSidesheetComponent,
    SchemaExecutionTrendComponent,
    AutoCompleteScrollDirective,
    GenericFieldControlComponent,
    UDRValueControlComponent,
    CheckCodeControlComponent,
    CheckCodeSidesheetComponent,
    StatusBadgeDirective,
    OverlayLoaderComponent,
    OptionFilterComponent,
    SelectComponent,
    DatasetSearchComponent,
    ChipsInputComponent,
    ErrorStateComponent,
    BlocksHierarchyComponent,
    BlockComponent,
    InlineTableColumnFilterComponent,
    QuillEditorComponent,
    HighlightPipe,
    NumberTransformPipe,
    DateFormatDropdownComponent,
    ProsDatePipe,
    GeoLocationMapComponent,
    RichTextEditorComponent,
    ScheduleSyncValueComponent,
    PayloadTestFormComponent,
    PayloadTestTableComponent,
    PayloadTestExpansionViewComponent,
    CorrectedValueDirective,
    RejectModuleComponent,
    DropdownFilterComponent,
    FormattedTableCellComponent,
    ListFilterFieldElementsComponent,
    ConstantRuleComponent,
    ZeroRuleComponent,
    EmptySpaceRuleComponent,
    InputPreventKeyDirective,
    ListItemSkeletonComponent,
    NavTitleSkeletonComponent,
    SecondaryNavSkeletonComponent,
    ToolbarSkeletonComponent,
    SkeletonTitleComponent,
    TargetFieldTransformationRuleComponent,
    ListFilterComponent,
    DescriptionDatatableComponent,
    DescriptionDatatableCellEditableComponent
  ],
  imports: [
    // ng modules
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    // material modules
    MatAutocompleteModule,
    MatBadgeModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatLineModule,
    MatListModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatStepperModule,
    MatTableModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatTreeModule,
    DragDropModule,
    OverlayModule,
    CdkAccordionModule,
    A11yModule,
    // chart module
    ChartsModule,
    ScrollingModule,
    MdoUiLibraryModule,
  ],
  exports: [
    // modules
    // ng modules
    FormsModule,
    ReactiveFormsModule,
    // material modules
    MatAutocompleteModule,
    MatBadgeModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatLineModule,
    MatListModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatStepperModule,
    MatTableModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatTreeModule,
    DragDropModule,
    OverlayModule,
    CdkAccordionModule,
    A11yModule,
    // MDO UI Library Module
    MdoUiLibraryModule,
    // chart module
    ChartsModule,
    ScrollingModule,
    // directives
    ClickStopPropagationDirective,
    TagsEllipsisDirective,
    ResizeableDirective,
    ContainerRefDirective,
    InfiniteScrollDirective,
    ResizableColumnDirective,
    ExpansionPanelToggleHandlerDirective,
    CorrectedValueDirective,
    TableCellFormatterDirective,
    // pipes
    SubstringPipe,
    ReplaceUnderscorePipe,
    ThousandconvertorPipe,
    FormatTableHeadersPipe,
    DateFormatPipe,
    ProsDatePipe,
    // components
    DeleteReasonDialogComponent,
    PageNotFoundComponent,
    BreadcrumbComponent,
    AddTileComponent,
    SvgIconComponent,
    TableColumnSettingsComponent,
    BrConditionalFieldsComponent,
    UdrConditionOperatorsComponent,
    SearchInputComponent,
    FormInputComponent,
    FormInputAutoselectComponent,
    AddFilterMenuComponent,
    NavigationDropdownComponent,
    FilterValuesComponent,
    ScheduleComponent,
    DatePickerFieldComponent,
    TableCellInputComponent,
    TransformationRuleComponent,
    LookupRuleComponent,
    LookupConfigComponent,
    NullStateComponent,
    SubscriberInviteComponent,
    SubscriberInviteSidesheetComponent,
    SchemaExecutionTrendComponent,
    AutoCompleteScrollDirective,
    GenericFieldControlComponent,
    UDRValueControlComponent,
    CheckCodeControlComponent,
    CheckCodeSidesheetComponent,
    StatusBadgeDirective,
    OverlayLoaderComponent,
    SelectComponent,
    ChipsInputComponent,
    ErrorStateComponent,
    BlocksHierarchyComponent,
    BlockComponent,
    InlineTableColumnFilterComponent,
    QuillEditorComponent,
    DatasetSearchComponent,
    HighlightPipe,
    NumberTransformPipe,
    DateFormatDropdownComponent,
    GeoLocationMapComponent,
    RichTextEditorComponent,
    ScheduleSyncValueComponent,
    PayloadTestFormComponent,
    PayloadTestTableComponent,
    PayloadTestExpansionViewComponent,
    DropdownFilterComponent,
    DataSizePipe,
    FormattedTableCellComponent,
    ListFilterFieldElementsComponent,
    ConstantRuleComponent,
    ZeroRuleComponent,
    EmptySpaceRuleComponent,
    InputPreventKeyDirective,
    ListItemSkeletonComponent,
    NavTitleSkeletonComponent,
    SecondaryNavSkeletonComponent,
    ToolbarSkeletonComponent,
    SkeletonTitleComponent,
    OptionFilterComponent,
    TargetFieldTransformationRuleComponent,
    ListFilterComponent,
    DescriptionDatatableComponent,
    DescriptionDatatableCellEditableComponent
  ],
  providers: [
    TitleCasePipe,
    DatePipe,
    { provide: MAT_AUTOCOMPLETE_SCROLL_STRATEGY, useFactory: scrollFactory, deps: [Overlay] },
    {
      provide: MatDialogRef,
      useValue: {},
    },
    CookieService
  ],
  entryComponents: [TableCellInputComponent],
})
export class SharedModule { }

export function scrollFactory(overlay: Overlay): () => CloseScrollStrategy {
  return () => overlay.scrollStrategies.close();
}
