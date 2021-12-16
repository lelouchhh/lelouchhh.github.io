//! scrolltables.js
//! version : 0.2.8
//! author : Pavel Belikov
//! contributor : 0.2.8+ Dmitry Kamenskih 
//! license : MIT
//! isu.ifmo.ru
//! updates 0.2.5: .apex_report_break fixed thead positioning
//! updates 0.2.6: ".sticky" bug fixed and ".navbar" bug fixed
//! updates 0.2.7: scrollbar width counts on th and td simultaneously, instead of th then td, (if (!sizers.length) { sizers =  $($(instance).find("tr")[0]).find(" > td")})
//! updates 0.2.7: thead may not exist in table
//! updates 0.2.8: width evaluation made correct (there should not be any more problems with 2px delta between real width and evaluated one)
//! updates 0.2.9: top offset now calculated with page-header
//! updates 0.3.0: optimization and new calculations for page header, prepared for refreshing reports
(function($) {
    $.fn.scrolltable = function(reset) {
		
        var selector = $(this),
			navBar = $("#main-navbar"),
			pageHeader = $(".page-header"),
            navbarHeight = (navBar.length ? navBar.height() : 0);
        
		navbarHeight += (pageHeader.length ? (pageHeader[0].scrollHeight + (pageHeader.is('.affix') ? 11 : -7)) : 0); // #crutch-coding
		// calculation with changing header height and paddings and -7 additional px like a magic number

        reset = ((selector == null) || (selector == undefined)) ? false : reset;
        if ((selector == null) || (selector == undefined)) {
            selector = $(document);
        }
        if (!$(document).find(".table-responsive").length) {
            return
        }

        var $outer = $('<div>').css({
                visibility: 'hidden',
                width: 100,
                overflow: 'scroll'
            }).appendTo('body'),
            widthWithScroll = $('<div>').css({
                width: '100%'
            }).appendTo($outer).outerWidth();
        $outer.remove();
        scrollbarSize = 100 - widthWithScroll;
        scrollbarSize = ((scrollbarSize == null) || (scrollbarSize == undefined) ? "15px" : scrollbarSize);

        var $_scrollable = selector.find(".table-responsive");
        if (selector.hasClass("table-responsive")) {
            $_scrollable = $_scrollable.add(selector);
        };

        var counter = 0;
        $_scrollable.each(function() {
            var scrollbarContainer = $(document.createElement("div")),
                scrollbarDummy = $(document.createElement("div")),
                scrollbar = $(document.createElement("div")),
                instance = $(this),
                oid,
				table,
				head;

            try {
                if (instance.find("table.table").length == 0) {
                    return
                }
				oid = instance.find("table.table").eq(0).attr("id");
                if (oid == undefined) {
                    instance.find("table.table").eq(0).attr("id", "scrolltable-" + (++counter));
                    oid = "scrolltable-" + counter;
                }
            } catch (exception) {
                return
            }
			
			table = $("#" + oid);
			head = table.find("thead");
            head = head.length > 0 ? head : table.find("tbody").eq(0);

            if (reset) {
                $("[scrolltable-id='" + oid + "']").remove();
            }

            if ($("[scrolltable-id='" + oid + "']").length) {
                return
            }

            scrollbarContainer.attr({
                "id": oid + "_scroller",
                "scrolltable-id": oid
            });
            scrollbarDummy.attr({
                "id": oid + "_scroller_dummy",
                "scrolltable-id": oid
            });

            instance.off("resize." + oid);
            instance.on("resize." + oid, function() {
                scrollbar.width(instance[0].scrollWidth);
                scrollbarContainer.width(instance.outerWidth());
                if (scrollbar.width() <= scrollbarContainer.width()) {
                    scrollbarContainer.addClass("hide");
                } else {
                    scrollbarContainer.removeClass("hide");
                }
                return
            });

            scrollbarContainer.on("scroll.scrolltable", function(event) {
                if (scrollbarContainer.data("scrolltable-source") != "instance") {
                    instance.data("scrolltable-source", "scrollbar");
                    instance.scrollLeft($(this).scrollLeft());
                }
                scrollbarContainer.data("scrolltable-source", "");
                return
            });

            instance.on("scroll.scrolltable", function(event) {
                if (instance.data("scrolltable-source") != "scrollbar") {
                    scrollbarContainer.data("scrolltable-source", "instance");
                    scrollbarContainer.scrollLeft($(this).scrollLeft());
                }
                instance.data("scrolltable-source", "");
                return
            });

            scrollbar.html("&nbsp;");
            scrollbarContainer.append(scrollbar);
            scrollbarContainer.css({
                "top": navbarHeight,
                "height": scrollbarSize,
                "overflow-x": "auto",
                "overflow-y": "hidden",
                "z-index": "400"
            });
            scrollbarDummy.css({
                "position": "static",
                "height": scrollbarSize
            }).addClass('hide');

            if (scrollbarSize == 0) {
                instance.attr("scrolltable-hidden-scroll", "true");
            }

            instance.before(scrollbarContainer);
            scrollbarContainer.before(scrollbarDummy);

            if (table.parents(".modal").length) {
                $_positioner = table.parents(".modal").eq(0);
                table.data("positioner", "modal");
            } else if (table.parents(".ui-dialog").length) {
                table.data("positioner", "dialog");
            } else {
                $_positioner = $(window);
                table.data("positioner", "window");
            }
			
			$_positioner.off("scroll.scrolltable." + oid);
            $_positioner.on("scroll.scrolltable." + oid, function() {
                var stickyHeight = !!document.querySelector('.plugin-sticky-fixed') ? $(".plugin-sticky-fixed:visible").outerHeight() : 0; // new 0.2.6
                if (!head.length || oid == undefined) {
                    return
                }
                switch (table.data("positioner")) {
                    case "modal":
                        {
                            oidFixed = (head.offset().top - scrollbarContainer.height() <= 0) &&
                            (head.offset().top - scrollbarContainer.height() + table.height() >= 0);
                            scrollbarContainer.css("top", $(this).scrollTop() - parseInt($(this).find("> .modal-dialog").css("margin-top").replace(/[^0-9]/g, "")));
                            stickyHeight = null;
                            break;
                        }
                    case "dialog":
                        {
                            oidFixed = false;
                            break;
                        }
                    default:
                        {
                            oidFixed = ($(this).scrollTop() > head.offset().top - navbarHeight - scrollbarSize - (stickyHeight == null ? 0 : stickyHeight) - scrollbarContainer.height()) &&
                            ($(this).scrollTop() < head.offset().top - navbarHeight - scrollbarSize - (stickyHeight == null ? 0 : stickyHeight) - scrollbarContainer.height() + table.height());
                            break;
                        }
                }
                try {
                    oidFixed = oidFixed && !scrollbarContainer.hasClass("hide");
                    if (oidFixed) {
                        scrollbarContainer.css("position", "fixed");
                        scrollbarDummy.removeClass('hide');
                        if (stickyHeight != null && !scrollbarContainer.hasClass("plugin-scrollbar-position-finished")) { // new 0.2.6
                            scrollbarContainer.attr("plugin-scrollbar-position-default", scrollbarContainer.css("top"));
                            scrollbarContainer.css("top", function(index, value) {
                                return parseInt(parseInt(value.replace("px", "")) + parseInt(stickyHeight)) + "px";
                            });
                            scrollbarContainer.addClass("plugin-scrollbar-position-finished");
                        }
                    } else {
                        scrollbarContainer.css("position", "static");
                        scrollbarDummy.addClass('hide');
                        if (scrollbarContainer.hasClass("plugin-scrollbar-position-finished")) { // new 0.2.6
                            scrollbarContainer.removeClass("plugin-scrollbar-position-finished");
                            scrollbarContainer.css("top", scrollbarContainer.attr("plugin-scrollbar-position-default"));
                        }
                    }
                } catch (scrollException) {
                    return
                }
                return
            });

            instance.addClass("scrolltable-ready");
			
            scrollbarContainer.scrollLeft(instance.scrollLeft());
            instance.trigger("resize." + oid);
            $(window).trigger("scroll.scrolltable");
            return
        });
        return
    }
})(jQuery);