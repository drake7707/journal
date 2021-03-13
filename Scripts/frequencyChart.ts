
namespace FrequencyChart {

    interface Item {
        day: string;
    }
    export function loadFrequencyChart(items:Item[]) {

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        let to = new Date(items[0].day);
        let from = new Date(items[items.length - 1].day);
        if (to.getTime() < from.getTime()) {
            items = [...items].reverse(); // make sure to take a copy
            const tmp = from;
            from = to;
            to = tmp;
        }
        const xAxisValues = getXAxisValues(from, to, months);

        let seriesData: number[] = [];
        for (var i = 0; i < xAxisValues.length; i++)
            seriesData.push(0);

        for (let item of items) {
            let date = new Date(item.day);
            let idx = monthDiff(from, date);
            seriesData[idx]++;
        }
        Highcharts.chart('frequencyChart', {
            chart: {
                type: 'line',
                zoomType: "x",
            },
            title: {
                text: ''
            },
            subtitle: {
                text: ''
            },
            xAxis: {
                categories: xAxisValues
            },
            yAxis: {
                title: {
                    text: null
                },
                labels: {
                    enabled: false
                },
                gridLineWidth: 0,
                min:0
            },
            credits: {
                enabled: false
            },
            legend: {
                enabled: false
            },
            plotOptions: {
                column: {
                    stacking: 'normal',
                }
            },
            colors: [ "#00d1b2" ],
            series: [
                {
                    name: "Occurences over time",
                    type: 'column',
                    data: seriesData
                }
            ],
        });
    }


    function getXAxisValues(from, to, months) {
        var xAxisValues = [];
        if (from.getFullYear() == to.getFullYear()) {
            for (let month = from.getMonth(); month <= to.getMonth(); month++) {
                xAxisValues.push(months[month] + " " + from.getFullYear());
            }
        }
        else {
            for (let month = from.getMonth(); month < 12; month++) {
                xAxisValues.push(months[month] + " " + from.getFullYear());
            }
            for (let year = from.getFullYear() + 1; year < to.getFullYear(); year++) {
                for (let month = 0; month < 12; month++) {
                    xAxisValues.push(months[month] + " " + year);
                }
            }
            for (let month = 0; month <= to.getMonth(); month++) {
                xAxisValues.push(months[month] + " " + to.getFullYear());
            }
        }
        return xAxisValues;
    }

    function monthDiff(d1: Date, d2: Date) {
        var months;
        months = (d2.getFullYear() - d1.getFullYear()) * 12;
        months -= d1.getMonth();
        months += d2.getMonth();
        return months <= 0 ? 0 : months;
    }

}