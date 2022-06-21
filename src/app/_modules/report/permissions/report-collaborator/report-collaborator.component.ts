import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ReportService } from '@modules/report/_service/report.service';
import { PermissionOnCollaborator, ReportDashboardPermission, PermissionType, UserContent } from '@models/collaborator';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GlobaldialogService } from '@services/globaldialog.service';

export class PermissionGroup {
  groupId: string;
  groupDesc: string;
  childs: ReportDashboardPermission[];
}
@Component({
  selector: 'pros-report-collaborator',
  templateUrl: './report-collaborator.component.html',
  styleUrls: ['./report-collaborator.component.scss'],
})
export class ReportCollaboratorComponent implements OnInit {
  /**
   * All collaborators response
   */
  permissionOn: PermissionOnCollaborator;

  /**
   * Hold all collaborators with groups
   */
  collaborators: PermissionGroup[];

  /**
   * Assigned collaborators list
   */
  collaboratorList: ReportDashboardPermission[] = [];
  collaboratorListOb: Observable<ReportDashboardPermission[]> = of([]);

  addCollaboratorFrmGrp: FormGroup;
  searchCollCtrl: FormControl = new FormControl('');
  reportId: string;
  showErrorBanner = false;

  /**
   * To lose focus from input after selecting an option from MatAutocomplete
   */
  @ViewChild('loosefoucs') loosefocus: ElementRef;

  /**
   * Selected collaborators before saved
   */
  selectedCollaborators: ReportDashboardPermission[] = [];
  possibleChips: ReportDashboardPermission[] = [];
  currentPageIdx = 0;

  constructor(
    private reportServie: ReportService,
    private formBuilder: FormBuilder,
    private activatedRouter: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private globalDialogService: GlobaldialogService
  ) {}

  ngOnInit(): void {
    this.getCollaboratorPermission('', 10);
    this.activatedRouter.params.subscribe((param) => {
      this.reportId = param.reportId;
      console.log(this.reportId);
    });
    this.getExitingCollaborators();

    this.addCollaboratorFrmGrp = this.formBuilder.group({
      addCollaboratorCtrl: [''],
      isViewable: [false],
      isEditable: [false],
      isDeleteable: [false],
    });

    /**
     * After value change should call http for load more collaborators
     */
    this.addCollaboratorFrmGrp.get('addCollaboratorCtrl').valueChanges.subscribe((val) => {
      if (val && typeof val === 'string') {
        this.getCollaboratorPermission(val, 10);
      } else if (typeof val === 'string' && val.trim() === '') {
        this.getCollaboratorPermission('', 10);
      }
    });
  }

  /**
   * Get all collaborators permission
   * @param queryString search able string
   */
  getCollaboratorPermission(queryString: string, fetchCount: number) {
    const requestBody = {
        pageInfo: {
          pageNumer: 0,
          pageSize: fetchCount
        },
      searchString: queryString
    }
    forkJoin([
    this.reportServie.getCollaboratorUsers(requestBody),
    this.reportServie.getCollaboratorRoles(requestBody),
    ]).subscribe(
      (response) => {
        const users = response[0]?.listPage?.content;
        const roles = response[1]?.listPage?.content;
        const collaboratorsType = {
          users,
          roles
        }
        this.permissionOn = collaboratorsType;
        this.collaborators = this.transformResponse(collaboratorsType);
      },
      (error) => console.error(`Error: ${error}`)
    );
  }

  getFullName(user: UserContent) {
    let fullName = user.userName;
    if(user.fname) {
      fullName = user.fname;
    }
    if(user.lname) {
      fullName += ' ' +user.lname;
    }
    return fullName;
  }

  /**
   * Help to tarnsfor response into groups
   * @param response from server for (all collaborators)
   */
  transformResponse(response: PermissionOnCollaborator): PermissionGroup[] {
    const grps: PermissionGroup[] = [];
    // for user
    if (response && response.users) {
      const userGrp = new PermissionGroup();
      userGrp.childs = [];
      response.users.forEach((user) => {
        const permission = new ReportDashboardPermission();
        permission.userId = user.userName;
        permission.description = this.getFullName(user);
        permission.fullName = this.getFullName(user);
        permission.permissionType = PermissionType.USER;
        userGrp.childs.push(permission);
      });
      userGrp.groupId = 'user_group';
      userGrp.groupDesc = 'Users';
      grps.push(userGrp);
    }

    // for roles
    if (response && response.roles) {
      const userGrp = new PermissionGroup();
      userGrp.childs = [];
      response.roles.forEach((role) => {
        const permission = new ReportDashboardPermission();
        permission.roleId = role.roleId;
        permission.description = role.description;
        permission.permissionType = PermissionType.ROLE;
        userGrp.childs.push(permission);
      });
      userGrp.groupId = 'roles';
      userGrp.groupDesc = 'Roles';
      grps.push(userGrp);
    }

    // groups
    // if (response && response.groups) {
    //   const userGrp = new PermissionGroup();
    //   userGrp.childs = [];
    //   response.groups.forEach((grp) => {
    //     const permission = new ReportDashboardPermission();
    //     permission.groupId = grp.groupIdAsStr;
    //     permission.description = grp.description;
    //     permission.permissionType = PermissionType.GROUP;
    //     userGrp.childs.push(permission);
    //   });
    //   userGrp.groupId = 'groups';
    //   userGrp.groupDesc = 'Groups';
    //   grps.push(userGrp);
    // }
    return grps;
  }

