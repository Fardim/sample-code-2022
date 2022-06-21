export class ClassType {
  classType: string;
  className: string;
  description: string;
  classes: Class[] = [];
  count?: number;
  allowMultipleclass: boolean;
  relatedDatasets: any[] = [];
  enableSync: boolean;
  nountype: boolean;
  system: string;
  tenantId?: string;
  allowHierachy?: boolean;
  allowMultidataset?: boolean;
  isNountype?: boolean;
  uuid: string;
  classTypeId: string;
}

export class ResultInfo<T = any> {
  data: T;
  message: string;
  status: number;
  success: boolean;
  acknowledged: boolean;
  response: T;
}

export class ClassLabel {
  code: string;
  codeLong: string;
  language: string | Language;
  mod: string;
  modLong: string;
  uuid?: string;
  label: string;
}

export class Characteristics {
  uuid?: string;
  charCode: string;
  defaultValue: string;
  dataType: string;
  charDesc: string;
  charOrder: string;
  descActive: boolean;
  dimensionType: string;
  defaultUoM: string[];
  fieldType: string;
  helpText: string;
  isChecklist: boolean;
  isManatory: boolean;
  labels: LanguageLabel[];
  length: string | number;
  longPrefix: string;
  longSuffix: string;
  numCode: string;
  prefix: string;
  sapChars: string;
  suffix: string;
  tenantId: string;
  validFrom = '0';
  validTo = '0';
}

export class LanguageLabel {
  label: string;
  language: string;
  uuid?: string;
}

export class Language {
  id: string;
  name: string;
}
export class ColloquialName {
  calloquialName: string;
  collorder: number;
  language: string;
  xref: string;
}

export class Class {
  classLabels: ClassLabel[];
  classType: ClassType;
  classes: Class[] = [];
  colloquialNames: ColloquialName[] = [];
  code: string;
  codeLong: string;
  description: string;
  imageUrl = [];
  inheritAttributes: boolean;
  isCodePartOfDesc: boolean;
  isModPartOfDesc: boolean;
  isNoun: boolean;
  mod: string;
  modLong: string;
  numCod?: string;
  numMod?: string;
  parentUuid: string;
  referenceCode: string | ClassType;
  referenceType: string;
  sapClass: string;
  tenantId: string;
  uuid: string;
  validFrom: string;
}

export const languages: Language[] = [
  { id: 'en', name: 'English' },
  { id: 'ar', name: 'Arabic' },
  { id: 'de', name: 'German' },
  { id: 'es', name: 'Spanish' },
  { id: 'fr', name: 'French' },
  { id: 'id', name: 'Indonesian' },
  { id: 'it', name: 'Italian' },
  { id: 'ja', name: 'Japanese' },
  { id: 'ko', name: 'Korean' },
  { id: 'nl', name: 'Netherlands' },
  { id: 'pt', name: 'Portuguese' },
  { id: 'ru', name: 'Russian' },
  { id: 'sv', name: 'Swedish' },
  { id: 'th', name: 'Thai' },
  { id: 'vi', name: 'Vietnamese' },
  { id: 'zf', name: 'Chinese' },
];


export class DimensionItem {
  type: string;
  uomValue: string;
}

// dimensions
export class Dimensions {
  uuid?: string;
  description: string;
  values: DimensionItem[] =[];
}

export class SaveDimensionsRequest {
  dimensionsModel: Dimensions;
}

export class SaveDimensionsResponse extends ResultInfo<Dimensions> {}

export class ColloquialNames {
  calloquialName: string;
  collorder: number;
  language: string;
  xref: string;
}

export class CPIConnection {
  connectionId: string;
  connectionName: string;
  connectionDescription: string;
  systemType: string;
  tenantId: string;
}
