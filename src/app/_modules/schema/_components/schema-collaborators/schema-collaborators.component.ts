import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { SchemaDetailsService } from 'src/app/_services/home/schema/schema-details.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PermissionOn, SchemaDashboardPermission, PermissionType } from '@models/collaborator';

export class PermissionGroup {
  groupId: string;
  groupDesc: string;
  childs: SchemaDashboardPermission[];
}
@Component({
  selector: 'pros-schema-collaborators',
  templateUrl: './schema-collaborators.component.html',
  styleUrls: ['./schema-collaborators.component.scss']
})
export class SchemaCollaboratorsComponent implements OnInit {

  /**
   * All collaborators response
   */
  permissionOn: PermissionOn;

  /**
   * Hold all collaborators with groups
   */
  collaborators: PermissionGroup[];

  /**
   * Assigned collaborators list
   */
  collaboratorList: SchemaDashboardPermission[];
  collaboratorListOb: Observable<SchemaDashboardPermission[]> = of([]);

  addCollaboratorFrmGrp: FormGroup;
  searchCollCtrl: FormControl = new FormControl('');
  schemaId: string;

  /**
   * Selected collaborators before saved
   */
  selectedCollaborators: SchemaDashboardPermission[]= [];
  possibleChips: SchemaDashboardPermission[] = [];
  currentPageIdx = 0;

  /**
   * Fetch count for collaborators
   */
  fetchCount = 0;

  constructor(
    private activatedRouter: ActivatedRoute,
    private formBuilder: FormBuilder,
    private schemaDetailsService: SchemaDetailsService,
    private router: Router,
    private snackBar: MatSnackBar
    ) { }

  ngOnInit(): void {
    this.getCollaboratorPermission('', this.fetchCount);
    this.activatedRouter.params.subscribe(params => {
      this.schemaId = params.schemaId;
    });
    this.getExistingCollaboratorDetails();

    this.addCollaboratorFrmGrp = this.formBuilder.group({
      addCollaboratorCtrl:[''],
      isAdmin: [false],
      isViewer: [false],
      isEditer: [false],
      isReviewer: [false]
    });

    /**
     * After value change should call http for load more collaborators
     */
    this.addCollaboratorFrmGrp.get('addCollaboratorCtrl').valueChanges.subscribe(val=>{
      this.fetchCount = 0;
      if(val && typeof val === 'string') {
        this.getCollaboratorPermission(val, this.fetchCount);
      } else if(typeof val === 'string' && val.trim() === ''){
        this.getCollaboratorPermission('', this.fetchCount);
      }
    })

    /**
     * Filtered added collaborators
     */
    this.searchCollCtrl.valueChanges.subscribe(data => {
      this.collaboratorListOb = of(this.collaboratorList.filter(fil => {
        if(fil.userMdoModel && fil.userMdoModel.fullName.toLocaleLowerCase().indexOf(data.toLocaleLowerCase()) !==-1) {
          return fil;
        }

        if(fil.rolesModel && fil.rolesModel.roleDesc.toLocaleLowerCase().indexOf(data.toLocaleLowerCase()) !==-1) {
          return fil;
        }

        if(fil.groupHeaderModel && fil.groupHeaderModel.description.toLocaleLowerCase().indexOf(data.toLocaleLowerCase()) !==-1) {
          return fil;
        }

      }));
    })
  }

  /**
   * Get all collaborators permission
   * @param queryString search able string
   */
  getCollaboratorPermission(queryString: string, fetchCount: number) {
    this.schemaDetailsService.getAllUserDetailsV2(queryString, fetchCount).subscribe(response => {
      this.permissionOn = response;
      this.collaborators = this.transformResponse(response);
    },error=>console.error(`Error: ${error}`));
  }

