import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { SchemaExecutionLog } from '@models/schema/schemadetailstable';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { ChartDataset, ChartOptions, ChartType, TimeUnit } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import * as moment from 'moment';
import { StatisticsFilterParams } from '@modules/schema/_components/v2/statics/statics.component';
import { UserService } from '@services/user/userservice.service';
import { distinctUntilChanged } from 'rxjs/operators';
import * as _ from 'lodash';

@Component({
    selector: 'pros-schema-execution-trend',
    templateUrl: './schema-execution-trend.component.html',
    styleUrls: ['./schema-execution-trend.component.scss']
})
export class SchemaExecutionTrendComponent implements OnInit, OnChanges {

    /**
     * To store module ID
     */
    @Input() readonly moduleId: string;

    /**
     * To store schema ID
     */
    @Input() readonly schemaId: string;

    /**
     * To store variant ID
     */
    @Input() variantId = '0';

    @Input()
    filter: StatisticsFilterParams;

    @ViewChild(BaseChartDirective) readonly chart: BaseChartDirective;

    dataSetLabels: string[] = [];
    chartType: ChartType = 'line';

    /**
     * Unit of execution trend ..
     * This will calculate based on execution output ..
     */
    @Input()
    unit: TimeUnit = 'day';

    @Input() hideLabel = false;
    dataSet: ChartDataset[] = [
        {
            data: [],
            tension: 0.4,
            label: 'Error',
            stack: 'a',
            fill: ' #ff6b6b',
            borderColor: ' #ff6b6b',
            backgroundColor: '#ff6b6b',
            /* lineTension: 0.1,
            backgroundColor: 'red',
            borderDash:[5],
            pointBorderColor: 'rgba(75,192,192,1)',
            pointBackgroundColor: '#fff',
            borderColor: 'orange',
            borderCapStyle: 'butt',
            borderJoinStyle: 'miter',
            pointBorderWidth: 0,
            pointHoverRadius: 0,
            pointHoverBackgroundColor: 'rgba(75,192,192,1)',
            pointHoverBorderColor: 'rgba(220,220,220,1)',
            pointHoverBorderWidth: 0,
            pointRadius: 0,
            pointHitRadius: 0, */
        },
        {
            data: [],
            tension: 0.4,
            label: 'Success',
            stack: 'a',
            fill: '#51cf67',
            borderColor: '#51cf67',
            borderDash: [2],
            backgroundColor: '#51cf67',
            pointBackgroundColor: '#51cf67',
            pointBorderColor: '#fff',


        }
    ];

