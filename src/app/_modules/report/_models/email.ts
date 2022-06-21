import { Criteria } from './widget';

export interface EmailRequestBody {
    subject: string;
    message: string;
    email: string[];
    attachmentType: string;
    conditionList: Criteria[];
}

export interface EmailTemplate {
    _id: string
    desc: string
}

export interface EmailTemplateBody {
  emailSubject: string,
  subType: string,
  emailText: string,
  templateDescription: string
}

export interface EmailResponseBody {
    email: string;
    acknowledge: boolean;
    errorMsg?: string
}