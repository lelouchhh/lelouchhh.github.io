/************************************
          MINIMALECT 1.0 APEX EDITION
  A minimalistic select replacement

 jQuery 1.7+ required.
 this is fork from original plugin by @groenroos

Fully rebuild and add many options and method

Developer Andrew Ivanychev 

pitmov@gmail.com

 Licensed under the MIT license.

************************************/

//назначение опций и вызов методов происходит через метод data
// $("#example").data("plugin_minimalect").showChoices();
var timerIdPlugin;
var c = 1;
var globalRequestCounter = 0;
var executeAlready = 0;

(function($, window, document, undefined) {

    var pluginName = "minimalect",
        defaults = {
            // settings
            theme: "", // name of the theme used
            transition: "fade",
            remove_empty_option: true,

            // messages
            placeholder: "Select a choice", // default placeholder when nothing is selected
            empty: "No results match your keyword.", // error message when nothing matches the filter search term
            //apex options
            apexMode: "NO",
            apexProcess: "",
            apexParameters: [],
            //x01 занят текущим значением комбобокса
            //advanced options
            allowNewValues: "NO",
            inputField: "input",
            initialData: "",
            // classes
            class_container: "minict_wrapper", // wrapper div for the element
            class_group: "minict_group", // list item for an optgroup
            class_empty: "minict_empty", // "No results" message
            class_active: "active", // applied to wrapper when the dropdown is displayed
            class_selected: "selected", // the currently selected item in the dropdown
            class_hidden: "hidden", // an item that doesn't match the filter search term
            class_highlighted: "highlighted", // item highlighted by keyboard navigation
            class_first: "minict_first", // first visible element
            class_last: "minict_last", // last visible element
            ul_id: "", //unique id of ul elements
            class_ul:"", //additional class for ul_element, it's add, if user want custom css options for  list
            // callbacks
            beforeinit: function() {}, // called before Minimalect is initialized
            afterinit: function(objContext) {$(objContext.element).trigger("minimalect-init");}, // called right after Minimalect is initialized
            onchange: function() {}, // called whenever the user changes the selected value
            onopen: function() {}, // called when the dropdown is displayed
            onclose: function() {}, // called when the dropdown is hidden
            onfilter: function() {} // called every time the filter has been activated
        };

    // The actual plugin constructor
    function Plugin(element, options) {
        var pluginElem = this;
        this.element = $(element);
        this.options = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.label = $('[for="' + this.element.attr('id') + '"]').attr('for', 'minict_' + this.element.attr('id'));
        this.options.ul_id = 'element_' + this.getUniqueId();
        this.init();
    }

    Plugin.prototype = {

        init: function() {
            // before init callback
            this.options.beforeinit();

            // PREPWORK
            var m = this;
            // create the wrapper
            this.wrapper = $('<div class="minict_wrapper minict_wrapper_combo form-control ' + this.options.class_container + '"></div>');
            // hide the original select and add the wrapper
            this.element.after(this.wrapper);
            this.element.hide();
            // apply the current theme to the wrapper
            if (this.options.theme) this.wrapper.addClass(this.options.theme);
            // create and add the input
            if (this.options.inputField == 'input') {
                this.input = $('<input class="form-control" type="text" value="' + (this.element.find("option[selected]").html() || "") + '" placeholder="' + (this.element.find("option[selected]").html() || this.options.placeholder) + '" ' + (this.element.is('[tabindex]') ? ('tabindex=' + this.element.attr('tabindex')) : '') + ' />').appendTo(this.wrapper);
            } else if (this.options.inputField == 'textarea') {
                this.input = $('<textarea placeholder="' + (this.element.find("option[selected]").html() || this.options.placeholder) + '" ' + (this.element.is('[tabindex]') ? ('tabindex=' + this.element.attr('tabindex')) : '') + '>' + (this.element.find("option[selected]").html() || "") + '</textarea>').appendTo(this.wrapper);
            }
            // parse the select itself, and create the dropdown markup
            if (this.options.initialData == "") {
                this.ul = $('<ul class="minimalect_ul '+this.options.class_ul+'" id="' + this.options.ul_id + '">' + m.parseSelect() + '<li class="' + m.options.class_empty + '">' + m.options.empty + '</li></ul>').appendTo(this.wrapper);//appendTo("body");
            } else {
                var initialElements = "";
                for (i = 0; i < this.options.initialData.values.length; i++) {
                    initialElements += '<option value="' + this.options.initialData.values[i].value + '">' + this.options.initialData.values[i].name + '</option>';
                }
                this.element.empty().append(initialElements);
                this.ul = $('<ul class="minimalect_ul '+this.options.class_ul+'" id="' + this.options.ul_id + '">' + m.parseSelect() + '<li class="' + m.options.class_empty + '">' + m.options.empty + '</li></ul>').appendTo(this.wrapper);//appendTo("body");
            }
            this.items = this.ul.find('li');
            // if it's preselected, select the option itself as well
            if (this.element.find("option[selected]").length) {
                this.items.each(function() {
                    if ($(this).attr("data-value") == m.element.find("option[selected]").val()) {
                        $(this).addClass(m.options.class_selected);
                        return false;
                    }
                });
            }

            // LISTEN TO THE ORIGINAL FOR CHANGES
            m.element.on("change", function() {
                var current = m.items.filter("." + m.options.class_selected),
                    markup = m.parseSelect();
                var dataVal;
                if (m.element.val() != current.data("value")) {
                    m.hideChoices(m.wrapper, function() {
                        if (m.element.val() === "") {
                            // A common convention is to have an
                            // empty option in a select list to act
                            // as a place holder. Thus we only want
                            // display an input value if the input
                            // is non-empty
                            m.input.val('').attr('placeholder', m.options.placeholder);
                        } else {
                            m.ul.html(markup + '<li class="' + m.options.class_empty + '">' + m.options.empty + '</li>');
                            m.items = m.ul.find('li');
                            m.items.each(function() {
                                if ($(this).attr("data-value") == m.element.val()) {
                                    dataVal = $(this);
                                    return false;
                                }
                            });
                            m.selectChoice(dataVal);
                        }
                    });
                }
            });
            // BIND EVENTS
            // hide dropdown when you click elsewhere
            $(document).on("click", function(e) {
                m.hideChoices(m.wrapper)
            });
            // hide dropdown when moving focus outside it
            this.wrapper.find("*").on("focusout", function() {
                m.hideChoices(m.wrapper);
            });
            // toggle dropdown when you click on the dropdown itself
            this.wrapper.on("click", function(e) {
                if (m.ul.is(':visible')) {
                    e.stopPropagation();
                    m.hideChoices(m.wrapper);
                } else {
                    e.stopPropagation();
                    m.showChoices(m.wrapper);
                }
            });
            // select choice when you click on it
            this.ul.on("mousedown", "li:not(." + m.options.class_group + ", ." + m.options.class_empty + ")", function() {
                m.selectChoice($(this));
            });
            // toggle dropdown when you click on the associated label, if present
            this.label.on("click", function(e) {
                e.stopPropagation();
                m.input.trigger('focus')
            });
            // stop the dropdown from closing when you click on a group or empty placeholder
            this.ul.on("click", "li." + m.options.class_group + ", li." + m.options.class_empty, function(e) {
                e.stopPropagation();
                m.input.focus();
            });
            // key bindings for the input element
            this.input.on("focus click", function(e) {
                e.stopPropagation();
                m.showChoices();
                $(this).select();
            }).on("keydown", function(e) {
                // keyboard navigation
                switch (e.keyCode) {
                    // up
                    case 38:
                        m.navigateChoices('up');
                        break;
                        // down
                    case 40:
                        m.navigateChoices('down');
                        break;
                        // enter
                    case 13:
                        if (m.options.inputField == 'textarea') {
                            var op = m.options;
                            var currElem = m.items.filter("." + op.class_highlighted);
                            if (currElem.length == 0) {
                                break;
                            }
                        }
                        // tab
                    case 9:
                        // select the highlighted choice
                        if (m.items.filter("." + m.options.class_highlighted).length)
                            m.selectChoice(m.items.filter("." + m.options.class_highlighted));
                        // or if there is none, select the first choice after filtering
                        else if (m.input.val())
                            m.selectChoice(m.items.not("." + m.options.class_group + ", ." + m.options.class_empty).filter(':visible').first());
                        if (e.keyCode === 13) {
                            e.preventDefault();
                            m.hideChoices(m.wrapper);
                        }
                        break;
                        // escape
                    case 27:
                        // close the select and don't change the value
                        m.hideChoices(m.wrapper);
                        break;
                }
            }).on("keyup", function(e) {
                // if we're not navigating, filter
                if ($.inArray(e.keyCode, [38, 40, 13, 9, 27]) === -1) {
                    m.loadingUl();
                    clearTimeout(timerIdPlugin);
                    timerIdPlugin = setTimeout(function() {
                        m.filterChoices();
                    }, 450);
                }
            });
            // after init callback
            this.options.afterinit(this);
        },

        // navigate with a keyboard
        // dr - direction we're going, either "up" or "down"
        navigateChoices: function(dr) {
            var m = this,
                wr = m.wrapper, // jQuery reference for the wrapper
                op = m.options, // options object
                items = m.items;
            // list all the elements that aren't navigatable
            var ignored = "." + op.class_hidden + ", ." + op.class_empty + ", ." + op.class_group;

            if (!items.filter("." + op.class_highlighted).length) { // if nothing is selected, select the first or last
                if (dr === 'up') {
                    items.not(ignored).last().addClass(op.class_highlighted);
                } else if (dr === 'down') {
                    items.not(ignored).first().addClass(op.class_highlighted);
                }
                return false;
            } else { // if something is selected...
                // ...remove current selection...
                cur = items.filter("." + op.class_highlighted);
                cur.removeClass(op.class_highlighted);
                // ...and figure out the next one
                if (dr === 'up') {
                    if (items.not(ignored).first()[0] != cur[0]) { // if we're not at the first
                        cur.prevAll("li").not(ignored).first().addClass(op.class_highlighted); // highlight the prev
                        // make sure it's visible in a scrollable list
                        var offset = items.filter("." + op.class_highlighted).offset().top - m.ul.offset().top + m.ul.scrollTop();
                        if (m.ul.scrollTop() > offset)
                            m.ul.scrollTop(offset);
                    } else { // if we are at the first
                        items.not(ignored).last().addClass(op.class_highlighted); // highlight the last
                        // make sure it's visible in a scrollable list
                        m.ul.scrollTop(m.ul.height());
                    }
                } else if (dr === 'down') {
                    if (items.not(ignored).last()[0] != cur[0]) { // if we're not at the last
                        cur.nextAll("li").not(ignored).first().addClass(op.class_highlighted); // highlight the next
                        // make sure it's visible in a scrollable list
                        var ddbottom = m.ul.height(),
                            libottom = items.filter("." + op.class_highlighted).offset().top - m.ul.offset().top + items.filter("." + op.class_highlighted).outerHeight();
                        if (ddbottom < libottom)
                            m.ul.scrollTop(m.ul.scrollTop() + libottom - ddbottom);
                    } else { // if we are at the last
                        items.not(ignored).first().addClass(op.class_highlighted); // highlight the first
                        // make sure it's visible in a scrollable list
                        m.ul.scrollTop(0);
                    }
                }
            }
        },

        // parse the entire select based on whether it has optgroups or not, and return the new markup
        parseSelect: function() {
            var m = this,
                ulcontent = "";
            if (!m.element.find("optgroup").length) { // if we don't have groups
                // just parse the elements regularly
                ulcontent = this.parseElements(m.element.html());
            } else { // if we have groups
                // parse each group separately
                m.element.find("optgroup").each(function() {
                    // create a group element
                    ulcontent += '<li class="' + m.options.class_group + '">' + $(this).attr("label") + '</li>';
                    // and add its children
                    ulcontent += m.parseElements($(this).html());
                });
            }
            return ulcontent;
        },

        // turn option elements into li elements
        // elhtml - HTML containing the options
        parseElements: function(elhtml) {
            var m = this,
                readyhtml = "";
            // go through each option
            $($.trim(elhtml)).filter("option").each(function() {
                var $el = $(this);
                if ($el.attr('value') === '' && m.options.remove_empty_option) return;
                // create an li with a data attribute containing its value
                readyhtml += '<li data-value="' + $el.val() + '" class="' + ($el.attr("class") || "") + '">' + $el.text().replace('\n', '<br />') + '</li>';
            });
            // spit it out
            return readyhtml;
        },

        // toggle the visibility of the dropdown
        toggleChoices: function() {
            (!this.wrapper.hasClass(this.options.class_active)) ? this.showChoices() : this.hideChoices(this.wrapper);
        },

        // show the dropdown
        // cb - callback before the animation plays
        showChoices: function(cb) {
            var m = this,
                wr = this.wrapper, // jQuery reference for the wrapper
                op = this.options; // options object
            var offs = this.input.offset();
            var elTop = offs.top + this.input.height();
            var elLeft = offs.left;
            var elWidth = this.input.parent().width() + 28;
			this.ul.css({
                "top": '0px',//elTop + 'px',
                "left": '0px',//elLeft + 'px',
				//"width": elWidth + 'px',
				"margin-left": '0px',
				"margin-top": '30px'
            });
            if (!wr.hasClass(op.class_active)) {
                // keep the first and last classes up to date
                this.updateFirstLast(false);
                // close all other open minimalects
                $("." + op.class_container).each(function() { //todo this doesn't work if the container classes are different
                    if ($(this)[0] !== wr[0])
                        m.hideChoices($(this));
                });
                // internal callback
                if (typeof cb === 'function') cb.call();
                // add the active class
                wr.addClass(op.class_active);
                switch (op.transition) {
                    case "fade":
                        m.ul.fadeIn(150);
                        break;
                    default:
                        m.ul.show();
                        break;
                }
                // make the input editable
                //this.input.val("").focus();
                this.input.focus();
                this.filterChoices();
                // callback
                this.options.onopen();
            } else {
                // internal callback
                if (typeof cb === 'function') cb.call();
            }
        },

        resetDropdown: function(cb) {
            var op = this.options; // options object
            // reset the filtered elements
            this.items.removeClass(op.class_hidden);
            // hide the empty error message
            this.ul.find("." + op.class_empty).hide();
            // reset keyboard navigation
            this.items.filter("." + op.class_highlighted).removeClass(op.class_highlighted);
            // internal callback
            if (typeof cb === 'function') cb.call();
        },

        // hide the dropdown
        // wr - jQuery reference for the wrapper
        // cb - callback for after the animation has played
        hideChoices: function(wr, cb) {
            globalRequestCounter++; //increase counter to stop ajax response show
            if (executeAlready == 0) {
                executeAlready = 1;

                var op = this.options, // options object
                    input = wr.find(op.inputField);
                var countElem = 0;
                var currValue = "";
                if (wr.hasClass(op.class_active)) {
                    // remove the active class and fade out
                    wr.removeClass(op.class_active);

                    switch (op.transition) {
                        case "fade":
                            this.ul.fadeOut(150);
                            break;
                        default:
                            this.ul.hide();
                            break;
                    }

                    //this.resetDropdown(cb);

                    // blur the input
                    input.blur();
                    // reset it
                    if (input.attr("placeholder") != op.placeholder) {
                        // if we have a previously selected value, restore that
                        if (op.allowNewValues != 'YES') {
                            if (input.val() != "" || (!op.remove_empty_option && input.val() == "")) {
                                this.element.children("option").each(function() {
                                    if ($(this).text() == input.val()) {
                                        currValue = $(this).val();
                                        countElem++;
                                        $(this).attr("selected", "selected");
                                        return false;
                                    }
                                });
                            }
                            if (countElem == 0) {
                                input.val(input.attr("placeholder"));
                                this.element.change();
                                this.options.onchange();
                            } else {
                                input.attr("placeholder", input.val());
                                this.element.val(currValue).change();
                                this.options.onchange();
                            }
                        } else {
                            if (input.val() != "" || (!op.remove_empty_option && input.val() == "")) {
                                this.element.children("option").each(function() {
                                    if ($(this).text() == input.val()) {
                                        currValue = $(this).val();
                                        countElem++;
                                        $(this).attr("selected", "selected");
                                        return false;
                                    }
                                });
                            }
                            if (countElem == 0) {
                                this.element.append('<option value="' + input.val() + '">' + input.val() + '</option>');
                                input.attr("placeholder", input.val());
                                this.element.val(input.val()).change();
                                this.options.onchange();
                            } else {
                                this.element.val(currValue).attr("selected", "selected").change();
                                this.options.onchange();
                            }
                        }
                    } else if (!this.items.filter("." + op.class_selected).length || op.allowNewValues == 'YES') {
                        // if we have no selection, empty it to show placeholder
                        if (op.allowNewValues != 'YES') {
                            this.element.children("option").each(function() {
                                if ($(this).text() == input.val()) {
                                    currValue = $(this).val();
                                    countElem++;
                                    $(this).attr("selected", "selected");
                                    return false;
                                }
                            });
                            if (countElem == 0) {
                                input.val("");
                            } else {
                                input.attr("placeholder", input.val());
                                this.element.val(currValue).change();
                                this.options.onchange();
                            }
                        } else {
                            this.element.children("option").each(function() {
                                if ($(this).text() == input.val()) {
                                    currValue = $(this).val();
                                    countElem++;
                                    $(this).attr("selected", "selected");
                                    return false;
                                }
                            });
                            if (countElem == 0) {
                                this.element.append('<option value="' + input.val() + '">' + input.val() + '</option>');
                                input.attr("placeholder", input.val());
                                this.element.val(input.val()).change();
                                this.options.onchange();
                            } else {
                                input.attr("placeholder", input.val());
                                this.element.val(currValue).change();
                                this.options.onchange();
                            }
                        }
                    }
                    // callback
                    op.onclose();
                } else {
                    // internal callback
                    if (typeof cb === 'function') cb.call();
                }
                executeAlready = 0;
            }
        },

        //вот здесь надо аякс вызовы делать для фильтрации результата
        // filter choices based on user input
        filterChoices: function() {
            var wr = this.wrapper, // jQuery reference for the wrapper
                op = this.options; // options object
            var currentObj = this;
            // get the filter value
            var filter = this.input.val();
            // reset keyboard navigation
            if (op.apexMode == 'NO') {
                this.items.filter("." + op.class_highlighted).removeClass(op.class_highlighted);

                // filter through each option
                this.items.not(op.class_group).each(function() {
                    // if there's no match, hide it. otherwise, unhide it
                    if ($(this).text().search(new RegExp(currentObj.escapeRegExp(filter), "i")) < 0)
                        $(this).addClass(op.class_hidden);
                    else
                        $(this).removeClass(op.class_hidden);
                });

                // make sure optgroups with no choices are hidden
                // sort of a kludge since we have no hierarchy
                this.items.filter("." + op.class_group).removeClass(op.class_hidden).each(function() {
                    nextlis = $(this).nextAll("li").not("." + op.class_hidden + ", ." + op.class_empty);
                    if (nextlis.first().hasClass(op.class_group) || !nextlis.length) $(this).addClass(op.class_hidden);
                });

                // show a "no results" placeholder if there's nothing to show
                $("ul#" + op.ul_id).find("." + op.class_empty).hide();
                if (!this.items.not("." + op.class_hidden + ", ." + op.class_empty).length) {
                    $("ul#" + op.ul_id).find("." + op.class_empty).show();
                    // callback, no results found
                    this.options.onfilter(false);
                } else {
                    // callback, results found
                    this.options.onfilter(true);
                }

                // keep the first and last classes up to date
                this.updateFirstLast(true);
                this.hideUl();
            } else if (op.apexMode == 'YES') {
                var m = this;
                var arrVal = this.options.apexParameters.slice();
                arrVal.unshift(filter);
                globalRequestCounter++;
                runAsyncAjaxRequest(null, null, $("#pFlowStepId").attr("value"), 0, "APPLICATION_PROCESS=" + op.apexProcess, null, null, ['x01', 'x02', 'x03', 'x04', 'x05', 'x06', 'x07', 'x08', 'x09'], arrVal, function(ajax, params) {
                    if ((params == globalRequestCounter) && (wr.hasClass(op.class_active))) {
                        var pVal = ajax.response;
                        if (pVal != '{}') {
                            pVal = pVal.replace('\n', '<newline>', 'g');
                            var optElements = jQuery.parseJSON(pVal);
                            var optHtml = '';
                            if (optElements.values.length > 0) {
                                for (i = 0; i < optElements.values.length; i++) {
                                    optHtml += '<option value="' + optElements.values[i].value.replace('<newline>', '\n', 'g') + '">' + optElements.values[i].name.replace('<newline>', '\n', 'g') + '</option>';
                                }
                            }
                            optHtml = '<option value=""></option>' + optHtml;
                            var currentVal = m.element.val();
                            var currentPlaceholder = m.input.attr("placeholder");
                            var counterVals = 0;
                            m.element.empty().append(optHtml);
                            m.element.find('option').each(function() {
                                if ($(this).val() == currentVal) {
                                    $(this).attr('selected', 'selected');
                                    counterVals++;
                                    return false;
                                }
                            });
                            if (counterVals == 0) {
                                m.element.append('<option selected="selected" value="' + currentVal + '">' + currentPlaceholder + '</option>');
                            }
                            m.ul.empty().append(m.parseSelect() + '<li class="' + op.class_empty + '">' + op.empty + '</li>');
                            m.items = m.ul.find('li');
                            m.items.filter("." + op.class_highlighted).removeClass(op.class_highlighted);
                        }
                        // filter through each option
                        m.items.not(op.class_group).each(function() {
                            // if there's no match, hide it. otherwise, unhide it
                            if ($(this).text().search(new RegExp(currentObj.escapeRegExp(filter), "i")) < 0)
                                $(this).addClass(op.class_hidden);
                            else
                                $(this).removeClass(op.class_hidden);


                            if ($(this).text() == filter)
                                $(this).addClass(op.class_selected);
                        });

                        // make sure optgroups with no choices are hidden
                        // sort of a kludge since we have no hierarchy
                        m.items.filter("." + op.class_group).removeClass(op.class_hidden).each(function() {
                            nextlis = $(this).nextAll("li").not("." + op.class_hidden + ", ." + op.class_empty);
                            if (nextlis.first().hasClass(op.class_group) || !nextlis.length) $(this).addClass(op.class_hidden);
                        });
                        // show a "no results" placeholder if there's nothing to show
                        $("ul#" + op.ul_id).find("." + op.class_empty).hide();
                        if (!m.items.not("." + op.class_hidden + ", ." + op.class_empty).length) {
                            $("ul#" + op.ul_id).find("." + op.class_empty).show();
                            // callback, no results found
                            m.options.onfilter(false);
                        } else {
                            // callback, results found
                            m.options.onfilter(true);
                        }

                        // keep the first and last classes up to date
                        m.hideUl();
                        m.updateFirstLast(true);
                    } else {
                        m.hideUl();
                        return false;
                    }
                }, globalRequestCounter);
            }
        },

        // select the choice defined
        // ch - jQuery reference for the li element the user has chosen
        selectChoice: function(ch) {
            var el = this.element, // jQuery reference for the original select element
                op = this.options; // options object
            // apply the selected class
            this.items.removeClass(op.class_selected);
            ch.addClass(op.class_selected);
            var chDataText = ch.html().replace('<br>', '\n');
            var chDataValue = ch.data("value");
            this.wrapper.addClass(op.class_active);
            //console.log("chDataText:"+chDataText);
            //console.log("chDataValue:"+chDataValue);
            // show it up in the input
            if (!chDataValue) {
                // empty value = reset to placeholder
                this.input.val('').attr("placeholder", op.placeholder);
            } else {
                // new value
                this.input.val(chDataText).attr("placeholder", chDataText);
            }
            // if the selected choice is different
            if (el.find('option:selected').val() != chDataValue) {
                // update the original select element
                el.find("option:selected").prop("selected", false).each(function() {
                    $(this).removeAttr("selected")
                });

                el.find('option').each(function() {
                    if ($(this).val() == chDataValue) {
                        $(this).prop("selected", true);
                        $(this).attr("selected", "selected");
                        return false;
                    }
                });
                // call original select change event
                el.trigger('change');
            }

            // callback
            this.options.onchange(chDataValue, chDataText);
        },

        // keep the first and last classes up-to-date
        // vi - whether we want to count visibility or not
        updateFirstLast: function(vi) {
            var wr = this.wrapper, // jQuery reference for the wrapper
                op = this.options; // options object
            $("ul#" + op.ul_id).find("." + op.class_first + ", ." + op.class_last).removeClass(op.class_first + " " + op.class_last);
            if (vi) {
                this.items.filter(":visible").first().addClass(op.class_first);
                this.items.filter(":visible").last().addClass(op.class_last);
            } else {
                this.items.first().addClass(op.class_first);
                this.items.not("." + op.class_empty).last().addClass(op.class_last);
            }
        },
        loadingUl: function(ul) {
            var ulElement = this.ul;
            if (!jQuery.data(ulElement, "uniqueId")) {
                //$(ulElement).fadeTo('slow',.6);
                var topCoord = $(ulElement).offset().top;
                var leftCoord = $(ulElement).offset().left;
                var widthVal = $(ulElement).width();
                var heightVal = $(ulElement).height();
                var c = 1;
                var uniqueId = this.getUniqueId();
                jQuery.data(ulElement, "uniqueId", uniqueId);
                $("body").append('<div class="loaderObj element_' + uniqueId + '" style="overflow: hidden; position: absolute;top:' + topCoord + 'px;left:' + leftCoord + 'px;width: ' + widthVal + 'px;height:' + heightVal + 'px;z-index:99999999999;opacity:0.4;filter: alpha(opacity = 50); text-align: center;"><span style="display: block;font-size: 20px;margin-top: 10px;color: #000000;font-weight: bold;" class="loaderText">Загрузка ...</span></div>');
            }
        },
        getUniqueId: function() {
            var d = new Date(),
                m = d.getMilliseconds() + "",
                u = ++d + m + (++c === 10000 ? (c = 1) : c);

            return u;
        },
        hideUl: function(ul) {
            var ulElement = this.ul;
            var uniqueId = jQuery.data(ulElement, "uniqueId");
            jQuery.removeData(ulElement, "uniqueId");
            $(".element_" + uniqueId).remove();
            //$(ulElement).fadeTo('slow',1);
        },
        setData: function(data) {
            this.setValue();
            if (data == "") {
                this.element.empty();
                this.ul.empty().append(this.parseSelect() + '<li class="' + this.options.class_empty + '">' + this.options.empty + '</li>'); //= $('<ul class="minimalect_ul">'+this.parseSelect()+'<li class="'+this.options.class_empty+'">'+this.options.empty+'</li></ul>').appendTo(this.wrapper);
            } else {
                var setElements = '';
                for (i = 0; i < data.values.length; i++) {
                    setElements += '<option value="' + data.values[i].value + '">' + data.values[i].name + '</option>';
                }
                this.element.empty().append(setElements);
                //this.ul = $('<ul class="minimalect_ul">'+this.parseSelect()+'<li class="'+this.options.class_empty+'">'+this.options.empty+'</li></ul>').appendTo(this.wrapper);
                this.ul.empty().append(this.parseSelect() + '<li class="' + this.options.class_empty + '">' + this.options.empty + '</li>');
            }
        },
        setValue: function(val) {
            var wr = this.wrapper;
            var currValue = "";
            var countElem = 0;
            if ((val == "") || (val == null)) {
                this.input.val("");
                this.input.attr("placeholder", this.options.placeholder);
                if (!this.options.remove_empty_option) {
                    this.element.children("option").each(function() {
                        if ($(this).val() == val) {
                            currValue = $(this).val();
                            countElem++;
                            return false;
                        }
                    });
                    if ((countElem == 0) && (this.options.allowNewValues == "YES")) {
                        this.element.append('<option value="' + val + '">' + val + '</option>')
                        this.element.val(val).change();
                    } else {
                        this.element.val(currValue).change();
                    }
                }
            } else {
                this.element.children("option").each(function() {
                    if ($(this).val() == val) {
                        currValue = $(this).val();
                        countElem++;
                        return false;
                    }
                });
                if ((countElem == 0) && (this.options.allowNewValues == "YES")) {
                    this.element.append('<option value="' + val + '">' + val + '</option>')
                    this.element.val(val).change();
                } else {
                    this.element.val(currValue).change();
                }
            }
        },
        escapeRegExp: function(str) {
            return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
        }
    };

    $.fn[pluginName] = function(options) {
        return this.each(function() {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new Plugin(this, options));
            }
        });
    };

})(jQuery, window, document);