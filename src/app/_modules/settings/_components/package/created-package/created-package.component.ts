import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CoreService } from '@services/core/core.service';
import { TransientService } from 'mdo-ui-library';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'pros-created-package',
  templateUrl: './created-package.component.html',
  styleUrls: ['./created-package.component.scss']
})
export class CreatedPackageComponent implements OnInit {

  searchString: string = '';
  searchPackage = new Subject();
  openLocation: string;
  selectedPackage;
  loader: boolean = false;
  isEmptyState: boolean = false;
  pageNo: number = 0;
  pageSize: number = 20;
  packageList = [];
  filter: boolean = false;

  constructor(private router: Router, private coreService: CoreService, private transientService: TransientService, private activateRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.activateRoute.queryParams.subscribe(
      res => {
        console.log(res);
        this.openLocation = res?.openLoc;
      });
    this.getAllCreatedPackage();
    this.searchPackage.pipe(debounceTime(1000), distinctUntilChanged()).subscribe((searchString: string) => {
      this.searchString = searchString;
      this.getFilteredPackage();
    });
  }

  // get all package from local
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
      this.transientService?.open(err?.message);
    });
  }

  // get filter package
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
      this.transientService?.open(err?.message);
    });
  }

  // call when scroll reaches end of page
  loadMore() {
    this.pageNo++;
    this.coreService?.getAllPackages(this.pageNo, 20, this.searchString).subscribe((res) => {
      this.packageList = [...this.packageList, ...res];
    },
    err => {
      this.transientService?.open(err?.message);
    });
  }

  // get all package detail for edit and published
  editPackage(id) {
    this.router.navigate([{ outlets: { sb: `sb/settings/packages/new-packages` } }], {
      queryParams: { packageId: id }
    });
  }

  // close side sheet
  close() {
    this.router.navigate([{ outlets: { outer: null } }], { queryParamsHandling: 'preserve' });
  }

}
