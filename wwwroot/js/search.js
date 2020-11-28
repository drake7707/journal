var Search;
(function (Search) {
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
            if ($("#txtKeywords").val().length <= 0)
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
                success: function (data) {
                    if (data == null || typeof (data) === "undefined")
                        alert("No content");
                    if (data.success) {
                        showResults(data.data);
                    }
                    else
                        alert("Error: " + data.message);
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
        function showResults(items) {
            $("#nrSearchResults").text(items.length + " search result(s)");
            var html = "";
            if (items.length > 0) {
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    // i totally regret not using a view for this
                    var itemHtml = "\n                        <div class=\"box\">\n                            <article class=\"media\">\n                                <div class=\"media-left\"></div>\n                                <div class=\"media-content\">\n                                    <nav class=\"level\">\n                                        <div class=\"level-left\">\n                                            <div class=\"level-item has-text-centered\">\n                                                <div><p class=\"heading\">Words</p><p class=\"title\">" + item.wordCount + "</p></div>\n                                            </div>\n                                            <div class=\"level-item has-text-centered\">\n                                                <div><p class=\"heading\">Images</p><p class=\"title\">" + item.imageCount + "</p></div>\n                                            </div>\n                                        </div>\n                                        <div class=\"level-item has-text-centered\">\n                                            <div class=\"content\">\n                                                <p><a target=\"_blank\" href=\"./?date=" + item.day + "\"><strong>" + item.day + "</strong></a><br>..." + item.fragment + "...</p>\n                                        </div>\n                                    </nav>\n                                </div>\n                            </article>\n                        </div>";
                    html += itemHtml;
                }
            }
            else {
                html += "<span>No results found</span>";
            }
            $("#resultsContainer").html(html);
            FrequencyChart.loadFrequencyChart(items);
        }
    });
})(Search || (Search = {}));
