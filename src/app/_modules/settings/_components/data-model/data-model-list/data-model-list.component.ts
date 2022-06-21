import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CoreService } from '@services/core/core.service';
import { TransientService } from 'mdo-ui-library';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'pros-data-model-list',
  templateUrl: './data-model-list.component.html',
  styleUrls: ['./data-model-list.component.scss']
})
export class DataModelListComponent implements OnInit {
  // table column
  displayedColumns = ['action', 'coreDesc', 'datasets', 'modified_date', 'modified_by'];
  // table data source
  dataSource;
  // app language
  lang: string = 'en';
  // data set ids for filter
  dataSetIds: string = 'datasetIds=';
  // filter list by name
  searchString: string = '';
  // loader
  loader: boolean = false;
  // for empty state
  isShowEmptyState: boolean = false;
  // for all dataset
  dataSetList = [];
  // for user selected checkbox filter
  userSelectedCheckBoxfilter = [];
  // subject for data set dropdown
  searchFieldByDataSet: Subject<string> = new Subject();
  // subject for name filter
  searchFieldByName: Subject<string> = new Subject();
  // for data set filter by name
  datasetSearchString: string;
  // for show empty state when filter apply
  filter = false;

  constructor(private router: Router, private coreService: CoreService, private transientService: TransientService) {}

  ngOnInit(): void {
    this.getAllSavedDataModel(this.lang, this.dataSetIds, this.searchString);
    this.searchDataset(this.datasetSearchString);

    this.searchFieldByDataSet.pipe(debounceTime(1000), distinctUntilChanged()).subscribe((searchString) => {
      this.datasetSearchString = searchString;
      this.searchDataset(this.datasetSearchString);
    });

    this.searchFieldByName.pipe(debounceTime(1000), distinctUntilChanged()).subscribe((searchString) => {
      this.searchString = searchString;
      this.getFilteredDataModel(this.lang, this.dataSetIds, this.searchString);
    });
  }

  // get all data sets
  searchDataset(searchTerm = '') {
    const body = {
      lang: 'en',
      fetchsize: 0,
      fetchcount: 0,
      description: !!searchTerm && typeof searchTerm === 'string' ? searchTerm.toLowerCase() : ''
    };
    this.coreService.searchAllObjectType(body).subscribe(
      (response) => {
        this.dataSetList = response;
      },
      (err) => {
        this.transientService.open(`Not get datasets`, null, {
          duration: 2000,
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
      }
    );
  }

  // get all saved data model when we apply filter
  getFilteredDataModel(lang: string, dataSetIds: string, searchString: string) {
    this.coreService.getAllDataModelList(lang, dataSetIds, searchString).subscribe(
      (res: any) => {
        if (res?.length > 0) {
          this.dataSource = res;
          this.filter = false;
        } else {
          this.dataSource = [];
          this.filter = true;
        }
      },
      (err) => {
        this.transientService.open(`${err?.errorMsg}`, null, {
          duration: 2000,
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
        this.dataSource = [];
      }
    );
  }

  // get all saved data model when we load app
  getAllSavedDataModel(lang: string, dataSetIds: string, searchString: string) {
    this.loader = true;
    this.coreService.getAllDataModelList(lang, dataSetIds, searchString).subscribe(
      (res: any) => {
        this.loader = false;
        if (res?.length > 0) {
          this.dataSource = res;
        } else {
          this.isShowEmptyState = true;
        }
      },
      (err) => {
        this.transientService.open(`${err?.errorMsg}`, null, {
          duration: 2000,
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
        this.loader = false;
        this.dataSource = [];
      }
    );
  }

  // new button click handler
  newButtonHandler() {
    this.router.navigate([{ outlets: { sb: `sb/settings/data-model`, outer: `outer/data-model/new-data-model` } }], {
      queryParamsHandling: 'preserve'
    });
  }

  // for reset filter
  removeDataSets() {
    this.userSelectedCheckBoxfilter = [];
    this.dataSetIds = 'datasetIds=';
    this.searchDataset(this.datasetSearchString);
    this.getAllSavedDataModel(this.lang, this.dataSetIds, this.searchString);
  }

  // store user selected dataset value for filter
  onCheckBoxClicked(event, dataSet) {
    if (event) {
      this.userSelectedCheckBoxfilter.push(dataSet);
    } else {
      const index = this.userSelectedCheckBoxfilter.findIndex((e) => e?.moduleDesc === dataSet?.moduleDesc);
      this.userSelectedCheckBoxfilter.splice(index, 1);
    }
  }

  // apply filter for data sets
  applyFilter() {
    this.dataSetIds = '';
    this.userSelectedCheckBoxfilter.forEach((e) => {
      this.dataSetIds = this.dataSetIds + `datasetIds=${e?.moduleId}&`;
    });
    this.getFilteredDataModel(this.lang, this.dataSetIds, this.searchString);
  }

  // make short name for display in case when we not found image of user
  getInitials(senderName: string): string {
    if (!senderName) {
      return '--';
    }
    const name = senderName.split(' ')?.length > 1 ? senderName.split(' ') : senderName;
    if (typeof name === 'string') {
      return name.slice(0, 2).toUpperCase();
    } else {
      return `${name[0].toUpperCase()}${name[1].toUpperCase()}`;
    }
  }
}
