import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '@services/user/userservice.service';
import { distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'pros-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  userDetail;

  constructor(private router: Router,private userService: UserService) { }

  ngOnInit(): void {
    this.userService.getUserDetails().pipe(distinctUntilChanged()).subscribe(response => {
      if (response) {
        this.userDetail = response;
      }
    });
  }

  /**
   * Function to close settings side sheet
   */
  close() {
    this.router.navigate([{ outlets: { sb: null } }]);
  }

}
