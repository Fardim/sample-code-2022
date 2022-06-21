import { Component, Inject, LOCALE_ID, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CoreService } from '@services/core/core.service';
import { TransientService } from 'mdo-ui-library';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';


const DATA_MANAGEMENT_OPTIONS = [
  // {
  //   label: 'Manage data',
  //   value: 'Manage data'
  // },
  {
    label: 'Manage configuration',
    value: 'Manage configuration'
  }
]
@Component({
  selector: 'pros-data-management',
  templateUrl: './data-management.component.html',
  styleUrls: ['./data-management.component.scss']
})
export class DataManagementComponent implements OnInit, OnDestroy {

  constructor(
    private transientService: TransientService,
    private coreService: CoreService,
    @Inject(LOCALE_ID) private locale
  ) { }

  private datasets: Subject<{ moduleId: number, moduleName: string }[]> = new Subject();
  showSuccessMessage = false;
  dataManagementOptions = DATA_MANAGEMENT_OPTIONS;
  managementOption = new FormControl('Manage data');
  selectedModuleId: number;
  datasetList$ = this.datasets.asObservable();
  filteredDatasets: Observable<string[]>; successMessage = '';
  private unsubscribeAll$ = new Subject();

  handleDelete: () => void;
  handleRefresh: () => void;

  ngOnInit(): void {
    this.getDatasets();
    this.datasets.pipe(
      takeUntil(this.unsubscribeAll$),
    ).subscribe(
      datasets => {
        this.handleDelete = () => {
          const selectedModuleName = datasets.find(dataset => dataset.moduleId === this.selectedModuleId).moduleName;
          this.transientService.confirm({
            data: { dialogTitle: 'Confirmation', label: `Delete this dataset: ${selectedModuleName}? Please re-confirm as you will not be able to recover it.` },
            disableClose: true,
            autoFocus: false,
            width: '600px',
            panelClass: 'create-master-panel',
            // backdropClass: 'no-backdrop'
          }, (response) => {
            if (response === 'yes') {
              this.coreService.deleteModuleById(this.selectedModuleId)
                .pipe(takeUntil(this.unsubscribeAll$))
                .subscribe(
                  () => {
                    this.successMessage = `${selectedModuleName} successfully Deleted!`;
                    this.showSuccessMessage = true;
                    this.getDatasets();
                  }
                )
            }
          });
        };
        this.handleRefresh = () => {
          const selectedModuleName = datasets.find(dataset => dataset.moduleId === this.selectedModuleId).moduleName;
          this.transientService.confirm({
            data: { dialogTitle: 'Confirmation', label: `Refresh this dataset: ${selectedModuleName}? Please re-confirm as you will not be able to recover it.` },
            disableClose: true,
            autoFocus: false,
            width: '600px',
            panelClass: 'create-master-panel',
          }, (response) => {
            if (response === 'yes') { }
          });
        }
      }
    )
  }

  getDatasets() {
    this.coreService.getAllModulesByLanguageAndDescription({ lang: this.locale?.split('-')[0], description: '' })
      .pipe(
        map(
          datasets => datasets.map(
            dataset => {
              return {
                moduleId: dataset.moduleId,
                moduleName: dataset.moduleDescriptionRequestDTO.description
              }
            }
          )
        )
      ).subscribe(data => this.datasets.next(data), () => { });
  }

  selectDataset(event) {
    this.selectedModuleId = event;
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next();
  }
}
