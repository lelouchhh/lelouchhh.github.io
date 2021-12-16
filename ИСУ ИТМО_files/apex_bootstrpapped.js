//function to show Help on modal window
function ShowHelp(p_dom_element_id) {
    apex.server.process("get_help_for_dom_element", {
        x01: p_dom_element_id
    }, {
        success: function(pData) {
            $('#s4atb-helptext-container').html(pData);
            $('#s4atb-modalHelp').modal();

        },
        dataType: "text"
    });
}

//function to show which dom-elements have helptekst on page
function s4atb_HelpOn() {
    apex.server.process("get_ids_with_help_on_cur_page", {}, {
        success: function(pData) {
            //add a border to all Dom-elements with help
            $(pData).addClass("s4atb-help");

            //remove links
            $("a").not("#P1000_HELP_ON,#P1000_HELP_OFF").removeAttr("href"); //remove all links

            $('*').unbind('click') // takes care of jQuery-bound click events
            .attr('onclick', '') // clears `onclick` attributes in the HTML
            .each(function() { // reset `onclick` event handlers
                this.onclick = null;
            });

            //remove any previous modal Help
            $("#s4atb-modalHelp").remove();

            //create a modal Help
            $("body").append("<div class=\"modal fade\" id=\"s4atb-modalHelp\"><div class=\"modal-dialog\"><div class=\"modal-content\"><div class=\"modal-header\"><button type=\"button\" class=\"close\" data-dismiss=\"modal\"><span aria-hidden=\"true\">&times;</span><span class=\"sr-only\">Close</span></button><h4 class=\"modal-title\">Help</h4></div><div class=\"modal-body\"><div id=\"s4atb-helptext-container\">#HELPTEKST#</div></div><div class=\"modal-footer\"><button type=\"button\" class=\"btn btn-default\" data-dismiss=\"modal\">Close</button></div></div></div></div>");

            //add click event to dom-elements with help-tekst
            $('.s4atb-help').on('click', function(event) {
                event.preventDefault();
                event.stopImmediatePropagation();
                ShowHelp(this.id);
            });
        },
        dataType: "text"
    });
}

