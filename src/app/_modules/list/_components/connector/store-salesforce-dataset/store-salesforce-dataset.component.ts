import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Observable, of } from 'rxjs';
import { FormControl } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';

@Component({
  selector: 'pros-store-salesforce-dataset',
  templateUrl: './store-salesforce-dataset.component.html',
  styleUrls: ['./store-salesforce-dataset.component.scss'],
})
export class StoreSalesforceDatasetComponent implements OnInit {
  // output event emitter
  @Output()
  cancelClick: EventEmitter<any> = new EventEmitter<any>();

  @Output()
  backClick: EventEmitter<any> = new EventEmitter<any>();

  selectOptions: Observable<string[]>;

  // For dropdown values
  serviceList = [];
  tableList = [];

  @ViewChild('serviceEntriesTrigger', { read: MatAutocompleteTrigger }) searchServiceTrigger: MatAutocompleteTrigger;

  showStandardServiceMessage = true;

  optionCtrl = new FormControl();

  isServicesTab = true;

  constructor() {}

  ngOnInit(): void {
    // this.getServiceList();
    // this.getTablesList();
    this.checkForSearchValueChange();
  }

  // getServiceList() {

  //   this.listService.getServiceList().subscribe((serviceList) => {

  //     this.serviceList = [...serviceList];

  //   });

  //   this.selectOptions = of(this.serviceList);

  // }

  // getTablesList() {

  //   this.listService.getTablesList().subscribe((tablesList) => {

  //     this.tableList = [...tablesList];

  //   });

  // }

  checkForSearchValueChange() {
    this.optionCtrl.valueChanges.subscribe((text) => {
      const FilteredServiceOption = this._filter(text);

      this.selectOptions = of(FilteredServiceOption);
    });
  }

  _filter(value) {
    const serviceListValue = value.toLowerCase();

    return this.isServicesTab
      ? this.serviceList.filter((text) => text.toLowerCase().indexOf(serviceListValue) === 0)
      : this.tableList.filter((text) => text.toLowerCase().indexOf(serviceListValue) === 0);
  }

  onServiceSearchFocus() {
    this.searchServiceTrigger.openPanel();
  }

  onClickedEvent() {}

  applyServiceEntry(entryText) {
    this.optionCtrl.setValue(entryText);
  }

  changeImportTab(event) {
    this.optionCtrl.setValue('');

    this.searchServiceTrigger.closePanel();

    if (event === 0) {
      this.selectOptions = of(this.serviceList);

      this.isServicesTab = true;
    } else if (event === 1) {
      this.selectOptions = of(this.tableList);

      this.isServicesTab = false;
    }
  }

  onCancelClick() {}

  back() {
    this.backClick.emit();
  }
}
