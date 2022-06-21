import { ComponentType } from '@angular/cdk/portal';
import { Component, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent, ConfirmationDialogReq } from '@modules/shared/_components/confirmation-dialog/confirmation-dialog.component';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GlobaldialogService {

  /**
   * Event Emitter to open dialog
   */
  dialogToggleEmitter: Subject<{}> = new Subject();

  /**
   * Event emitter to close dialog
   */
  dialogCloseEmitter: Subject<{}> = new Subject();

  /**
   * constuctor of class
   */
  constructor(
    private matDialog: MatDialog
  ) { }

  /**
   * Function to toggle the dialog
   * @param componentName name of component that needs to be opened
   * @param data Information that needs to be passed to the dialog component
   * @param state the state that needs to be acted upon
   */
  public openDialog(componentName, data: {}, config: any = null) {
    if (!componentName) {
      throw new Error('component name is required');
    }
    this.dialogToggleEmitter.next({
      componentName,
      data,
      config
    });
  }

  /**
   * Function to close modal and emit the status
   * @param data the value to send back to parent component
   */
  public closeModel(data) {
    this.dialogCloseEmitter.next(data);
  }

  public openCustomDialog(component: ComponentType<unknown>, dialogData, config: any = null) {
    const { disableClose, height, width, panelClass, hasBackdrop } = config || {};
    return this.matDialog.open(component, {
      data: dialogData,
      disableClose: !!disableClose,
      height: height || 'auto',
      width: width || '545px',
      panelClass: panelClass || 'create-master-panel',
      hasBackdrop: hasBackdrop || false
    });
  }


  /**
   * Use this function for confirmation dialog ..
   * @param data get request data for dialog uses ..
   * @param callBack callback function after dilog close ...
   */
  public confirm = (data: ConfirmationDialogReq, callBack : (resonse) => any, width?: string) => {
    this.createCallBackFun(callBack);
    const dialogCloseRef = this.matDialog.open(ConfirmationDialogComponent, {
      data,
      disableClose: true,
      height:'200px',
      width: width || '300px'
    });
    dialogCloseRef.afterClosed().subscribe(res=>{
      console.log(res);
      this.callBack(res);
    });
  };

  /**
   * Use for bind .. callback function
   * @param callBack call back function ..
   */
  createCallBackFun = (callBack) =>{
    this.callBack = callBack.bind();
  };

  /**
   * Actual callback function for return data ...
   * @param res actual response
   */
  callBack = (res) =>{
    return res;
  };
}
