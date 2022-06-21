export interface SchemaScheduler {
    schedulerId: number;
    isEnable: boolean;
    schemaId: string;
    schemaSchedulerRepeat: SchemaSchedulerRepeat;
    repeatValue: string;
    weeklyOn: WeekOn;
    monthOn: MonthOn;
    startOn: string;
    end: SchemaSchedulerEnd;
    occurrenceVal: number;
    endOn: string;
}
export enum SchemaSchedulerRepeat {
    NONE = 'NONE',
    HOURLY = 'HOURLY',
    DAILY = 'DAILY',
    WEEKLY = 'WEEKLY',
    MONTHLY = 'MONTHLY',
    YEARLY = 'YEARLY',
}
export enum SchemaSchedulerRepeatMetric {
    HOURLY = 'Hours',
    DAILY = 'Days',
    WEEKLY = 'Weeks',
    MONTHLY = 'Months',
    YEARLY = 'Years'
}
export enum SchemaSchedulerEnd {
    NEVER = 'NEVER',
    AFTER = 'AFTER',
    ON = 'ON'
}
export enum MonthOn {
    DAY_OF_MONTH = 'DAY OF MONTH',
    DAY_OF_WEEK = 'DAY OF WEEK'
}
export enum WeekOn {
    MONDAY = 'MONDAY',
    TUESDAY = 'TUESDAY',
    WEDNESDAY = 'WEDNESDAY',
    THURSDAY = 'THURSDAY',
    FRIDAY = 'FRIDAY',
    SATURDAY = 'SATURDAY',
    SUNDAY = 'SUNDAY',
}