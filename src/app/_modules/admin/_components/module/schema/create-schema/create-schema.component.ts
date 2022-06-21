import { Component, OnInit } from '@angular/core';
import { Breadcrumb } from 'src/app/_models/breadcrumb'; import { CdkDragDrop, moveItemInArray, transferArrayItem, copyArrayItem } from '@angular/cdk/drag-drop';
import { SchemaService } from 'src/app/_services/home/schema.service';
import { FormControl, FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { CreateUpdateSchema, CoreSchemaBrInfo, Category } from '../../business-rules/business-rules.modal';
import { ActivatedRoute, Router } from '@angular/router';
import { SchemalistService } from 'src/app/_services/home/schema/schemalist.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ObjectTypeResponse } from '@models/schema/schema';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { DiwCreateBusinessruleComponent } from '../diw-create-businessrule/diw-create-businessrule.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'pros-create-schema',
  templateUrl: './create-schema.component.html',
  styleUrls: ['./create-schema.component.scss']
})
export class CreateSchemaComponent implements OnInit {

  schemaName: string;
  businessRuleNames: any;
  filterList: any;
  categoriesNames: any;
  categoriesNamesList: any = [];
  searchCategories: any = [];
  enableCreateCategoryBtn = false;
  showBusinessPage = false;
  businessrulelength: any;

  myControl = new FormControl();
  filteredOptions: Observable<string[]>;
  schemaDetails: any;

  schemaId: string;
  moduleId: string;
  fragment: string;
  brList: CoreSchemaBrInfo[] = [];
  brListOb: Observable<CoreSchemaBrInfo[]> = of([]);

  categoryList: Category[] = [];

  moduleList: ObjectTypeResponse[] = [];
  filteredModules: Observable<ObjectTypeResponse[]> = of([]);
  moduleInpCtrl: FormControl = new FormControl('');

  schemaThresholdCtrl: FormControl = new FormControl('');
  /**
   * Use for store br mapped on particular category
   * As key value pair | kay is the index of form array and value is CoreSchemaBrInfo[]
   */
  categoryBrMap: any = {} as any;

  dynCategoryFrmGrp: FormGroup;

  breadcrumb: Breadcrumb = {
    heading: 'Create Schema',
    links: [
      {
        link: '/home/schema/',
        text: 'Schema List'
      }
    ]
  };

