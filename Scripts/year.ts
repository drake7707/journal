declare var moodZones: any;

namespace Year {



    declare class Calendar {
        constructor(selector: string, options: unknown);
        setDataSource(val: any);
    }

    interface GetYearResponse {
        data: DayData[],
        success: boolean;
    }

    interface Result {
        success: boolean;
        message?: string;
    }


    interface DayData {
        id: number;
        day: string;
        mood: MoodEnum;
        imageCount: number;
        wordCount: number;
        tags: string[];
    }

    enum MoodEnum {
        terrible = -2,
        unhappy = -1,
        neutral = 0,
        happy = 1,
        joyous = 2
    }

    class RestAPI {


        public async getYear(year: any): Promise<GetYearResponse> {
            return this.get<GetYearResponse>("api/year", { year: year });
        }

        private async get<T extends Result>(path: string, data?: any): Promise<T> {
            return new Promise<T>((then, reject) => {

                $.ajax(path, {
                    cache: false,
                    method: "GET",
                    data: data,
                    success: (data: Result) => {
                        if (data === null || typeof (data) === "undefined")
                            reject("No content");

                        if (data.success)
                            then(<T>data);
                        else
                            reject(data.message);
                    },
                    error: (e) => {
                        reject(e.statusText + " - " + e.responseText);
                    }
                });

            });
        }
    }

    var api = new RestAPI();


    var maxWordCount: number = -1;

    async function loadYear(year: number) {

        // fetch the year data
        var result = await api.getYear(year);

        maxWordCount = result.data.map(e => e.wordCount).reduce((prev, current) => (prev > current) ? prev : current, 0);

        cal.setDataSource(result.data.map(r => {
            return { id: r.id, startDate: new Date(r.day), endDate: new Date(r.day), entry: r }
        }));

        let totalWordCount = 0;
        let totalImageCount = 0;
        let daysJournalled = 0;

        let tagFrequency: { [key: string]: number } = {};

        for (let r of result.data) {
            totalWordCount += r.wordCount;
            totalImageCount += r.imageCount;
            daysJournalled++;

            for (let t of r.tags) {
                if (typeof tagFrequency[t] === "undefined")
                    tagFrequency[t] = 1;
                else
                    tagFrequency[t] = tagFrequency[t] + 1;
            }
        }

        $("#totalWordCount").text(totalWordCount);
        $("#totalImageCount").text(totalImageCount);
        $("#daysJournalled").text(daysJournalled);


        (<any>window).Highcharts.chart('tagCloud', {
            series: [{
                type: 'wordcloud',
                data: Object.keys(tagFrequency).map(t => {
                    return { name: t, weight: Math.log(tagFrequency[t] + 1) }
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



        (<any>window).Highcharts.chart('moodChart', {
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
                data: result.data.map(r => { return { x: new Date(r.day).getTime(), y: r.mood } }),
                zoneAxis: 'y',
                zones: moodZones
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

    }

    const cal = new Calendar('.calendar', {

        customDataSourceRenderer: function (el: HTMLElement, date: Date, events: { entry: DayData }[]) {
            if (events.length > 0) {
                const ev = events[0];
                let wordCountPerc = Math.max(30, ev.entry.wordCount / maxWordCount * 100);

                let wordCountPercStr = wordCountPerc.toFixed(2) + "%";

                let offset = ((100 - wordCountPerc) / 2).toFixed(2) + "%";

                $(el).prepend(`<div class='event-bubble' style='left:${offset};top:${offset};width:${wordCountPercStr};height:${wordCountPercStr}'></div>`);
            }
        },
        displayWeekNumber: true,
        enableRangeSelection: false,
        weekStart: 1,

        yearChanged: async function (ev: { currentYear: number, preventRendering: boolean }) {
            await loadYear(ev.currentYear);
        },

        style: "custom"
    });
    document.querySelector('.calendar').addEventListener('clickDay', function (e: any) {
        if (e.events.length > 0) {
            var win = window.open("/?date=" + e.events[0].entry.day, '_blank');
            win.focus();
        }

    })



}