function QueryString(p_paramname) {
    p_paramname = p_paramname.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + p_paramname + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function closemodal() {
    var modalid = $.cookie("s4atb-modalid");
    $.cookie("s4atb-modalid", "")
    window.parent.$('#' + modalid).modal('hide');
}

function nl_s4a_bootstrap_modal_iframed() {

    var width = this.action.attribute01,
        height = this.action.attribute02,
        pagenumber = this.action.attribute03,
        pageitem = this.action.attribute04,
        valuetype = this.action.attribute05,
        itemvalue = this.action.attribute06,
        id = this.action.attribute07,
        action = this.action.attribute08,
        app_id = this.action.attribute09,
        app_session = this.action.attribute10,
        app_debug = this.action.attribute11,
        app_pf = this.action.attribute12,
        modalrefresh = this.action.attribute13,
        url, theID;

    //How should we interpret the itemvalue?
    switch (valuetype) {
        case "jQuery-selector":
        case "link-attribute":
            itemvalue = $(this.triggeringElement).attr(itemvalue);
            break;
        case "fixed value":
            itemvalue = itemvalue;
            break;
        default:
            itemvalue = "";
    }

    url = "f?p=" + app_id + ":" + pagenumber + ":" + app_session + "::" + app_debug + "::" + pageitem + ":" + itemvalue + ":" + app_pf + "&modalid=" + id;

    // destroy the current element
    $("#" + id).remove();

    // create a new element
    $('body').append("<div class='modal fade' id='" + id + "' tabindex='-1' role='dialog' aria-hidden='true'>" + "<div class='modal-dialog'>" + "<div class='modal-content iframe-content'>" + "<iframe id='" + id + "iframe' class='modaliframe' allowtransparency='true' src='" + url + "' width='" + width + "' height='" + height + "'></iframe>" + "</div><!-- /.modal-content -->" + "</div><!-- /.modal-dialog -->" + "</div><!-- /.modal fade -->");

    // adjust the modal width
    $("#" + id + ' .modal-dialog').css('width', eval(eval(width) + 5) + 'px');

    // show the modal
    $("#" + id).modal({
        show: true
    });

    $("#" + id).on('hidden.bs.modal', function() {
        apex.jQuery(modalrefresh).trigger('apexrefresh');
    });
}

// alter the pagination
function tbpaginate(p_regionid) {
    var pagList = "#report_" + p_regionid.substring(1) + "_catch  ul.pagination",
        newPag = "";
    $(pagList).children().each(
        function(index) {
            switch ($(this).prop("tagName")) {
                case 'B':
                    newPag += "<li class='active'><a>" + $(this).html() + "</a></li>";
                    break;
                case 'A':
                    newPag += '<li><a href="' + $(this).attr("href") + '">' + $(this).html() + "</a></li>";
                    break;
                case 'LI':
                    newPag += "<li>" + $(this).html() + "</a></li>"
                    break;
                case 'LABEL':
                    $(this).children("select").addClass("form-control");
                    newPag += "<li>" + $(this).html() + "</a></li>"
                    break;
                default:
                    break;
            }
        }
    );
    if (newPag.length == 0) {
        newPag = "<li>" + $(pagList).html() + "</li>";
    }
    $(pagList).html(newPag);

    apex.jQuery('#' + p_regionid).unbind("apexafterrefresh")
    apex.jQuery('#' + p_regionid).bind("apexafterrefresh", function() {
        if ($("#report_" + p_regionid).hasClass("transform")) {
            G2.dataTable($("#report_" + p_regionid));
        } else {
            if (!$("#report_" + p_regionid).parent().hasClass("scrolltable-ready")) {
                try {
                    $($("#report_" + p_regionid).parents(".table-responsive")[0]).scrolltable(true);
                } catch (exception) {}
            }
        }
    });
    if ($("#report_" + p_regionid).hasClass("transform") && !$("#report_" + p_regionid).hasClass("dataTable")) {
        apex.jQuery('#' + p_regionid).trigger("apexafterrefresh");
    }
    return
}

function AddClasses() {
    $("[addclass]").each(function() {
        $(this).addClass($(this).attr("addClass"));
        // hook on the parent region while paginating reports
        if ($(this).get(0).tagName == "TABLE") {
            $("#" + $(this).attr("id").substring(7)).bind("DOMSubtreeModified", function() {
                $(this).find("[addclass]").each(function() {
                    $(this).addClass($(this).attr("addClass"));
                });
                //addclasses();
            });
        }
    });
}

// remember the active state of pills tabs and accordions
function ActiveState() {
    var json, tabsState;

    $('a[data-toggle="pill"], a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
        var href, json, parentId, tabsState;
        tabsState = localStorage.getItem("tabs-state");

        json = JSON.parse(tabsState || "{}");
        parentId = $(e.target).parents("ul.nav.nav-pills, ul.nav.nav-tabs").attr("id");
        href = $(e.target).attr('href');
        json[parentId] = href;

        return localStorage.setItem("tabs-state", JSON.stringify(json));
    });

    tabsState = localStorage.getItem("tabs-state");
    json = JSON.parse(tabsState || "{}");

    $.each(json, function(containerId, href) {
        return $("#" + containerId + " a[href=" + href + "]").tab('show');
    });

    $("ul.nav.nav-pills, ul.nav.nav-tabs").each(function() {
        var $this = $(this);
        if (!json[$this.attr("id")]) {
            return $this.find("a[data-toggle=tab]:first, a[data-toggle=pill]:first").tab("show");
        }
    });
    /**/


    // remember active accordion       
    var jsonAccordion, accordionState;
    $('.panel-collapse').on('shown.bs.collapse', function(e) {
        var panel, json, parentId, accordionState;
        accordionState = localStorage.getItem("accordion-state");

        json = JSON.parse(accordionState || "{}");
        parentId = $(e.target).parents("div.panel-group ").attr("id");
        panel = $(e.target).attr("id");
        json[parentId] = panel;

        return localStorage.setItem("accordion-state", JSON.stringify(json));
    });

    accordionState = localStorage.getItem("accordion-state");
    jsonAccordion = JSON.parse(accordionState || "{}");

    $.each(jsonAccordion, function(containerId, panel) {
        return $("#" + panel).collapse('show');
    });
    /**/
}

