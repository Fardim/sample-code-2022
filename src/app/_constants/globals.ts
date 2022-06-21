export enum ROLENAMES {
    ADMIN = 'Admin',
    REVIEWER = 'Reviewer',
    VIEWER = 'Viewer',
    EDITOR = 'Editer'
}


export enum GLOBALCONSTANTS {
    ADD = 'add',
    REMOVE = 'remove',
    SCHEMA_SCHEDULER = 'schema_scheduler',
    checked = 'checked',
    disabled = 'disabled',
    indeterminate = 'indeterminate',
    options = 'options',
    value = 'value',
    required = 'required',
    width = 'width',
}

export const validationRegex = {
  email: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$',
  dmsURL: '\/dms\/',
  url: '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?', // checks the inserted input is a url or not
}

export enum TragetInfo {
  VALUE = 'VALUE',
  FIELD = 'FIELD'
}

export enum OldValueInfo {
  VALUE = 'VALUE',
  FIELD = 'FIELD'
}

export const LanguageList = [
  'en',
  'ar',
  'de',
  'es',
  'fr',
  'id',
  'it',
  'ja',
  'ko',
  'nl',
  'pt',
  'ru',
  'sv',
  'th',
  'vi',
  'zf'
]