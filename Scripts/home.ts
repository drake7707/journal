declare var highlightedDates: string[];
declare var weekStart: number;

namespace Home {
    declare var bulmaCalendar: any;
    declare var InlineEditor: any;
    declare var BulmaTagsInput: any;
    
    interface GetDayReponse extends Result {
        data: DayData;
    }

    interface DayData {
        date: string;
        content: string;
        mood: MoodEnum;
        version: number;
        tags: string[];
    }

    enum MoodEnum {
        terrible = -2,
        unhappy = -1,
        neutral = 0,
        happy = 1,
        joyous = 2
    }


    interface API {
        getDay(day: string): Promise<GetDayReponse>;
        postDay(day: DayData): Promise<Result>;

        deleteDay(day: string): Promise<Result>;
    }

    class DocumentStorageAPI implements API {
       

        public async getDay(day: string): Promise<GetDayReponse> {

            let json = localStorage.getItem('entry_' + day);
            console.log('local storage read entry_' + day);
            let dayData: DayData;
            if (typeof json === "undefined" || json === "" || json === null) {
                dayData = {
                    content: "",
                    date: day,
                    mood: MoodEnum.neutral,
                    version: 1,
                    tags: []
                }
            } else {

                dayData = JSON.parse(json);
            }
            return {
                success: true,
                data: dayData
            };
        }

        public async postDay(day: DayData): Promise<Result> {
            let json = JSON.stringify(day);

            console.log("setting item " + json);
            console.log('local storage write entry_' + day.date);

            const oldjson = localStorage.getItem('entry_' + day.date);

            let dayData: DayData;
            if (typeof oldjson === "undefined" || oldjson === "" || oldjson === null) { }
            else {
                dayData = JSON.parse(oldjson);
                if (dayData.version >= day.version)
                    throw new Error("Entry is out of date");
            }

            localStorage.setItem('entry_' + day.date, json);
            return {
                success: true
            };
        }

        public async deleteDay(day: string): Promise<Result> {
            localStorage.removeItem('entry_' + day);
            return {
                success: true,
            };
        }

    }

    class RestAPI implements API {
      

        public async getDay(day: string): Promise<GetDayReponse> {
            return this.get<GetDayReponse>("api/day", { day: day });
        }

        public async postDay(day: DayData): Promise<Result> {
            return this.post<Result>("api/day", day);
        }