  /**
   * Displaywith help to display selection with option description
   * @param option from mat-autocomplete
   */
  displayWith(option: ReportDashboardPermission): string {
    return option ? option.description : null;
  }

  /**
   * Use for set selected item
   * @param event after selection change on collaborators list
   */
  onSelectCollaborator(event: MatAutocompleteSelectedEvent) {
    if (event && event.option) {
      const selVal: ReportDashboardPermission = event.option.value;
      let isAlreadyExits = false;
      if (selVal.permissionType === PermissionType.USER) {
        const user = this.permissionOn.users.filter((fil) => fil.userName === selVal.userId)[0];
        user.fullName = this.getFullName(user);
        selVal.userMdoModel = user;
        isAlreadyExits = this.selectedCollaborators.filter((fil) => fil.userId === selVal.userId).length ? true : false;
      // } else if (selVal.permissionType === PermissionType.GROUP) {
      //   const grp = this.permissionOn.groups.filter((fil) => fil.groupIdAsStr === selVal.groupId)[0];
      //   selVal.groupHeaderModel = grp;
      //   isAlreadyExits = this.selectedCollaborators.filter((fil) => fil.groupId === selVal.groupId).length ? true : false;
      } else if (selVal.permissionType === PermissionType.ROLE) {
        const role = this.permissionOn.roles.filter((fil) => fil.roleId === selVal.roleId)[0];
        selVal.rolesModel = role;
        isAlreadyExits = this.selectedCollaborators.filter((fil) => fil.roleId === selVal.roleId).length ? true : false;
      }

      if (selVal && !isAlreadyExits) {
        this.selectedCollaborators.push(selVal);
        this.possibleChips.push(selVal);
      }
      if (this.enableNextBtn) this.paginateChip('next');
      this.addCollaboratorFrmGrp.controls.addCollaboratorCtrl.reset();
      this.loosefocus.nativeElement.blur();
      this.getCollaboratorPermission('', 10);
    }
  }

  /**
   * Get all exiting added collaborators
   */
  getExitingCollaborators() {
    this.reportServie.getCollaboratorsPermisison(this.reportId).subscribe(
      (res) => {
        this.collaboratorList = res;
        this.collaboratorListOb = of(res);
      },
      (error) => console.error(`Error : ${error}`)
    );
  }

  /**
   * Should create possibleChips to view on mat-chip-list
   * @param where get the pagination call from prev | next
   */
  paginateChip(where?: string) {
    const reverseSelected = this.selectedCollaborators;
    if (where === 'prev' && this.currentPageIdx > 0) {
      this.possibleChips = [];
      if (reverseSelected[this.currentPageIdx * 2 - 2]) this.possibleChips.push(reverseSelected[this.currentPageIdx * 2 - 2]);
      if (reverseSelected[this.currentPageIdx * 2 - 1]) this.possibleChips.push(reverseSelected[this.currentPageIdx * 2 - 1]);
      this.currentPageIdx--;
    } else if (
      where === 'next' &&
      this.currentPageIdx * 2 + 2 < this.selectedCollaborators.length &&
      this.selectedCollaborators.length > 2
    ) {
      this.possibleChips = [];
      this.currentPageIdx++;
      if (reverseSelected[this.currentPageIdx * 2]) this.possibleChips.push(reverseSelected[this.currentPageIdx * 2]);
      if (reverseSelected[this.currentPageIdx * 2 + 1]) this.possibleChips.push(reverseSelected[this.currentPageIdx * 2 + 1]);
    } else {
      this.possibleChips = [];
      if (reverseSelected[this.currentPageIdx * 2]) this.possibleChips.push(reverseSelected[this.currentPageIdx * 2]);
      if (reverseSelected[this.currentPageIdx * 2 + 1]) this.possibleChips.push(reverseSelected[this.currentPageIdx * 2 + 1]);
    }
  }

  /**
   * Should remove selected user / group / role from list
   * @param removeAble Remove able selected user / group / role
   */
  remove(removeAble: ReportDashboardPermission) {
    let selecteItemIdx;
    let possibleChipsIdx;
    if (removeAble && removeAble.permissionType === PermissionType.USER) {
      const selData = this.selectedCollaborators.filter((fil) => fil.userId === removeAble.userId)[0];
      selecteItemIdx = this.selectedCollaborators.indexOf(selData);
      const possibleCh = this.possibleChips.filter((fil) => fil.userId === removeAble.userId)[0];
      possibleChipsIdx = this.possibleChips.indexOf(possibleCh);
    } else if (removeAble && removeAble.permissionType === PermissionType.GROUP) {
      const selData = this.selectedCollaborators.filter((fil) => fil.groupId === removeAble.groupId)[0];
      selecteItemIdx = this.selectedCollaborators.indexOf(selData);
      const possibleCh = this.possibleChips.filter((fil) => (fil.groupId = removeAble.groupId))[0];
      possibleChipsIdx = this.possibleChips.indexOf(possibleCh);
    } else if (removeAble && removeAble.permissionType === PermissionType.ROLE) {
      const selData = this.selectedCollaborators.filter((fil) => fil.roleId === removeAble.roleId)[0];
      selecteItemIdx = this.selectedCollaborators.indexOf(selData);
      const possibleCh = this.possibleChips.filter((fil) => (fil.roleId = removeAble.roleId))[0];
      possibleChipsIdx = this.possibleChips.indexOf(possibleCh);
    }

    if (selecteItemIdx !== undefined && possibleChipsIdx !== undefined) {
      this.selectedCollaborators.splice(selecteItemIdx, 1);
      this.possibleChips.splice(possibleChipsIdx, 1);
      this.paginateChip();
    }
  }