  /**
   * Help to tarnsfor response into groups
   * @param response from server for (all collaborators)
   */
  transformResponse(response: PermissionOn): PermissionGroup[] {
    const grps: PermissionGroup[] = [];
    // for user
    if(response && response.users) {
      const userGrp = new PermissionGroup();
      userGrp.childs = [];
      response.users.forEach(user=>{
        const permission = new  SchemaDashboardPermission();
        permission.userid = user.userName;
        permission.description = user.fullName ? user.fullName : user.email;
        permission.permissionType = PermissionType.USER;
        userGrp.childs.push(permission);
      });
      userGrp.groupId = 'user_group';
      userGrp.groupDesc = 'Users';
      grps.push(userGrp);
    }

    // for roles
    if(response && response.roles) {
      const userGrp = new PermissionGroup();
      userGrp.childs = [];
      response.roles.forEach(role=>{
        const permission = new  SchemaDashboardPermission();
        permission.roleId = role.roleId;
        permission.description = role.roleDesc;
        permission.permissionType = PermissionType.ROLE;
        userGrp.childs.push(permission);
      });
      userGrp.groupId = 'roles';
      userGrp.groupDesc = 'Roles';
      grps.push(userGrp);
    }

    // groups
    if(response && response.groups) {
      const userGrp = new PermissionGroup();
      userGrp.childs = [];
      response.groups.forEach(grp=>{
        const permission = new  SchemaDashboardPermission();
        permission.groupid = grp.groupIdAsStr;
        permission.description = grp.description;
        permission.permissionType = PermissionType.GROUP;
        userGrp.childs.push(permission);
      });
      userGrp.groupId = 'groups';
      userGrp.groupDesc = 'Groups';
      grps.push(userGrp);
    }
    return grps;
  }

  /**
   * Displaywith help to display selection with option description
   * @param name from mat-autocomplete
   */
  displaywith(option: SchemaDashboardPermission): string {
    return option ? option.description: null;
  }

  /**
   * Use for set selected item
   * @param event after selection change on collaborators list
   */
  onSelectCollaborator(event: MatAutocompleteSelectedEvent) {
    if(event && event.option) {
      const selVal: SchemaDashboardPermission = event.option.value;
      let isAlreadyExits = false;
      if(selVal.permissionType === PermissionType.USER) {
        const user = this.permissionOn.users.filter(fil => fil.userName === selVal.userid)[0];
        selVal.userMdoModel = user;
        isAlreadyExits = this.selectedCollaborators.filter(fil => fil.userid === selVal.userid).length ? true : false;
      } else if(selVal.permissionType === PermissionType.GROUP) {
        const grp  = this.permissionOn.groups.filter(fil => fil.groupIdAsStr === selVal.groupid)[0];
        selVal.groupHeaderModel = grp;
        isAlreadyExits = this.selectedCollaborators.filter(fil => fil.groupid === selVal.groupid).length ? true : false;
      } else if(selVal.permissionType === PermissionType.ROLE) {
        const role = this.permissionOn.roles.filter(fil => fil.roleId === selVal.roleId)[0];
        selVal.rolesModel = role;
        isAlreadyExits = this.selectedCollaborators.filter(fil => fil.roleId === selVal.roleId).length ? true : false;
      }

      if(selVal && !isAlreadyExits) {
        this.selectedCollaborators.push(selVal);
        if(this.currentPageIdx === 0 && this.possibleChips.length<2) {
          this.possibleChips.push(selVal);
          this.currentPageIdx = 0;
        }
      }
      this.addCollaboratorFrmGrp.controls.addCollaboratorCtrl.reset();
    }
  }

  /**
   * Get all exiting added collaborators
   */
  getExistingCollaboratorDetails() {
    this.schemaDetailsService.getCollaboratorDetails(this.schemaId).subscribe(response => {
      this.collaboratorList = response;
      this.collaboratorListOb = of(response);
    },error=>console.error(`Error : ${error}`));
  }

  /**
   * Should create possibleChips to view on mat-chip-list
   * @param where get the pagination call from prev | next
   */
  paginateChip(where?: string) {
    const reverseSelected = this.selectedCollaborators;
    if(where === 'prev' && this.currentPageIdx >0) {
      this.possibleChips = [];
      if(reverseSelected[(this.currentPageIdx *2) -2])
        this.possibleChips.push(reverseSelected[(this.currentPageIdx *2) -2]);
      if(reverseSelected[(this.currentPageIdx *2) -1])
        this.possibleChips.push(reverseSelected[(this.currentPageIdx *2) -1]);
      this.currentPageIdx --;
    }
    else if(where === 'next' && this.currentPageIdx < this.selectedCollaborators.length) {
      this.possibleChips = [];
      this.currentPageIdx ++;
      if(reverseSelected[this.currentPageIdx * 2])
        this.possibleChips.push(reverseSelected[this.currentPageIdx * 2]);
      if(reverseSelected[(this.currentPageIdx * 2)+1])
        this.possibleChips.push(reverseSelected[(this.currentPageIdx * 2)+1]);
    } else {
      this.possibleChips = [];
      if(reverseSelected[this.currentPageIdx * 2])
        this.possibleChips.push(reverseSelected[this.currentPageIdx * 2]);
      if(reverseSelected[(this.currentPageIdx * 2)+1])
        this.possibleChips.push(reverseSelected[(this.currentPageIdx * 2)+1]);
    }
  }


