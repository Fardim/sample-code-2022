import { DataRestrictDto, RolePrivilegeDataRestrictionFilters } from './../../../../../_models/role-privileges.model';
import { take, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
import { Component, Input, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { UserProfileService } from '@services/user/user-profile.service';
import {
  Privilege,
  PrivilegeList,
  RolePrivilegeDto,
  RolePrivilegeDataRestriction
} from '@models/role-privileges.model';
import { FilterCriteria, ListPageFilters } from '@models/list-page/listpage';

@Component({
  selector: 'pros-role-privilege',
  templateUrl: './role-privilege.component.html',
  styleUrls: ['./role-privilege.component.scss']
})
export class RolePrivilegeComponent implements OnInit, OnDestroy {
  @Input() roleId = '0';
  @Input() roleData: RolePrivilegeDto = null;
  @Output() updatedPrivilege = new EventEmitter<PrivilegeList[]>();
  flattenedPrivilegeList: Privilege[] = [];
  privilegeList: PrivilegeList[] = [];
  rolesDataFetching = false;
  /**
   * table data search by string
   */
  searchFieldSub: Subject<string> = new Subject();
  searchString = '';
  displayedColumns: string[] = [
    'description',
    '_select',
    'privilege',
    'actions_allowed',
    'data_restrictions',
    'category'
  ];
  fields = privilegeTableFields;
  dataSource: any;
  /**
   * selected rows from the table
   */
  selection = new SelectionModel<PrivilegeModel>(true, []);
  privilegeData: PrivilegeModel[] = [];
  originalPrivileges: PrivilegeModel[] = [];
  roleDetailsFetching = false;
  currentFilter = '';
  unsubscribeAll$: Subject<boolean> = new Subject<boolean>();

  constructor(private router: Router, private profileService: UserProfileService) {}

  ngOnInit(): void {
    this.getFlattenedPrivilegeList();
    this.getAllPrivileges();
    this.profileService.rolePrivilegeDataRestrictionFilters$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((resp) => {
      if (resp) {
        this.mapDataRestrictions(resp);
      }
    });
    this.searchFieldSub.pipe(debounceTime(1000), distinctUntilChanged()).subscribe((searchString) => {
      this.searchString = searchString;
      if(this.searchString) {
        const data = this.originalPrivileges.filter((d: PrivilegeModel) => d.privilege.toLowerCase().indexOf(this.searchString.toLowerCase())>=0);
        this.dataSource.data = data;
      } else {
        this.dataSource.data = this.originalPrivileges;
      }
      this.dataSource.data.forEach((element: PrivilegeModel) => {
        if (element.roleHasPrivilege) {
          this.selection.select(element);
        }
      });
    });
  }
  mapDataRestrictions(restriction: RolePrivilegeDataRestrictionFilters) {
    this.originalPrivileges = this.originalPrivileges.map((p) => {
      if (p.id === restriction.privilegeId && this.roleId === restriction.roleId) {
        let targetRestrictionIndex = p.dataRestrict.findIndex((dr) => dr.moduleId === restriction.moduleId);
        if (targetRestrictionIndex >= 0) {
          p.dataRestrict.splice(targetRestrictionIndex, 1, {
            moduleId: restriction.moduleId,
            criteria: restriction.filters
          });

          p.has_data_restrictions = true;
        } else {
          p.dataRestrict.push({ moduleId: restriction.moduleId, criteria: restriction.filters });
        }
      }
      return p;
    });
    let tableData = (this.dataSource && this.dataSource.data) || [];
    tableData = tableData.map((p) => {
      if (p.id === restriction.privilegeId && this.roleId === restriction.roleId) {
        let targetRestrictionIndex = p.dataRestrict.findIndex((dr) => dr.moduleId === restriction.moduleId);
        if (targetRestrictionIndex >= 0) {
          p.dataRestrict.splice(targetRestrictionIndex, 1, {
            moduleId: restriction.moduleId,
            criteria: restriction.filters
          });

          p.has_data_restrictions = true;
        } else {
          p.dataRestrict.push({ moduleId: restriction.moduleId, criteria: restriction.filters });
        }
      }
      return p;
    });
    this.dataSource.data = tableData;
    this.dataSource.data.forEach((element: PrivilegeModel) => {
      if (element.roleHasPrivilege) {
        this.selection.select(element);
      }
    });

    this.triggerPrivilegeChanged();
  }
  getFlattenedPrivilegeList() {
    this.flattenedPrivilegeList =
      (this.roleData &&
        this.roleData.privilegeList &&
        this.roleData.privilegeList.reduce((acc, curr) => {
          acc = [
            ...acc,
            ...curr.privileges.map((d) => {
              return {
                ...d,
                area: curr.area
              };
            })
          ];
          return acc;
        }, [])) ||
      [];
  }

  getAllPrivileges() {
    this.profileService
      .getAllPrivileges()
      .pipe(take(1))
      .subscribe((resp) => {
        this.privilegeList = resp;
        this.mapExistingPrivilegeData();
      });
  }

  mapExistingPrivilegeData() {
    this.originalPrivileges = this.privilegeList.reduce((acc, curr) => {
      acc = [
        ...acc,
        ...curr.privileges.map((d) => {
          const allowed = this.flattenedPrivilegeList.find((f) => f.id === d.id);
          let model = {
            id: d.id,
            privilege: d.id ? d.id.replace(/_/g, ' ') : d.id,
            description: d.description,
            category: curr.area,
            roleHasPrivilege: allowed && allowed.actions && allowed.actions.length > 0,
            privilege_options: d.actions || [],
            actions_allowed: allowed && allowed.actions ? allowed.actions : [],
            dataRestrict: (allowed && allowed.dataRestrict) || [],
            has_data_restrictions: allowed && allowed.dataRestrict && allowed.dataRestrict.length > 0,
            canRestrictData: false,
            canAllowFilterRestriction: false
          };
          model = this.findCanAllowRestriction(model);
          model = this.findCanRestrictData(model);
          return model;
        })
      ];
      return acc;
    }, []);

    this.bindTable();
  }

  bindTable() {
    this.privilegeData = JSON.parse(JSON.stringify(this.originalPrivileges));
    this.dataSource = new MatTableDataSource<PrivilegeModel>(this.privilegeData);
    this.dataSource.data.forEach((element: PrivilegeModel) => {
      if (element.roleHasPrivilege) {
        this.selection.select(element);
      }
    });
  }
  /**
   * find the label of the field of the table column
   * @param dynCol table column
   * @returns string
   */
  getLabel(dynCol) {
    return this.fields.find((d) => d.id === dynCol).name;
  }

  isChecked(row: any): boolean {
    const found = this.selection.selected.find((e) => e.privilege === row.privilege);
    if (found) return true;
    return false;
  }

  /**
   * select/deselect the table row
   */
  toggle(event: boolean, element: PrivilegeModel): void {
    this.selection.toggle(element);
    if(!event) {
      element.actions_allowed = [];
      const originalIdx = this.originalPrivileges.findIndex(d=> d.id === element.id);
      this.originalPrivileges[originalIdx].actions_allowed = [];
      this.triggerPrivilegeChanged();
    }
  }
  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ? this.selection.clear() : this.dataSource.data.forEach((row) => this.selection.select(row));
  }

  getAllowedActions(row: PrivilegeModel) {
    let html = '';
    const allowed = row && row.actions_allowed ? row.actions_allowed.map((d) => d.text) : [];
    allowed.forEach((element) => {
      html += `<div>${element}</div>`;
    });
    return html;
  }

  isPrivilegeSelected(row: PrivilegeModel, privilege: { code: string; text: string }) {
    const index = row.actions_allowed.findIndex((d) => d.code === privilege.code);
    return index >= 0 ? true : false;
  }

  setAllowedPrivilege(row: PrivilegeModel, privilege: { code: string; text: string }) {
    const index = row.actions_allowed.findIndex((d) => d.code === privilege.code);
    if (index >= 0) {
      row.actions_allowed.splice(index, 1);
    } else {
      row.actions_allowed.push(privilege);
    }

    this.originalPrivileges = this.originalPrivileges.map(d=> {
      if(d.id === row.id) {
        d.actions_allowed = row.actions_allowed;
      }
      return d;
    });
    this.triggerPrivilegeChanged();
  }

  triggerPrivilegeChanged() {
    // const tableData: PrivilegeModel[] = this.dataSource.data || [];
    const tableData: PrivilegeModel[] = this.originalPrivileges || [];
    const uniqAreas = Array.from(new Set(tableData.map((obj) => obj.category)));
    const latestPrivileges: PrivilegeList[] = uniqAreas.map((a) => {
      return {
        area: a,
        privileges: tableData
          .filter((p) => p.category === a && p.actions_allowed.length > 0)
          .map((f) => {
            return {
              id: f.id,
              actions: f.actions_allowed || [],
              description: f.description,
              dataRestrict:
                f.dataRestrict.filter(d=> d.moduleId).map((dr) => {
                  dr.criteria = dr && dr.criteria && Array.isArray(dr.criteria) && dr.criteria.filter((c) => c.fieldId !== null) || [];
                  return dr;
                }) || []
            };
          })
      };
    });
    this.updatedPrivilege.emit(latestPrivileges);
  }

  filterData(category: string) {
    if (category === this.currentFilter) {
      this.dataSource.data = this.originalPrivileges;
      this.currentFilter = '';
    } else {
      const data = this.originalPrivileges.filter((d: PrivilegeModel) => d.category === category);
      this.dataSource.data = data;
      this.currentFilter = category;
    }
    this.dataSource.data.forEach((element: PrivilegeModel) => {
      if (element.roleHasPrivilege) {
        this.selection.select(element);
      }
    });
  }

  gotoDataRestriction(privilege: PrivilegeModel) {
    this.profileService.nextRolePrivilegeDataRestriction({
      roleId: this.roleId,
      privilegeId: privilege.id,
      filters: privilege
    });
    if (this.roleId === '0') {
      this.router.navigate(
        [
          {
            outlets: {
              sb: `sb/settings/roles-permissions`,
              outer: `outer/roles-permissions/new-role`,
              sb3: `sb3/roles-permissions/${this.roleId}/data-restriction/${privilege.id}`
            }
          }
        ]
      );
    } else {
      this.router.navigate(
        [
          {
            outlets: {
              sb: `sb/settings/roles-permissions`,
              outer: `outer/roles-permissions/edit-role/${this.roleId}`,
              sb3: `sb3/roles-permissions/${this.roleId}/data-restriction/${privilege.id}`
            }
          }
        ]
      );
    }
  }

  findCanRestrictData(model: PrivilegeModel) {
    const restrictablePrivilegeIds = [
      'Maintain_Integration',
      'Maintain_Flows',
      'Maintain_Business_Rules',
      'Maintain_Schemas',
      'Maintain_Datasets'
    ];
    if (restrictablePrivilegeIds.indexOf(model.id) >= 0) {
      model.canRestrictData = true;
    } else {
      model.canRestrictData = false;
    }
    return model;
  }

  findCanAllowRestriction(model: PrivilegeModel) {
    const filterablePrivilegeIds = [
      'Maintain_Flows',
      'Maintain_Business_Rules',
      'Maintain_Schemas',
      'Maintain_Datasets'
    ];
    if (filterablePrivilegeIds.indexOf(model.id) >= 0) {
      model.canAllowFilterRestriction = true;
    } else {
      model.canAllowFilterRestriction = false;
    }
    return model;
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next(true);
    this.unsubscribeAll$.complete();
  }
}

export const privilegeTableFields = [
  {
    id: 'privilege',
    name: $localize`:@@privilege:Privilege`
  },
  {
    id: 'description',
    name: $localize`:@@description:description`
  },
  {
    id: 'actions_allowed',
    name: $localize`:@@actions_allowed:Actions allowed`
  },
  {
    id: 'data_restrictions',
    name: $localize`:@@data_restrictions:Data restrictions`
  },
  {
    id: 'category',
    name: $localize`:@@category:Category`
  }
];

export interface PrivilegeModel {
  id: string;
  privilege: string;
  description: string;
  category: string;
  roleHasPrivilege: boolean;
  privilege_options: {
    code: string;
    text: string;
  }[];
  actions_allowed: {
    code: string;
    text: string;
  }[];
  dataRestrict: DataRestrictDto[];
  has_data_restrictions: boolean;
  canRestrictData: boolean; // can open the data restriction sidesheet?
  canAllowFilterRestriction: boolean; // can open the filter restriction sidesheet?
}