  constructor(
    private service: SchemaService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private schemaListService: SchemalistService,
    private formBuilder: FormBuilder,
    private matSnackBar: MatSnackBar,
    private matDialog: MatDialog
  ) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.moduleId = params.moduleId ? (params.moduleId.toLowerCase() === 'new' ? '' : params.moduleId) : '';
      this.schemaId = params.schemaId ? (params.schemaId.toLowerCase() === 'new' ? '' : params.schemaId) : '';
    });

    this.dynCategoryFrmGrp = this.formBuilder.group({
      categories: this.formBuilder.array([])
    });


    this.activatedRoute.fragment.subscribe(frag => {
      this.fragment = frag;
    });
    this.getCategoriesData();

    this.service.getAllObjectType().subscribe(data => {
      this.moduleList = data;
      this.filteredModules = of(data);
      if (this.moduleId) {
        const moduleDesc = this.moduleList.filter(fill => fill.objectid === this.moduleId)[0];
        if (moduleDesc) {
          this.moduleInpCtrl.setValue(moduleDesc);
        }
      }
    }, error => {

    });

    if (this.schemaId) {
      this.getSchemaData();
    }

    this.moduleInpCtrl.valueChanges.subscribe(value => {
      if (value instanceof ObjectTypeResponse) { } else if (value && value !== '') {
        const filteredObjectTypes = this.moduleList.filter(module => (module.objectdesc.toLowerCase().indexOf(value.toLowerCase())) === 0);
        this.filteredModules = of(filteredObjectTypes);
      } else {
        this.filteredModules = of(this.moduleList);
      }
    });

  }

  getSchemaData() {
    this.schemaListService.getSchemaDetailsBySchemaId(this.schemaId).subscribe(res => {
      this.schemaDetails = res;
      if (this.schemaDetails) {
        this.getBusinessRulesData();
        this.schemaName = this.schemaDetails.schemaDescription;
        this.schemaThresholdCtrl.setValue(this.schemaDetails.schemaThreshold)
        const moduleDesc = this.moduleList.filter(fill => fill.objectid === this.schemaDetails.moduleId)[0];
        if (moduleDesc) {
          this.moduleInpCtrl.setValue(moduleDesc);
          this.moduleInpCtrl.disable({ onlySelf: true });
        }
      }
    })
  }

  search(value: string) {
    const filter = value.toLowerCase();
    this.businessRuleNames = this.filterList.filter(list => list.brInfo.toLowerCase().indexOf(filter) >= 0);
  }

  navigateToListPage() {
    this.router.navigate(['/home/schema']);
  }

  /**
   * Open Business Rule Componenet using fragment
   * For fragment see router.navigate method imp..
   */
  showAddBusinessRulePage() {
    if (this.moduleId && this.moduleId !== 'new') {
      this.router.navigate(['/home/schema/create-schema', this.moduleId, this.schemaId], { fragment: 'missing' });
    } else {
      this.matSnackBar.open(`Please select module`, 'Close', { duration: 5000 });
    }
  }

  getCategoriesData() {
    this.service.getAllCategoriesList().subscribe(res => {
      this.categoryList = res;
      this.categoriesNames = res;
      this.searchCategories = res;
    })
  }

  /**
   * Should return all business rules that assigned to schema
   */
  getBusinessRulesData() {
    this.service.getBusinessRulesBySchemaId(this.schemaId).subscribe(res => {
      if (res) {
        // update brids
        res.forEach(r => {
          r.brId = r.brIdStr;
        });
        // set to assigned brlist
        this.brList = res;
        this.brListOb = of(res);

        // map to assigned categories
        const assignedCat = res.map(map => map.categoryId);
        const distinctAssignedcat = new Set(assignedCat);
        const assinedcatObj: Category[] = [];
        distinctAssignedcat.forEach(each => {
          const cat = this.categoryList.filter(fil => fil.categoryId === String(each))[0];
          if (cat) {
            assinedcatObj.push(cat);
          }
        });

        // add to form array
        const categories = this.dynCategoryFrmGrp.controls.categories as FormArray;
        assinedcatObj.forEach((each, index) => {
          categories.push(this.formBuilder.group({
            category: [each]
          }));
          const assignedBrs = res.filter(fil => String(fil.categoryId) === each.categoryId);
          this.categoryBrMap[categories.length - 1] = assignedBrs;
        });
      }
    })
  }

  /**
   * While click edit then should call this
   * @param brId Selected br id
   * @param brType type for edit based on type
   */
  editBusinessRuls(brId: string, brType: string) {
    // let fragmentTo = '';
    // if(brType === BusinessRuleType.BR_MANDATORY_FIELDS) {
    //   fragmentTo = 'missing';
    // } else if(brType === BusinessRuleType.BR_METADATA_RULE) {
    //   fragmentTo = 'metadata';
    // } else if(brType === BusinessRuleType.BR_CUSTOM_SCRIPT) {
    //   fragmentTo = 'userdefined';
    // } else if(brType === BusinessRuleType.BR_REGEX_RULE) {
    //   fragmentTo = 'regex';
    // }
    // this.router.navigate(['/home/schema/create-schema', this.moduleId , this.schemaId], {queryParams:{brId}, fragment:fragmentTo});
    this.createbusinessrule(brId, brType);
  }

  /**
   * When try to drop any dropable container , then this method should called
   * @param event current event use for dropable container
   * @param index index of item
   * @param dropOutsideBr check its from outside dropable container
   */
  drop(event: CdkDragDrop<any>, index, dropOutsideBr?: boolean) {
    if (event.previousContainer === event.container) {
      const inBrList = (event.container.element.nativeElement.classList).contains('inBrList');
      if (inBrList) {
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        // update br execution order
        this.brList.forEach((br, idx) => {
          br.order = idx + 1;
        });
      } else {
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      }
    }
    else {
      const dropAbleBr = event.previousContainer.data[event.previousIndex] as CoreSchemaBrInfo;
      const iscategoryAssign = (event.previousContainer.element.nativeElement.classList).contains('inCategory');
      if (!iscategoryAssign) {
        if (event.container.data.indexOf(dropAbleBr) === -1) {
          // check already exits on any category assigned
          let isExits = false;
          Object.keys(this.categoryBrMap).forEach(cat => {
            const afterFill = this.categoryBrMap[cat] ? this.categoryBrMap[cat].filter(fill => fill.brIdStr === dropAbleBr.brIdStr) : [];
            if (afterFill.length) {
              isExits = true;
              return;
            }
          });
          if (!isExits) {
            copyArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
          }
        }
      } else {
        if ((event.container.element.nativeElement.classList).contains('inCategory')) {
          if (event.container.data.indexOf(dropAbleBr) === -1) {
            transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
          }
        } else {
          event.previousContainer.data.splice(event.previousIndex, 1);
        }

      }

    }
  }

  removeBrFromCategory(index1, index2) {
    this.categoriesNamesList[index1].businessRules.splice(index2, 1);
  }

  /**
   * Use for add new category
   */
  addCategory() {
    const categories = this.dynCategoryFrmGrp.controls.categories as FormArray;
    categories.push(this.formBuilder.group({
      category: ['']
    }));
    this.categoryBrMap[categories.length - 1] = [];
  }

  /**
   * Use for remove category
   * @param index of removeable category
   */
  removeCategory(index: number) {
    const categories = this.dynCategoryFrmGrp.controls.categories as FormArray;
    categories.removeAt(index);

    // remove mapping br also
    delete this.categoryBrMap[index];
  }

  /**
   * After add new or modified exiting br then should reflect on ui
   * @param brInfo is the CoreSchemaBrInfo which is new or may be updated by add-business-rule componenet
   */
  afterSavedBrinfo(brInfo: CoreSchemaBrInfo) {
    if (brInfo) {
      const isAvailBr = this.brList.filter(fil => fil.brIdStr === brInfo.brIdStr);
      if (isAvailBr.length) {
        this.brList.splice(this.brList.indexOf(isAvailBr[0]), 1, brInfo);
      } else {
        this.brList.push(brInfo);
      }
      // update br execution order
      this.brList.forEach((br, index) => {
        br.order = index + 1;
      });
      this.brListOb = of(this.brList);
    }
  }

  /**
   *
   * @param cat is the selected drop val from autocomplete
   */
  categoryDisplayWith(cat: Category): string {
    return cat ? cat.categoryDesc : null;
  }

  /**
   * Use for check has any categories with empty values
   */
  checkIsEmptyCategory(): boolean {
    const categories = this.dynCategoryFrmGrp.controls.categories as FormArray;
    for (let i = 0; i < categories.length; i++) {
      if (categories.at(0).value.category === undefined || categories.at(i).value.category === '' || (typeof categories.at(i).value.category === 'string' && categories.at(i).value.category.trim() === '')) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if category doesn't have assigned rules then return true | false
   * And also update category id
   */
  checkIsEmptycategoryAssigned(): boolean {
    let status = false;
    if (this.categoryBrMap) {
      const categories = this.dynCategoryFrmGrp.controls.categories as FormArray;
      Object.keys(this.categoryBrMap).forEach((each, index) => {
        if (this.categoryBrMap[each] === undefined || this.categoryBrMap[each].length === 0) {
          status = true;
        } else {
          const catId = categories.at(index).value ? categories.at(index).value.category.categoryId : '';
          this.categoryBrMap[each].forEach(br => {
            this.updateCategoryId(catId, br.brIdStr);
          });
        }
      })
    }
    return status;
  }

  /**
   * Use for update categoryid and brIds
   * @param catId updated category id
   * @param brIdStr business rule id
   */
  updateCategoryId(catId: string, brIdStr: string) {
    this.brList.filter(fil => {
      if (fil.brIdStr === brIdStr) {
        fil.brId = brIdStr;
        fil.categoryId = catId;
      }
    });

  }

  /**
   * Delete business rule
   * Should call deleteBr service
   * @param brId business rule id
   */
  deleteBr(brId: string) {
    this.service.deleteBr(brId).subscribe(res => {
      if (res) {
        this.matSnackBar.open(`Successfully deleted`, 'Close', { duration: 5000 });
        const br = this.brList.filter(fil => fil.brIdStr === brId)[0];
        if (br) {
          this.brList.splice(this.brList.indexOf(br), 1);
          // reorder
          this.brList.forEach((br01, index) => {
            br01.order = index++;
          });
          this.brListOb = of(this.brList);

          // remove from br mapped , category
          Object.keys(this.categoryBrMap).forEach((cat, index) => {
            const data = this.categoryBrMap[cat];
            const br01 = data.filter(fil => fil.brIdStr === brId)[0];
            if (br01) {
              data.splice(data.indexOf(br01), 1);
              this.categoryBrMap[index] = data;
              return false;
            }
          });
        }
      }
    }, error => {
      this.matSnackBar.open(`Something went wrong`, 'Close', { duration: 5000 });
    });
  }

  /**
   *
   * @param brId removeable brid
   * @param index Index of category
   */
  removeMappedBr(br: CoreSchemaBrInfo, index: number) {
    if (br && index !== undefined) {
      const brMap = this.categoryBrMap[index];
      if (brMap) {
        brMap.splice(brMap.indexOf(br), 1);
        this.categoryBrMap[index] = brMap;
      }
    }
  }

  /**
   * Will help us for display the object description from objectType object
   *  objectType
   */
  displayFn(objectType: ObjectTypeResponse): string | undefined {
    return objectType ? objectType.objectdesc : '';
  }

  /**
   * While selection object from object type this method will help us to get assigned schema(s)
   *  event
   */
  selectModule(event: MatAutocompleteSelectedEvent): void {
    const selData = event.option ? event.option.value : '';
    if (selData) {
      this.moduleId = selData.objectid;
    }
  }

  /**
   *
   * @param br current br info
   * @param weightage number range 0-100 in percentage
   */
  brWightageChange(br: CoreSchemaBrInfo, weightage: string) {
    if (br) {
      const brInfo = this.brList.filter(brLst => brLst.brIdStr === br.brIdStr)[0];
      if (brInfo) {
        const indx = this.brList.indexOf(brInfo);
        brInfo.brWeightage = weightage;
        this.brList.splice(indx, 1, brInfo);
      }
    }
  }

  /**
   * Open create business rule dialog
   */
  createbusinessrule(brId?: string, brType?: string) {
    if (this.moduleId) {
      const dialogRef = this.matDialog.open(DiwCreateBusinessruleComponent, {
        height: '706px',
        width: '1100px',
        disableClose: true,
        autoFocus: false,
        data: {
          moduleId: this.moduleId,
          schemaId: this.schemaId,
          brId,
          brType
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.afterSavedBrinfo(result);
        }
      });
    } else {
      this.matSnackBar.open(`Please select module`, 'Close', { duration: 5000 });
    }
  }


  /**
   * Call http for save update schema and br mapping
   * along with goup
   */
  createUpdateSchema() {
    if (this.checkIsEmptyCategory()) {
      this.matSnackBar.open(`Category name can't blank`, 'Close', { duration: 5000 });
      return false;
    }
    const res = this.checkIsEmptycategoryAssigned();
    if (res) {
      this.matSnackBar.open(`Please assign rule(s) in category`, 'Close', { duration: 5000 });
      return false;
    }


    const request: CreateUpdateSchema = new CreateUpdateSchema();
    request.moduleId = this.moduleId;
    request.discription = this.schemaName;
    request.schemaId = this.schemaId;
    request.brs = this.brList;
    if (this.schemaThresholdCtrl.value < 0 || this.schemaThresholdCtrl.value > 100) {
      this.matSnackBar.open(`Schema threshold in 0-100`, 'Close', { duration: 5000 });
      return false;
    }
    request.schemaThreshold = this.schemaThresholdCtrl.value;

    let totalWigtage = 0;
    this.brList.forEach(map => {
      if (map.brWeightage) {
        totalWigtage += Number(map.brWeightage);
      }
    });

    if (totalWigtage > 100) {
      this.matSnackBar.open(`Total Business rule weightage can't more than 100`, 'Close', { duration: 5000 });
      return false;
    }

    if (totalWigtage < 100) {
      this.matSnackBar.open(`Total Business rule weightage can't less than 100`, 'Close', { duration: 5000 });
      return false;
    }

    this.service.createUpdateSchema(request).subscribe(response => {
      if (response) {
        this.schemaId = response;
        this.router.navigate(['/home/schema']);
        this.matSnackBar.open(`Successfully saved`, 'Close', { duration: 5000 });
      }
    }, error => {
      this.matSnackBar.open(`Something went wrong`, 'Close', { duration: 5000 });
    })
  }


}