$(document).ready(
    function() {
        //change all input type to bootstrap inputs with class "form-control"
        //$("input,textarea,select").not("[type='checkbox']").not("[type='radio']").not("[type='file']").not(".form-control, .no-form-control").addClass("form-control");
		$("input,textarea,select").filter(':not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([type="file"]):not(.form-control):not(.no-form-control)').addClass('form-control');

        //remove all classes from fieldset so default bootstrap CSS is back
        //$("fieldset").removeClass();

        //change succes items to TB-succes
        $(".has-success").each(function(index) {
            //remove the class from the origional
            $(this).removeClass("has-success");

            //add the class to div with class "form-group"
            $(this).parent("div.form-group").addClass("has-success");
        });

        //change warning items to TB-warning
        $(".has-warning").each(function(index) {
            //remove the class from the origional
            $(this).removeClass("has-warning");

            //add the class to div with class "form-group"
            $(this).parent("div.form-group").addClass("has-warning");
        });

        //change error items to TB-error
        $(".has-error").each(function(index) {
            //remove the class from the origional
            $(this).removeClass("has-error");

            //add the class to div with class "form-group"
            $(this).parent("div.form-group").addClass("has-error");
        });

        // set InteractiveReport parent table to 100% width
        $("table.apexir_WORKSHEET_DATA").parents("table:first").css("width", "100%");

        // initiate tooltips
        $('[data-toggle="tooltip"]').tooltip();

        // initiate select lists
        //$('.selectpicker').selectpicker();

        // actions to create input-groups and button groups
        //remove edit links
        $(".s4atb-input-group a.eLink, .s4atb-button-group a.eLink").remove();

        //remove display-only labels
        $(".s4atb-input-group > span[style='display: none;']").remove();

        //remove hidden items
        $(".s4atb-input-group input[type='hidden']").remove();

        //when input-group with thext, then add input-group-addon to text
        $(".s4atb-input-group > span[class='display_only']").addClass("input-group-addon");

        //when input-group with checkbox, then add input-group-addon to checkbox
        $(".s4atb-input-group > div[class='checkbox']").addClass("input-group-addon");

        //when input-group with button, then add a container around the button 
        $('.s4atb-input-group > .btn').wrap('<div class="input-group-btn"></div>');

        //remove all labels for checkbox and radio 
        $(".s4atb-input-group label").remove();

        //add an arrow to a dropdown button
        $('div.s4atb-button-group .dropdown-toggle').append("<span class=\"caret \"></span>");

        //remove containers (ie DIV) but retain their contents
        $('.removecontainer').replaceWith($('.removecontainer').html());

        //remove empty panel-footers
        $('div.panel-footer').filter(function() {
            //return $(this).text().replace(/[^\W]+/gi, '') == '';
            return $(this).text().replace(/\s/gi, '').length == 0;
        }).remove();

        //remove empty font-awesome elements from panel headings
        $("div.panel-heading > i").each(function() {
            var l_classList = $(this).attr('class').split(/\s+/);
            var l_removeelement = true;
            var l_haystack = ":fa:fa-lg:fa-2x:fa-3x:fa-4x:fa-5x:fa-fw:fa-ul:fa-li:fa-border:pull-right:pull-left:fa-spin:fa-rotate-90:fa-rotate-180:fa-rotate-90:fa-rotate-270:fa-flip:horizontal:fa-flip-vertical:fa-inverse:";
            for (ii = 0; ii < l_classList.length; ii++) {
                if (l_haystack.indexOf(":" + l_classList[ii] + ":") == -1) {
                    l_removeelement = false;
                }
            }
            if (l_removeelement) {
                $(this).remove();
            }
        });

        // make all panels without a specific type a PANEL-DEFAULT
        $("div.panel").each(function(index) {
            var l_classList = $(this).attr('class').trim().split(/\s+/);
            if (l_classList.length == 1) $(this).addClass("panel-default");
        });

        // add classes based on the addClass attribute
        AddClasses();

        // Set inline for checkboxes and radios
        $('div[inline="true"]').each(function() {
            $(this).children('fieldset').css('display', 'inline');
            $(this).find('table').each(function() {
                var newcontent = '';
                $(this).find('input').each(function() {
                    newcontent += $(this).siblings('label').addClass('checkbox-inline').prepend($(this)).clone().wrap('<wrap></wrap>').parent().html();
                });
                $(this).replaceWith(newcontent);
            });
        });

        // Set Activestate for tabs and Accordions

        ActiveState();

        // activate popover
        $('body').find('[data-toggle="popover"]').popover();

        // show the content (defaults to hidden), prevents flicker
        $('body').css('visibility', 'inherit');

        $.fn.modal.Constructor.prototype.enforceFocus = function() {};

        // Fix bootstrap-modal backdrop height bug on change content-size
        /*$('.modal .modal-body').on('resize', function() {
            $(this).find('.modal-backdrop').css('height', $(this).find('.modal-content').height() + 100);
        });*/
		$('.modal .modal-body').on('resize',function () {
			var modalWindow = $(this.closest('.modal'));
			if (modalWindow.is('.in')) {
				modalWindow.modal('handleUpdate');
			}
		});

        // Set tooltip in report after refresh
        apex.jQuery(document.body).on('apexafterrefresh', function(e) {
            var targetObj = $(e.target);
			if (targetObj.is('[id^="report"]') || targetObj.is('#apexir_WORKSHEET')) { // If it's a report region
                targetObj.find('[data-toggle="tooltip"]').tooltip(); // add tooltip
				
				if (targetObj.find('[data-mustache-template]').length) { // render mustache
					G2.mustacheRender(null,'[data-mustache-template]',targetObj);
				}
				
				// Add form-control class
				targetObj.find("input[type='text']:not(.form-control, .no-form-control),input[type='password']:not(.form-control, .no-form-control)," + 
								"select:not(.form-control, .no-form-control),textarea:not(.form-control, .no-form-control)").addClass("form-control");
								
				// Activate ScrollTable
				if (targetObj.is('[id^="report"]')) {
					targetObj.scrolltable();
				}
            }
        });

        // Bootstrap modal scroll-fix + tooltip
        $(document).on('hidden.bs.modal', function(e) {
			$(e.target).find('[data-toggle="tooltip"]').tooltip('hide');
            if ($('.modal:not(:hidden)').length) {
                $('body').addClass('modal-open');
            }
        });

    });

