
export interface JobQueue {
    endTime: string;
    jobId: string;
    jobName: string;
    startTime: string;
    status: string;
    userName: string;
    enableCancel?: boolean;
    responseData: string;
}
