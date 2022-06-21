
export const NotificationTrigger: Array<{label: string; value: string}> = [
    { label: 'Date', value: 'DATE' },
    { label: 'Event', value: 'DEFAULT' },
    { label: 'Field value', value: 'FIELD' },
    { label: 'Email', value: 'EMAIL' },
    { label: 'Custom', value: 'UDR' },
]

export enum NotificationTriggerType {
    DATE = 'DATE',
    DEFAULT = 'DEFAULT',
    FIELD = 'FIELD',
    EMAIL = 'EMAIL',
    UDR = 'UDR'
}

export const NotificationType: Array<{label: string; value: string}> = [
    { label: 'Email', value: 'EMAIL' },
    { label: 'System', value: 'UI' },
]

export const NotificationPriority: Array<{label: string; value: string}> = [
    { label: 'Low', value: 'LOW' },
    { label: 'Medium', value: 'MEDIUM' },
    { label: 'High', value: 'HIGH' }
]

export const EmailRecipientsTypes = [
    { label: 'Role', value: 'ROLE'},
    { label: 'User', value: 'USER'},
]

export const RepeatSegmentList = [
    { label: 'None', value: 'NONE' },
    { label: 'Hourly', value: 'HOURS' },
    { label: 'Daily', value: 'DAYS' },
    { label: 'Weekly', value: 'WEEKS' },
    { label: 'Monthly', value: 'MONTHS' },
    { label: 'Yearly', value: 'YEARS' },
];

export const StartList = [
    { label: 'Before 1 hour', value: 'beforeHour' },
    { label: 'Before 1 day', value: 'beforeDay'},
    { label: 'Custom', value: 'custom'}
]

export const eventList = [
    { label: 'Create', value: 'CREATE' },
    { label: 'Change', value: 'CHANGE' },
    { label: 'Approve', value: 'APPROVE' },
    { label: 'Reject', value: 'REJECT' },
    { label: 'Activate', value: 'ACTIVATE' },
    { label: 'Deactivate', value: 'DEACTIVATE' },
    { label: 'Excel', value: 'EXCEL' },
    { label: 'Delete', value: 'DELETE' },
]

export class notifInfo {
    brid: string;
    priority: string;
    ruleType: string;
    eventName: string;
    notifyType: string;
    reminder: string;
    interval: string;
    isConfigurable: string;
    repeatCount: string;
    fieldArr: fieldValue[];
    reciptients: [];
    templateId: string;
    jobId: string;
    udrId: string;
    startTime: string;
    endTime: string;
    isFormValid: boolean;
    when?: any;
    objectType?: any;
    udrData?: any;
    intervalData?: any;
    urdId?: any;
    uuid?: string;
}

export interface DateRepeatEvent {
    formValue: RepeatFormValue
    isFormValid: boolean
}

export interface RepeatFormValue {
    customDate: string;
    ends: string;
    every: string;
    occurrence: string;
    occurrenceDate: string;
    repeat: string;
    repeatLabel: string;
    repeatMonthDay: string;
    repeatOnWeek: string;
    starts: string;
}

export interface DatePatchValue {
    isFormSaved?: boolean;
    date?: string;
    dateRepeat?: any;
    isUpdated?: boolean;
}

export interface EmailFieldData {
    isFormSaved?: boolean;
    emailFieldIds?: emailFieldIDs[]
    isUpdated?: boolean;
}

export interface emailFieldIDs {
    fieldId: ''
}

export interface EventFieldData {
    isFormSaved?: boolean;
    event?: any;
    isUpdated?: boolean;
}

export interface fieldValue {
    fieldId: string,
    oldValue?: string,
    newValue?: string,
    anyValue?: string
}

export interface FieldValueData {
    isFormSaved?: boolean;
    event?: string;
    isUpdated?: boolean;
    fieldValues?: fieldValue[]
}