    chartOptions: ChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Date'
                },
                grid: {
                    display: false,
                    color: 'rgba(255,255,255,0.1)',
                },
                ticks: {
                    color: '#000'
                },
                offset: true
            },
            y: {
                title: {
                    display: true,
                    text: 'Values',
                },
                ticks: {
                    color: '#000',
                },
                offset: true
            },
        },
        plugins: {
            zoom: {
                pan: {
                    enabled: true,
                    mode: 'x',
                    // speed: 10,
                    threshold: 10,
                    onPan() { console.log('I am pan ...!'); },
                    onPanComplete() { console.log('On pan Complete !'); }
                },
                zoom: {
                    wheel: {
                        enabled: false,
                    },
                    pinch: {
                        enabled: false
                    },
                    // grag: true,
                    mode: 'x',
                    /*limits: {max: 10, min: 0.5}, */
                    onZoom() { console.log('ONZOOM'); },
                    onZoomComplete() { console.log('ZOOM Complete'); }
                }
            },
            legend: {
                position: 'bottom',
                labels: {
                    // fontSize: 12,
                    usePointStyle: false,
                    boxWidth: 30
                }
            },
            tooltip: {
                backgroundColor: 'rgba(255,255,255,0.9)',
                bodyColor: '#999',
                titleColor: '#999',
                borderColor: '#999',
                borderWidth: 1,
                caretPadding: 15,
                displayColors: true,
                titleMarginBottom: 10,
                mode: 'index',
                intersect: false
            },
        }
    };

    /**
     * mock data for preparing chart
     */
    data: SchemaExecutionLog[] = [];


    /**
     * constructor of class
     */
    constructor(
        private schemaDetailsService: SchemaDetailsService,
        private userDetailsService: UserService
    ) { }


    ngOnChanges(changes: SimpleChanges): void {
        if (changes.unit && changes.unit.previousValue !== changes.unit.currentValue && this.chart) {
            this.unit = changes.unit.currentValue;
            this.chart.chart.options = this.chartOptions;
            this.chart.chart.update();
        }

        if ((changes.schemaId && changes.schemaId.currentValue !== changes.schemaId.previousValue) ||
            (changes.variantId && changes.variantId.currentValue !== changes.variantId.previousValue) ||
            (changes.filter && changes.filter.previousValue !== changes.filter.currentValue)) {
            this.filter = changes.filter.currentValue;
            if (!this.variantId) {
                this.variantId = this.filter && this.filter._data_scope ? this.filter._data_scope.variantId : this.variantId;
            }
            this.dataSetLabels = [];
            this.dataSet.forEach(d => {
                d.data = [];
            })
            this.getExecutionTrendData(this.schemaId, this.variantId);
        }
    }

    /**
     * ANGULAR HOOK
     */
    ngOnInit(): void {

    }

    /**
     * Function to get execution trend data
     * @param schemaId: schema id
     * @param variantId: variant id
     */
    getExecutionTrendData(schemaId: string, variantId: string) {
        this.userDetailsService.getUserDetails().pipe(distinctUntilChanged()).subscribe(user => {
            this.schemaDetailsService.getSchemaExecutedStatsTrend(schemaId, variantId, user.plantCode, this.filter)
                .subscribe((response) => {
                    this.data = response;
                    this.prepareDataSet(this.data);
                }, (error) => {
                    console.log('Something went wrong while getting exec trend data.', error.message)
                })
        });

    }

    /**
     * Function to prepare data set
     * @param rawData: sorted trend data according to exec start date
     */
    prepareDataSet(rawData: SchemaExecutionLog[]) {

        const errorDataSet = [];
        const successDataSet = [];

        let finalExecution = {};

        this.dataSetLabels = [];
        this.dataSet.forEach(d => { d.data = []; });

        switch (this.unit) {
            case 'day':
                finalExecution = _.groupBy(rawData, (data) => {
                    return moment(data.exeStrtDate).endOf('day').toDate().getTime();
                });
                break;
            case 'week':
                finalExecution = _.groupBy(rawData, (data) => {
                    return moment(data.exeStrtDate).endOf('week').toDate().getTime();
                });
                break;
            case 'month':
                finalExecution = _.groupBy(rawData, (data) => {
                    return moment(data.exeStrtDate).endOf('month').toDate().getTime();
                });
                break;

            case 'year':
                finalExecution = _.groupBy(rawData, (data) => {
                    return moment(data.exeStrtDate).endOf('year').toDate().getTime();
                });
                break;

            default:
                break;
        }

        Object.keys(finalExecution).forEach(exeDate => {
            const details: SchemaExecutionLog[] = finalExecution[exeDate];

            // last execution for this period of time ..
            const lastExe = details[details.length - 1];
            const exeStrtdate = moment.unix(lastExe.exeStrtDate ? lastExe.exeStrtDate / 1000 : 0).format('DD-MMM-YYYY');
            this.dataSetLabels.push(exeStrtdate);
            errorDataSet.push(lastExe.totalError);
            successDataSet.push(lastExe.totalSuccess);
        });

        this.dataSet[0].data = errorDataSet;
        this.dataSet[0].type = this.chartType;
        this.dataSet[1].data = successDataSet;
        this.dataSet[1].type = this.chartType;
    }
}
