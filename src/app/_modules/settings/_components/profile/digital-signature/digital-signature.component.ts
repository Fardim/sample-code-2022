import { Component, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { UserPersonalDetails } from '@models/userdetails';
import { UserService } from '@services/user/userservice.service';
import { Subscription } from 'rxjs';
import SignaturePad from 'signature_pad';

@Component({
  selector: 'pros-digital-signature',
  templateUrl: './digital-signature.component.html',
  styleUrls: ['./digital-signature.component.scss'],
})
export class DigitalSignatureComponent implements AfterViewInit, OnDestroy {
  // View child for signature pad canvas
  @ViewChild('sPad', { static: true }) signaturePadElement;
  // varaible that holds signature pad values
  signaturePad: any;
  // user signature
  userSignature: any;
  // check if signature is empty
  isSignatureEmpty: boolean;
  // to show banner Message
  bannerMsg = 'Please enter signature first';
  subscription: Subscription = new Subscription();
  currentUserPersonalDetails: UserPersonalDetails;
  showErrorBanner = false;

  constructor(private router: Router, private userService: UserService) {}

  /**
   * Get user personal details and bind digital signature for that
   */
  getUserDetails() {
    this.subscription.add(
      this.userService.getUserPersonalDetails().subscribe((res: UserPersonalDetails) => {
        this.currentUserPersonalDetails = res;
        this.signaturePad.fromDataURL(this.currentUserPersonalDetails.digitalSignature);
        if (!this.currentUserPersonalDetails.digitalSignature) {
          this.signaturePad.clear();
        }
      })
    );
  }

  /**
   * Sets canvas element with signature pad methods
   */
  ngAfterViewInit(): void {
    this.signaturePad = new SignaturePad(this.signaturePadElement.nativeElement);
    this.getUserDetails();
  }

  /**
   * closes digital signature sidesheet
   */
  close() {
    this.router.navigate([{ outlets: { outer: null } }], {
      queryParamsHandling: 'preserve',
      preserveFragment: true,
    });
  }

  /**
   * clears canvas
   */
  clearSignature() {
    this.signaturePad.clear();
    this.currentUserPersonalDetails.digitalSignature = null;
    this.saveUpdateUserDetails(true); // call submit detailss api for removing digital signature
  }

  /**
   * saves canvas value to user signature
   */
  save() {
    if (this.signaturePad.isEmpty()) {
      this.isSignatureEmpty = true;
      return;
    } else {
      this.isSignatureEmpty = false;
      this.userSignature = this.signaturePad.toDataURL();
      this.currentUserPersonalDetails.digitalSignature = this.userSignature;
      this.saveUpdateUserDetails(); // submit details with digital sgnature
    }
  }

  /**
   * API call to submit user details
   */
  saveUpdateUserDetails(isFromClearSignature = false) {
    this.subscription.add(
      this.userService.updateUserPersonalDetails(this.currentUserPersonalDetails).subscribe(
        () => {
          if (!isFromClearSignature) {
            this.close();
          }
        },
        (error) => {
          this.bannerMsg = error.message;
          this.showErrorBanner = true;
        }
      )
    );
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
