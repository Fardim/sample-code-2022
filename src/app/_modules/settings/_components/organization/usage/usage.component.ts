

import { Component, Inject, LOCALE_ID, OnDestroy, OnInit } from '@angular/core';
import { ModuleDetailsResponse } from '@models/core/module-details.response.model';
import { CoreSchemaBrInfo } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { CoreService } from '@services/core/core.service';
import { OrganizationManagementService } from '@services/organization-management.service';
import { RuleService } from '@services/rule/rule.service';
import { ChartDataset, ChartOptions } from 'chart.js';
import { Observable, Subject, zip } from 'rxjs';
import { map, tap } from 'rxjs/operators';
@Component({
  selector: 'pros-usage',
  templateUrl: './usage.component.html',
  styleUrls: ['./usage.component.scss'],
})
export class UsageComponent implements OnInit, OnDestroy {

  // !------------------------DUMMY: No implementation on backend yet --------------------------------
  showInfoBanner = true;
  bannerInfoMsg = 'Usage data last updated in 29.10.2020. Calculating current usage...';
  // !------------------------------------------------------------------------------------------------

  private dataSets: Subject<ModuleDetailsResponse[]> = new Subject();
  private dataSetSizes: Subject<{ postgres: string, indices: { dataSetName: string, size: string }[] }> = new Subject();
  dataSetSizes$ = this.dataSetSizes.asObservable();
  // Column config for Index details table
  dataSetUsageColumns: string[] = ['dataSetName', 'size'];
  dataUOM = ''

  roleCounts$ = this.orgManagementService.getRoleNamesWithCount();
  // column config for user role details table
  roleCountColumns = ['roleName', 'countOfUsers'];
  showSkeleton = true;

  private businessRulesMetadata: Subject<CoreSchemaBrInfo[]> = new Subject();
  businessRulesDetails$ = zip(this.businessRulesMetadata, this.dataSets).pipe(
    map(([businessRulesMetadata, dataSets]) => businessRulesMetadata.map(businessRuleMetadata => {
      return {
        ruleName: businessRuleMetadata.brInfo,
        dataset: dataSets.find(dataSet => businessRuleMetadata.moduleId === dataSet.moduleId.toString())?.moduleDescriptionRequestDTO.description,
        // ! runCount API missing or unknown
        runCount: 'N/A'
      }
    })
    )
  );
  displayedBusinessRulesExecutedColumns = ['ruleName', 'dataset', 'runCount'];

  // Pie Chart config: START
  public pieChartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.chart.data.labels[ctx.dataIndex]}:${ctx.dataset.data[ctx.dataIndex]} Bytes`
        }
      },
    },
  };
  pieChartLabels$: Observable<string[]>;
  pieChartDataSets$: Observable<ChartDataset[]> = this.dataSetSizes.pipe(
    map(
      dataSetSize => {
        const MIN_BRIGHTNESS = 150;
        const MAX_BRIGHTNESS_INCREMENT = 100;
        return [{
          data: dataSetSize.indices.map(index => parseInt(index.size.trim().split(' ')[0] ?? '0', 10)),
          borderAlign: 'center',
          backgroundColor: dataSetSize.indices.map(
            () => `rgb(${Math.floor(MIN_BRIGHTNESS + Math.random() * MAX_BRIGHTNESS_INCREMENT)},${Math.floor(MIN_BRIGHTNESS + Math.random() * MAX_BRIGHTNESS_INCREMENT)},${Math.floor(MIN_BRIGHTNESS + Math.random() * MAX_BRIGHTNESS_INCREMENT)}`
          ),
        }]
      }
    )
  )
  // Pie chart config: END

  // Component Initialization
  constructor(
    private orgManagementService: OrganizationManagementService,
    private coreService: CoreService,
    @Inject(LOCALE_ID) private locale,
    private businessRulesService: RuleService
  ) { }
  ngOnInit() {
    this.coreService.getAllModulesByLanguageAndDescription({ lang: this.locale?.split('-')[0], description: '' }).subscribe(this.dataSets)
    zip(this.dataSets.asObservable(), this.orgManagementService.getSchemaSpaces())
      .pipe(
        map(([dataSets, schemaSpaces]) => {
          return {
            postgres: schemaSpaces.postgres,
            indices: schemaSpaces.indices.map(
              index => {
                return {
                  dataSetName: dataSets.find(dataset => dataset.moduleId === parseInt(index.moduleId, 10))?.moduleDescriptionRequestDTO.description,
                  size: index.size
                }
              }
            )
          }
        }),
        tap(response => this.dataUOM = response.postgres),
        tap(response => this.showSkeleton = false),
      ).subscribe(this.dataSetSizes);
    this.pieChartLabels$ = this.dataSetSizes.pipe(map(datasetSize => datasetSize.indices.map(index => index.dataSetName)));
    this.businessRulesService.getAllBusinessRulesMetadata().subscribe(this.businessRulesMetadata);
  }


  // Cleanup
  ngOnDestroy() { }
}
