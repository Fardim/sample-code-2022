import { FormControl } from '@angular/forms';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'pros-role-users',
  templateUrl: './role-users.component.html',
  styleUrls: ['./role-users.component.scss']
})
export class RoleUsersComponent implements OnInit, OnDestroy {
  unsubscribeAll$: Subject<boolean> = new Subject<boolean>();
  roleId = '';
  isLoading = false;
  userList:any[] = [];
  roleUserCtrl: FormControl = new FormControl(null);
  searchString = '';

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.unsubscribeAll$)).subscribe((params) => {
      if (params?.roleId) {
        this.roleId = params.roleId;
        this.getRoleUsers();
      }
    });
    this.roleUserCtrl.valueChanges
    .pipe(debounceTime(700), distinctUntilChanged(), takeUntil(this.unsubscribeAll$))
    .subscribe((search) => {
      this.searchString = search;
      this.getRoleUsers();
    });
  }

  getRoleUsers() {

  }

  close() {
    this.router.navigate([{ outlets: { outer: null } }]);
  }
  ngOnDestroy(): void {
    this.unsubscribeAll$.next(true);
    this.unsubscribeAll$.complete();
  }
}
