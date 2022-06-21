import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { GlobalCounts } from '@models/schema/schemadetailstable';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { SchemaService } from '@services/home/schema.service';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'pros-global-count',
  templateUrl: './global-count.component.html',
  styleUrls: ['./global-count.component.scss'],
})
export class GlobalCountComponent implements OnInit, OnDestroy, OnChanges {
  globalCount: GlobalCounts = {
    successCount: 0,
    errorCount: 0,
    skippedCount: 0,
  };

  // selected schemaId
  @Input() schemaId: string;
  subscriptions: Array<Subscription> = [];

  constructor(private schemaService: SchemaService, private sharedService: SharedServiceService) {}

  ngOnInit() {
    this.subscriptions.push(
      this.sharedService.updateGlobalCounts.pipe(debounceTime(100)).subscribe(() => {
        this.getGlobalCounts();
      }),

      this.sharedService.getSchemaRunNotif().subscribe(() => {
        this.getGlobalCounts();
      })
    );
  }

  ngOnChanges(simpleChanges: SimpleChanges): void {
    // get latest count on schema changes
    if (simpleChanges && simpleChanges.schemaId.currentValue) {
      // Refresh Global counts
      this.sharedService.updateGlobalCounts.next(true);
    }
  }

  getGlobalCounts() {
    this.subscriptions.push(
      this.schemaService.getSchemaGlobalCounts(this.schemaId).subscribe(
        (res: GlobalCounts) => {
          this.globalCount = res;
        },
        (error) => {
          console.error(`Error : ${error.message}`);
        }
      )
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
