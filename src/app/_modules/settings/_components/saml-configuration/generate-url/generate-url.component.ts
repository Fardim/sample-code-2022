import { Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Clipboard } from '@angular/cdk/clipboard';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'pros-generate-url',
  templateUrl: './generate-url.component.html',
  styleUrls: ['./generate-url.component.scss']
})
export class GenerateUrlComponent implements OnInit {

  url = new FormControl();

  constructor(
    public dialogRef: MatDialogRef<GenerateUrlComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private clipboard: Clipboard
  ) { }

  ngOnInit(): void {
    this.url.setValue(
      `${environment.authUrl}/auth/saml/login/alias/${this.data?.spEntityId}?idp=${this.data?.idpEntityId}`
    );
  }

  afterLabelIconClick($event) {
    this.clipboard.copy(`${environment.authUrl}/auth/saml/login/alias/${this.data?.spEntityId}?idp=${this.data?.idpEntityId}`);
  }

  closeDialog(res?) {
    this.dialogRef.close(res);
  }

}
