import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { OrganizationDetailsDTO } from '@models/organization-details.model';
import { DmsService } from '@services/dms/dms.service';
import { OrganizationManagementService } from '@services/organization-management.service';
import { TransientService } from 'mdo-ui-library';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, skip, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'pros-company-details',
  templateUrl: './company-details.component.html',
  styleUrls: ['./company-details.component.scss'],
})
export class CompanyDetailsComponent implements OnInit, OnDestroy {
  /**********************************************************************************
   * VARIABLES, STORES AND OBSERVABLES
   *********************************************************************************/
  // Subscription management subject
  private unsubscribeAll$: Subject<void> = new Subject();
  // Local/Outgoing org details store
  private newOrgDetails$: BehaviorSubject<OrganizationDetailsDTO> = new BehaviorSubject(new OrganizationDetailsDTO());
  // Details Update subject
  private updateDetails$: Subject<OrganizationDetailsDTO> = new Subject();
  // update debounce time
  private UPDATE_DEBOUNCE_TIME = 2000;
  // total user count observable variable from org management service
  totalUserCount$: Observable<number | string>;
  // logo
  logo: string;
  // show Skeleton
  showSkeleton = true;
  // Initialize form for validation checks
  organizationDetailsFormGroup: FormGroup = new FormGroup({
    id: new FormControl(''),
    userAuth: new FormControl(''),
    mappedRegionId: new FormControl(''),
    link: new FormControl(''),
    billingEmail: new FormControl('', [Validators.required, Validators.email]),
    companyName: new FormControl('', Validators.required),
    contactNumber: new FormControl(''),
    industry: new FormControl('', Validators.required),
    website: new FormControl(''),
    address: new FormGroup({
      country: new FormControl('', Validators.required),
      state: new FormControl('', Validators.required),
      suburb: new FormControl('', Validators.required),
      addressLine1: new FormControl('', Validators.required),
      addressLine2: new FormControl(''),
      streetNo: new FormControl('', Validators.required),
      postalCode: new FormControl('', [Validators.required]),
    })
  });

  /************************************************************************************
   * COMPONENT INITIALIZATION
   ***********************************************************************************/
  constructor(private organizationManagementService: OrganizationManagementService, private libToast: TransientService, private dmsService: DmsService) { }

  // On component initialization
  ngOnInit(): void {
    this.organizationManagementService.getOrganizationDetails().subscribe((details) => {
      console.log(details);
      this.organizationDetailsFormGroup.patchValue({ ...details });
      // patch address values to address form subgroup
      this.organizationDetailsFormGroup.controls?.address?.patchValue({ ...details?.address });
      this.logo = details.logo;
      this.showSkeleton = false;
      // Set initial value of update subject; to skip first (false) trigger;
      this.updateDetails$.next(details);
    },
      // toast an error when unable to get data from API
      (error) => {
        this.libToast.open($localize`:@@organization-details-fetch-error-toast:Something happened! Cannot retrieve organization details.`, '', { duration: 2000 });
      }
    );
    // Setup form changes to update local/outgoing store
    this.organizationDetailsFormGroup.valueChanges
      .pipe(
        // Auto unsubscribe (called in ngOnDestroy)
        takeUntil(this.unsubscribeAll$),
      )
      // Update the local/outgoing store
      .subscribe(this.newOrgDetails$)
    // setup afterblur reactive organization detail updates
    this.updateDetails$.pipe(
      takeUntil(this.unsubscribeAll$),
      distinctUntilChanged(),
      skip(1),
      debounceTime(this.UPDATE_DEBOUNCE_TIME)
    ).subscribe(neworgDetails =>
      // Nested subscription to prevent http error from closing the main observable.
      this.organizationManagementService.updateOrganizationDetails(neworgDetails).subscribe(
        () => this.libToast.open($localize`:@@organization-details-update-success-toast:Organization details updated!`, '', { duration: 2000 }),
        (error: { errorMsg: string }) => this.libToast.open($localize`:@@organization-details-update-error-toast:Something happened! Cannot update organization details`, '', { duration: 2000 })
      )
    )
    // Setup total user count variable
    this.totalUserCount$ = this.organizationManagementService
      .getTotalUserCount()
      .pipe(
        catchError(
          err => of('Cannot get user count at the moment...')
        )
      );
  }

  /********************************************************************************
   *  EVENT HANDLERS
   *******************************************************************************/
  attempOrgInfoUpdate() {
    // Proceed only if the form is valid
    if (this.organizationDetailsFormGroup.valid) {
      console.log(this.newOrgDetails$.getValue());
      this.updateDetails$.next(this.newOrgDetails$.getValue());
    }
  }
  // Avatar update event handler
  companyLogoChange(logoUpdateEvent) {
    // ! Not Implemented
  }

  // Address automcompletion event handler
  addressAutocomplete(event: google.maps.places.PlaceResult) {
    // get address_components from event
    const components = event.address_components;
    // console.log(components);
    // patch address_component values to form
    this.organizationDetailsFormGroup.patchValue({
      address: {
        country: components.find((component) => component.types.includes('country'))?.long_name,
        // !-TODO: Needs further clarification for what consists in street number, subpremise, address lines etc... ----
        streetNo: components
          .find((component) => component.types.includes('street_number'))
          ?.long_name,
        addressLine1: components.find((component) => component.types.includes('route'))?.long_name,
        // !------------------------------------------------------------------------------------------------------------
        state: components.find((component) => component.types.includes('administrative_area_level_1'))?.long_name,
        suburb: components.find((component) => component.types.includes('locality'))?.long_name,
        postalCode: components.find((component) => component.types.includes('postal_code'))?.long_name,
      },
    });
    this.attempOrgInfoUpdate();
  }
  /**************************************************************************************************************
   * CLEANUP ON DESTROY
   *************************************************************************************************************/
  ngOnDestroy() {
    // Subscriptions cleanup
    this.unsubscribeAll$.next();
  }
}
