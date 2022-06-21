
import { Chart } from 'chart.js';
import { Options } from './index';

/*
Source:
https://stackoverflow.com/questions/47826483/how-to-display-data-labels-outside-in-pie-chart-with-lines-in-ionic
https://codesandbox.io/s/wispy-bash-nt7ty?file=/src/Chart.js:1300-1334
*/

const getSuitableY = (y: number, yArray: number[] = [], direction: 'right' | 'left') => {
    let result = y;
    yArray.forEach((existedY) => {
        // if (existedY - 14 < result && existedY + 14 > result) {
        // if (direction === "right") {
        result = existedY + 20;
        //     } else {
        //         result = existedY - 14;
        //     }
        // }
    });

    return result;
};

/**
 * Custom plugin for PIE chart showing datalabels outside with lines/arrows
 */
export const OutsideLabelsPlugin: any = {
    id: 'piechartLabels',
    afterDatasetDraw: (chart: Chart, args, options: Options) => {
        const ctx = chart.ctx;
        ctx.save();
        if (options && !options.display) {
            return;
        }
        ctx.font = '12px \'Lato,sans-serif\'';
        const leftLabelCoordinates = [];
        const rightLabelCoordinates = [];
        if (options.legendTop) {
            leftLabelCoordinates.push(options.legendTop);
            rightLabelCoordinates.push(options.legendTop);
        }
        const chartCenterPoint = {
            x:
                (chart.chartArea.right - chart.chartArea.left) / 2 +
                chart.chartArea.left,
            y:
                (chart.chartArea.bottom - chart.chartArea.top) / 2 +
                chart.chartArea.top
        };

        let total = 0;
        const dataset = chart.config.data.datasets[0];
        if (options.isEnabledBarPerc && dataset && dataset.data.length > 0) {
            total = Number((dataset.data as number[]).reduce((accumulator, currentValue) => accumulator + currentValue));
        }

        chart.config.data.labels.forEach((label, i) => {
            const meta = chart.getDatasetMeta(0);
            const arc = meta.data[i];

            // Prepare data to draw
            // important point 1
            const centerPoint = (arc as any).getCenterPoint();
            const model = arc as any;

            const angle = Math.atan2(
                centerPoint.y - chartCenterPoint.y,
                centerPoint.x - chartCenterPoint.x
            );
            // important point 2, this point overlapsed with existed points
            // so we will reduce y by 14 if it's on the right
            // or add by 14 if it's on the left
            const point2X =
                chartCenterPoint.x + Math.cos(angle) * (model.outerRadius + 15);
            let point2Y =
                chartCenterPoint.y + Math.sin(angle) * (model.outerRadius - 15);

            let suitableY;

            const position = point2X < chartCenterPoint.x ? 'left' : 'right';
            if (position === 'left') {
                // on the left
                suitableY = getSuitableY(14, leftLabelCoordinates, 'left');
            } else {
                // on the right
                suitableY = getSuitableY(14, rightLabelCoordinates, 'right');
            }

            point2Y = suitableY;
            let value: string = dataset.data[i].toString();
            if (total > 0) {
                value = (Number(value) * 100 / total).toFixed(2) + '%';
            }
            value = Number(parseFloat(value).toFixed()).toLocaleString();

            // if (dataset.polyline && dataset.polyline.formatter) {
            //   value = dataset.polyline.formatter(value);
            // }
            const edgePointX = point2X < chartCenterPoint.x ? 10 : chart.width - 10;

            if (point2X < chartCenterPoint.x) {
                leftLabelCoordinates.push(point2Y);
            } else {
                rightLabelCoordinates.push(point2Y);
            }
            // DRAW CODE
            // first line: connect between arc's center point and outside point
            ctx.strokeStyle = model.options.backgroundColor;
            ctx.beginPath();
            ctx.moveTo(centerPoint.x, centerPoint.y);
            ctx.lineTo(point2X, point2Y);
            ctx.stroke();
            // second line: connect between outside point and chart's edge
            ctx.beginPath();
            ctx.moveTo(point2X, point2Y);
            ctx.lineTo(edgePointX, point2Y);
            ctx.stroke();
            // fill custom label
            const labelAlignStyle = position;
            const labelX = edgePointX;
            const labelY = point2Y;
            ctx.textAlign = labelAlignStyle;
            ctx.textBaseline = 'bottom';

            ctx.fillStyle = '#666666';
            ctx.fillText(value, labelX, labelY);
        });
        ctx.restore();

        const rightHeight = rightLabelCoordinates.length * 20;
        const leftHeight = leftLabelCoordinates.length * 20;
        let greaterHeight = 0;
        if (leftHeight > rightHeight) {
            greaterHeight = leftHeight;
        } else {
            greaterHeight = rightHeight;
        }

        if (options.scrollHeight && greaterHeight > chart.height) {
            options.scrollHeight(greaterHeight - chart.height);
        } else {
            // options.scrollHeight(0);
        }
    }
};