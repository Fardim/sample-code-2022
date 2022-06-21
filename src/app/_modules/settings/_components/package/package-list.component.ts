import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CoreService } from '@services/core/core.service';
import { TransientService } from 'mdo-ui-library';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'pros-package-list',
  templateUrl: './package-list.component.html',
  styleUrls: ['./package-list.component.scss']
})
export class PackageListComponent implements OnInit {
  loader: boolean = false;
  isEmptyState: boolean = false;
  pageNo: number = 0;
  pageSize: number = 20;
  searchString: string = '';
  packageList = [];
  filter: boolean = false;
  searchPackage = new Subject();

  @Input() icon: string;
  @Input() title: string;
  @Input() description: string;
  @Input() action: string;
  @Input() actionButtonText: string;
  @Input() svgIconSize = 80;
  @Input() svgIconHeight = 80;
  @Input() svgIconViewBox = "0 0 262 251";
  @Input() disableClose: boolean = false;

  constructor(private router: Router, private coreService: CoreService, private transienteService: TransientService) {}

  ngOnInit(): void {
    this.getAllCreatedPackage();
    this.searchPackage.pipe(debounceTime(1000), distinctUntilChanged()).subscribe((searchString: string) => {
      this.searchString = searchString;
      this.pageNo = 0;
      this.getFilteredPackage();
    });
  }

  // get all saved packages
  getAllCreatedPackage() {
    this.loader = true;
    this.coreService?.getAllPackages(this.pageNo, 20, this.searchString).subscribe((res) => {
      this.loader = false;
      if (res?.length) {
        this.packageList = res;
      } else {
        this.isEmptyState = true;
      }
    },
    err => {
      this.transienteService.open(err?.message);
    });
  }

  // get filtered packages
  getFilteredPackage() {
    this.coreService?.getAllPackages(this.pageNo, 20, this.searchString).subscribe((res) => {
      if (res?.length) {
        this.packageList = res;
        this.filter = false;
      } else {
        this.filter = true;
      }
    },
    err => {
      this.transienteService.open(err?.message);
    });
  }

  // load more package when we scroll reaches end of page
  loadMore() {
    this.pageNo++;
    this.coreService?.getAllPackages(this.pageNo, 20, this.searchString).subscribe((res) => {
      this.packageList = [...this.packageList, ...res];
    },
    err => {
      this.transienteService.open(err?.message);
    });
  }

  // change route for create new package
  newButtonHandler() {
    // this.router.navigate([{ outlets: { sb: `sb/settings/packages`, outer: `outer/packages/new-package` } }], {
    //   queryParamsHandling: 'preserve',
    // });

    this.router.navigate([{ outlets: { sb: `sb/settings/packages/new-packages` } }]);
  }

  // for publishing the packages
  publishPackage(id) {
    this.coreService.exportPackage(id).subscribe((res) => {
      if (res) {
        this.transienteService.open('Package published');
        this.pageNo = 0;
        this.getAllCreatedPackage();
      }
    },
    err => {
      this.transienteService.open(err?.message);
    });
  }

  // for editing package
  editPackage(id) {
    this.router.navigate([{ outlets: { sb: `sb/settings/packages/new-packages` } }], {
      queryParams: { packageId: id }
    });
  }

  // open existing package side sheet
  openExistingPackage() {
    this.router.navigate([{ outlets: { sb: `sb/settings/packages`, outer: `outer/packages/created-package` } }], {
      queryParamsHandling: 'preserve'
    });
  }

  // open connekthub existing packages
  openConnekthubPackage() {
    this.router.navigate([{ outlets: { sb: `sb/settings/packages`, outer: `outer/connekthubPackage` } }], {
      queryParams: {openLoc: 'package'}
    });
  }
}