  /**
   * Should remove selected user / group / role from list
   * @param removeAble Remove able selected user / group / role
   */
  remove(removeAble: SchemaDashboardPermission) {
    let selecteItemIdx;
    let possibleChipsIdx;
    if(removeAble && removeAble.permissionType === PermissionType.USER) {
      const selData = this.selectedCollaborators.filter(fil=> fil.userid === removeAble.userid)[0];
      selecteItemIdx = this.selectedCollaborators.indexOf(selData);
      const possibleCh = this.possibleChips.filter(fil=> fil.userid === removeAble.userid)[0];
      possibleChipsIdx = this.possibleChips.indexOf(possibleCh);
    } else if(removeAble && removeAble.permissionType === PermissionType.GROUP) {
      const selData = this.selectedCollaborators.filter(fil=> fil.groupid === removeAble.groupid)[0];
      selecteItemIdx = this.selectedCollaborators.indexOf(selData);
      const possibleCh = this.possibleChips.filter(fil=> fil.groupid = removeAble.groupid)[0];
      possibleChipsIdx = this.possibleChips.indexOf(possibleCh);
    } else if(removeAble && removeAble.permissionType === PermissionType.ROLE) {
      const selData = this.selectedCollaborators.filter(fil=> fil.roleId === removeAble.roleId)[0];
      selecteItemIdx = this.selectedCollaborators.indexOf(selData);
      const possibleCh = this.possibleChips.filter(fil=> fil.roleId = removeAble.roleId)[0];
      possibleChipsIdx = this.possibleChips.indexOf(possibleCh);
    }

    if(selecteItemIdx !== undefined && possibleChipsIdx !== undefined) {
      this.selectedCollaborators.splice(selecteItemIdx,1);
      this.possibleChips.splice(possibleChipsIdx,1);
      this.paginateChip();
    }
}

  /**
   * To check / enable previuos button
   */
  get enablePreBtn() {
    return this.currentPageIdx <=0;
  }

  /**
   * To check / enable next button
   */
  get enableNextBtn() {
    return ((this.currentPageIdx*2 +2) < this.selectedCollaborators.length && this.selectedCollaborators.length >2);
  }

  /**
   * While click on close should be set sb outlet to null
   */
  close() {
    this.router.navigate([{ outlets: { sb: null }}]);
  }

  /**
   * Should http call for update selected permission
   * @param permission update able permission
   */
  updatePermission(permission: SchemaDashboardPermission) {
    permission.schemaId = (this.schemaId);
    this.schemaDetailsService.createUpdateUserDetails([permission]).subscribe(res=>{
      this.getExistingCollaboratorDetails();
    },error=> console.error(`Error : ${error}`));
  }

  /**
   * For delete assigned collaborator based on assigned permission
   * @param sno sno which we want to delete
   */
  deleteCollaborator(sno: string) {
    const sNoList = [];
    sNoList.push(sno);
    this.schemaDetailsService.deleteCollaborator(sNoList).subscribe(res=>{
      if(res) {
        this.snackBar.open(`Successfully deleted`, 'Close',{duration:4000});
        this.getExistingCollaboratorDetails();
      } else {
        this.snackBar.open(`Something went wrong`, 'Close',{duration:4000});
      }
    },error=>{
      this.snackBar.open(`Something went wrong`, 'Close',{duration:4000});
    });
  }

  /**
   * Save or update selected permission
   */
  saveCollaborators() {
    const value = this.addCollaboratorFrmGrp.value;
    this.selectedCollaborators.forEach(coll =>{
      coll.isAdmin = value.isAdmin ? value.isAdmin : false;
      coll.isViewer = value.isViewer ? value.isViewer : false;
      coll.isEditer = value.isEditer ? value.isEditer : false;
      coll.isReviewer = value.isReviewer ? value.isReviewer : false;
      coll.sno = Math.floor(Math.random() * 1000000000).toString();
      coll.schemaId = this.schemaId;
    });
    this.schemaDetailsService.createUpdateUserDetails(this.selectedCollaborators).subscribe(res =>{
      this.addCollaboratorFrmGrp.reset();
      this.selectedCollaborators = [];
      this.possibleChips = [];
      this.currentPageIdx = 0;
      this.getExistingCollaboratorDetails();
    },error=> console.error(`Error : ${error}`));
  }
}
