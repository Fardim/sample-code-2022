import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { WidgetService } from '@services/widgets/widget.service';
import { BehaviorSubject } from 'rxjs';
import { LayoutTabResponse, MDORECORDESV3 } from '@modules/report/_models/widget';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '@services/user/userservice.service';
import { distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'pros-summary-layout',
  templateUrl: './summary-layout.component.html',
  styleUrls: ['./summary-layout.component.scss']
})
export class SummaryLayoutComponent implements OnInit {

  widgetId: string;
  objectNumber: string;
  layoutData:MDORECORDESV3;
  layoutMetadata: BehaviorSubject<LayoutTabResponse[]> = new BehaviorSubject<LayoutTabResponse[]>(null);

  /**
   * current selected layout.. id
   */
  layoutId: string;

  constructor(
    private router: Router,
    private activatedRouter: ActivatedRoute,
    private widgetService:WidgetService,
    private snackbar: MatSnackBar,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.activatedRouter.params.subscribe(param => {
      this.widgetId = param.widgetId;
      this.objectNumber = param.objectNumber;
      this.layoutId = param.layoutId ? param.layoutId : '';
      console.log(this.widgetId,this.objectNumber);
    });
     this.getLayoutMetadata(this.widgetId,this.objectNumber, this.layoutId);
      this.layoutMetadata.subscribe(data=>{
        if(data){
           this.getlayoutData(this.widgetId,this.objectNumber);
        }
      })
  }

  close() {
    this.router.navigate([{ outlets: { sb: null } }]);
  }

/**
 * Method to get layout metadata based on widgetId and objectNumber
 */

  getLayoutMetadata(widgetId:string,objectNumber:string, layoutId: string):void{
    this.userService.getUserDetails().pipe(distinctUntilChanged()).subscribe(user=>{
      this.widgetService.getLayoutMetadata(widgetId,objectNumber, layoutId, user.currentRoleId).subscribe(data=>{
        console.log(data);
        this.layoutMetadata.next(data);
      },error => {
        this.snackbar.open(`Something went wrong`, 'Close', { duration: 5000 });
        this.router.navigate([{ outlets: { sb: null } }]);
      })
    });
  }

  /**
   * Method to get layout data based on widgetId and objectNumber
   */

  getlayoutData(widgetId:string,objectNumber:string):void{
    this.widgetService.getlayoutData(widgetId,objectNumber).subscribe(data=>{
      this.layoutData = data;
      console.log(this.layoutData);
    },error=>console.error(`Error : ${error}`));
  }

}