function hideShow(regionId, obj, callback) {
    if ($('#' + regionId).hasClass('hide')) {
        $('#' + regionId).removeClass('hide');
        $('#' + regionId).css('display', 'none');
        if ($(obj).parent().find('.fa-hide-show').hasClass('fa-chevron-circle-right')) {
            var angle = 90;
        } else var angle = 0;

        $(obj).parent().find('.fa-hide-show').css({
            'transform': 'rotate(' + angle + 'deg)'
        });

        $('#' + regionId).slideDown(function() {
            try {
                $($('#' + regionId).parents(".modal")[0]).data('bs.modal').handleUpdate();
            } catch (e) {}
            if (typeof callback == "function") {
                callback();
            }
        });
    } else {
        if ($(obj).parent().find('.fa-hide-show').hasClass('fa-chevron-circle-right')) {
            var angle = 0;
        } else {
            var angle = -90;
        }
        $(obj).parent().find('.fa-hide-show').css({
            'transform': 'rotate(' + angle + 'deg)'
        });
        $('#' + regionId).slideUp(function() {
            $('#' + regionId).addClass('hide');
            try {
                $($('#' + regionId).parents(".modal")[0]).data('bs.modal').handleUpdate();
            } catch (e) {}
            if (typeof callback == "function") {
                callback();
            }
        });
    }
}

