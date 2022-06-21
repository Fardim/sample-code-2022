import { MDORecordES } from '../_modules/transaction/model/transaction';

export interface RuleTransformationReq {
  brIds: number[],
  doc: MDORecordES
}
