import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FilterCriteria } from '@models/list-page/listpage';
import { Dataset } from '@models/schema/schema';
import { TeamMember } from '@models/teams';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { CoreService } from '@services/core/core.service';
import { ListService } from '@services/list/list.service';
import { TeamService } from '@services/user/team.service';
import { TransientService } from 'mdo-ui-library';
import { Observable, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs/operators';

@Component({
  selector: 'pros-dataset-record-mapping',
  templateUrl: './dataset-record-mapping.component.html',
  styleUrls: ['./dataset-record-mapping.component.scss']
})
export class DatasetRecordMappingComponent implements OnInit {

  mappingForm: FormGroup;

  datasetList: Dataset[] = [];
  initialDatasetList: Dataset[] = [];
  datasetListObs: Observable<Dataset[]> = of([]);

  datasetSearchSub: Subject<string> = new Subject();
  recordSearchSub: Subject<string> = new Subject();

  recordsList: string[] = [];

  isInitializing = false;

  submitted = false;

  userInfo: TeamMember;

  constructor(private fb: FormBuilder,
    private coreService: CoreService,
    private listService: ListService,
    private transientService: TransientService,
    private sharedService: SharedServiceService,
    private router: Router,
    private teamService: TeamService,
    @Inject(LOCALE_ID) public locale: string) { }

  ngOnInit(): void {
    this.initForm();

    this.sharedService.getPartnerDetails().subscribe(userInfo => {
      this.userInfo = userInfo;
    })

    this.datasetSearchSub.pipe(
      startWith(''),
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(s => {
      this.getAllObjectType(s);
    });

    this.recordSearchSub.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(s => {
      this.getData(s);
    });
  }

  initForm(value?) {
    this.mappingForm = this.fb.group({
      dataset: [value ? value.dataset : null, Validators.required],
      recordId: [value ? value.recordId : null, Validators.required]
    });

    this.mappingForm.get('dataset').valueChanges.subscribe(v => {
      this.mappingForm.get('recordId').setValue(null);
      this.recordsList = [];
    });
  }

  save() {
    const assignUserPayload = {
      roleIds: this.userInfo?.roles?.map(role => role.roleId),
      userName: this.userInfo?.userName,
      isPartner: true,
      datasetId: this.mappingForm.value.dataset.datasetId,
      recordNumber: this.mappingForm.value.recordId
    }

    this.teamService.assignUserRoles(assignUserPayload).subscribe((response)=> {
      if(this.userInfo) {
        this.userInfo.datasetId = this.mappingForm.value.dataset.datasetId;
        this.userInfo.recordNumber = this.mappingForm.value.recordId;
      }
      this.close();
    }, err => {
      console.log(`Error:: ${err.message}`);
    })
  }


  getAllObjectType(searchTerm='') {
    this.coreService.getDataSets(searchTerm, 0, 20, this.locale)
      .subscribe(resp => {
        this.datasetList = resp;
        this.datasetListObs = of(this.datasetList);
      }, error => {
        console.error(`Error:: ${error.message}`);
    });
  }

  public getData(searchTerm) {
    const moduleId = this.mappingForm.value?.dataset?.datasetId;
    if(!moduleId) {
      return;
    }

    const filterCriteria = [];

    if(searchTerm && searchTerm.trim()) {
      const filterC = new FilterCriteria();
      filterC.fieldId = 'id';
      filterC.type = 'INLINE';
      filterC.values = [searchTerm];
      filterCriteria.push(filterC);
    }

    this.listService.getTableData(moduleId, '', 1, filterCriteria, '').pipe(
        map(resp => resp?.map(doc => doc.id))
    ).subscribe(res => {
        this.recordsList = res;
    }, error => {
        console.error(`Error : ${error.message}`);
    });
  }

  displayDatasetFn(dataset): string {
    if (dataset) {
      return dataset.datasetDesc ? dataset.datasetDesc : '';
    }
    return '';
  }

  close() {
    this.router.navigate([{ outlets: { outer: null } }], { preserveFragment: true, queryParamsHandling: 'preserve' });
  }

}
