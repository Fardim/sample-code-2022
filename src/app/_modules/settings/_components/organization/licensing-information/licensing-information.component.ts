import { Component, OnInit } from '@angular/core';
import { licensingInformation, Userdetails } from '@models/userdetails';
import { UserService } from '@services/user/userservice.service';
import { TransientService } from 'mdo-ui-library';
import * as moment from 'moment';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'pros-licensing-information',
  templateUrl: './licensing-information.component.html',
  styleUrls: ['./licensing-information.component.scss']
})
export class LicensingInformationComponent implements OnInit {

  isTrialLicense = true;

  licenseInfo = {
    licenseType: '',
    expiryDate: '',
    status: ''
  }

  constructor(
    private userService: UserService,
    private transientService: TransientService
  ) { }

  ngOnInit(): void {
    this.userService.getUserDetails().subscribe(
      (response: Userdetails) => {
        this.getLicenseValidateInfo(response?.orgId);
      },
      (error) => console.error(`Error : ${error.message}`)
    );
  }

  getLicenseValidateInfo(orgId) {
    if (!orgId) {
      this.transientService.open('Something went wrong!', null, { duration: 2000, verticalPosition: 'bottom' });
      return;
    }
    this.userService.getLicenseInfo(orgId)
    .pipe(
      catchError((err) => {
        console.log(err);
        return throwError(err);
      }),
    )
    .subscribe((response: licensingInformation) => {
      if (response) {
        this.licenseInfo.expiryDate = moment(Number(response.expirationTime)).format('DD-MM-YYYY');
        this.licenseInfo.licenseType = response.licenceType;
        this.licenseInfo.status = response.status;
      }
    }, error => {
      this.transientService.open('Something went wrong!', null, { duration: 2000, verticalPosition: 'bottom' });
    })
  }

}
