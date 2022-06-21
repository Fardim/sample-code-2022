import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConnectionService } from '@services/connection/connection.service';
import { TransientService } from 'mdo-ui-library';
import { combineLatest } from 'rxjs';
@Component({
  selector: 'pros-edit-connection',
  templateUrl: './edit-connection.component.html',
  styleUrls: ['./edit-connection.component.scss'],
})
export class EditConnectionComponent implements OnInit {
  editConnectionForm: FormGroup;

  connectionDetails = {
    connectionId: '',
    connectionName: '',
    connectionDescription: '',
    sapConnection: {
      hostName: '',
      user: '',
      password: '',
    },
  };

  isSave = false;

  connectionId = '';
  showTestConnectionMsg = false;
  bannerText: string;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private connectionService: ConnectionService,
    private route: ActivatedRoute,
    private transientService: TransientService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params) {
        this.connectionId = params.connectionId;
      }
    });
    this.getConnectionDetails();
    this.createEditConnectionFrom();
  }

  getConnectionDetails() {
    combineLatest([this.connectionService.getConnectionDetails(this.connectionId), this.connectionService.connectionDetail$]).subscribe(
      (resp: any) => {
        if (resp[0].acknowledge) {
          this.showTestConnectionMsg = false;
          const connDetails = resp[0].response;
          this.connectionDetails = {
            connectionId: connDetails.connectionId,
            connectionName: resp[1].connName,
            connectionDescription: resp[1].connDesc,
            sapConnection: {
              hostName: connDetails.hostName,
              user: connDetails.user,
              password: connDetails.password,
            },
          };
          this.patchConnectionValue();
        }
      },
      (err) => {
        console.log(err);
        this.showTestConnectionMsg = true;
      }
    );
  }

  createEditConnectionFrom() {
    this.editConnectionForm = this.formBuilder.group({
      connectionName: ['', Validators.required],
      connectionDescription: ['', Validators.required],
      hostName: ['', Validators.required],
      user: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  patchConnectionValue() {
    this.editConnectionForm.patchValue({
      connectionName: this.connectionDetails.connectionName ? this.connectionDetails.connectionName : '',
      connectionDescription: this.connectionDetails.connectionDescription ? this.connectionDetails.connectionDescription : '',
      hostName: this.connectionDetails.sapConnection.hostName ? this.connectionDetails.sapConnection.hostName : '',
      user: this.connectionDetails.sapConnection.user ? this.connectionDetails.sapConnection.user : '',
      password: this.connectionDetails.sapConnection.password ? this.connectionDetails.sapConnection.password : '',
    });
  }

  saveConnection() {
    const payload = {
      connectionId: this.connectionDetails.connectionId,
      connectionName: this.editConnectionForm.value.connectionName,
      connectionDescription: this.editConnectionForm.value.connectionDescription,
      sapConnection: {
        hostName: this.editConnectionForm.value.hostName,
        user: this.editConnectionForm.value.user,
        password: this.editConnectionForm.value.password,
      },
    };
    this.isSave = true;
    this.connectionService.updateConnectionDetails(payload).subscribe((response: any) => {
      this.isSave = false;
      this.connectionService.nextUpdateConnectionDetailsSubject(response);
      this.transientService.open('Successfully saved !', null, { duration: 1000, verticalPosition: 'bottom' });
      this.close();
    },error => {
      this.isSave = false;
      this.showTestConnectionMsg = true;
    });
  }

  close() {
    this.router.navigate([{ outlets: { outer: null } }], { queryParamsHandling: 'preserve' });
  }
}
