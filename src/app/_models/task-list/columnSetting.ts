import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';

export interface TaskListViewObject {
    userCreated?: string;
    plantCode?: string;
    viewId?: string;
    viewName: string;
    fieldId: Array<string>;
    default: boolean;
    active?: boolean;
    fields: Array<{
        fieldId: string,
        order: number
    }>
}

export interface DropEvent {
    container: CdkDropList,
    currentIndex: number,
    distance: { x: number, y: number }
    isPointerOverContainer: boolean,
    item: CdkDrag,
    previousContainer: CdkDropList
    previousIndex: number
}