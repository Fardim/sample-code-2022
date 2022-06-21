import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConnekthubService } from '@modules/connekthub/_services/connekthub.service';

@Component({
  selector: 'pros-connekthub-login',
  templateUrl: './connekthub-login.component.html',
  styleUrls: ['./connekthub-login.component.scss']
})
export class ConnekthubLoginComponent implements OnInit {

  @Output() hasLogined: EventEmitter<boolean> = new EventEmitter();

  form = new FormGroup({
    userName: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  });

  dialogData: any;

  /**
   * Hold error messgae while login ..
   */
  errorMsg: string;

  constructor(
    private connekthubService: ConnekthubService,
    private matDialog: MatDialogRef<ConnekthubLoginComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.dialogData = data;
  }

  ngOnInit(): void {
    this.form.valueChanges.subscribe(val => {
      this.errorMsg = '';
    });
  }

  get showCloseButton(): boolean {
    return !!this.dialogData?.showCloseButton;
  }

  /**
   * close if opened as a dialog
   * @param data data to emit after close
   */
  close(data = null) {
    this.matDialog.close(data);
  }

  /**
   * After successfully loged in
   * Then check .. has redirectUrl is yes then redirect to that url
   * Otherwise navigate to /home
   *
   * Login pre/post processor .. for do authentication ..
   */
  signIn() {
    if (!this.form.valid) {
      this.form.markAsDirty()
      this.errorMsg = 'Username or password required ';
      return false;
    }
    this.connekthubService.login(this.form.value.userName, this.form.value.password).subscribe((response) => {
      localStorage.setItem('LIB-JWT-TOKEN', response.headers.get('JWT-TOKEN'));
      localStorage.setItem('LIB-JWT-REFRESH-TOKEN', response.headers.get('JWT-REFRESH-TOKEN'));
      this.errorMsg = '';

      // after successfully login ... redirect to redirect url
      this.hasLogined.emit(true);
      // this.close(true);
    }, error => {
      console.error(`Error : ${error}`);
      this.errorMsg = 'Invalid username or password ';
    });;
  }

}
