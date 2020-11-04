var TagCloudChart;
(function (TagCloudChart) {
    function loadTagCloudChart(container, tagFrequency) {
        var chart = Highcharts.chart('tagCloud', {
            series: [{
                    type: 'wordcloud',
                    data: Object.keys(tagFrequency).map(function (t) {
                        return { name: t, weight: Math.log(tagFrequency[t] + 1) };
                    }),
                    colors: ['#00d1b2']
                }],
            plotOptions: {
                wordcloud: {
                    allowPointSelect: true,
                    point: {
                        events: {
                            click: function () {
                                var win = window.open("/tag?tag=" + this.name, '_blank');
                                win.focus();
                            }
                        }
                    }
                },
                series: {
                    animation: false
                }
            },
            chart: {
                animation: false
            },
            tooltip: {
                pointFormatter: function () {
                    return "Used " + Math.round(Math.exp(this.weight)) + " times";
                }
            },
            credits: {
                enabled: false
            },
            title: {
                text: null
            },
            subtitle: {
                text: null
            },
        });
        return chart;
    }
    TagCloudChart.loadTagCloudChart = loadTagCloudChart;
})(TagCloudChart || (TagCloudChart = {}));
