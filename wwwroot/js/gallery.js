var Gallery;
(function (Gallery) {
    var KEYCODE_ESCAPE = 27;
    var KEYCODE_ARROW_RIGHT = 39;
    var KEYCODE_ARROW_LEFT = 37;
    $(document).ready(function () {
        var imagesGroups = $(".image-group");
        var _loop_1 = function (i) {
            var day = $(imagesGroups[i]).attr("data-day");
            var idx = i;
            fetch("api/imageThumbs?day=" + day + "&width=100&height=100&contain=false").then(function (resp) {
                resp.json().then(function (result) {
                    if (result.success) {
                        var imageThumbs = $(imagesGroups[idx]).find(".image-thumb");
                        for (var i = result.data.length - 1; i >= 0; i--) {
                            var galleryImg = result.data[i];
                            $(imageThumbs[i]).attr("src", galleryImg.data);
                            $(imageThumbs[i]).attr("data-day", galleryImg.day);
                            $(imageThumbs[i]).attr("data-index", galleryImg.index);
                            $(imageThumbs[i]).attr("data-embedded", galleryImg.isEmbedded);
                            $(imageThumbs[i]).attr("data-external-source", galleryImg.externalSource);
                            if (galleryImg.caption == null)
                                $(imageThumbs[i]).attr("title", galleryImg.day);
                            else
                                $(imageThumbs[i]).attr("title", galleryImg.day + " • " + galleryImg.caption);
                        }
                        //for (let galleryImg of result.data) {
                        //$(imagesGroups[idx]).append("<img class='image-thumb tile is-child' src='" + galleryImg.data + "' data-index='" + galleryImg.index + "' data-external='" + !galleryImg.isEmbedded  + "' data-external-source='" + galleryImg.externalSource + "' />");
                        //}
                    }
                });
            });
        };
        for (var i = 0; i < imagesGroups.length; i++) {
            _loop_1(i);
        }
        $(".modal-close").on("click", function (ev) {
            $(this).closest(".modal").removeClass("is-active");
        });
        $("body").keydown(function (e) {
            if ($("#modal").hasClass("is-active")) {
                if (e.keyCode == KEYCODE_ARROW_LEFT) { // left
                    var cur = thumbClicked.get(0);
                    var thumbs = $(".image-thumb");
                    for (var i = 0; i < thumbs.length; i++) {
                        if (thumbs[i] == cur && i - 1 >= 0) {
                            $(thumbs[i - 1]).click();
                            break;
                        }
                    }
                }
                else if (e.keyCode == KEYCODE_ARROW_RIGHT) { // right
                    var cur = thumbClicked.get(0);
                    var thumbs = $(".image-thumb");
                    for (var i = 0; i < thumbs.length; i++) {
                        if (thumbs[i] == cur && i + 1 < thumbs.length) {
                            $(thumbs[i + 1]).click();
                            break;
                        }
                    }
                }
                else if (e.keyCode == KEYCODE_ESCAPE) { // escape
                    $("#modal").removeClass("is-active");
                }
            }
        });
    });
    $(document).on("click", ".modal-content img", function () {
        $(this).closest(".modal").removeClass("is-active");
    });
    var thumbClicked = null;
    $(document).on("click", ".image-thumb", function () {
        thumbClicked = $(this);
        var content = $("#modal").find(".modal-content");
        $(content).empty();
        var day = $(this).attr("data-day");
        if ($(this).attr("data-embedded") == "true") {
            var index = $(this).attr("data-index");
            fetch("api/image?day=" + day + "&index=" + index).then(function (resp) {
                resp.json().then(function (result) {
                    if (result.success) {
                        content.append("<img src='" + result.data.data + "' /><br/>");
                        if (result.data.caption !== "" && result.data.caption != null) {
                            content.append("<span class='has-text-light'><a class='has-text-light' href='./?date=" + day + "'>" + day + "</a>&nbsp;&bull;&nbsp;" + result.data.caption + "</span>");
                        }
                        else {
                            content.append("<span class='has-text-light'><a class='has-text-light' href='./?date=" + day + "'>" + day + "</a></span>");
                        }
                        $("#modal").addClass("is-active");
                    }
                });
            });
        }
        else {
            var source = $(this).attr("data-external-source");
            content.append("<img src='" + source + "' /><br/>");
            if (typeof $(this).attr("title") !== "undefined") {
                content.append("<span class='has-text-light'><a class='has-text-light' href='./?date=" + day + "'>" + day + "</a></span>");
            }
            $("#modal").addClass("is-active");
        }
    });
})(Gallery || (Gallery = {}));
