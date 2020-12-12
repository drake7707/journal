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
var Home;
(function (Home) {
    var MoodEnum;
    (function (MoodEnum) {
        MoodEnum[MoodEnum["terrible"] = -2] = "terrible";
        MoodEnum[MoodEnum["unhappy"] = -1] = "unhappy";
        MoodEnum[MoodEnum["neutral"] = 0] = "neutral";
        MoodEnum[MoodEnum["happy"] = 1] = "happy";
        MoodEnum[MoodEnum["joyous"] = 2] = "joyous";
    })(MoodEnum || (MoodEnum = {}));
    var DocumentStorageAPI = /** @class */ (function () {
        function DocumentStorageAPI() {
        }
        DocumentStorageAPI.prototype.getDay = function (day) {
            return __awaiter(this, void 0, void 0, function () {
                var json, dayData;
                return __generator(this, function (_a) {
                    json = localStorage.getItem('entry_' + day);
                    console.log('local storage read entry_' + day);
                    if (typeof json === "undefined" || json === "" || json === null) {
                        dayData = {
                            content: "",
                            date: day,
                            mood: MoodEnum.neutral,
                            version: 1,
                            tags: []
                        };
                    }
                    else {
                        dayData = JSON.parse(json);
                    }
                    return [2 /*return*/, {
                            success: true,
                            data: dayData
                        }];
                });
            });
        };
        DocumentStorageAPI.prototype.postDay = function (day) {
            return __awaiter(this, void 0, void 0, function () {
                var json, oldjson, dayData;
                return __generator(this, function (_a) {
                    json = JSON.stringify(day);
                    console.log("setting item " + json);
                    console.log('local storage write entry_' + day.date);
                    oldjson = localStorage.getItem('entry_' + day.date);
                    if (typeof oldjson === "undefined" || oldjson === "" || oldjson === null) { }
                    else {
                        dayData = JSON.parse(oldjson);
                        if (dayData.version >= day.version)
                            throw new Error("Entry is out of date");
                    }
                    localStorage.setItem('entry_' + day.date, json);
                    return [2 /*return*/, {
                            success: true
                        }];
                });
            });
        };
        DocumentStorageAPI.prototype.deleteDay = function (day) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    localStorage.removeItem('entry_' + day);
                    return [2 /*return*/, {
                            success: true,
                        }];
                });
            });
        };
        return DocumentStorageAPI;
    }());
    var RestAPI = /** @class */ (function () {
        function RestAPI() {
        }
        RestAPI.prototype.getDay = function (day) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.get("api/day", { day: day })];
                });
            });
        };
        RestAPI.prototype.postDay = function (day) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.post("api/day", day)];
                });
            });
        };
        RestAPI.prototype.deleteDay = function (day) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.post("api/day", day, "DELETE")];
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
        RestAPI.prototype.post = function (path, data, method) {
            if (method === void 0) { method = "POST"; }
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, new Promise(function (then, reject) {
                            $.ajax(path, {
                                cache: false,
                                method: method,
                                data: JSON.stringify(data),
                                contentType: "application/json; charset=utf-8",
                                success: function (data) {
                                    if (data == null || typeof (data) === "undefined")
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
    var editor = null;
    var calendar;
    var isSettingDataToControls = false;
    var isDirty = false;
    var loadedSuccessfully = false;
    var currentDate;
    var currentVersion;
    var tmrAutoSave = -1;
    // use local storage if it's loaded from github.io
    var api = window.location.host.indexOf("github") == -1 ? new RestAPI() : new DocumentStorageAPI();
    function run() {
        return __awaiter(this, void 0, void 0, function () {
            var calendars, isSaving, urlParams, date;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        calendars = bulmaCalendar.attach('#cal', {
                            displayMode: "inline",
                            startDate: new Date(),
                            weekStart: weekStart,
                            showClearButton: false,
                            // disabledDates: [ new Date(new Date().getTime()-24*3600*1000) ],
                            highlightedDates: highlightedDates.map(function (d) { return getDateFromDateString(d); })
                        });
                        return [4 /*yield*/, initEditor()];
                    case 1:
                        _a.sent();
                        calendar = calendars[0];
                        calendar.datePicker.on('select', function (date) { return __awaiter(_this, void 0, void 0, function () {
                            var success;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        console.log("selected");
                                        if (isSettingDataToControls)
                                            return [2 /*return*/];
                                        if (!(loadedSuccessfully && isDirty)) return [3 /*break*/, 2];
                                        return [4 /*yield*/, saveDay()];
                                    case 1:
                                        success = _a.sent();
                                        if (!success) {
                                            alert("Not saved and attempt to save failed");
                                            window.setTimeout(function () {
                                                console.log("reverting date to " + currentDate);
                                                isSettingDataToControls = true;
                                                calendar.value(getDateFromDateString(currentDate));
                                                calendar.refresh();
                                                calendar.datePicker.refresh();
                                                isSettingDataToControls = false;
                                            }, 1);
                                            return [2 /*return*/];
                                        }
                                        _a.label = 2;
                                    case 2:
                                        console.log("loading " + calendar.date.start);
                                        return [4 /*yield*/, loadDay(getDateString(calendar.date.start))];
                                    case 3:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        isSaving = false;
                        $("#pnlUnsaved").click(function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (isSaving)
                                            return [2 /*return*/];
                                        isSaving = true;
                                        return [4 /*yield*/, saveDay()];
                                    case 1:
                                        _a.sent();
                                        isSaving = false;
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        $("input[name=optMood]").change(function () {
                            onControlChange();
                        });
                        $("#tags").change(function () {
                            onControlChange();
                        });
                        $("#lnkDelete").click(function () {
                            return __awaiter(this, void 0, void 0, function () {
                                var result;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (!confirm("Are you sure?")) return [3 /*break*/, 2];
                                            return [4 /*yield*/, api.deleteDay(currentDate)];
                                        case 1:
                                            result = _a.sent();
                                            if (result.success) {
                                                isDirty = false;
                                                document.location.reload(true);
                                            }
                                            else {
                                                alert("Delete failed: " + result.message);
                                            }
                                            _a.label = 2;
                                        case 2: return [2 /*return*/];
                                    }
                                });
                            });
                        });
                        new BulmaTagsInput(document.getElementById("tags"), {
                            freeInput: true,
                            allowDuplicates: false,
                            caseSensitive: false,
                        });
                        /*  $(document).on("click", ".lnkAddCurrentTag", null, () => {
                              var tags = <any>$("#tags").get(0);
                              var searchText = tags.BulmaTagsInput().input.value;
                              tags.BulmaTagsInput().add({ name: searchText, value: searchText });
                              $(tags.BulmaTagsInput().container).removeClass("is-active");
                              tags.BulmaTagsInput().input.value = "";
                          });
                          */
                        window.addEventListener("beforeunload", function (e) {
                            if (!isDirty) {
                                return undefined;
                            }
                            var confirmationMessage = 'It looks like you have been editing something. '
                                + 'If you leave before saving, your changes will be lost.';
                            (e || window.event).returnValue = confirmationMessage; //Gecko + IE
                            return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
                        });
                        urlParams = new URLSearchParams(window.location.search);
                        date = urlParams.get('date');
                        if (date !== null)
                            date = getDateString(new Date(date));
                        else
                            date = getDateString(new Date());
                        return [4 /*yield*/, loadDay(date)];
                    case 2:
                        _a.sent();
                        subscribeToEvents();
                        return [2 /*return*/];
                }
            });
        });
    }
    function getDateString(date) {
        date.setHours(23); // damnit timezones
        return date.toISOString().split("T")[0];
    }
    function getDateFromDateString(dateStr) {
        var date = new Date(dateStr);
        date.setHours(23); //  fix for wrongly interpreted timezone
        return date;
    }
    function subscribeToEvents() {
        var wsPrefix = document.location.protocol == "https:" ? "wss://" : "ws://";
        var ws = new WebSocket(wsPrefix + document.location.host + "/events");
        ws.onmessage = function onmessage(ev) {
            //console.log("Data received: " + ev.data);
            var event = JSON.parse(ev.data);
            handlePhoto(event.Photo);
        };
        ws.onopen = function open() {
            console.log("open");
        };
        ws.onerror = function error(ev) {
            console.log("error " + ev);
        };
        ws.onclose = function close(ev) {
            console.log("close " + ev.reason);
        };
    }
    function handlePhoto(payload) {
        // insert image into editor
        editor.setData(editor.getData() + payload);
        // scroll to the bottom
        $("#editor").get(0).scrollTop = $("#editor").get(0).scrollHeight;
    }
    function initEditor() {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (editor !== null)
                            editor.destroy();
                        return [4 /*yield*/, InlineEditor.create(document.querySelector('#editor'), {
                                toolbar: {
                                    items: [
                                        'heading',
                                        'fontSize',
                                        'fontColor',
                                        '|',
                                        'bold',
                                        'italic',
                                        'underline',
                                        'strikethrough',
                                        '|',
                                        'indent',
                                        'outdent',
                                        '|',
                                        'bulletedList',
                                        'numberedList',
                                        'todoList',
                                        '|',
                                        'code',
                                        'blockQuote',
                                        'codeBlock',
                                        '|',
                                        'horizontalLine',
                                        '|',
                                        'link',
                                        'imageUpload',
                                        'insertTable',
                                        'mediaEmbed',
                                        '|',
                                        'undo',
                                        'redo'
                                    ]
                                },
                                language: 'en',
                                image: {
                                    toolbar: [
                                        'imageTextAlternative',
                                        'imageStyle:full',
                                        'imageStyle:side'
                                    ]
                                },
                                table: {
                                    contentToolbar: [
                                        'tableColumn',
                                        'tableRow',
                                        'mergeTableCells'
                                    ]
                                },
                                licenseKey: '',
                            })];
                    case 1:
                        editor = _a.sent();
                        //editor = await InlineEditor.create(document.querySelector('#editor'));
                        editor.model.document.on('change:data', function () {
                            onControlChange();
                        });
                        return [2 /*return*/];
                }
            });
        });
    }
    function onControlChange() {
        if (isSettingDataToControls)
            return;
        if (loadedSuccessfully) {
            setDirty(true);
            scheduleSave();
        }
    }
    function setDirty(dirty) {
        isDirty = dirty;
        if (isDirty) {
            $("#pnlUnsaved").show();
            $("#pnlSaved").hide();
        }
        else {
            $("#pnlUnsaved").hide();
            $("#pnlSaved").show();
        }
    }
    function setAutoSaveError(error, msg) {
        if (error)
            $("#pnlUnsaved").addClass("is-error").attr("title", msg);
        else
            $("#pnlUnsaved").removeClass("is-error").attr("title", "");
    }
    function setLoadedSuccessfully(success) {
        loadedSuccessfully = success;
        if (success) {
            $("#editorContainer").removeClass("is-error");
            editor.isReadOnly = false;
            $("input[name=optMood]").prop("disabled", false);
            $("#tabs").prop("disabled", false);
        }
        else {
            $("#editorContainer").addClass("is-error");
            editor.isReadOnly = true;
            $("input[name=optMood]").prop("disabled", true);
            $("#tabs").prop("disabled", true);
        }
    }
    function loadDay(date) {
        return __awaiter(this, void 0, void 0, function () {
            var dayData, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, api.getDay(date)];
                    case 1:
                        dayData = (_a.sent()).data;
                        return [4 /*yield*/, setDayDataToControls(dayData)];
                    case 2:
                        _a.sent();
                        setLoadedSuccessfully(true);
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _a.sent();
                        alert("Error loading: " + err_1);
                        setLoadedSuccessfully(false);
                        return [3 /*break*/, 4];
                    case 4:
                        // force clear autosave
                        if (tmrAutoSave !== -1)
                            window.clearTimeout(tmrAutoSave);
                        return [2 /*return*/];
                }
            });
        });
    }
    function saveDay() {
        return __awaiter(this, void 0, void 0, function () {
            var dayData, data, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // force clear autosave
                        if (tmrAutoSave !== -1)
                            window.clearTimeout(tmrAutoSave);
                        console.log("Saving");
                        // increment version
                        currentVersion++;
                        dayData = getDayDataFromControls();
                        console.log(JSON.stringify(dayData));
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, api.postDay(dayData)];
                    case 2:
                        data = _a.sent();
                        if (data.success) {
                            // do save call and check if success
                            setDirty(false);
                            setAutoSaveError(false, "");
                            // add current day to highlight
                            if (calendar.options.highlightedDates.indexOf(currentDate) == -1)
                                calendar.options.highlightedDates.push(currentDate);
                        }
                        else {
                            // revert increment of version
                            currentVersion--;
                            setAutoSaveError(true, data.message);
                        }
                        return [2 /*return*/, true];
                    case 3:
                        err_2 = _a.sent();
                        // revert increment of version
                        currentVersion--;
                        setAutoSaveError(true, err_2);
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }
    function scheduleSave() {
        var _this = this;
        if (tmrAutoSave !== -1)
            window.clearTimeout(tmrAutoSave);
        tmrAutoSave = window.setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, saveDay()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }, 5000);
    }
    function setDayDataToControls(data) {
        return __awaiter(this, void 0, void 0, function () {
            var url;
            return __generator(this, function (_a) {
                isSettingDataToControls = true;
                try {
                    calendar.value(getDateFromDateString(data.date));
                    calendar.refresh();
                    calendar.datePicker.refresh();
                    currentDate = data.date;
                    currentVersion = data.version;
                    $("#tags").get(0).BulmaTagsInput().value = data.tags.join(",");
                    url = new URL(document.location.toString());
                    url.searchParams.set("date", data.date);
                    window.history.replaceState({}, "", url.toString());
                    window.document.title = "Journal " + data.date;
                    // await initEditor();
                    editor.setData(data.content);
                    setDirty(false);
                    $("input[name=optMood][value=" + data.mood + "]").prop("checked", true);
                }
                finally {
                    isSettingDataToControls = false;
                }
                return [2 /*return*/];
            });
        });
    }
    function getDayDataFromControls() {
        return {
            date: currentDate,
            version: currentVersion,
            content: editor.getData(),
            mood: parseInt($("input[name=optMood]:checked").val()),
            tags: $("#tags").get(0).BulmaTagsInput().value.split(",")
        };
    }
    run().then(function (editor) {
    }).catch(function (err) {
        console.error(err);
    });
})(Home || (Home = {}));