        public async deleteDay(day: string): Promise<Result> {
            return this.post<Result>("api/day", day, "DELETE");
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

        private async post<T extends Result>(path: string, data?: any, method:string = "POST"): Promise<T> {
            return new Promise<T>((then, reject) => {

                $.ajax(path, {
                    cache: false,
                    method: method,
                    data: JSON.stringify(data),
                    contentType: "application/json; charset=utf-8",
                    success: (data: Result) => {
                        if (data == null || typeof (data) === "undefined")
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


    let editor: any = null;

    let calendar: any;

    let isSettingDataToControls: boolean = false;
    let isDirty: boolean = false;
    let loadedSuccessfully = false;

    let currentDate: string;
    let currentVersion: number;

    let tmrAutoSave: number = -1;

    // use local storage if it's loaded from github.io
    const api: API = window.location.host.indexOf("github") == -1 ? new RestAPI() : new DocumentStorageAPI();


    async function run() {


        // Initialize all input of type date

        // TODO once bulma calendar fixes the highlighted dates thing, fetch the dates and highlight them
        //let highlightDates = [new Date("2020-07-14")];
        /*for (let i:number = 0; i < 1000; i++) {
            highlightDates.push(new Date(new Date("2020-07-12").getTime()-24*3600*1000*i*2));
        }*/

        let calendars = bulmaCalendar.attach('#cal', {
            displayMode: "inline",
            startDate: new Date(),
            weekStart: weekStart,
            showClearButton: false,

            // disabledDates: [ new Date(new Date().getTime()-24*3600*1000) ],
            highlightedDates: highlightedDates.map(d => getDateFromDateString(d))
        });

        await initEditor();

        calendar = calendars[0];
        calendar.datePicker.on('select', async (date: Date) => {
            console.log("selected");
            if (isSettingDataToControls)
                return;
            if (loadedSuccessfully && isDirty) {
                const success = await saveDay();
                if (!success) {
                    alert("Not saved and attempt to save failed");


                    window.setTimeout(() => {
                        console.log("reverting date to " + currentDate);
                        isSettingDataToControls = true;
                        calendar.value(getDateFromDateString(currentDate));
                        calendar.refresh();
                        calendar.datePicker.refresh();
                        isSettingDataToControls = false;
                    }, 1);

                    return;
                }

            }

            console.log("loading " + calendar.date.start);

            await loadDay(getDateString(calendar.date.start));
        });


        let isSaving = false;
        $("#pnlUnsaved").click(async () => {
            if (isSaving)
                return;
            isSaving = true;
            await saveDay();
            isSaving = false;
        });

        $("input[name=optMood]").change(() => {
            onControlChange();
        });

        $("#tags").change(() => {
            onControlChange();
        });

        $("#lnkDelete").click(async function () {
            if (confirm("Are you sure?")) {
                const result = await api.deleteDay(currentDate);
                if (result.success) {
                    isDirty = false;
                    document.location.reload(true);
                } else {
                    alert("Delete failed: " + result.message);
                }
            }
        });

        new BulmaTagsInput(document.getElementById("tags"), {
            freeInput: true,
            allowDuplicates: false,
            caseSensitive: false,
            //   itemValue: "value",
            //  itemText: "name",
            //noResultsLabel: "No results, <a class='lnkAddCurrentTag'>add current search text</a>",
            // source: [{ name: "work", value: "work" }, { name: "trans", value: "trans" }, { name: "school", value: "school" }]
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


        const urlParams = new URLSearchParams(window.location.search);
        let date = urlParams.get('date');
        if (date !== null)
            date = getDateString(new Date(date));
        else
            date = getDateString(new Date());

        await loadDay(date);

        subscribeToEvents();
    }

    function getDateString(date: Date) {
        date.setHours(23); // damnit timezones
        return date.toISOString().split("T")[0];
    }
    function getDateFromDateString(dateStr: string) {
        const date = new Date(dateStr);
        date.setHours(23); //  fix for wrongly interpreted timezone
        return date;
    }

    function subscribeToEvents() {
        let wsPrefix = document.location.protocol == "https:" ? "wss://" : "ws://";
        const ws = new WebSocket(wsPrefix + document.location.host + "/events");

        ws.onmessage = function onmessage(ev: MessageEvent) {
            //console.log("Data received: " + ev.data);

            var event = <PhotoRequest>JSON.parse(ev.data);
            handlePhoto(event.Photo);
        };
        ws.onopen = function open() {
            console.log("open");
        };
        ws.onerror = function error(ev: Event) {
            console.log("error " + ev);
        };
        ws.onclose = function close(ev: CloseEvent) {
            console.log("close " + ev.reason);
        };
    }

    function handlePhoto(payload: string) {
        // insert image into editor
        editor.setData(editor.getData() + payload);
        // scroll to the bottom
        $("#editor").get(0).scrollTop = $("#editor").get(0).scrollHeight;
    }

    async function initEditor() {
        if (editor !== null)
            editor.destroy();

        editor = await InlineEditor.create(document.querySelector('#editor'), {

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

        });

        //editor = await InlineEditor.create(document.querySelector('#editor'));
        editor.model.document.on('change:data', () => {
            onControlChange();
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


    function setDirty(dirty: boolean) {
        isDirty = dirty;
        if (isDirty) {
            $("#pnlUnsaved").show();
            $("#pnlSaved").hide();
        } else {
            $("#pnlUnsaved").hide();
            $("#pnlSaved").show();
        }
    }

    function setAutoSaveError(error: boolean, msg?: string) {
        if (error)
            $("#pnlUnsaved").addClass("is-error").attr("title", msg);
        else
            $("#pnlUnsaved").removeClass("is-error").attr("title", "");
    }

    function setLoadedSuccessfully(success: boolean) {
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


    async function loadDay(date: string) {
        try {

            const dayData: DayData = (await api.getDay(date)).data;

            await setDayDataToControls(dayData);
            setLoadedSuccessfully(true);
        }
        catch (err) {
            alert("Error loading: " + err);
            setLoadedSuccessfully(false);
        }

        // force clear autosave
        if (tmrAutoSave !== -1)
            window.clearTimeout(tmrAutoSave);

    }

    async function saveDay() {
        // force clear autosave
        if (tmrAutoSave !== -1)
            window.clearTimeout(tmrAutoSave);

        console.log("Saving");

        // increment version
        currentVersion++;

        const dayData = getDayDataFromControls();

        console.log(JSON.stringify(dayData));

        try {
            const data = await api.postDay(dayData)
            if (data.success) {
                // do save call and check if success
                setDirty(false);
                setAutoSaveError(false, "");

                // add current day to highlight
                if (calendar.options.highlightedDates.indexOf(currentDate) == -1)
                    calendar.options.highlightedDates.push(currentDate);

            } else {
                // revert increment of version
                currentVersion--;
                setAutoSaveError(true, data.message);
            }
            return true;
        }
        catch (err) {
            // revert increment of version
            currentVersion--;
            setAutoSaveError(true, err);

            return false;
        }

    }

    function scheduleSave() {
        if (tmrAutoSave !== -1)
            window.clearTimeout(tmrAutoSave);

        tmrAutoSave = window.setTimeout(async () => {
            await saveDay();
        }, 5000);
    }

    async function setDayDataToControls(data: DayData) {
        isSettingDataToControls = true;
        try {
            calendar.value(getDateFromDateString(data.date));
            calendar.refresh();
            calendar.datePicker.refresh();


            currentDate = data.date;
            currentVersion = data.version;

            (<any>$("#tags").get(0)).BulmaTagsInput().value = data.tags.join(",");


            var url = new URL(document.location.toString());
            url.searchParams.set("date", data.date);
            window.history.replaceState({}, "", url.toString());

            window.document.title = "Journal " + data.date;
            // await initEditor();
            editor.setData(data.content);

            setDirty(false);
            $(`input[name=optMood][value=${data.mood}]`).prop("checked", true);
        }
        finally {
            isSettingDataToControls = false;
        }

    }

    function getDayDataFromControls(): DayData {
        return {
            date: currentDate,
            version: currentVersion,
            content: editor.getData(),
            mood: parseInt(<string>$("input[name=optMood]:checked").val()),
            tags: (<any>$("#tags").get(0)).BulmaTagsInput().value.split(",")
        };
    }


    interface PhotoRequest {
        Photo: string;
    }

    interface Result {
        success: boolean;
        message?: string;
    }


    run().then(editor => {

    }).catch(err => {
        console.error(err);
    });


}