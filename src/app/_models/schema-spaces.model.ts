export type IndexNamesResponse = {
  postgres: string;
  [index: string]: string;
};

export class Index {
  dbName: string;
  moduleId: string;
  tenantId: string;
  lang: string;
  size: string;
}
