import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, UrlSegment, UrlSegmentGroup, UrlTree } from '@angular/router';
import { DatasetForm } from '@models/list-page/listpage';
import { CoreService } from '@services/core/core.service';
import { UserProfileService } from '@services/user/user-profile.service';
import { TransientService } from 'mdo-ui-library';
import { combineLatest, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, startWith, take, takeUntil } from 'rxjs/operators';
import { Tag, TagActionResponse, TagsResponse } from './../../../../../_models/userdetails';

@Component({
  selector: 'pros-dataset-form-properties',
  templateUrl: './dataset-form-properties.component.html',
  styleUrls: ['./dataset-form-properties.component.scss'],
})
export class DatasetFormPropertiesComponent implements OnInit, OnDestroy {
  datasetformGroup: FormGroup;
  unsubscribeAll$: Subject<boolean> = new Subject<boolean>();
  openPropertyPanel = false;
  /**
   * moduleId from param
   */
  moduleId = '';
  /**
   * formId from param
   */
  formId = '';
  /**
   * possible 3 form types. 2,3,4
   */
  formTypeId = 0;
  showFormProperties = false;
  showTabProperties = false;

  /**
   * label chip limit to view
   */
  limit = 3;
  selectedLabels: string[] = [];
  optionCtrl = new FormControl();

  /**
   * default datatable page size
   */
  recordsPageSize = 15;

  /**
   * Hold total records count
   */
  totalCount = 0;

  /**
   * for table records paging
   */
  recordsPageIndex = 0;

  /**
   * will get tags by API call
   */
  tags: Tag[] = [];

  /**
   * search text
   */
  fieldsSearchString = '';
  @ViewChild('optionInput') optionInput: ElementRef<HTMLInputElement>;

  constructor(
    private fb: FormBuilder,
    public route: ActivatedRoute,
    private router: Router,
    private coreService: CoreService,
    private userProfileService: UserProfileService,
    private toasterService: TransientService
  ) {}

  ngOnInit(): void {
    this.getTags();
    this.optionCtrl.valueChanges
      .pipe(debounceTime(1000), distinctUntilChanged(), takeUntil(this.unsubscribeAll$), startWith(''))
      .subscribe((searchString) => {
        this.fieldsSearchString = searchString || '';
        this.recordsPageIndex = 0;
        this.tags = [];
        this.getTags();
      });

    combineLatest([
      this.route.fragment.pipe(takeUntil(this.unsubscribeAll$)),
      this.route.queryParams.pipe(takeUntil(this.unsubscribeAll$)),
      this.route.params.pipe(takeUntil(this.unsubscribeAll$)),
    ])
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe(
        (resp) => {
          this.formTypeId = +resp[1].t;
          if (resp[0] === 'property-panel') {
            this.showFormProperties = true;
          } else if (resp[0] !== null) {
            this.showTabProperties = true;
          }
          let changed = false;
          if (resp[2]?.moduleId && resp[2].moduleId !== this.moduleId) {
            this.moduleId = resp[2].moduleId;
            changed = true;
          }
          if (resp[2]?.formId && resp[2].formId !== this.formId) {
            this.formId = resp[2].formId;
            changed = true;
          }
          if (changed) {
            this.formId === 'new' ? this.createDatasetFormGroup(null) : this.getFormDetails(this.formId);
          }
        },
        (err) => {
          console.log(err);
        }
      );
  }

  /**
   * Open dependency panel without rewriting the
   * entire url to make sure the navigation is smooth
   */
  OpenDependencyRules() {
    const urlTree: UrlTree = this.router.parseUrl(this.router.url);
    // In order to preserve the old URL appending new url segments this way
    urlTree.root.children = {
      ...urlTree.root.children,
      sb3: new UrlSegmentGroup([
        new UrlSegment(`sb3`, {}),
        new UrlSegment(`dependency-rule`, {}),
        new UrlSegment(`${this.moduleId}`, {}),
      ], {}),
    }

    this.router.navigateByUrl(urlTree);
  }

