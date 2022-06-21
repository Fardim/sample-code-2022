import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { SchemaExecutionProgressResponse } from '@models/schema/schema-execution';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { SchemaService } from '@services/home/schema.service';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'pros-schema-progress',
  templateUrl: './schema-progress.component.html',
  styleUrls: ['./schema-progress.component.scss']
})
export class SchemaProgressComponent implements OnInit, OnChanges, OnDestroy {

  /**
   * Loading state for schema progress http request
   */
  isLoading: boolean;

  /**
   * To hold schema ID
   */
  @Input() schemaId: string;

  /**
   * To indicate if is is file upload progress
   */
  @Input() isFileUploading: boolean;

  /**
   * To indicate file is completed or stopped
   */
   @Output() fileUploaded = new EventEmitter<any>();

   /**
    * To indicate schema run is completed or stopped
    */
   @Output() runCompleted = new EventEmitter<any>();

  /**
   * To hold execution current status
   */
  schemaProgress: SchemaExecutionProgressResponse;

  /**
   * To hold file upload percent
   */
  dataUploadedPercent: any;

  /**
   * To hold all subscriptions of services
   */
  subscription: Subscription[] = [];

  pollingInterval: ReturnType<typeof setInterval>;

  progressHttpCallInterval = 15000;

  /**
   * Show the spinner based on this flag
   */
  isInLoading = false;

  /**
   * Hold error message while cancle the schema
   */
  errorMessage: string;

  /**
   * Constructor of class
   * @param schemaService: Instace of schema service
   */
  constructor(
      private schemaService: SchemaService,
      private schemaDetailsService: SchemaDetailsService,
      private sharedService: SharedServiceService) { }

  /**
   * ANGULAR HOOK
   */
  ngOnInit(): void {
    this.schemaExecutionProgressInfo(this.schemaId);
    if (this.isFileUploading) {
      this.progressHttpCallInterval = 3000;
    }
    this.pollingInterval =  setInterval(() => this.schemaExecutionProgressInfo(this.schemaId), this.progressHttpCallInterval);
  }

  /**
   * ANGULAR HOOK
   * Called before any other lifecycle hook.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes.schemaId && changes.schemaId.previousValue !== changes.schemaId.currentValue) {
      this.schemaId = changes.schemaId.currentValue;
      this.schemaExecutionProgressInfo(this.schemaId);
    }
  }

  /**
   * Function to get schema execution progress information
   * @param schemaId: schema id
   */
  schemaExecutionProgressInfo(schemaId: string) {
    if (this.isFileUploading) {
      this.getFileUploadProgress(schemaId);
    } else {
      // Preventing another http request untill the previous request is in progress
      if(!this.isLoading) {
        this.isLoading = true;
        const execSubscription = this.schemaService.getSchemaExecutionProgressDetails(schemaId).subscribe(response => {
          this.schemaProgress = response;
          this.isLoading = false;
          if (response?.percentage >= 100) {
            this.runCompleted.emit(response);
            this.sharedService.completeSchemaRunning();
          }
        }, (error) => {
          this.isLoading = false;
          console.log(`Something went wrong while getting schema execution progress, ${error.message}`);
        });
        this.subscription.push(execSubscription);
      }
    }
  }

  /**
   * Gets file upload progress
   * @param schemaId schema id
   */
  getFileUploadProgress(schemaId: string) {
    const subs = this.schemaDetailsService.getUploadProgressPercent(schemaId, '').subscribe((res: any) => {
      if (res) {
        this.dataUploadedPercent = res;
        if (this.dataUploadedPercent === 100) {
          setTimeout(() => {
            this.closeFileUploadProgress('File uploaded successfully');
          }, 2000);
        }
      }
    }, error => {
      console.error(`Error:: ${error.message}`);
      this.closeFileUploadProgress('Unable to upload file');
    });
    this.subscription.push(subs);
  }

  /**
   * Passes message to parent
   * @param msg optional message
   */
  closeFileUploadProgress(msg?) {
    this.fileUploaded.emit(msg);

    return true;
  }


  /**
   * ANGULAR HOOK
   * Called once, before the instance is destroyed.
   */
  ngOnDestroy(): void {
    this.subscription.forEach((sub) => {
      sub.unsubscribe();
    });
    clearInterval(this.pollingInterval);
  }

  /**
   * Cancle the schema and emit to go for details
   */
  cancleSchema() {
    this.isInLoading = true;
    const sub = this.schemaService.cancleSchema(this.schemaId).subscribe(res=>{
      this.runCompleted.emit(res);
      this.sharedService.refresSchemaListTrigger.next(true);
      this.isInLoading = false;
    }, err=>{
      this.isInLoading = false;
      console.error(`Error : ${err.mesage}`);
      this.errorMessage = `${err.message}`;
    });
    this.subscription.push(sub);
  }

}
