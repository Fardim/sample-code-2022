import { Fieldlist, FieldlistContainer } from '@models/list-page/listpage';
import { CoreService } from '@services/core/core.service';
import { ListService } from '@services/list/list.service';
import { takeUntil, filter } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, combineLatest } from 'rxjs';
import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, OnChanges, SimpleChanges, Inject, LOCALE_ID } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'pros-form-property',
  template: '',
})
export abstract class FormPropertyComponent implements OnInit, OnDestroy, OnChanges {
  formGroup: FormGroup = null;
  @Input() fieldId = '';
  @Input() moduleId = '';
  @Input() structId = '';
  unsubscribeAll$: Subject<boolean> = new Subject<boolean>();
  @Output() attributeValues = new EventEmitter<any>();
  type = ''; // no need of this field when live api is there, it will be decided based on fieldId and moduleId

  @Input()
  isReadOnlyMode = false;

  constructor(
    public fb: FormBuilder,
    public readonly route: ActivatedRoute,
    public router: Router,
    public listService: ListService,
    public coreService: CoreService,
    @Inject(LOCALE_ID) public locale: string
  ) {
    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
    this.formGroup = this.fb.group({
      fieldId: ['', [Validators.required]],
      maxChar: [100, [Validators.required, Validators.min(1)]],
      longtexts: this.helpTextFormGroup(),
      shortText: this.shortTextFormGroup(),
      lookupRuleId: [''],
    });

    // setTimeout(() => {
    //   document.getElementById('field_property_first_field').focus();
    // }, 100);
  }
  ngOnChanges(changes: SimpleChanges): void {
    // if (
    //   (changes.fieldId && changes.fieldId.currentValue !== changes.fieldId.previousValue) ||
    //   (changes.moduleId && changes.moduleId.currentValue !== changes.moduleId.previousValue)
    // ) {
    //   this.getFieldProperties();
    // }
  }

  ngOnInit(): void {
    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
    combineLatest([this.route.queryParams.pipe(takeUntil(this.unsubscribeAll$)), this.route.params.pipe(takeUntil(this.unsubscribeAll$))])
      .pipe(
        filter((resp) => {
          return resp[0].f && resp[1].moduleId ? true : false;
        }),
        takeUntil(this.unsubscribeAll$)
      )
      .subscribe((resp) => {
        this.fieldId = resp[0].subChildField ? resp[0].subChildField : resp[0].childField ? resp[0].childField : resp[0].f ? resp[0].f : resp[1].fieldId;
        this.moduleId = resp[1].moduleId;

        this.isReadOnlyMode = (resp[1]?.type && resp[1].type === 'read-only') ? true : false;
        this.structId = resp[0].s;
      });
  }

  // getFieldProperties() {
  //   this.coreService
  //     .getFieldDetails(this.moduleId, this.fieldId)
  //     .pipe(take(1))
  //     .subscribe(
  //       (resp) => {
  //         this.attributeValues.emit(resp);
  //       },
  //       (err) => {
  //         this.attributeValues.emit(null);
  //       }
  //     );
  // }

  patchCommonFields(data: Fieldlist) {
    this.formGroup.patchValue({
      fieldId: data && data.fieldId ? data.fieldId : '',
      maxChar: data && data.maxChar ? data.maxChar : 0,
      longtexts: {
        en: data && data.longtexts && data.longtexts.en ? data.longtexts.en : '',
        fr: data && data.longtexts && data.longtexts.fr ? data.longtexts.fr : ''
      },
      shortText: {
        en: {
          description: data && data.shortText && data.shortText.en && data.shortText.en.description ? data.shortText.en.description : '',
          information: data && data.shortText && data.shortText.en && data.shortText.en.information ? data.shortText.en.information : ''
        },
        fr: {
          description: data && data.shortText && data.shortText.fr && data.shortText.fr.description ? data.shortText.fr.description : '',
          information: data && data.shortText && data.shortText.fr && data.shortText.fr.information ? data.shortText.fr.information : ''
        }
      },
      lookupRuleId: data && data.lookupRuleId
    });
  }

  helpTextFormGroup(data?: Fieldlist) {
    return this.fb.group({
      en: [data && data.longtexts && data.longtexts.en ? data.longtexts.en : '', []],
      fr: [data && data.longtexts && data.longtexts.fr ? data.longtexts.fr : '', []],
    });
  }

  shortTextFormGroup(data?: Fieldlist) {
    return this.fb.group({
      en: this.fb.group({
        description: [data && data.shortText && data.shortText.en && data.shortText.en.description ? data.shortText.en.description : '', this.locale === 'en' ? [Validators.required, this.noWhitespaceValidator] : []],
        information: [data && data.shortText && data.shortText.en && data.shortText.en.information ? data.shortText.en.information : '', this.locale === 'en' ? [] : []],
      }),
      fr: this.fb.group({
        description: [data && data.shortText && data.shortText.fr && data.shortText.fr.description ? data.shortText.fr.description : '', this.locale === 'fr' ? [Validators.required, this.noWhitespaceValidator] : [] ],
        information: [data && data.shortText && data.shortText.fr && data.shortText.fr.information ? data.shortText.fr.information : '', this.locale === 'fr' ? [] : []],
      }),
    })
  }

  fireValidationStatus(fieldlistContainer: FieldlistContainer) {
    this.coreService.nextUpdateFieldFormValidationStatusSubject({
      fieldId: fieldlistContainer.fieldId,
      isValid: this.formGroup.valid,
    });
    this.coreService.nextUpdateChildFieldFormValidationStatusSubject({
      fieldId: fieldlistContainer.childrenId ? fieldlistContainer.childrenId: fieldlistContainer.parentSubGridId ? fieldlistContainer.parentSubGridId: fieldlistContainer.fieldId,
      isValid: this.formGroup.valid,
    });
    setTimeout(() => {
      this.coreService.nextUpdateFieldPropertySubject({
        fieldId: fieldlistContainer.fieldId,
        childrenId: fieldlistContainer.childrenId ? fieldlistContainer.childrenId : null,
        parentSubGridId: fieldlistContainer.parentSubGridId ? fieldlistContainer.parentSubGridId : null,
        isNew: fieldlistContainer.isNew,
        fieldlist: this.formGroup.value,
      });
    }, 10);
  }

  public noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { whitespace: true };
  }

  closePropertyPanel() {
    this.navigateToRoute({}, '');
  }

  navigateToRoute(queryParams: any, fragment: string, preserveFragment: boolean = false) {
    this.router.navigate(
      ['./'],
      {
        relativeTo: this.route,
        queryParams: { update: true, s: this.structId, ...queryParams },
        fragment,
        preserveFragment
      });
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next(true);
    this.unsubscribeAll$.unsubscribe();
  }
}
