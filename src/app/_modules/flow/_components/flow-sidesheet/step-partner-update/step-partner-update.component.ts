import { UserProfileService } from '@services/user/user-profile.service';
import { CoreService } from '@services/core/core.service';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { RoleRequestDto, UserListRequestDTO } from '@models/teams';
import { debounceTime, distinctUntilChanged, filter, map, take } from 'rxjs/operators';
import { TaskListService } from '@services/task-list.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TransientService } from 'mdo-ui-library';
import { Observable, of } from 'rxjs';
import { PicklistFieldsMetadata } from '@models/core/coreModel';
import { MetadataModeleResponse } from '@models/schema/schemadetailstable';

@Component({
  selector: 'pros-step-partner-update',
  templateUrl: './step-partner-update.component.html',
  styleUrls: ['./step-partner-update.component.scss']
})
export class StepPartnerUpdateComponent implements OnInit {

  formGroup: FormGroup;
  datasets;
  allTeamMembers;
  allRoles;
  allPartnerList;
  locale = "en";
  fetchSize = 1;
  rolePageIndex = 1;
  rolePageSize = 10;
  roleSearchString = '';
  flowId;
  stepId;
  outlet;

  datasetRefFieldsObs: Observable<any> = of([]);
  emailFieldsObs: Observable<any> = of([]);


  constructor(public coreService: CoreService,
    public profileService: UserProfileService,
    public taskListService: TaskListService,
    public activateRoute: ActivatedRoute,
    private transientService: TransientService,
    public router: Router) {}

  ngOnInit(): void {
    // this.datasetCtrl = new

    this.activateRoute.params.subscribe((params) => {
      console.log("params", params);
      this.stepId = params.stepId;
      this.flowId = params.id;
      this.outlet = params.outlet;
    });
    this.formGroup = new FormGroup({
      datasetCtrl: new FormControl(null, [Validators.required]),
      // partnerCtrl: new FormControl(null, [Validators.required]),
      rolesCtrl: new FormControl(null, [Validators.required]),
      emailFieldCtrl: new FormControl(null, [Validators.required, this.fieldCtrlValidator()]),
      datasetRefFieldCtrl: new FormControl(null, [Validators.required, this.fieldCtrlValidator()])
    });

    this.formGroup.controls.datasetRefFieldCtrl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      filter(value => (value !== null) && !value.fieldId)
    ).subscribe(searchString => {
        this.getFieldsByModuleId(this.formGroup.controls.datasetCtrl.value.moduleId, searchString, ['datasetRef']);
    });

