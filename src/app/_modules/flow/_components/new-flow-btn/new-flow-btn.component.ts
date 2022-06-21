import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Userdetails, UserPersonalDetails } from '@models/userdetails';
import { UserService } from '@services/user/userservice.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'pros-new-flow-btn',
  templateUrl: './new-flow-btn.component.html',
  styleUrls: ['./new-flow-btn.component.scss']
})
export class NewFlowBtnComponent implements OnInit {

  userDetails: UserPersonalDetails;
  tenantId: string;
  userName: string;
  password: string;
  url: string;

  @ViewChild('droolSignin') droolSignin: ElementRef<HTMLButtonElement>
  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.url = environment.apiurl + '/business-central/j_security_check'
    this.userService.getUserPersonalDetails().subscribe(user=> {
      this.userDetails = user;
      this.userName = `${this.userDetails.profileKey.userName+ '/' +this.userDetails.profileKey.tenantId}`;
      this.password = this.userDetails.droolPassword;
    });
  }

  /**
   * Open the business central ... for flow configuration
   */
   manageFlows() {
     this.droolSignin.nativeElement.click();
    // window.open(environment.apiurl,'business-central/j_security_check');
  }

}
