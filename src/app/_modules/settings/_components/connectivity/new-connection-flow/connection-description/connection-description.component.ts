import { Component, EventEmitter, forwardRef, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { CpiConnection, CreateConnectionData } from '@models/connector/connector.model';
import FormField from '@models/form-field';
import { ConnectorDetails } from '@modules/list/_components/connector/connectors.constants';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { SapwsService } from '@services/sapws/sapws.service';
import { TransientService } from 'mdo-ui-library';

@Component({
  selector: 'pros-connection-description',
  templateUrl: './connection-description.component.html',
  styleUrls: ['./connection-description.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => ConnectionDescriptionComponent)
    }]
})
export class ConnectionDescriptionComponent extends FormField implements OnInit, OnChanges {
  @Input()
  connectionDetails: ConnectorDetails;
  urlPattern = '^(http(s)?:\/\/)?([\\da-zA-Z.-]+(:[\\da-zA-Z.-]*)?@)?([\\da-zA-Z.-]+(:[\\da-zA-Z.-]*)?)(:[\\d]+)?(\/([\\w\\s\\-\\.\\,\\+\\?\\:\\(\\)\\[\\]\\{\\}\\#]*))?$';
  createConnectionForm: FormGroup;
  bannerText: string;
  saveLoader = false;
  @Output() navigate: EventEmitter<string> = new EventEmitter<string>();
  @Output() afterClose: EventEmitter<any> = new EventEmitter();
  constructor(
    private sapwsService: SapwsService,
    private transientService: TransientService,
    private sharedService: SharedServiceService) {
    super();
   }

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm() {
    this.createConnectionForm = new FormGroup({
      systemName: new FormControl('', [Validators.required]),
      systemDesc: new FormControl('', [Validators.required]),
      systemUrl: new FormControl('', [Validators.required, Validators.pattern(this.urlPattern)]),
      username: new FormControl('', [Validators.required]),
      userPassword: new FormControl('', [Validators.required, Validators.minLength(3)]),
    });

    this.createConnectionForm.valueChanges.subscribe(data => {
      this.onChange(data);
    })
  }

  close(data = null) {
    this.afterClose.emit(data);
  }

  writeValue(formData: CreateConnectionData): void {
    if(this.createConnectionForm) {
      this.createConnectionForm.patchValue(formData);
    }
  }

  createConnection() {
    const formData: CreateConnectionData = this.createConnectionForm.value;
    if(this.connectionDetails?.id === 'sap_cpi') {
      const body: CpiConnection = {
        connectionDescription: formData.systemDesc,
        connectionName: formData.systemName,
        sapConnection: {
          hostName: formData.systemUrl,
          password: formData.userPassword,
          user: formData.username
        }
      };
      this.createConnectionForm.disable();
      this.saveLoader = true;
      this.sapwsService.createOrUpdateCpiConnection(body).subscribe(data => {
        this.createConnectionForm.enable();
        this.saveLoader = false;
        if(data?.connectionId) {
          this.transientService.open('Connection Successfully Created', 'Dismiss');
          this.sharedService.cpiConnectionsReloadTriggerValue = {isReload: true, connectionId: data?.connectionId};
          this.close(data);
        } else {
          this.saveLoader = false;
          this.createConnectionForm.enable();
          this.bannerText = 'Error while creating connection';
          console.log(data);
        }
      }, err => {
        this.saveLoader = false;
        this.createConnectionForm.enable();
        this.bannerText = err?.error?.errorMsg ? err.error.errorMsg : 'Error while creating connection';
        console.error(err);
      })
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes.connectionDetails && changes.connectionDetails.currentValue) {
      this.connectionDetails = changes.connectionDetails.currentValue;
    }
  }

  goBack() {
    this.navigate.emit('connection-description');
  }
}
