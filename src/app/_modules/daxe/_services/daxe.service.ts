import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EndpointsRuleService } from '@services/_endpoints/endpoints-rule.service';
import { DaxeInfo, DaxeRuleResponse } from '@store/models/daxe.model';
import { environment } from 'src/environments/environment';
import { Daxe, DaxeStatus, DaxeUsage } from '@store/models/daxe.model';

/**
 * Test data for DAXE
 */
export const DAXE_TEST_DATA: Daxe[] = [
  {
    assignedState: true,
    settings: '',
    whatsNew: 'Bug fixes',
    createdOn: 1644289926316,
    createdBy: 'Abc Def',
    modifiedOn: 1644289926316,
    modifiedBy: 'Abc Def',
    name: 'V0001',
    status: DaxeStatus.ACTIVE,
    version: '1.0',
    usage: DaxeUsage.TRANSFORMING,
    brief: 'Test',
    daxeCode: "// First line\nfunction hello() {\n\talert('Hello !');\n}\n// Last line",
    id: '1',
    tenantId: '1'
  },
  {
    assignedState: true,
    settings: '',
    whatsNew: 'Bug fixes',
    createdOn: 1644289926316,
    createdBy: 'Xyz Abc',
    modifiedOn: 1644289926316,
    modifiedBy: 'Xyz Abc',
    name: 'V0002',
    status: DaxeStatus.INACTIVE,
    version: '1.0',
    usage: DaxeUsage.TRANSFORMING,
    brief: 'Test',
    daxeCode: "// First line\nfunction hello() {\n\talert('Hello !');\n}\n// Last line",
    id: '2',
    tenantId: '1'
  },
  {
    assignedState: false,
    settings: '',
    whatsNew: 'Bug fixes',
    createdOn: 1644289926316,
    createdBy: 'Tezt User',
    modifiedOn: 1644289926316,
    modifiedBy: 'Tezt User',
    name: 'V0003',
    status: DaxeStatus.ACTIVE,
    version: '1.0',
    usage: DaxeUsage.TRANSFORMING,
    brief: 'Test',
    daxeCode: "// First line\nfunction hello() {\n\talert('Hello !');\n}\n// Last line",
    id: '3',
    tenantId: '1'
  },
  {
    assignedState: true,
    settings: '',
    whatsNew: 'Bug fixes',
    createdOn: 1644289926316,
    createdBy: 'Abc user',
    modifiedOn: 1644289926316,
    modifiedBy: 'Abc user',
    name: 'incorrect',
    status: DaxeStatus.INACTIVE,
    version: '1.0',
    usage: DaxeUsage.TRANSFORMING,
    brief: 'Test',
    daxeCode: "// First line\nfunction hello() {\n\talert('Hello !');\n}\n// Last line",
    id: '4',
    tenantId: '1'
  },
  {
    assignedState: false,
    settings: '',
    whatsNew: 'Bug fixes',
    createdOn: 1644289926316,
    createdBy: 'Abc Def',
    modifiedOn: 1644289926316,
    modifiedBy: 'Abc Def',
    name: 'V0001',
    status: DaxeStatus.ACTIVE,
    version: '1.0',
    usage: DaxeUsage.TRANSFORMING,
    brief: 'Test',
    daxeCode: "// First line\nfunction hello() {\n\talert('Hello !');\n}\n// Last line",
    id: '5',
    tenantId: '1'
  },
  {
    assignedState: false,
    settings: '',
    whatsNew: 'Bug fixes',
    createdOn: 1644289926316,
    createdBy: 'Tezt User',
    modifiedOn: 1644289926316,
    modifiedBy: 'Tezt User',
    name: 'V0002',
    status: DaxeStatus.DRAFT,
    version: '1.0',
    usage: DaxeUsage.TRANSFORMING,
    brief: 'Test',
    daxeCode: "// First line\nfunction hello() {\n\talert('Hello !');\n}\n// Last line",
    id: '6',
    tenantId: '1'
  },
  {
    assignedState: true,
    settings: '',
    whatsNew: 'Bug fixes',
    createdOn: 1644289926316,
    createdBy: 'Xyz Abc',
    modifiedOn: 1644289926316,
    modifiedBy: 'Xyz Abc',
    name: 'V0003',
    status: DaxeStatus.ACTIVE,
    version: '1.0',
    usage: DaxeUsage.TRANSFORMING,
    brief: 'Test',
    daxeCode: "// First line\nfunction hello() {\n\talert('Hello !');\n}\n// Last line",
    id: '7',
    tenantId: '1'
  },
  {
    assignedState: true,
    settings: '',
    whatsNew: 'Bug fixes',
    createdOn: 1644289926316,
    createdBy: 'Xyz Abc',
    modifiedOn: 1644289926316,
    modifiedBy: 'Xyz Abc',
    name: 'V0004',
    status: DaxeStatus.DRAFT,
    version: '1.0',
    usage: DaxeUsage.TRANSFORMING,
    brief: 'Test',
    daxeCode: "// First line\nfunction hello() {\n\talert('Hello !');\n}\n// Last line",
    id: '8',
    tenantId: '1'
  }
];

@Injectable({
  providedIn: 'root'
})
export class DaxeService {
  apiUrl = environment.apiurl;

  constructor(private http: HttpClient, private endpointsRuleService: EndpointsRuleService) {}

  public getDaxeRules(moduleId: string) {
    return this.http.post<DaxeRuleResponse>(this.endpointsRuleService.getDaxeRules(moduleId), []);
  }

  public getDaxeInfo(uuid: string) {
    return this.http.get(this.endpointsRuleService.getDaxeInfo(uuid));
  }

  public saveDaxeRule(body: DaxeInfo) {
    return this.http.post(this.endpointsRuleService.saveDaxeRule(), body);
  }
}
