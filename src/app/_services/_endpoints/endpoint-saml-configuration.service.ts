import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EndpointSamlConfigurationService {
    auth = environment.authUrl + '/auth';

  constructor() {}

  getSamlConfigurationList(fetchCount,fetchSize,searchString,orgId) {
    return this.auth + `/user/get-saml-orgid?fetchCount=${fetchCount}&fetchSize=${fetchSize}&searchString=${searchString}&orgId=${orgId}`;
  }

  getSAMLConfigurationData(orgId, tenantId) {
    return this.auth + `/user/get-saml?orgId=${orgId}&tenantId=${tenantId}`
  }

  saveUpdateSAMLUrl() {
    return this.auth + `/user/save-update-saml`;
  }

  uploadIDPFiles(orgId) {
    return this.auth + `/user/save-saml-file?orgId=${orgId}&tenantId=0`;
  }

  deleteConfiguration(orgId, tenantID) {
    return this.auth + `/user/delete-saml?orgId=${orgId}&tenantId=${tenantID}`;
  }
}