import { GroupDetails } from '@models/schema/duplicacy';

export class VirtualDatasetDetails {
  vdId: string;
  vdName: string;
  indexName: string;
  tableName: string;
  tenantId: string;
  userCreated: string;
  dateCreated: string;
  userModified: string;
  dateModified: string;
  vdDescription: string;
  jobSchedulerId: string;
  groupDetails?: GroupDetails[];
  groupResult?: GroupResult[];
}

export class GroupResult {
  resultId: string;
  source: string;
  fieldId: string;
  fieldAlias: string;
  order: number;
}

export class TabScrollData {
  containerWidth = 0;
  itemsWidth = 0;
  scrollWidth = 150;
  disablePrev = true;
  disableNext = false;
}

export class VirtualDatasetDetailsResponse {
  data: VirtualDatasetDetails;
  message: string;
}
