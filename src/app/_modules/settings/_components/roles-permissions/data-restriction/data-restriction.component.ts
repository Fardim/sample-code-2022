import { PrivilegeModel } from './../role-privilege/role-privilege.component';
import { UserProfileService } from '@services/user/user-profile.service';
import { FilterCriteria, ListPageFilters } from '@models/list-page/listpage';
import { SelectionModel } from '@angular/cdk/collections';
import { FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { debounceTime, distinctUntilChanged, take, takeUntil, map } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CoreService } from '@services/core/core.service';
import { uniq } from 'lodash';

@Component({
  selector: 'pros-data-restriction',
  templateUrl: './data-restriction.component.html',
  styleUrls: ['./data-restriction.component.scss']
})
export class DataRestrictionComponent implements OnInit, OnDestroy {
  roleId = '';
  privilegeId = '';
  datasetfieldsItemsCtrl: FormControl = new FormControl(null);
  unsubscribeAll$: Subject<boolean> = new Subject<boolean>();
  isLoading = false;
  moduleList: { moduleId: string; moduleDesc: string }[] = [];
  selection = new SelectionModel<{ moduleId: string; moduleDesc: string }>(true, []);
  selectedModuleIds: string[] = [];
  privilegeDetails: PrivilegeModel = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private coreService: CoreService,
    private cdr: ChangeDetectorRef,
    private profileService: UserProfileService,
  ) {
    this.route.params.pipe(takeUntil(this.unsubscribeAll$)).subscribe((params) => {
      if (params?.roleId) {
        this.roleId = params.roleId;
      }
      this.privilegeId = params.privilegeId ? params.privilegeId : '0';
    });

    this.profileService.rolePrivilegeDataRestriction$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((resp) => {
      if (resp) {
        this.privilegeDetails = resp.filters;
        this.selectedModuleIds = resp.filters && resp.filters.dataRestrict ? Array.from(new Set(resp.filters.dataRestrict.map(d=> d.moduleId))) : [];
        this.findModuleSelected();
      }
    });

    this.profileService.rolePrivilegeDataRestrictionFilters$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((resp) => {
      if (resp) {
        this.selectedModuleIds = uniq([...this.selectedModuleIds, resp.moduleId]);
        this.findModuleSelected();
        const idx = this.privilegeDetails.dataRestrict.findIndex(d=> d.moduleId === resp.moduleId);
        if(idx>=0) {
          this.privilegeDetails.dataRestrict.splice(idx, 1, {moduleId: resp.moduleId, criteria: resp.filters});
        } else {
          this.privilegeDetails.dataRestrict.push({moduleId: resp.moduleId, criteria: resp.filters});
        }
      }
    });
  }

  ngOnInit(): void {
    this.getModules();
    this.datasetfieldsItemsCtrl.valueChanges
      .pipe(debounceTime(700), distinctUntilChanged(), takeUntil(this.unsubscribeAll$))
      .subscribe((search) => {
        search = search ? search.toLowerCase() : '';
        this.getModules(search);
      });
  }

  getModules(description: string = '') {
    this.isLoading = true;
    this.coreService
      .searchAllObjectType({ lang: 'en', fetchsize: 0, fetchcount: 0, description })
      .pipe(take(1))
      .subscribe(
        (resp) => {
          this.moduleList = resp;
          this.findModuleSelected();
          this.isLoading = false;
        },
        (err) => (this.isLoading = false)
      );
  }

  findModuleSelected() {
    this.moduleList.forEach(module => {
      const idx = this.selectedModuleIds.findIndex(d=> d === module.moduleId);
      if(idx>=0) {
        this.selection.select(module);
      }
    })
  }

  /**
   * check if row is selected
   * @param row to check
   * @returns boolean
   */
  isChecked(row: { moduleId: string; moduleDesc: string }): boolean {
    const found = this.selection.selected.find((e) => e.moduleId === row.moduleId);
    if (found) return true;
    return false;
  }

  /**
   * select/deselect the table row
   * @param element to select/deselect
   */
  toggle(element: { moduleId: string; moduleDesc: string }): void {
    this.selection.toggle(element);
    this.cdr.detectChanges();
    this.profileService.nextRolePrivilegeDataRestrictionFilters({roleId: this.roleId, privilegeId: this.privilegeId, moduleId: element.moduleId, filters: []});
  }

  gotoFilter(moduleId: string) {
    let filters = '';
    const moduleRestrictions = this.privilegeDetails.dataRestrict.find(d=> d.moduleId === moduleId);
    if(this.privilegeDetails.dataRestrict.length>0 && moduleRestrictions) {
      let filtersList: ListPageFilters = new ListPageFilters();
      filtersList.filterCriteria = moduleRestrictions.criteria as FilterCriteria[];
      filters = btoa(JSON.stringify(filtersList));
    }
    if (this.roleId === '0') {
      this.router.navigate(
        [
          {
            outlets: {
              sb: `sb/settings/roles-permissions`,
              outer: `outer/roles-permissions/new-role`,
              sb3: `sb3/roles-permissions/${this.roleId}/data-restriction/${this.privilegeId}/filter-settings/${moduleId}`
            }
          }
        ],
        {
          queryParams: {f: filters},
          fragment: 'role-privilege-data-restriction',
        }
      );
    } else {
      this.router.navigate(
        [
          {
            outlets: {
              sb: `sb/settings/roles-permissions`,
              outer: `outer/roles-permissions/edit-role/${this.roleId}`,
              sb3: `sb3/roles-permissions/${this.roleId}/data-restriction/${this.privilegeId}/filter-settings/${moduleId}`
            }
          }
        ],
        {
          queryParams: {f: filters},
          fragment: 'role-privilege-data-restriction',
        }
      );
    }
  }

  close() {
    this.router.navigate([{ outlets: { sb3: null } }]);
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next(true);
    this.unsubscribeAll$.complete();
  }
}
