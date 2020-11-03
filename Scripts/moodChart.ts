
namespace MoodChart {


    interface Data {
        day: string;
        mood: MoodEnum;
    }

    enum MoodEnum {
        terrible = -2,
        unhappy = -1,
        neutral = 0,
        happy = 1,
        joyous = 2
    }

    export function loadMoodChart(container: string, data: Data[], from: Date, to: Date, moodZones:any) {
        // fill in every day or otherwise the moving average is going to be bad
        var everyDayData: { x: number, y: MoodEnum | null }[] = [];

        let entryPerDay: { [key: string]: Data } = {};

        for (let r of data) {
            entryPerDay[r.day] = r;
        }

        let curDay = from.getTime(); //new Date(year + "-01-01").getTime();
        while (curDay < to.getTime() && new Date(curDay) <= new Date()) {

            let dayStr = new Date(curDay).toISOString().split('T')[0];
            if (typeof entryPerDay[dayStr] !== "undefined")
                everyDayData.push({ x: new Date(curDay).getTime(), y: entryPerDay[dayStr].mood });
            else
                everyDayData.push({ x: new Date(curDay).getTime(), y: null });
            curDay += 24 * 3600 * 1000;
        }
        const moodData = everyDayData;// result.data.map(r => { return { x: new Date(r.day).getTime(), y: r.mood } });

        let movingAverageData = [];
        var period = 7; // a week 
        var sumForAverage = 0;
        var i;
        for (i = 0; i < moodData.length; i++) {
            sumForAverage += moodData[i].y;
            if (i < period) {
                //  movingAverageData.push(null);
            } else {
                sumForAverage -= moodData[i - period].y;
                movingAverageData.push([moodData[i].x, sumForAverage / period]);
            }
        }


        const chart = (<any>window).Highcharts.chart(container, {
            chart: {
                type: 'line',
                zoomType: 'x'
            },
            title: {
                text: null
            },
            subtitle: {
                text: null
            },
            credits: {
                enabled: false
            },
            legend: {
                enabled: false
            },
            xAxis: {
                type: 'datetime',
                title: {
                    text: null
                },
                lineWidth: 0
            },
            yAxis: {
                title: {
                    text: null
                },
                labels: {
                    enabled: false
                },
                gridLineWidth: 0,
                min: -2,
                max: 2
            },
            tooltip: {

                pointFormatter: function () {

                    let str = "";//"<em>" + new Date(this.x).toDateString() + "</em><br/>";
                    switch (this.y) {
                        case -2: str += "Terrible"; break;
                        case -1: str += "Unhappy"; break;
                        case 0: str += "Neutral"; break;
                        case 1: str += "Happy"; break;
                        case 2: str += "Joyous"; break;
                    }
                    return str;
                }
            },

            plotOptions: {
                series: {
                    marker: {
                        enabled: true
                    }
                }
            },

            colors: ['#6CF', '#39F', '#06C', '#036', '#000'],
            series: [{
                name: "Mood",
                data: moodData,
                zoneAxis: 'y',
                zones: moodZones,
                lineWidth: 0,
                marker: {
                    radius: 2
                },
                states: {
                    hover: {
                        lineWidthPlus: 0
                    },
                    inactive: {
                        opacity: 1
                    }
                },
                allowPointSelect: true,
                point: {
                    events: {
                        click: function () {
                            const dayStr = new Date(this.x).toISOString().split('T')[0];
                            var win = window.open("/?day=" + dayStr, '_blank');
                            win.focus();
                        }
                    }
                }
            },
            {
                type: 'spline',
                name: 'Moving Average',
                data: movingAverageData,
                zoneAxis: 'y',
                zones: moodZones,
                marker: {
                    enabled: false
                },
                states: {
                    inactive: {
                        opacity: 1
                    }
                }
            }],

            responsive: {
                rules: [{
                    condition: {
                        maxWidth: 500
                    },
                    chartOptions: {
                        plotOptions: {
                            series: {
                                marker: {
                                    radius: 2.5
                                }
                            }
                        }
                    }
                }]
            }
        });
        return chart;
    }
}