  /**
   * Call the 2 API, one with searchString and another without search string. gets the tags, if tags returned empty array flat the hasMoreData to false so that no more api call hits
   */
  getTags() {
    let subscription: Observable<TagsResponse>;
    if (this.fieldsSearchString) {
      subscription = this.userProfileService.searchTags(this.recordsPageIndex, this.recordsPageSize, this.fieldsSearchString).pipe(take(1));
    } else {
      subscription = this.userProfileService.getAllTags(this.recordsPageIndex, this.recordsPageSize).pipe(take(1));
    }
    subscription.subscribe((resp: TagsResponse) => {
      this.tags = resp.tags;
    });
  }
  getFormDetails(formId: string) {
    this.coreService
      .getDatasetFormDetail(this.moduleId, this.formId)
      .pipe(take(1))
      .subscribe((resp) => {
        this.createDatasetFormGroup(resp);
          if(resp.labels.trim().length>0){
          this.selectedLabels = resp.labels.split(',');
        }
      });
  }
  createDatasetFormGroup(datasetForm?: DatasetForm) {
    this.datasetformGroup = this.fb.group({
      description: [
        datasetForm && datasetForm.description ? datasetForm.description : '',
        [Validators.required, Validators.maxLength(50), this.noWhitespaceValidator],
      ],
      usage: [datasetForm && datasetForm.usage ? datasetForm.usage : '', []],
      type: [datasetForm && datasetForm.type ? +datasetForm.type : +this.formTypeId, []],
      labels: [datasetForm && datasetForm.labels ? datasetForm.labels : '', []],
      helpText: [datasetForm && datasetForm.helpText ? datasetForm.helpText : '', []],
      descriptionGenerator: [datasetForm && datasetForm.descriptionGenerator ? datasetForm.descriptionGenerator : false, []],
      isForFlow: [datasetForm && datasetForm.isForFlow ? datasetForm.isForFlow : false, []]
    });
    this.fireDatasetFormValue();
  }

  /**
   * to check if limit is extended
   */
  hasLimit(isParentDataset): boolean {
    return this.selectedLabels.length > this.limit;
  }

  selected(event) {
    const tagIndex = this.tags.findIndex((d) => d.description === event.option.value);
    if (tagIndex < 0) {
      this.createTag(event.option.value);
    }

    const index = this.selectedLabels.findIndex((d) => d === event.option.value);
    if (index < 0) {
      this.selectedLabels.push(event.option.value);
    }
    // this.optionInput.nativeElement.value = '';
    this.optionCtrl.setValue(null);

    this.datasetformGroup.patchValue({
      labels: this.selectedLabels.join(','),
    });

    this.fireDatasetFormValue();
  }

  remove(opt: string) {
    const index = this.selectedLabels.findIndex((d) => d === opt);
    if (index >= 0) {
      this.selectedLabels.splice(index, 1);
    }

    this.datasetformGroup.patchValue({
      labels: this.selectedLabels.join(','),
    });

    this.fireDatasetFormValue();
  }

  createTag(newTag: string) {
    const obj: Tag = {
      id: '',
      description: newTag,
    };
    this.userProfileService
      .saveUpdateTag(obj)
      .pipe(take(1))
      .subscribe((resp: TagActionResponse) => {
        if (resp.acknowledge) {
          this.tags.push({ id: resp.tagId, description: newTag });
        } else {
          this.toasterService.open('Tag update/add Failed.', 'ok', {
            duration: 2000,
          });
        }
      });
  }

  public noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { whitespace: true };
  }

  setToggleValue(event: EventEmitter<boolean>) {
    this.datasetformGroup.patchValue({ descriptionGenerator: event });
    this.fireDatasetFormValue();
  }

  setIsForFlowToggleValue(event: EventEmitter<boolean>) {
    this.datasetformGroup.patchValue({isForFlow: event});
    this.fireDatasetFormValue();
  }

  fireDatasetFormValue(event?: any) {
    this.coreService.nextUpdateDatasetFormSubject({
      formId: this.formId,
      form: this.datasetformGroup.value,
      isValid: this.datasetformGroup.valid,
    });
  }

  close() {
    this.router.navigate(['.'], { relativeTo: this.route, fragment: null, queryParamsHandling: 'preserve' });
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next(true);
    this.unsubscribeAll$.unsubscribe();
  }
}
