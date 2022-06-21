export class CreateTemplate {
  data: string;
  fqdn: string;
  id: number;
  subject: string;
  templateName: string;
  templateType: string;
}

export class TemplateModelResponse {
  offset: number;
  limit: number;
  totalCount: number;
  templateModels: TemplateModel[];
}

export interface TemplateModel {
  id: number;
  templateName: string;
  templateType: string;
  subject: string;
  data: any;
  createdDate: string;
  createdUser: string;
  modifiedDate: string;
  modifiedUser: string;
  dataSet: string;
  tenantId: string;
  fqdn: string;
  attachementDetailsModel?: AttachementDetails[];
}

export interface AttachementDetails {
  id: number
  templateId: string
  type: string
  dmsRef: any
  dataset: string
}

export interface EmailTemplateReqParam {
  dataSet: string;
  modifiedDate: string;
  templateName: string;
  templateType: string;
  modifiedUser: string;
  createdUser: string;
}

export const TemplateTypeOptions: {key: string; value: string}[] = [
  {
    key: 'Workflow',
    value: 'WORKFLOW',
  },
  {
    key: 'Dashboard',
    value: 'DASHBOARD',
  },
  {
    key: 'Reminder',
    value: 'REMINDER',
  },
  {
    key: 'Invite User',
    value: 'INVITE_USER',
  },
  {
    key: 'PDF Template',
    value: 'PDF_TEMPLATE',
  },
];
