var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var Year;
(function (Year) {
    var MoodEnum;
    (function (MoodEnum) {
        MoodEnum[MoodEnum["terrible"] = -2] = "terrible";
        MoodEnum[MoodEnum["unhappy"] = -1] = "unhappy";
        MoodEnum[MoodEnum["neutral"] = 0] = "neutral";
        MoodEnum[MoodEnum["happy"] = 1] = "happy";
        MoodEnum[MoodEnum["joyous"] = 2] = "joyous";
    })(MoodEnum || (MoodEnum = {}));
    var RestAPI = /** @class */ (function () {
        function RestAPI() {
        }
        RestAPI.prototype.getYear = function (year) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.get("api/year", { year: year })];
                });
            });
        };
        RestAPI.prototype.get = function (path, data) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, new Promise(function (then, reject) {
                            $.ajax(path, {
                                cache: false,
                                method: "GET",
                                data: data,
                                success: function (data) {
                                    if (data === null || typeof (data) === "undefined")
                                        reject("No content");
                                    if (data.success)
                                        then(data);
                                    else
                                        reject(data.message);
                                },
                                error: function (e) {
                                    reject(e.statusText + " - " + e.responseText);
                                }
                            });
                        })];
                });
            });
        };
        return RestAPI;
    }());
    var api = new RestAPI();
    var maxWordCount = -1;
    function loadYear(year) {
        return __awaiter(this, void 0, void 0, function () {
            var result, totalWordCount, totalImageCount, daysJournalled, tagFrequency, _i, _a, r, _b, _c, t, from, to;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, api.getYear(year)];
                    case 1:
                        result = _d.sent();
                        maxWordCount = result.data.map(function (e) { return e.wordCount; }).reduce(function (prev, current) { return (prev > current) ? prev : current; }, 0);
                        cal.setDataSource(result.data.map(function (r) {
                            return { id: r.id, startDate: new Date(r.day), endDate: new Date(r.day), entry: r };
                        }));
                        totalWordCount = 0;
                        totalImageCount = 0;
                        daysJournalled = 0;
                        tagFrequency = {};
                        for (_i = 0, _a = result.data; _i < _a.length; _i++) {
                            r = _a[_i];
                            totalWordCount += r.wordCount;
                            totalImageCount += r.imageCount;
                            daysJournalled++;
                            for (_b = 0, _c = r.tags; _b < _c.length; _b++) {
                                t = _c[_b];
                                if (typeof tagFrequency[t] === "undefined")
                                    tagFrequency[t] = 1;
                                else
                                    tagFrequency[t] = tagFrequency[t] + 1;
                            }
                        }
                        $("#totalWordCount").text(totalWordCount);
                        $("#totalImageCount").text(totalImageCount);
                        $("#daysJournalled").text(daysJournalled);
                        window.Highcharts.chart('tagCloud', {
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
                        from = new Date(year + "-01-01");
                        to = new Date((year + 1) + "-01-01");
                        MoodChart.loadMoodChart('moodChart', result.data, from, to, moodZones);
                        return [2 /*return*/];
                }
            });
        });
    }
    var cal = new Calendar('.calendar', {
        customDataSourceRenderer: function (el, date, events) {
            if (events.length > 0) {
                var ev = events[0];
                var wordCountPerc = Math.max(30, ev.entry.wordCount / maxWordCount * 100);
                var wordCountPercStr = wordCountPerc.toFixed(2) + "%";
                var offset = ((100 - wordCountPerc) / 2).toFixed(2) + "%";
                $(el).prepend("<div class='event-bubble' style='left:" + offset + ";top:" + offset + ";width:" + wordCountPercStr + ";height:" + wordCountPercStr + "'></div>");
            }
        },
        displayWeekNumber: true,
        enableRangeSelection: false,
        weekStart: 1,
        yearChanged: function (ev) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, loadYear(ev.currentYear)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        },
        style: "custom"
    });
    document.querySelector('.calendar').addEventListener('clickDay', function (e) {
        if (e.events.length > 0) {
            var win = window.open("/?date=" + e.events[0].entry.day, '_blank');
            win.focus();
        }
    });
})(Year || (Year = {}));
