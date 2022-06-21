import { FormGroup, FormArray, FormControl } from '@angular/forms';
import { UserPasswordPolicy, UserPasswordPolicyDto, UserPasswordPolicyActionResponse } from './../../_models/userdetails';
import { Observable } from 'rxjs';
import { EndpointsAuthService } from '@services/_endpoints/endpoints-auth.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserPasswordPolicyService {

  constructor(private http: HttpClient, private endpointsAuthService: EndpointsAuthService) { }

  public getPasswordPolicy(): Observable<UserPasswordPolicy> {
    return this.http.get<UserPasswordPolicy>(this.endpointsAuthService.getPasswordPolicy());
    // return of(passwordPolicy);
  }

  public policyAdd(passwordDetails: UserPasswordPolicyDto): Observable<UserPasswordPolicyActionResponse> {
    return this.http.post<any>(this.endpointsAuthService.policyAdd(), passwordDetails);
  }

  validateAllFormFields(formGroup: FormGroup) {
		Object.keys(formGroup.controls).forEach((field) => {
			const control = formGroup.get(field);
			if (control instanceof FormArray) {
				// if the control is FormArray
				for (const c of control.controls) {
					// c is either FormGroup or FormControl
					if (c instanceof FormGroup) {
						// c is FormGroup
						this.validateAllFormFields(c);
					} else if (c instanceof FormControl) {
						// c is FormControl
						c.markAsDirty({ onlySelf: true });
					}
				}
			} else if (control instanceof FormControl) {
				control.markAsTouched({ onlySelf: true });
			} else if (control instanceof FormGroup) {
				this.validateAllFormFields(control);
			}
		});
	}
}

export const passwordPolicy = {
  minimumLength: 12,
  upperCase: true,
  lowerCase: false,
  digit: true,
  specialCharacterAllowed: false,
  initialLoginPaswordReset: false,
  historyCount: 10,
  MaximumAge: 10,
  MaxloginAttempts: 12,
  userDefinedValues: 'One,Two,Three',
  systemDefinedValues: 'Six,Seven,Eight',
  userId: '',
  tenantId: ''
}
