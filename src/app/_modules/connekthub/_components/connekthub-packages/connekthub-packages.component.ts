import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { Package, PackageType } from '@modules/connekthub/_models';
import { ConnekthubService } from '@modules/connekthub/_services/connekthub.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'pros-connekthub-packages',
  templateUrl: './connekthub-packages.component.html',
  styleUrls: ['./connekthub-packages.component.scss']
})
export class ConnekthubPackagesComponent implements OnInit, OnChanges {
  @Input() packages: Package[] = [];
  @Input() rootClass: string;
  @Input() getOption: boolean;
  @Input() selectOption: boolean;
  @Input() filterOption: boolean;
  @Output() emitGetPackage: EventEmitter<Package> = new EventEmitter();

  /**
   * fieldList pagination for scroll down
   */

  recordsPageIndex = 1;

  /**
   * fieldList pagination size
   */
  recordsPageSize = 10;

  totalCount = 3;
  selected: string;
  tempPackages: Package[];


  /**
   * The import type ...
   */
  @Input()
  importType: PackageType;


  /**
   * The form control for the search the packages ...
   */
  searchInput: FormControl = new FormControl('');

  constructor(
    private connekthubService: ConnekthubService
  ) { }

  ngOnInit(): void {

    this.searchInput.valueChanges.pipe(debounceTime(1000), distinctUntilChanged()).subscribe(r=>{
      this._searchPackages(r);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.packages) {
      this.totalCount = this.packages.length;
      this.tempPackages = JSON.parse(JSON.stringify(this.packages));
    }
  }

  getPackage(data: Package) {
    this.selected = data.id;
    this.emitGetPackage.emit(data);
  }

  /**
   * Search the package with s
   * @param s serach string for the request
   */
  _searchPackages(s: string = '') {
    this.connekthubService.getPackages(this.importType, s).subscribe(res => {
      this.packages = res as any[];
    }, err=> console.error(`Error : ${err.message}`));
  }

  /**
   * get page records
   */

   onPageChange(event: PageEvent) {
    if (this.recordsPageIndex !== event.pageIndex) {
      this.recordsPageIndex = event.pageIndex;
    }
  }

  // display page records range

  get displayedRecordsRange(): string {
    const endRecord =
      this.recordsPageIndex * this.recordsPageSize < this.totalCount ? this.recordsPageIndex * this.recordsPageSize : this.totalCount;

    return this.totalCount ? `${(this.recordsPageIndex - 1) * this.recordsPageSize + 1} to ${endRecord} of ${this.totalCount}` : '';
  }

}
