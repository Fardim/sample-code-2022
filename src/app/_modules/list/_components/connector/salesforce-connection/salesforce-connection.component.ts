import { AfterViewInit, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
@Component({
  selector: 'pros-salesforce-connection',
  templateUrl: './salesforce-connection.component.html',
  styleUrls: ['./salesforce-connection.component.scss'],
  providers: [CookieService]
})
export class SalesforceConnectionComponent implements OnInit, AfterViewInit {
  loader = false;

  winPopup: any;
  windowObject: any;

  errorMessage = '';
  showBanner = false;

  @Output()
  cancelClick: EventEmitter<any> = new EventEmitter<any>();

  @Output()
  backClick: EventEmitter<any> = new EventEmitter<any>();

  @Output()
  nextClick: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  ngOnInit(): void {
    console.log('from ngOnint');
  }


  authorise() {
    const redirectUri = 'http://localhost:4200/%23/connectToSalesforce';
    const loginURL = `https://login.salesforce.com/services/oauth2/authorize?client_id=3MVG9d8..z.hDcPJW26oPygOCg34a_jJUH0Iu.vE6LGanEbyNy9s7DsnPLOF8xeLWdeEgCIa0Ou2qTQhQtzsX&redirect_uri=${redirectUri}&response_type=code&scope=refresh_token+api`;

    window.open(
      loginURL,
      '_blank',
      'width=600,height=600'
    );

    window.addEventListener('message', function (event: any) {
      if (event.data.status === 'SUCCESS') {
        this.setCookie('sfConnectionName', event.data.sfConnectionName, 1);
        window.alert('login Successful');
        this.nextClick.emit();
      } else {
        this.showBanner = true;
        this.errorMessage = 'Authorisation unsuccessful, please try again';
      }
    }.bind(this), { once: true });
  }

  ngAfterViewInit() { }

  onCancelClick(event) {
    this.cancelClick.emit(event);
  }

  back() {
    this.backClick.emit();
  }

  setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    const expires = 'expires=' + d.toUTCString();
    document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
  }
}
