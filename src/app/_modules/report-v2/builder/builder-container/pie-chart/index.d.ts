import { LegendPosition } from "@modules/report-v2/_models/widget";

export interface Options {
    display: boolean;
    isEnabledBarPerc: boolean;
    legendPosition: LegendPosition;
    /**
     * Allow for padding on top for labels
     */
    legendTop?: number;
    scrollHeight: (value: number) => void,
    formatter: (value: number) => string
}

declare module 'chart.js' {
    interface ChartDatasetProperties<TType extends ChartType, TData> {
        piechartLabels?: Options;
    }

    interface PluginOptionsByType<TType extends ChartType> {
        piechartLabels?: Options;
    }
}