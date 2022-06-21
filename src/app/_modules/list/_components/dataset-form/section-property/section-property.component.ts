import { takeUntil } from 'rxjs/operators';
import { combineLatest, Subject } from 'rxjs';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';

@Component({
  selector: 'pros-section-property',
  templateUrl: './section-property.component.html',
  styleUrls: ['./section-property.component.scss']
})
export class SectionPropertyComponent implements OnInit, OnChanges, OnDestroy {
  sectionformGroup;
  sectionStateList = ['Editable', 'Non-Editable'];
  formId = '';

  @Input() sectionProperty: any = {};
  @Input() tabIndex: number;
  @Input() moduleId: string;
  @Output() updateSectionProperty: EventEmitter<any> = new EventEmitter();
  @Output() closed: EventEmitter<boolean> = new EventEmitter();

  unsubscribeAll$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private fb: FormBuilder,
    public route: ActivatedRoute,
    private router: Router,
    private sharedService: SharedServiceService
  ) { }

  ngOnInit(): void {
    this.sharedService.afterDisplayCriteriaSave()
      .subscribe(udrId => {
        if(udrId) {
          this.sectionProperty.udrId = `${udrId}`;
        }
    });
    combineLatest([
      this.route.fragment.pipe(takeUntil(this.unsubscribeAll$)),
      this.route.queryParams.pipe(takeUntil(this.unsubscribeAll$)),
      this.route.params.pipe(takeUntil(this.unsubscribeAll$)),
    ])
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe(
        (resp) => {
          if(resp[2]?.formId && (resp[2].formId !== this.formId)) {
            this.formId = resp[2].formId;
          }
        },
        (err) => {
          console.log(err);
        }
      );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.sectionProperty?.currentValue !== changes.sectionProperty?.previousValue) {
      this.createSectionFormGroup(changes?.sectionProperty?.currentValue);
    }
  }

  createSectionFormGroup(sectionForm?: { tabText: string; isTabHidden: boolean; isTabReadOnly: boolean; }) {
    this.sectionformGroup = this.fb.group({
      tabText: [sectionForm?.tabText ? sectionForm?.tabText : 'New Section', [Validators.required, Validators.maxLength(50)]],
      sectionState: [sectionForm?.isTabHidden ? this.sectionStateList[2] : sectionForm?.isTabReadOnly ? this.sectionStateList[1]: this.sectionStateList[0]],
    });
  }

  onChangeNameValue(event) {
    this.sectionProperty.tabText = event;
    this.updateSectionProperty.emit({ sectionProperty: this.sectionProperty, index: this.tabIndex });
  }

  patchValue(sectionForm) {
    this.sectionformGroup.patchValue({
      tabText: sectionForm?.tabText ? sectionForm?.tabText : null,
      sectionState:  sectionForm?.isTabHidden ? this.sectionStateList[2] : sectionForm?.isTabReadOnly ? this.sectionStateList[1]: this.sectionStateList[0],
    })
  }

  onChangeSetionState(event) {
    switch (event.option?.value) {
      case 'Editable': {
        this.sectionProperty.isTabReadOnly = false;
        this.sectionProperty.isTabHidden = false;
        break;
      }
      case 'Non-Editable': {
        this.sectionProperty.isTabReadOnly = true;
        this.sectionProperty.isTabHidden = false;
        break;
      }
      case 'Hidden': {
        this.sectionProperty.isTabHidden = true;
        this.sectionProperty.isTabReadOnly = false;
        break;
      }
      default:
        break;
    }
    this.updateSectionProperty.emit({sectionProperty: this.sectionProperty, index: this.tabIndex});
  }
/**
 * open the side sheet for the display criteria
 */
  openDisplayCriteriaSheet() {
    const udrId = (this.sectionProperty?.udrId) ? this.sectionProperty.udrId : 'new';
    this.router.navigate([{
      outlets: {
        sb:`sb/list/dataset-settings/${this.moduleId}/forms/${this.moduleId}/${this.formId}`,
        outer: `outer/list/display-criteria/${this.moduleId}/${udrId}`
      }
    }], {
      queryParamsHandling: 'preserve',
      preserveFragment: true,
    });
    // this.router.navigate([{ outlets: { outer: `outer/list/display-criteria/${this.moduleId}/${udrId}` } }], {
    //   queryParamsHandling: 'preserve',
    //   preserveFragment: true,
    // });
  }

  close() {
    this.router.navigate(['./'], { relativeTo: this.route, fragment: null, queryParamsHandling: 'preserve' });
    this.closed.emit(true);
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next(true);
    this.unsubscribeAll$.unsubscribe();
  }
}
