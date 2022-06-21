import { Component, OnInit } from '@angular/core';
import { ChartDataset, ChartOptions, ChartType } from 'chart.js';
// import { Label } from 'ng2-charts';

@Component({
  selector: 'pros-execution-result',
  templateUrl: './execution-result.component.html',
  styleUrls: ['./execution-result.component.scss']
})
export class ExecutionResultComponent implements OnInit {

  barChartLabels: string[] = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
  barChartType: ChartType = 'bar';
  barChartLegend = true;
  barChartPlugins = [];

  barChartData: ChartDataset[] = [
    {
      data: [100,59, 80, 81, 56, 55, 40], label: 'Error', stack : 'a' ,
      barThickness: 50,
      barPercentage: 0.5,
      type:this.barChartType
      // backgroundColor: 'rgba(255,255,0,0.28)',

    },
    {
      data: [28, 48, 40, 19, 86, 27, 90], label: 'Success', stack:'a' ,
      barThickness: 50,
      barPercentage: 0.5,
      type:this.barChartType
    },
    {
      data: [28, 48, 40, 19, 86, 27, 90], label: 'Warning', stack:'a',
      barThickness: 50,
      barPercentage: 0.5,
      type:this.barChartType
    }
  ];

  barChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins:{
        tooltip:{
            backgroundColor: 'rgba(255,255,255,0.9)',
            bodyColor:'#999',
            borderColor: '#999',
            borderWidth: 1,
            caretPadding: 15,
            displayColors: true,
            enabled: true,
            intersect: true,
            mode: 'x',
            titleColor: '#999',
            titleMarginBottom: 10,
            padding:15
         },

        legend: {
          position: 'bottom',
          labels: {
            font:{
                size:12
            },
            usePointStyle: false,
            boxWidth: 30,
          }
        }
    }


  };

  constructor() { }

  ngOnInit(): void {
  }

}
