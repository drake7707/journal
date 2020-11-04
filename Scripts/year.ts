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

        TagCloudChart.loadTagCloudChart('tagCloud', tagFrequency);

        const from = new Date(year + "-01-01");
        const to = new Date((year+1) + "-01-01");
        MoodChart.loadMoodChart('moodChart', result.data, from, to, moodZones);

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