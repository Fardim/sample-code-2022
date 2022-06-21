import { TableMappingComponent } from '../../table-mapping/table-mapping.component';
import { CpiDataScopeComponent } from './../sap-cpi/cpi-data-scope/cpi-data-scope.component';
import { CpiStandardPackageComponent } from './../sap-cpi/cpi-standard-package/cpi-standard-package.component';
import { CpiPackageSelectionComponent } from './../sap-cpi/cpi-package-selection/cpi-package-selection.component';
import { CpiLoginRetryComponent } from './../sap-cpi/cpi-login-retry/cpi-login-retry.component';
import { CpiChecklistComponent } from './../sap-cpi/cpi-checklist/cpi-checklist.component';
import { CpiLoginComponent } from './../sap-cpi/cpi-login/cpi-login.component';
import { FlowStep } from './../models/step.model';
import { CpiInterimActivitiesComponent } from './../sap-cpi/cpi-interim-activities/cpi-interim-activities.component';
import { DatasetSourceComponent } from './../../dataset/dataset/dataset-source/dataset-source.component';
import { SapOdataLoginComponent } from './../sap-odata-login/sap-odata-login.component';
import { ManuallyDatasetsComponent } from './../../dataset/dataset/manually-datasets/manually-datasets.component';
import { BehaviorSubject } from 'rxjs';
import { ProcessItem } from './../models/process-item';
import { SapMappingFieldsComponent } from './../sap-mapping-fields/sap-mapping-fields.component';
import { SapConnectorStepTwoComponent } from './../sap-connector-step-two/sap-connector-step-two.component';
import { SapConnectorStepOneComponent } from './../sap-connector-step-one/sap-connector-step-one.component';
import { SalesforceConnectionComponent } from './../salesforce-connection/salesforce-connection.component';
import { ConnectToDatasetComponent } from './../connect-to-dataset/connect-to-dataset.component';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConnectorService {
  steps: ['dataset sources', ]

  private flow: {items: FlowStep[]} = {
    items: [
      {
        id: '1',
        step: 'dataset sources',
        component: DatasetSourceComponent,
        nextOptions: ['connectors', 'file', 'manually']
      },
      {
        id: '2',
        step: 'connectors',
        component: ConnectToDatasetComponent,
        nextOptions: ['sap ws login', 'sap cpi']
      },
      {
        id: '3',
        step: 'sap ws login',
        component: 'Logincompo',
        nextOptions: ['sap ws package selection']
      },
      {
        id: '4',
        step: 'sap ws package selection',
        component: SapConnectorStepOneComponent,
        nextOptions: ['standard pkg', 'mapping table']
      },
      {
        id: '5',
        step: 'standard pkg',
        component: SapConnectorStepTwoComponent,
        nextOptions: ['check your data']
      },
      {
        id: '6',
        step: 'mapping table',
        component: SapMappingFieldsComponent,
        nextOptions: ['check your data']
      },
      {
        id: '7',
        step: 'check your data',
        component: 'Check data compo',
        nextOptions: []
      },
      {
        id: '8',
        step: 'file',
        component: 'file',
        nextOptions: []
      },
      {
        id: '9',
        step: 'manually',
        component: ManuallyDatasetsComponent,
        nextOptions: []
      },
      {
        id: '10',
        step: 'sap cpi login',
        component: CpiLoginComponent,
        nextOptions: ['sap cpi package selection']
      },
      {
        id: '12',
        step: 'sap cpi standard pkg',
        component: 'sap cpi standard pkg',
        nextOptions: [],
      },
      {
        id: '13',
        step: 'mapping table cpi',
        component: SapMappingFieldsComponent,
        nextOptions: []
      },
      {
        id: '14',
        step: 'interim customer activities',
        component: CpiInterimActivitiesComponent,
        nextOptions: []
      },
      {
        id: '15',
        step: 'sap cpi checklist',
        component: CpiChecklistComponent,
        nextOptions: []
      },
      {
        id: '15',
        step: 'sap cpi login retry',
        component: CpiLoginRetryComponent,
        nextOptions: []
      },
      {
        id: '16',
        step: 'sap cpi package selection',
        component: CpiPackageSelectionComponent,
        nextOptions: []
      },
      {
        id: '17',
        step: 'sap cpi standard package',
        component: CpiStandardPackageComponent,
        nextOptions: []
      },
      {
        id: '18',
        step: 'sap cpi data scope',
        component: CpiDataScopeComponent,
        nextOptions: []
      },
      {
        id: '19',
        step: 'table mapping',
        component: TableMappingComponent,
        nextOptions: []
      }
    ]
  };
  private connectorFlow = {
    items: [
      {
        step: 'connectors',
        desc: 'All The connectors',
      },
      {
        step: 'sf login',
        desc: 'sf login',
      },
      {
        step: 'sapodata login',
        desc: 'sapodata login',
      },
      {
        step: 'sap webservices login',
        desc: 'Sap Webservices login',
        items: [
          {
            step: 'select service structure',
            desc: 'select service structure',
          },
          {
            step: 'sap webservices 2',
            desc: 'sap webservices 2',
          },
          {
            step: 'sap webservices 3',
            desc: 'sap webservices 3',
          }
        ]
      },
      {
        step: 'sf connect',
        desc: 'sf connect',
        items: [
          {
            step: 'select service structure',
            desc: 'select service structure',
          }
        ]
      }
    ]
  };

  public nextStep: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  nextStep$ = this.nextStep.asObservable();

  public nextFlowStep: BehaviorSubject<FlowStep> = new BehaviorSubject<FlowStep>(null);
  nextFlowStep$ = this.nextFlowStep.asObservable();

  public backClicked: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  backClicked$ = this.backClicked.asObservable();

  public cancelClick: BehaviorSubject<{toRefreshApis: boolean, moduleId?: number}> = new BehaviorSubject<{toRefreshApis: boolean, moduleId?: number}>(null);
  cancelClick$ = this.cancelClick.asObservable();

  constructor() { }


  getProcessSteps() : ProcessItem[] {
    return this.getPageOrder(this.connectorFlow.items);
  }

  private getPageOrder(steps) : ProcessItem[] {
    let result : ProcessItem[] = [];

    for (const item of steps) {
      if (item.items) {
        result = result.concat(this.getPageOrder(item.items));
      } else {
        const comp = this.resolveComponentsName(item.step);
        const newItem = new ProcessItem(comp);
        result.push(newItem);
      }
    }

    return result;
  }

  private resolveComponentsName(step) {
    if (step === 'connectors') {
      return ConnectToDatasetComponent;
    } else if (step === 'sf login') {
      return SalesforceConnectionComponent;
    }  else if (step === 'select service structure') {
      return SapConnectorStepOneComponent;
    } else if (step === 'sap webservices 2') {
      return SapConnectorStepTwoComponent;
    } else if (step === 'sap webservices 3') {
      return SapMappingFieldsComponent;
    } else if(step === 'sapodata login') {
      return SapOdataLoginComponent
    }
  }

  getNextComponent(step: string) {
    const nextStep = this.flow.items.find(d=> d.step === step);
    this.nextFlowStep.next(nextStep);
  }

  updateNextStep(step: number) {
    this.nextStep.next(step); // +1 or -1
  }

  onCancelClick(action: {toRefreshApis: boolean, moduleId?: number}) {
    this.cancelClick.next(action);
  }
}

