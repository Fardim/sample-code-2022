import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SchemaListDetails, SchemaVariantsModel, VarinatType } from '@models/schema/schemalist';
import { SchemalistService } from '@services/home/schema/schemalist.service';
import { StatisticsFilterParams } from '../../statics/statics.component';
import * as moment from 'moment';
import { CoreService } from '@services/core/core.service';

@Component({
  selector: 'pros-execution-trend-sidesheet',
  templateUrl: './execution-trend-sidesheet.component.html',
  styleUrls: ['./execution-trend-sidesheet.component.scss']
})
export class ExecutionTrendSidesheetComponent implements OnInit {

  moduleId: string;

  schemaId: string;

  variantId: string;

  /**
   * Current schema info ..
   */
  schemaInfo: SchemaListDetails;

  /**
   * Filter params ...
   */
  statsFilterParams: StatisticsFilterParams;


  constructor(private router: Router,
    private activatedRoute: ActivatedRoute,
    private schemaListService: SchemalistService,
    private coreService: CoreService
    ) { }

  ngOnInit(): void {
    this.statsFilterParams = {unit: 'day', exe_end_date: String(moment().endOf('day').toDate().getTime()), exe_start_date : String(moment().startOf('month').toDate().getTime()),_date_filter_type:'this_month', _data_scope: {variantId:'0',variantName:'Entire data scope', variantType: VarinatType.RUNFOR} as SchemaVariantsModel};
    this.activatedRoute.params.subscribe(params => {
      this.moduleId = params.moduleId;
      this.schemaId = params.schemaId;
      this.variantId = params.variantId;

      this.getSchemaDetails();
    });
  }

  /**
   * Get schema info ..
   */
  getSchemaDetails() {
    this.schemaListService.getSchemaDetailsBySchemaId(this.schemaId).subscribe(res => {
      this.schemaInfo = res;
      this.getModuleInfo();
    }, error => console.error(`Error : ${error.message}`))
  }

  /**
   * Get module info ..
   */
  getModuleInfo() {
    this.coreService.searchAllObjectType({lang: 'en',fetchsize: 1,fetchcount: 0,description: ''},[this.moduleId]).subscribe((moduleData) => {
      const module = moduleData[0];
      if (module) {
       Object.assign(this.schemaInfo, module);
      }
    }, error => {
      console.error('Error: {}', error.message);
    });
  }

  close() {
    this.router.navigate([{ outlets: { sb: null } }], {queryParamsHandling: 'preserve'});
  }

}