    this.formGroup.controls.emailFieldCtrl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      filter(value => (value !== null) && !value.fieldId)
    ).subscribe(searchString => {
        this.getFieldsByModuleId(this.formGroup.controls.datasetCtrl.value.moduleId, searchString, ['email']);
    });

    this.formGroup.controls.datasetCtrl.valueChanges.subscribe(dataset => {
      this.formGroup.controls.datasetRefFieldCtrl.setValue(null);
      this.formGroup.controls.emailFieldCtrl.setValue(null);
      if(dataset?.moduleId) {
        this.getFieldsByModuleId(this.formGroup.controls.datasetCtrl.value.moduleId, '', ['email', 'datasetRef']);
      }
    });

    this.coreService.searchAllObjectType({
      lang: this.locale,
      fetchsize: 50,
      fetchcount: 0,
      description: ''
    }).subscribe((res) => {
      if (res) {
        this.datasets = res;
      }
    }, (error) => {})

    this.getAllTeamMembers();

    this.getRoles();

  }

  getRoles() {
    const requestDto: RoleRequestDto = {
      pageInfo: {
        pageNumer: this.rolePageIndex - 1,
        pageSize: this.rolePageSize,
      },
      searchString: this.roleSearchString,
    };
    this.profileService
      .getTeamRoles(requestDto)
      .pipe(take(1))
      .subscribe((resp) => {
        this.allRoles = resp;
      });
  }

  getAllTeamMembers(userListRequestDTO1 ? : UserListRequestDTO) {
    let userListRequestDTO: UserListRequestDTO = {
      pageInfo: {
        pageNumer: 0,
        pageSize: 50
      },
      roles: [],
      searchString: '',
      sortingInfo: [],
      status: [],
      isPartner: true
    }
    this.profileService.getTeamMembers(userListRequestDTO).subscribe((res) => {
      this.allTeamMembers = res;
      this.allPartnerList = res;
    })
  }

  onSave() {
    if (this.formGroup.status === 'VALID') {
      const payload = {
        flowId: this.flowId,
        stepId: this.stepId,
        dataSetId: String(this.formGroup.controls.datasetCtrl.value.moduleId),
        // partnerEcid: this.formGroup.controls.partnerCtrl.value.roles[0].roleId,
        roleId: this.formGroup.controls.rolesCtrl.value.roleId,
        emailField: this.formGroup.controls.emailFieldCtrl.value.fieldId,
        partnerEcid: this.formGroup.controls.datasetRefFieldCtrl.value.fieldId
      }
      this.taskListService.saveInviteUser(payload).subscribe((res) => {
        if (res)
          this.transientService.open('The invitation has been sent',null, { duration: 2000, verticalPosition: 'bottom' });
          this.close();
      }, (error) => {
        this.transientService.open('There was an error with and the invite was not sent', null, { duration: 2000, verticalPosition: 'bottom' });
        console.log("error " + error);
      })
    }
  }

  resetForm() {
    this.formGroup.reset();
    for (const key in this.formGroup.controls) {
      if(key) {
        this.formGroup.controls.key.clearValidators();
        this.formGroup.controls.key.updateValueAndValidity();
      }
    }
  }

  close() {
    this.router.navigate([{
      outlets: {
        [this.outlet]: null
      }
    }], {
      queryParamsHandling: 'preserve'
    });
  }


  datasetDisplayWith(dataset){
    return dataset?.moduleDesc;
  }

  partnerDisplayWith(partner){
    if(partner?.fname && partner?.lname)
      return partner?.fname + ' ' + partner?.lname;
    else if(partner?.fname)
      return partner?.fname;
    else if(partner?.lname)
      return partner?.lname;
    else
      return partner?.userName
  }

  roleDisplayWith(role){
    return role?.description;
  }

  getDatasetFields(moduleId, pickList, description=''): Observable<PicklistFieldsMetadata[]> {
    const payload = {
      description,
      pickList
    }
    return this.coreService.getFieldsListByPickList(payload, moduleId, this.locale)
      .pipe(map(resp => resp.pickListField || []));
  }

  fieldDisplayWith(field){
    return field?.fieldDescri;
  }

  getFieldsByModuleId(moduleId, searchString, dataFor: string[]) {
    if (!moduleId) { return };

    this.coreService.getMetadataFieldsByModuleId([moduleId], searchString).subscribe((metadataModeleResponse: MetadataModeleResponse) => {
      if(dataFor.includes('email') || dataFor.includes('init')) {
        this.emailFieldsObs = of(this.parseMetadataModelResponse(metadataModeleResponse, moduleId, '0', 'EMAIL'));
      }
      if(dataFor.includes('datasetRef') || dataFor.includes('init')) {
        this.datasetRefFieldsObs = of(this.parseMetadataModelResponse(metadataModeleResponse, moduleId, '30', 'CHAR'));
      }
    }, (err) => {
      console.error(`Error:: ${err.message}`);
    });
  }

  parseMetadataModelResponse(response: MetadataModeleResponse, moduleId, pickList, dataType) {
    const fldGroups = [];
    // for header
    const headerChilds = [];
    if(response.headers) {
      Object.keys(response.headers).forEach(header=>{
        const res = response.headers[header];
        if(res.pickList === pickList && res.dataType === dataType) {
          headerChilds.push({
            fieldId: res.fieldId,
            fieldDescri: res.fieldDescri,
            isGroup: false,
            childs: [],
            moduleId
          });
        }
      });
    }
    if(headerChilds.length) {
      fldGroups.push({
        fieldId: 'header_fields',
        fieldDescri: 'Header fields',
        isGroup: true,
        childs: headerChilds,
        moduleId
      });
    }

    // for grid response transformations
    if(response && response.grids) {
      Object.keys(response.grids).forEach(grid=>{
        const childs = [];
        if(response.gridFields && response.gridFields.hasOwnProperty(grid)) {
          Object.keys(response.gridFields[grid]).forEach(fld=>{
            const fldCtrl = response.gridFields[grid][fld];
            if(fldCtrl.pickList === pickList && fldCtrl.dataType === dataType) {
              childs.push({
                fieldId: fldCtrl.fieldId,
                fieldDescri: fldCtrl.fieldDescri,
                isGroup: false,
                childs:[],
                moduleId
              });
            }
          });
        }
        if(childs.length) {
          fldGroups.push({
            fieldId: grid,
            fieldDescri: response.grids[grid].fieldDescri,
            isGroup: true,
            childs,
            moduleId
          });
        }
      })
    }

    // for hierarchy response transformations
    if(response && response.hierarchyFields) {
      Object.keys(response.hierarchyFields).forEach(hkey => {
        const childs = [];
        Object.keys(response.hierarchyFields[hkey]).forEach(fld=>{
          const fldCtrl = response.hierarchyFields[hkey][fld];
          if(fldCtrl.pickList === pickList && fldCtrl.dataType === dataType) {
          childs.push({
            fieldId: fldCtrl.fieldId,
            fieldDescri: fldCtrl.fieldDescri,
            isGroup: false,
            childs:[],
            moduleId
          });
        }
        });
        if(childs.length) {
          fldGroups.push({
            fieldId: `Hierarchy_${hkey}`,
            fieldDescri: `Hierarchy ${hkey}`,
            isGroup: true,
            childs,
            moduleId
          });
        }
      });
    }
    return fldGroups;
  }

  fieldCtrlValidator = (): ValidatorFn => {
    return (control: AbstractControl): ValidationErrors | null => {
      if(control.value) {
        if(!(control.value?.fieldId)) {
          return {fieldCtrlError: true};
        } else {
          return null;
        }
      } else {
        return null;
      }
    };
  }

}
