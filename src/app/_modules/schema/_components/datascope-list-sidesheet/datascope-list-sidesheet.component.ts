import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataScopeSidesheet } from '@models/schema/schema';
import { VariantDetails } from '@models/schema/schemalist';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { GlobaldialogService } from '@services/globaldialog.service';
import { SchemaVariantService } from '@services/home/schema/schema-variant.service';
import { TransientService } from 'mdo-ui-library';

@Component({
  selector: 'pros-datascope-list-sidesheet',
  templateUrl: './datascope-list-sidesheet.component.html',
  styleUrls: ['./datascope-list-sidesheet.component.scss']
})
export class DatascopeListSidesheetComponent implements OnInit, OnDestroy {

  /**
   * holds list of schema variants
   */
  variantsList: VariantDetails[] = [];
  /**
   * holds subscription list
   */
  subscriptions = [];
  /**
   * holds schemaid
   */
  schemaId;
  /**
   * holds module ID
   */
  moduleId;
  /**
   * holds outlet name
   */
  outlet;
  /**
   * holds current page no of variants infinite scroll list
   */
  pageNo = 0;
  loader = false;

  datascopeSheetState: DataScopeSidesheet;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private schemaVariantService: SchemaVariantService,
    private globalDialogService: GlobaldialogService,
    private toasterService: TransientService,
    private sharedService: SharedServiceService
  ) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.schemaId = params.schemaId;
      this.moduleId = params.moduleId;
      this.outlet = params.outlet;

      if (this.schemaId) {
        this.getSchemaVariants(this.schemaId, 'RUNFOR', 0);
      }
    });

    this.sharedService.getdatascopeSheetState().subscribe((res) => {
      if (res) {
        this.datascopeSheetState = res;
        if (this.datascopeSheetState.openedFrom === 'schemaInfo' && !this.datascopeSheetState.editSheet && this.datascopeSheetState.isSave && this.schemaId) {
          this.getSchemaVariants(this.schemaId, 'RUNFOR', 0);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }

  /**
   * gets schema variants list
   * @param schemaId schema id
   * @param type variant type
   * @param pageNo infinite scroll page no
   * @param limit no of records per page
   */
  getSchemaVariants(schemaId: string, type = 'RUNFOR', pageNo, limit = 20) {
    const body = {
      from: pageNo,
      size: limit,
      variantName: null
    };
    this.loader = true;
    const schemaVariantList = this.schemaVariantService.getDataScopesList(schemaId, type, body).subscribe(res => {
      this.loader = false;
      if (res && res.length) {
        if (pageNo === 0) {
          this.variantsList = res;
        } else {
          res.forEach((x) => {
            this.variantsList.push(x);
          });
        }
      }
    }, error => {
      this.loader = false;
      console.log('Error while getting schema variants', error.message)
    })
    this.subscriptions.push(schemaVariantList);
  }

  /**
   * updates variant list based on infinite scroll
   */
  updateVariantsList() {
    if (this.schemaId) {
      this.pageNo = this.pageNo + 1;
      this.getSchemaVariants(this.schemaId, 'RUNFOR', this.pageNo);
    }
  }

  /**
   * opens edit datascope sidesheet
   * @param variantId variant id
   */
  editDataScope(variantId: string) {
    if(!this.datascopeSheetState) { return; }
    this.datascopeSheetState.variantId = variantId;
    this.datascopeSheetState.editSheet = true;
    this.sharedService.setdatascopeSheetState(this.datascopeSheetState);
  }

  /**
   * opens confirmation box
   * @param variantId variant id
   */
  deleteVariant(variantId: string) {
    this.globalDialogService.confirm({ label: 'Are you sure you want to delete this ?' }, (response) => {
      this.deleteVariantAfterConfirm(response, variantId);
    });
  }

  /**
   * deletes variant
   * @param response confirmation box response
   * @param variantId variant id
   */
  deleteVariantAfterConfirm(response, variantId: string) {
    if (response && response === 'yes') {
      const deleteVariant = this.schemaVariantService.deleteVariant(variantId).subscribe(res => {
        if (res) {
          this.variantsList = this.variantsList.filter((x) => x.variantId !== variantId);
          this.toasterService.open('Data scope successfully deleted !!', 'close', { duration: 3000 })
          this.sharedService.setAfterVariantDeleted(variantId);
        }
      }, error => {
        console.log('Error while deleting schema variant', error.message)
      })
      this.subscriptions.push(deleteVariant);
    }
  }

  /**
   * closes sidesheet
   */
  close(){
    this.router.navigate([{ outlets: { [this.outlet]: null } }], {queryParamsHandling: 'preserve'});
    if(!this.datascopeSheetState) { return; }
    const state = {
      openedFrom: this.datascopeSheetState.openedFrom,
      editSheet: false,
      listSheet: false
    };
    this.sharedService.setdatascopeSheetState(state);
  }
}
