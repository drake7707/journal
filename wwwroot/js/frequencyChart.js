var FrequencyChart;
(function (FrequencyChart) {
    function loadFrequencyChart(items) {
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var to = new Date(items[0].day);
        var from = new Date(items[items.length - 1].day);
        if (to.getTime() < from.getTime()) {
            items = items.slice().reverse(); // make sure to take a copy
            var tmp = from;
            from = to;
            to = tmp;
        }
        var xAxisValues = getXAxisValues(from, to, months);
        var seriesData = [];
        for (var i = 0; i < xAxisValues.length; i++)
            seriesData.push(0);
        for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
            var item = items_1[_i];
            var date = new Date(item.day);
            var idx = monthDiff(from, date);
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
                min: 0
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
            colors: ["#00d1b2"],
            series: [
                {
                    name: "Occurences over time",
                    type: 'column',
                    data: seriesData
                }
            ],
        });
    }
    FrequencyChart.loadFrequencyChart = loadFrequencyChart;
    function getXAxisValues(from, to, months) {
        var xAxisValues = [];
        if (from.getFullYear() == to.getFullYear()) {
            for (var month = from.getMonth(); month <= to.getMonth(); month++) {
                xAxisValues.push(months[month] + " " + from.getFullYear());
            }
        }
        else {
            for (var month = from.getMonth(); month < 12; month++) {
                xAxisValues.push(months[month] + " " + from.getFullYear());
            }
            for (var year = from.getFullYear() + 1; year < to.getFullYear(); year++) {
                for (var month = 0; month < 12; month++) {
                    xAxisValues.push(months[month] + " " + year);
                }
            }
            for (var month = 0; month <= to.getMonth(); month++) {
                xAxisValues.push(months[month] + " " + to.getFullYear());
            }
        }
        return xAxisValues;
    }
    function monthDiff(d1, d2) {
        var months;
        months = (d2.getFullYear() - d1.getFullYear()) * 12;
        months -= d1.getMonth();
        months += d2.getMonth();
        return months <= 0 ? 0 : months;
    }
})(FrequencyChart || (FrequencyChart = {}));
