export interface TableHeader {
  label: string;
  key: string;
  sticky?: boolean;
}

export interface TableHeaderConfig {
  stringColumns: Array<string>;
  objectColumns: Array<TableHeader>;
}

export enum ProcessValue {
  CREATE = '1',
  CHANGE = '2',
  SUMMARY = '3',
  APPROVE = '4'
}

export enum ProcessName {
  CREATE = 'created',
  CHANGE = 'changed',
  SUMMARY = 'summary',
  APPROVE = 'approved'
}

export interface AuditLogResponse {
  id: string;
  hdvs: {
    [key: string]: FieldDetail;
  };
  staticFields: {
    [key: string]: {
      fId: string;
      ls: string;
      vc: AttributeValue;
    };
  };
  wfvs: {
    chngfld: {
      hdvs: {
        [key: string]: {
          bc: AttributeValue[];
          fid: string;
          ls: string;
          vc: AttributeValue[];
        };
      };
      gvs: {
        [key: string]: {
          gId: string;
          rows: {
            [key: string]: {
              fId: string;
              vc: AttributeValue[];
            };
          }[];
        };
      };
    };
    wfvl: {
      [key: string]: {
        fId: string;
        ls: string;
        vc: AttributeValue[];
      };
    };
  }[];
}

export interface StaticFieldDetail {
  CRID: string;
  EVENTID: string;
  INITIATED_BY: string;
  MODULEID: string;
  OBJECT_NUMBER: string;
  date: string;
  eventName: string;
  role: string;
}
export interface AuditExpansion {
  isExpanded?: boolean;
  wfvs_details: WfvsDetails[];
  staticFields_details: StaticFieldDetail;
}

export interface WfvsDetails {
  staticFields_details?: StaticFieldDetail;
  wfvlData: DynamicKeyValue;
  chngfldData: {
    hyvs: {};
    hdvs: {};
    gvs: {};
  };
}

export interface ChangeFieldDetail {
  // fieldId: string;
  fieldName: string;
  beforeChange: string;
  afterChange: string;
}

export class DynamicKeyValue {
  [key: string]: string | Date;
}

export interface FieldDetail {
  fid: string;
  ls: string;
  bc: AttributeValue[];
  vc: AttributeValue[];
}

export class AttributeValue {
  c: string;
}
