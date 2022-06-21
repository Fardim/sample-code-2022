import { Component, Input, OnInit } from '@angular/core';

export type PercentageBarData = Array<{
    color: string;
    value: number;
    label?: string;
}>;
@Component({
    selector: 'pros-percentage-bar',
    styleUrls: ['./percentage-bar.component.scss'],
    templateUrl: './percentage-bar.component.html'
})
export class PercentageBarComponent implements OnInit {
    @Input() data:PercentageBarData = [];
    constructor() { }
    ngOnInit() { }
}