import { Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import FormField from '@models/form-field';
import { Dataset } from '@models/schema/schema';
import { InterfaceAPIResponse } from '@modules/settings/_components/connectivity/connectivity';
import { ConnectionService } from '@services/connection/connection.service';
import { CoreService } from '@services/core/core.service';
import { Observable, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'pros-interface',
  templateUrl: './interface.component.html',
  styleUrls: ['./interface.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => InterfaceComponent)
    }
  ]
})
export class InterfaceComponent extends FormField implements OnInit {
  @Input() datasetID: any;

  @Input()
  submitted: boolean;

  @Input()
  initialValue: any;

  interfaceForm: FormGroup;

  @Output()
  removeRow: EventEmitter<boolean> = new EventEmitter();

  connectionsObs: Observable<any[]> = of([]);
  connectionsInitialLoad = true;

  interfacesObs: Observable<any[]> = of([]);
  interfaceSearchSub = new Subject<string>();
  interfacesInitialLoad = true;

  datasetsObs: Observable<Dataset[]> = of([]);
  datasetSearchSub = new Subject<string>();
  datasetsInitialLoad = true;

  constructor(private fb: FormBuilder, private coreService: CoreService, private conService: ConnectionService) {
    super();
  }

  ngOnInit(): void {
    this.datasetSearchSub.pipe(debounceTime(200), distinctUntilChanged()).subscribe((searchString) => {
      this.getDatasets(searchString);
    });

    this.interfaceSearchSub.pipe(debounceTime(200), distinctUntilChanged()).subscribe((searchString) => {
      this.getInterfaceDetails(searchString);
    });
    this.createForm();
  }

  writeValue(value: any) {}

  createForm() {
    this.interfaceForm = this.fb.group({
      system: [this.initialValue?.system, [Validators.required]],
      dataset: [this.initialValue?.dataset, [Validators.required]],
      interface: [this.initialValue?.interface, [Validators.required]]
    });
  }

  selectionChanged() {
    this.onChange({
      system: this.interfaceForm.controls.system.value,
      dataset: this.interfaceForm.controls.dataset.value,
      interface: this.interfaceForm.controls.interface.value
    });
  }

  systemSelected() {
    this.selectionChanged();
  }
  datasetSelected() {
    this.selectionChanged();
  }
  interfaceSelected() {
    this.selectionChanged();
  }

  getDatasets(searchString) {
    this.coreService.getDataSets(searchString, 0, 10).subscribe((resp) => {
      this.datasetsObs = of(resp);
    });
  }

  getCPIConnections() {
    this.conService.getCPIConnections().subscribe(
      (response: any) => {
        this.connectionsObs = of(response);
      },
      (error) => {
        console.error(`Error:: ${error.message}`);
      }
    );
  }

  getInterfaceDetails(searchString) {
    const connectionId = this.interfaceForm?.value?.system?.connectionId;
    if (!connectionId) {
      return;
    }
    const queryString = `&fieldName=${searchString}`;
    this.conService.getInterfaceDetails(connectionId, queryString).subscribe((data: any) => {
      const interfaces = this.mapInterfaceData(data?.response?.content || []);
      this.interfacesObs = of(interfaces);
    });
  }

  mapInterfaceData(intf: InterfaceAPIResponse[]) {
    const interfaces = [];
    intf.forEach((int) => {
      interfaces.push({
        interfaceType: int.interfaceType,
        name: int.scenarioDesc,
        dataset: int.objectType,
        type: int.interfaceType,
        flows: '',
        status: int.active ? 'Active' : 'Inactive',
        interfaceId: int.scenarioId
      });
    });
    return interfaces;
  }

  displayDatasetFn(dataset): string {
    if (dataset) {
      return dataset.moduleDesc ? dataset.moduleDesc : dataset.moduleId ? dataset.moduleId : 'unknown';
    }
    return '';
  }

  displayConnectionFn(con): string {
    if (con) {
      return con.connectionName ? con.connectionName : con.connectionId ? con.connectionId : 'unknown';
    }
    return '';
  }

  displayInterfaceFn(intf): string {
    if (intf) {
      return intf.name ? intf.name : intf.interfaceId ? intf.interfaceId : 'unknown';
    }
    return '';
  }

  removeMapping() {
    this.removeRow.emit(true);
  }

  datasetInputFocus() {
    if (this.datasetsInitialLoad) {
      this.datasetSearchSub.next('');
      this.datasetsInitialLoad = false;
    }
  }

  interfacesInputFocus() {
    if (this.interfacesInitialLoad) {
      this.interfaceSearchSub.next('');
      this.interfacesInitialLoad = false;
    }
  }

  connectionsInputFocus() {
    if (this.connectionsInitialLoad) {
      this.getCPIConnections();
      this.connectionsInitialLoad = false;
    }
  }
}
