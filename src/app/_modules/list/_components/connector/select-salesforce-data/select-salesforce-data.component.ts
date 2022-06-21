import { Component, OnInit, ViewChild } from '@angular/core'
import { FormControl } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete'
import { SalesforceAdaptorService } from '@services/salesforce-adaptor.service';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'pros-select-salesforce-data',
  templateUrl: './select-salesforce-data.component.html',
  styleUrls: ['./select-salesforce-data.component.scss'],
})

export class SelectSalesforceDataComponent implements OnInit {
  @ViewChild('searchServiceTrigger', { read: MatAutocompleteTrigger }) searchServiceTrigger: MatAutocompleteTrigger;
  sfObjectCtrl = new FormControl();
  updateDataCtrl = new FormControl();
  syncDataCtrl = new FormControl();

  sfObjectList = [];
  sfOptions: Observable<string[]>;

  errorText = '';
  showSFStoreData = false;

  constructor(private adaptorService: SalesforceAdaptorService) {}

  ngOnInit(): void {
    this.errorText = 'You will not be able to update data in Salesforce as the user <b>"demoinit"</b> does not have write access';
    this.getSFObjectList();
    this.checkForSearchValueChange();
  }


  getSFObjectList() {
    this.adaptorService.getSFObjectList().subscribe((sfObjectList) => {
      this.sfObjectList = [...sfObjectList];
    });
    this.sfOptions = of(this.sfObjectList);
  }

  checkForSearchValueChange() {
    this.sfObjectCtrl.valueChanges.subscribe((text) => {
      const FilteredServiceOption = this._filter(text);
      this.sfOptions = of(FilteredServiceOption);
    });
  }

  _filter(value) {
    const sfObjectValue = value.toLowerCase();
    return this.sfObjectList.filter((text) => text.name.toLowerCase().indexOf(sfObjectValue) === 0);
  }

  selectSFObject(entryText) {
    this.sfObjectCtrl.setValue(entryText.name);
    this.showSFStoreData = true;
  }

  onCancelClick(event) {}

  onServiceSearchFocus() {
    this.searchServiceTrigger.openPanel();
  }

  onToggle($event, toggleType) {}

  reAuthorise() {}

  back() {}
}