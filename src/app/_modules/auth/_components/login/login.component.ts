import { take } from 'rxjs/operators';
import { UserProfileService } from '@services/user/user-profile.service';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MsteamsConfigService } from '@modules/msteams/_service/msteams-config.service';

@Component({
  selector: 'pros-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  /**
   * While session expired has return url to navigate that router.
   */
  returnUrl: string;

  signInForm = new FormGroup({
    userName: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  });

  /**
   * Hold error messgae while login ..
   */
  errorMsg: string;

  constructor(
    private msteamsConfigService: MsteamsConfigService,
    private activatedRouter: ActivatedRoute,
    private router: Router,
    private msteamServices: MsteamsConfigService,
    private profileService: UserProfileService
  ) { }

  ngOnInit(): void {
    this.signInForm.valueChanges.subscribe(val => {
      this.errorMsg = '';
    });

    this.activatedRouter.queryParams.subscribe(param => {
      this.returnUrl = param.returnUrl ? param.returnUrl : '';
    });

    try {
      const jwtToken = localStorage.getItem('JWT-REFRESH-TOKEN');
      if (jwtToken) {
        this.validateToken(jwtToken).then(res => {
          if (res.body) {
            res = res.body;
            localStorage.setItem('JWT-TOKEN', (res['JWT-TOKEN'] ? res['JWT-TOKEN'] : ''));
            localStorage.setItem('JWT-REFRESH-TOKEN', (res['JWT-REFRESH-TOKEN'] ? res['JWT-REFRESH-TOKEN'] : ''));
            localStorage.setItem('DMS-TOKEN', (res['DMS-TOKEN'] ? res['DMS-TOKEN'] : ''));
            localStorage.setItem('NOTIF-TOKEN', (res['NOTIF-TOKEN'] ? res['NOTIF-TOKEN'] : ''));
            this.router.navigate(['/home']);
          }
        }).catch(ex => {
          console.error(`Exception : ${ex.messgae}`);
        });
      }

    } catch (ex) {
      console.error(`Exception ${ex.messgae}`);
    }
  }


  /**
   * Call service as promise for get sync token validation ..
   * @param token get for validation token ..
   */
  async validateToken(token: string): Promise<any> {
    return await this.msteamServices.validateToken(token).toPromise()
  }

  /**
   * After successfully loged in
   * Then check .. has redirectUrl is yes then redirect to that url
   * Otherwise navigate to /home
   *
   * Login pre/post processor .. for do authentication ..
   */
  async signIn() {
    const userName = this.signInForm.get('userName').value;
    const password = this.signInForm.get('password').value;
    console.log(this.signInForm)
    if (!this.signInForm.valid) {
      this.signInForm.markAsDirty()
      this.errorMsg = 'Username or password required ';
      return false;
    }
    this.msteamsConfigService.signIn(userName, password).subscribe(async res => {
      localStorage.setItem('JWT-TOKEN', (res['JWT-TOKEN'] ? res['JWT-TOKEN'] : ''));
      localStorage.setItem('JWT-REFRESH-TOKEN', (res['JWT-REFRESH-TOKEN'] ? res['JWT-REFRESH-TOKEN'] : ''));
      localStorage.setItem('DMS-TOKEN', (res['DMS-TOKEN'] ? res['DMS-TOKEN'] : ''));
      localStorage.setItem('NOTIF-TOKEN', (res['NOTIF-TOKEN'] ? res['NOTIF-TOKEN'] : ''));
      this.errorMsg = '';

      try {
        const privilegeResonse: any = await this.profileService.getUserPrivileges().pipe(take(1)).toPromise();
        if(privilegeResonse && privilegeResonse.acknowledge) {
          localStorage.setItem('PRIVILEGES', privilegeResonse.response);
        }
      } catch (error) {
        console.log(error);
      }
      // after successfully login ... redirect to redirect url
      if (this.returnUrl && !this.returnUrl.includes('/home/report')) {
        this.router.navigateByUrl(this.returnUrl);
        this.userPermissionForLocation();
      } else {
        this.router.navigate(['/home']);
        this.userPermissionForLocation();
      }
    }, error => {
      console.error(`Error : ${error}`);
      this.errorMsg = 'Invalid username or password ';
    });
  }


  userPermissionForLocation() {
    navigator.geolocation.getCurrentPosition((position) => {
      console.log('Position' + {latitude: position?.coords?.latitude, longitude: position?.coords?.longitude});
    });
  }
}