  /**
   * To check / enable previuos button
   */
  get enablePreBtn() {
    return this.currentPageIdx <= 0;
  }

  /**
   * To check / enable next button
   */
  get enableNextBtn(): boolean {
    return this.currentPageIdx * 2 + 2 < this.selectedCollaborators.length && this.selectedCollaborators.length > 2;
  }

  /**
   * While click on close should be set sb outlet to null
   */
  close() {
    this.router.navigate([{ outlets: { sb: null } }]);
  }

  /**
   * Should http call for update selected permission
   * @param permission update able permission
   */
  updatePermission(permission: ReportDashboardPermission) {
    this.reportServie.saveUpdateReportCollaborator([permission]).subscribe(
      (res) => {
        this.getExitingCollaborators();
      },
      (error) => console.error(`Error : ${error}`)
    );
  }

  /**
   * For delete assigned collaborator based on assigned permission
   * @param permissionId permission id which we want to delete
   */
  deleteCollaborator(permissionId: string) {
    this.globalDialogService.confirm({ label: 'Are you sure you want to remove this ?' }, (response) => {
      if (response && response === 'yes') {
        this.reportServie.deleteCollaborator(permissionId).subscribe(
          (res) => {
            if (res) {
              this.snackBar.open(`Successfully deleted`, 'Close', { duration: 4000 });
              this.getExitingCollaborators();
            } else {
              this.snackBar.open(`Something went wrong`, 'Close', { duration: 4000 });
            }
          },
          (error) => {
            this.snackBar.open(`Something went wrong`, 'Close', { duration: 4000 });
          }
        );
      }
    });
  }

  /**
   * Save or update selected permission
   */
  saveCollaborators() {
    this.showErrorBanner = false;
    const value = this.addCollaboratorFrmGrp.value;
    this.selectedCollaborators.forEach((coll, index) => {
      this.collaboratorList.forEach((existingCollaborator) => {
        if (existingCollaborator.userId === coll.userId) {
          this.selectedCollaborators.splice(index, 1);
          this.showErrorBanner = true;
        }
      });
    });
    this.selectedCollaborators.forEach((coll, index) => {
      coll.isEditable = value.isEditable ? value.isEditable : false;
      coll.isDeleteable = value.isDeleteable ? value.isDeleteable : false;
      coll.isViewable = value.isViewable ? value.isViewable : false;
      coll.permissionId = Math.floor(Math.random() * 1000000000);
      coll.reportId = this.reportId;
    });
    if (this.selectedCollaborators.length > 0) {
      this.reportServie.saveUpdateReportCollaborator(this.selectedCollaborators).subscribe(
        (res) => {
          this.addCollaboratorFrmGrp.reset();
          this.selectedCollaborators = [];
          this.possibleChips = [];
          this.currentPageIdx = 0;
          this.getExitingCollaborators();
          this.showErrorBanner = false;
        },
        (error) => {
          this.showErrorBanner = false;
        }
      );
    } else if ( this.showErrorBanner ) {
      this.showErrorBanner = false;
    }
  }

  /**
   * event emitted from collaborator component so that edit permission can be updated
   * @param collaborator selected collaborator
   */
  editPermission(collaborator: ReportDashboardPermission) {
    this.collaboratorList.forEach((element) => {
      if (element.userId !== collaborator.userId) {
        element.showEditMode = false;
      }
    });
  }

  /**
   * Search field by value change
   * @param value changed input value
   */
  searchFld(value: string) {
    console.log(this.collaboratorList);
    if (value) {
      this.collaboratorListOb = of(
        this.collaboratorList.filter((fil) => {
          if (fil.userId && fil.userId.toLocaleLowerCase().indexOf(value.toLocaleLowerCase()) !== -1) {
            return fil;
          }

          if (fil.roleId && fil.roleId.toLocaleLowerCase().indexOf(value.toLocaleLowerCase()) !== -1) {
            return fil;
          }

          // if (fil.groupHeaderModel && fil.groupHeaderModel.description.toLocaleLowerCase().indexOf(value.toLocaleLowerCase()) !== -1) {
          //   return fil;
          // }
        })
      );
    } else {
      this.collaboratorListOb = of(this.collaboratorList);
    }
  }
}
