﻿
namespace Search {

    interface SearchResult {
        success: boolean;
        data: SearchResultEntry[];
        message?: string;
    }

    interface SearchResultEntry {
        day: string;
        fragment: string;
        wordCount: number;
        imageCount: number;
        mood: MoodEnum;
    }
    enum MoodEnum {
        terrible = -2,
        unhappy = -1,
        neutral = 0,
        happy = 1,
        joyous = 2
    }


    $(document).ready(function () {


        $("#txtKeywords").keyup(function (event) {
            // Number 13 is the "Enter" key on the keyboard
            if (event.keyCode === 13) {
                // Cancel the default action, if needed
                event.preventDefault();
                // Trigger the button element with a click
                $("#btnSearch").click();
            }
        });


        $("#btnSearch").click(function () {
            if ((<string>$("#txtKeywords").val()).length <= 0)
                return;

            $("#btnSearch").addClass("is-loading");
            var req = {
                keywords: $("#txtKeywords").val(),
                prefix: "<b>",
                postfix: "</b>"
            };
            $.ajax("api/search", {
                cache: false,
                method: "GET",
                data: req,
                success: function (data: SearchResult) {
                    if (data == null || typeof (data) === "undefined")
                        alert("No content");

                    if (data.success) {
                        showResults(data.data);
                    }
                    else
                        alert("Error: " + data.message)

                    $("#btnSearch").removeClass("is-loading");
                },
                error: function (e) {
                    alert("Error: " + e.statusText + " - " + e.responseText);
                    $("#btnSearch").removeClass("is-loading");
                }
            });


        });

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

        function showResults(items: SearchResultEntry[]) {

            $("#nrSearchResults").text(`${items.length} search result(s)`);

            let html = "";

            if (items.length > 0) {
                for (let i = 0; i < items.length; i++) {
                    const item = items[i];

                    // i totally regret not using a view for this
                    const itemHtml = `
                        <div class="box">
                            <article class="media">
                                <div class="media-left"></div>
                                <div class="media-content" style="overflow:hidden">
                                    <nav class="">

<div class="columns">
    <div class="column is-one-third">
        <div class="columns is-mobile">
              <div class="column is-one-third has-text-centered">
                <div><p class="heading">Words</p><p class="is-size-5">${item.wordCount}</p></div>
            </div>
            <div class="column  is-one-third has-text-centered">
                <div><p class="heading">Images</p><p class="is-size-5">${item.imageCount}</p></div>
            </div>
            <div class="column  is-one-third has-text-centered">
                <div>
                    <p class="heading">Mood</p>
                    <div style="position:relative">
                        <p data-value="${item.mood}" class="mood" style="position: absolute; left:calc(50% - 24px);top: -4px;"></p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="column has-text-centered" style="flex-shrink: 1;">
                                            <div class="content">
                                                <p><a target="_blank" href="./?date=${item.day}"><strong>${item.day}</strong></a><br>...${item.fragment}...</p>
                                        </div>
</div>
                                  
                                    </nav>
                                </div>
                            </article>
                        </div>`;
                    html += itemHtml;
                }

            }
            else {
                html += "<span>No results found</span>";
            }
            $("#resultsContainer").html(html);

            if (items.length > 0) {
                FrequencyChart.loadFrequencyChart(items);
                $("#frequencyChart").show();
            } else {
                $("#frequencyChart").hide();
            }
            
        }
    });

}