// alter the pagination for interactive report
function tbpaginateinteractive() {
    pagList = $("#apexir_DATA_PANEL").find('td.pagination').children(".fielddata");
    $(pagList).each(function() {
        var context = this,
            newPag = "";
        $(this).children().each(
            function(index) {
                switch ($(this).prop("tagName")) {
                    case 'B':
                        newPag += "<li class='active'><a>" + $(this).html() + "</a></li>";
                        break;
                    case 'A':
                        if ($(this).find('img').attr('title') == '>') {
                            newPag += '<li><p class="no-border pagination-text">' + $(context).text() + '</p></li>';
                            newPag += '<li><a href="' + $(this).attr("href") + '">' + $(this).find('img').attr('title').replace('>', '»').replace('<', '«') + "</a></li>";
                        } else {
                            newPag += '<li><a href="' + $(this).attr("href") + '">' + $(this).find('img').attr('title').replace('>', '»').replace('<', '«') + "</a></li>";
                        }
                        break;
                    case 'LI':
                        newPag += "<li>" + $(this).html() + "</a></li>"
                        break;
                    case 'LABEL':
                        $(this).children("select").addClass("form-control");
                        newPag += "<li>" + $(this).html() + "</a></li>"
                        break;
                    default:
                        break;
                }
            }
        );
        if (newPag.length == 0) {
            newPag = "<li>" + $(context).html() + "</li>";
        }
        $(context).replaceWith('<ul class="pagination">' + newPag + '</ul>');
    });
    return
}

(function removeFormControl() {
    $(document).ready(function() {
        $("#apexir_SEARCH").removeClass('form-control');
        $("#apexir_search").removeClass('form-control');
        $("#apexir_rollover").appendTo("body");
        tbpaginateinteractive();
        apex.jQuery('#apexir_WORKSHEET_REGION').bind('apexafterrefresh', function() {
            tbpaginateinteractive();
        });
		
		// Multiple-click by <a> fix
		(function () {
			var clickedArray = [];
			
			function clearLink (link) {
				setTimeout(function(){
					clickedArray = clickedArray.filter(function(obj){
						return obj != link
					});
				},4000);
			}
			
			function goByLink (link) {
				if (link.target) {
					window.open(link.href,link.target);
				} else {
					window.location.href = link.href;
				}
			}
			
			$(document.body).on('click','a[href*="f?p="]', function(e) {
				if (this.closest('.note-editable')) {
					return false;
				}
				e.preventDefault();
				try {
					var link = this,
						linkOption = link.href.match(/f\?p\=.{0,}/)[0].replace(/^f\?p\=/,'').split(':');
					if (linkOption[3] != '') {
						goByLink(link);
						return false;
					}
					if (!clickedArray.some(function(obj){ return obj == link })) {
						clickedArray.push(link);
						clearLink(link);
						goByLink(link);
					} else {
						return false;
					}
				}
				catch (e) {
					goByLink(this);
				}
			});
		})();
		
		(function () { // Added by Viktor 29.03.2017
			$("#content-wrapper").on("resize", function() {
				$('#content-wrapper > div:first-child > .alert-page').css('width', $(this).outerWidth());
			});
			$('#content-wrapper > div:first-child > .alert-page').css('width', $('#content-wrapper').outerWidth());
		})();
    });
})();

/*(function optimizationScrollHover () {
	var body = document.body,
		timer;

	window.addEventListener('scroll', function() {
		clearTimeout(timer);
		if (!body.classList.contains('disable-hover')) {
			body.classList.add('disable-hover')
		}

		timer = setTimeout(function() {
			body.classList.remove('disable-hover')
		},300);
	}, false);
})();*/