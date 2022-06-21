import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CoreService } from '@services/core/core.service';
import { TransientService } from 'mdo-ui-library';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'pros-connekthub-packages',
  templateUrl: './connekthub-packages.component.html',
  styleUrls: ['./connekthub-packages.component.scss']
})
export class ConnekthubPackageComponent implements OnInit {
  // content all connekthub packages list
  connekthubPackageList = [];
  // content search string
  searchString: string = '';
  // search package subject
  searchPackage = new Subject();
  // store query params
  openLocation: string;
  // content selected package id
  selectedPackage;

  constructor(
    private router: Router,
    private coreService: CoreService,
    private transientService: TransientService,
    private activateRoute: ActivatedRoute
    ) { }

  ngOnInit(): void {
    this.activateRoute.queryParams.subscribe(
      res => {
        console.log(res);
        this.openLocation = res?.openLoc;
      });
    this.getAllConnekthubPackage();
    this.searchPackage.pipe(debounceTime(1000), distinctUntilChanged()).subscribe((searchString: string) => {
      this.searchString = searchString;
      this.getAllConnekthubPackage();
    });
  }

  // get all package from connekthub
  getAllConnekthubPackage() {
    this.coreService.getAllConnekthubPackage(this.searchString).subscribe(
      res => {
        this.connekthubPackageList = res?.response;
      },
      err => {
        this.transientService.open(err?.message);
      }
    )

  }

  // import package from connekthub
  // @params package object
  importPackage(packageObj: any) {
    this.transientService.confirm(
      {
        data: {dialogTitle: 'Confirmation', label: `You are about to import ${packageObj?.name}, it will overwrite existing package. Would you like to continue?` },
        autoFocus: false,
        width: '600px',
        panelClass: 'create-master-panel'
      },
      (response) => {
        if (response === 'yes') {
          this.selectedPackage = packageObj?.id
          this.coreService.importPackage(packageObj?.id).subscribe(
            res => {
              if(res) {
                this.selectedPackage = '';
                this.transientService.open('Package import successfully');
                this.close();
              }
            },
            err => {
              this.transientService.open(err?.message);
            }
          )
        }
      }
    );
  }

  // close side sheet
  close() {
    if(this.openLocation === 'home') {
      this.router.navigate([{ outlets: { sb: null } }]);
      return
    }
    this.router.navigate([{ outlets: { outer: null } }], { queryParamsHandling: 'preserve' });
  }

}
