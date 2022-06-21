import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { TransientService } from 'mdo-ui-library';

export enum ErrorStatusForDiw {
  ES_CONN_ISSUE = 'ES_CONN_ISSUE',
  ES_SHARDS = 'ES_SHARDS',
  ES_HEALTH = 'ES_HEALTH',
  ES_TIMEOUT = 'ES_TIMEOUT',
  RMQ_NOT_FOUND = 'RMQ_NOT_FOUND',
  RMQ_STUCK = 'RMQ_STUCK',
  RMQ_TIMEOUT = 'RMQ_TIMEOUT',
  INVALID_DATA = 'INVALID_DATA'
}

@Component({
  selector: 'pros-error-state',
  templateUrl: './error-state.component.html',
  styleUrls: ['./error-state.component.scss']
})
export class ErrorStateComponent implements OnChanges {

  /**
   * Pass the custom icon path to show on the null state
   */
   @Input()
   iconPath = './assets/images/error-state.svg';

   /**
    * configuration for icon width
    */
   @Input()
   iconWidth = 140;


   /**
    * The HTML element which will be insert into lib-text
    */
   @Input()
   htmltext = '<p>Error</p>';

   /**
    *
    */
   @Input()
   errorCode: ErrorStatusForDiw;

   /**
    * The queues which are not there need to craete ....
    */
   @Input()
   queues: string[] = [];


   /**
    * Schema id to execute the schema ...
    */
   @Input()
   schemaId: string;

   /**
    * Datascope id ...
    */
   @Input()
   variantId: string;

   /**
    * After run notify the parent componenet ....
    */
   @Output()
   hasScheduled: EventEmitter<string> = new EventEmitter<string>();

   constructor(
     private transientservice: TransientService,
     private schemaDetails: SchemaDetailsService,
     private sharedService: SharedServiceService
   ) { }

    ngOnChanges(changes: SimpleChanges): void {
      if(changes.errorCode && changes.errorCode.previousValue !== changes.errorCode.currentValue) {
        this.errorCode = (changes.errorCode.currentValue ? changes.errorCode.currentValue : '').toUpperCase();
      }
    }


    /**
     * Create the queue and run the schema based on the parameter ....
     * @returns if having queues ... just execute that and return it ..
     */
    createQueueAndRerunSchema() {
      if(Array.isArray(this.queues) && this.queues.length>0) {
        this.schemaDetails.createQueueAndRunSchema(this.queues, this.schemaId, this.variantId, false).subscribe(res=>{
          console.log(`schema scheduled !!!`);
          this.hasScheduled.emit(res);
          this.sharedService.setSchemaRunNotif(true);
        }, err=>{
          console.error(`Error : ${err?.error?.message}`);
        });
        return;
      }
      this.transientservice.open(`Oops , somethings not good`);

    }

}
