export class ModuleDetailsResponse {
  moduleId: number;
  tenantId: string;
  userModified: string;
  dateModified: number;
  dispCriteria: number;
  moduleDescriptionRequestDTO: {
    description: string,
    information: string
  };
  industry: string;
  isSingleRecord: boolean;
  systemType: string;
  owner: number;
  dataType: number;
  persistent: number;
  dataPrivacy: number;
  type: string;
}
