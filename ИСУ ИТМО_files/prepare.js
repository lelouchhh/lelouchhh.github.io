function Constants() {};

Constants.bgs = [];
// $.getScript("/i/tiny_mce/tiny_mce.js", function(data, textStatus, jqxhr) { return });

Constants.entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;',
    "/": '&#x2F;'
};

function G2() {}

G2.prototype = {}

G2.options = {};

G2.countLoaders = 0;
G2.menuLoaderFlag = null;

G2.init = function() {
    apex.extPrepared = true;
    if (document.getElementById('main-menu')) {
        this.menuInit();
    }
    this.affix();
    this.backStory();
    this.checkAndRadio();
    this.logo();
    this.rds();
    this.panels();
    this.formControl();
    this.grid();
    this.labels();
    if (document.getElementById('main-navbar')) {
        this.mainNavInit();
        this.mainNavInitDropdown();
        this.mainNavInitSmall();
        this.mainNavInitSupport();
        this.search();
    }
    this.wizard();
    this.bTree();
    this.scrolltables();
    this.sticky();
    this.expandTextarea($("textarea.autoexpand"));
    //this.addLocalStorage();
    var objContext = this;
    apex.jQuery("body").on('apexafterrefresh', function() {
        objContext.checkAndRadio();
    });
    try {
        bootbox.setLocale("ru");
    } catch (bootboxException) {}
    return
}

G2.getPathname = function () {
	return window.location.pathname.match(/.*\//)[0];
}

G2.ajax = function(init) {
    function addParam(name, value) {
        ajax_param.push({
            name: name,
            value: value
        });
    }
	
	function divideRowByN (row, n) {
		var res = [];
		if (!n || typeof row != 'string' || row.length == 0) {
			return res;
		}
		for (var i = 0; i < (row.length / n); i++) {
			res.push(row.substr(i * n,n));
		}
		return res;
	}
	
	function getComplete (callback) {
		return function (res) {
			var argsArray = Array.from(arguments);
			if (res.responseText.match(/c2adf6ecc220f2711801d6e466340183/) || res.status == 401 || res.status == 404 || res.responseText.match(/expired cookie/)) {
				$_obj = $(document.createElement("div")); 
				$_obj.attr("style", "width:100%;height:100%;position:fixed;top:0px;left:0px;text-align:center;z-index:1000001;background-color:#000;opacity:0.5;filter:alpha(opacity=50);filter:progid:DXImageTransform.Microsoft.Alpha(opacity=50);display:block!important;color:#FFF;font-size:30px;padding-top:10px;");
				$_obj.html("Вы вышли из системы.");
				$("body").append($_obj); 
				setTimeout(function() {
					setTimeout(function() {
						$("body").append($_obj);
					}, 500);
					window.location.href = 'f?p=' + $v("pFlowId") + ':LOGIN:0';
				}, 1500);
			} else if (typeof callback == 'function'){
				callback.apply(this, argsArray);
			}
		};
	}

    var instance = $v("pInstance"),
        app = $v("pFlowId"),
        page = $("#pFlowStepId").val(),
        request = '',
		method = 'POST',
		data_type = null,
		g_array_counter = 1,
        params = {
            names: [],
            values: []
        },
        g_params = {
            names: [],
            values: []
        },
		g_arrays = {
			names: [],
			values: []
		},
        ajax_param = [],
		complete = getComplete(),
		success = function () {},
		error = function () {};

    // init object processing
    if (init) {
		if (init.request) {
			request = init.request;
		} else if (init.process) {
			request = init.process.match(/^APPLICATION_PROCESS=/) ? init.process : ('APPLICATION_PROCESS=' + init.process);
		}

		if (init.app || init.flow) {
			app = +init.app || +init.flow;
		}

		if (typeof init.page != 'undefined') {
			page = +init.page;
		}

		if (init.params) {
			if (Array.isArray(init.params)) {
				init.params.forEach(function(obj, ind) {
					params.names.push(obj);
					params.values.push($v(obj));
				});
            }
            else if (init.params.names && init.params.values && Array.isArray(init.params.names) && Array.isArray(init.params.values)) {
                params.names = init.params.names;
                params.values = init.params.values;
            }
        }

        if (init.g_params) {
            if (Array.isArray(init.g_params)) {
                init.g_params.forEach(function(obj, ind) {
                    g_params.names.push("X" + (ind < 9 ? "0" : "") + (ind + 1));
                    g_params.values.push(obj);
                });
            } else if (init.g_params.names && init.g_params.values && Array.isArray(init.g_params.names) && Array.isArray(init.g_params.values)) {
                g_params.names = init.g_params.names;
                g_params.values = init.g_params.values;
            }
        }
		
		if (init.g_arrays) {
			if (init.g_arrays.names && init.g_arrays.values && Array.isArray(init.g_arrays.names) && Array.isArray(init.g_arrays.values)) {
				g_arrays.names = init.g_arrays.names;
                g_arrays.values = init.g_arrays.values;
			} else if (Array.isArray(init.g_arrays)) {
				init.g_arrays.forEach(function (arr, ind) {
					g_arrays.names.push("F" + (g_array_counter < 10 ? "0" : "") + g_array_counter);
                    g_arrays.values.push(arr);
					g_array_counter++;
				});
			}
		}
		
		if (init.g_clobs && Array.isArray(init.g_clobs)) {
			if (g_arrays.names.length) {
				g_array_counter = g_arrays.names.map(function (t) {
					return +t.substr(1);
				}).sort(function (a,b) {
					return a > b ? 1 : a < b ? -1 : 0;
				}).slice(-1)[0] + 1;
			}
			
			init.g_clobs.forEach(function (clob, ind) {
				g_arrays.names.push("F" + (g_array_counter < 10 ? "0" : "") + g_array_counter);
				g_arrays.values.push(divideRowByN(clob, 4000));
				g_array_counter++;
			});
		}
		
		if (init.data_type) {
			data_type = init.data_type;
		}
		
		if (init.complete && typeof init.complete == 'function') {
			complete = getComplete(init.complete);
		}
		
		if (init.success && typeof init.success == 'function') {
			success = init.success;
		}
		
		if (init.error && typeof init.error == 'function') {
			error = init.error;
		}
		
		if (init.callback && typeof init.callback == 'function') {
			complete = getComplete(init.callback);
		}
		
		if (init.method) {
			method = init.method.toUpperCase();
		}
    }
	
	if (!request) {
		console.warn('Вызов функции G2.ajax без параметров request и process крайне не рекомендуется');
	}

    // preparing request
    params.names.forEach(function(obj, ind) {
        addParam('p_arg_names', obj);
    });

    params.names.forEach(function(obj, ind) {
        addParam('p_arg_values', (typeof params.values[ind] == 'undefined' || params.values[ind] === null) ? '' : params.values[ind]);
    });
	
	if (g_params.names.length > 50) {
		console.error('Превышен лимит использования глобальных переменных');
		return false;
	}

    g_params.names.forEach(function(obj, ind) {
        addParam(obj, (typeof g_params.values[ind] == 'undefined' || g_params.values[ind] === null) ? '' : g_params.values[ind]);
    });
	
	if (g_arrays.names.length > 50) {
		console.error('Превышен лимит использования массивов данных');
		return false;
	}
	
	g_arrays.names.forEach(function (name, ind) {
		if (g_arrays.values[ind] && Array.isArray(g_arrays.values[ind])) {
			g_arrays.values[ind].forEach(function (elem, i) {
				addParam(name, elem);
			});
		}
	});

    addParam('p_flow_id', app);
    addParam('p_flow_step_id', page);
    addParam('p_instance', instance);
    addParam('p_request', request);

    return $.ajax({
        url: G2.getPathname() + 'wwv_flow.show',
        method: method,
		dataType: data_type,
        traditional: true,
        data: ajax_param,
		complete: complete,
		success: success,
		error: error
    });
};

G2.affix = function () {
    var obj = $('.page-header'), 
		stub;
    if (!obj.length) {
        return
    }
	
	$(document).ready(function () {
		stub = $('[for=".page-header"]');
		if (!stub.length) {
			stub = $('<div>');
			stub.attr('for', '.page-header');
		}
		if (!obj.next().is(stub)) {
			obj.after(stub);
		}
	});
	
    obj.on ('affix.bs.affix', function () {
		stub = $('[for=".page-header"]');
		if (!stub.length) {
			stub = $('<div>');
			stub.attr('for', '.page-header');
		}
        stub.css({"height": $(this).outerHeight(true)});
		if (!obj.next().is(stub)) {
			obj.after(stub);
		}
        return
    });
    obj.on ('affix-top.bs.affix', function () {
        return
    });
    obj.on ('affixed.bs.affix', function () {
		if (Array.prototype.slice.call(document.querySelectorAll('.sticky')).filter(function (t){return t.getBoundingClientRect().height > 0}).length) {
			stub.html('<style>.plugin-sticky-fixed {margin-top:' + ( +$(this).outerHeight(false) - 17) + 'px; padding-top: 10px;}</style>');
		}
    });
    obj.one ('affixed.bs.affix', function () {
        var objAffixed = $(this);
        try {
            $('.sticky').each(function () {
                $(this).attr('plugin-data-sticky-scroll-initial', function (index, currVal) {
                    return +currVal - (+objAffixed.outerHeight(false));
                });
            });
        } catch (noSticky) {}
    });
    if ($(window).scrollTop() > 0) {
        obj.trigger('affix.bs.affix').trigger('affixed.bs.affix');
    }
}

G2.sticky = function() {
    try {
        $(".sticky").sticky();
    } catch (e) {}
    try {
        $(".panel:not(.no-sticky) > .panel-controls:first-child").sticky();
    } catch (e) {}
}

G2.backStory = function() {
    var $ph = ($('#page-signup-bg').length > 0) ? $('#page-signup-bg') : $('#page-signin-bg'),
        $img = $ph.find('> img');

    $(window).on('resize', function() {
        $img.attr('style', '');
        if ($img.height() < $ph.height()) {
            $img.css({
                height: '100%',
                width: 'auto'
            });
        }
    });
}

G2.expandTextarea = function($_textarea) {
    var $_textarea = $($_textarea),
        maxHeight = $_textarea.data('maxHeight') || $_textarea.height();
    $_textarea.css({
        "resize": "none",
        "max-height": maxHeight
    });
    $_textarea.on("keyup paste ", function() {
        var obj = $(this);
        obj.css({
            "height": "0"
        });
        var currentHeight = obj.get(0).scrollHeight;
        obj.css({
            "overflow": (+currentHeight > +maxHeight) ? "auto" : "hidden",
            "height": currentHeight + "px"
        });
        return;
    });

    $_textarea.trigger("keyup");
    return $_textarea;
}

G2.labels = function() {
    $(document).on("mouseenter.controllabel", "label.control-label:not(.custom-tooltip)", function() {
        if ($().isOverflowed && $(this).isOverflowed()) {
            if ($(this).data("g2tooltip") != true) {
                $(this).tooltip({
                    title: $(this).text(),
                    placement: "auto",
                    "html": true,
                    container: "body"
                }).tooltip("show");
                $(this).data("g2tooltip", true);
            }
        } else {
            $(this).data("g2tooltip", false);
            $(this).tooltip("destroy");
        }
    });
    $(document).on("mouseenter.buttons", "button.btn,input[type='button']", function() {
        if ($().isOverflowed && $(this).isOverflowed()) {
            if ($(this).data("g2tooltip") != true) {
                if (typeof $(this)[0].dataset.toggle != 'undefined') {
                    $(this).data("g2tooltip_unOverflowed", {
                        placement: $(this)[0].dataset.placement,
                        toggle: $(this)[0].dataset.toggle,
                        originalTitle: $(this)[0].dataset.originalTitle
                    });
                }
                $(this).tooltip({
                    title: $(this).val(),
                    placement: "auto",
                    "html": true,
                    container: "body"
                }).tooltip("show");
                $(this).data("g2tooltip", true);
            }
        }
    });
    $(document).on("mouseleave.buttons", "button.btn,input[type='button']", function() {
        if ($().isOverflowed && $(this).isOverflowed() && $(this).data("g2tooltip") === true) {
            $(this).data("g2tooltip", false);
            if (typeof $(this).data("g2tooltip_unOverflowed") != 'undefined') {
                $(this).attr({
                    "data-toggle": $(this).data("g2tooltip_unOverflowed").toggle,
                    "data-placement": $(this).data("g2tooltip_unOverflowed").placement,
                    "data-original-title": $(this).data("g2tooltip_unOverflowed").originalTitle
                });
            } else {
                $(this).tooltip("destroy");
            }
        }
    });
    $("#main-menu").on("mouseenter.menu", ".navigation > li > a", function() {
        if ($(this).parent().hasClass("mm-dropdown") || !$("body").hasClass("mmc")) {
            $(this).data("g2tooltip", false);
            $(this).tooltip("destroy");
        } else {
            if ($(this).data("g2tooltip") != true) {
                $(this).tooltip({
                    title: $(this).html(),
                    placement: "right",
                    "html": true,
                    container: "body"
                }).tooltip("show");
                $(this).data("g2tooltip", true);
            }
        }
    });
    return
}

G2.logo = function() {
    $(".subsystem-logo > a").attr("title", function(i, val) {
        return val.replace(/(^<span\s+>)|(<\/span>$)/ig, "");
    });
    $(".subsystem-logo > a").attr("data-original-title", function(i, val) {
        return val.replace(/(^<span\s+>)|(<\/span>$)/ig, "");
    });
    if ($(".subsystem-logo > a").length > 0) {
        document.title += ' ['+$(".subsystem-logo > a").attr("data-original-title")+']';    
    }
    return
}

G2.scrolltables = function() {
    $(document).scrolltable();
}

G2.regionLoader = function(obj, loaderText, fontSize, fontTopMargin) {
    return ShowLoaderRegion(obj, loaderText, fontSize, fontTopMargin);
}

G2.regionUnLoader = function(obj) {
    return HideLoaderRegion(obj);
}

G2.loader = function(obj, text) {
    if ($(".G2item.simpleLoader").length) {
        G2.countLoaders++;
        return $(".G2item.simpleLoader");
    }
    var $_load = $(document.createElement('i')),
        $_hldr = $(document.createElement('div'));
    if ((text != null) && (text != undefined)) {
        $_load.html(text);
    } else {
        $_load.addClass('fa fa-circle-o-notch fa-spin');
    }
    $_hldr.addClass('G2item simpleLoader text-center');
    $_hldr.html($_load);
    $('body').append($_hldr);
    return $_hldr;
}

G2.boxLoader = function(text, obj) {
    if (obj == undefined || obj == null) {
        $(".boxLoaderSuper,.boxLoaderContainer").remove();
    } else {
        if (typeof obj != "object") {
            obj = $(obj);
        }
        if (obj.get(0) == $("body").get(0)) {
            $(".boxLoaderSuper,.boxLoaderContainer").remove();
            obj = null;
        } else {
            try {
                if (obj.find(" > .boxLoaderContainer")) {
                    obj.find(" > .boxLoaderContainer").remove();
                }
            } catch (e) {}
        }
    }
    var $_ldr = $(document.createElement("div"));
    $_ldr.addClass("loader");
    if (obj == undefined || obj == null) {
        $_ldr.addClass("boxLoaderSuper");
    }
    $_ldr.css("display", "none");
    $_ldr.append('<div class="boxLoader">' +
        '<div class="square" ></div>' +
        '<div class="square" ></div>' +
        '<div class="square last" ></div>' +
        '<div class="square clear" ></div>' +
        '<div class="square" ></div>' +
        '<div class="square last" ></div>' +
        '<div class="square clear" ></div>' +
        '<div class="square" ></div>' +
        '<div class="square last" ></div>' +
        '</div>'
    );
    if (text != undefined) {
        text = text.trim();
        if ((text != null) && (text != "")) {
            $_ldr.find(".boxLoader").append('<div class="text">' + text + '</div>');
        }
    } else {
        $_ldr.find(".boxLoader").append('<div class="text">' + 'Загрузка ...' + '</div>');
    }
    if (obj == undefined || obj == null) {
        var $_before = ($("#main-menu").length ? $("#main-menu") : $("#wwvFlowForm")),
            isModalOn = $(".modal-backdrop").is(":visible");
        $_before.after($_ldr);
        if (isModalOn) {
            $_ldr.css({
                left: "0"
            });
        }
        if (($("#main-menu").length) && !isModalOn) {
            $_ldr.find(".boxLoader").addClass("boxLoaderWM");
            $_ldr.css({
                "z-index": "590"
            });
        }
    } else {
        var $_obj = obj;
        try {
            $_obj.find(" > .boxLoaderContainer").remove();
        } catch (e) {}
        var $_hldr = $(document.createElement("div"));
        $_hldr.addClass("boxLoaderContainer");
        $_obj.prepend($_hldr);
        $_hldr.append($_ldr);
        $_hldr.css("position", "relative");
        $_ldr.css({
            "position": "absolute",
            "height": $_obj.height()
        });
        $_ldr.find(" > .boxLoader").css("left", "45%");
        $_ldr = $_hldr;
    }
    $_ldr.fadeIn(250);
    return $_ldr;
}

G2.superManLoader = function(text, obj, real) {
    if (real == true) {
        return G2.superManLoaderReal(text, obj);
    }
    if ((obj) && ($(obj).get(0) != $("body").get(0))) {
        return G2.regionLoader(obj, text);
    }
    return G2.boxLoader(text, obj);
}

G2.superManLoaderReal = function(text, obj) {
    if (obj == undefined || obj == null) {
        $(".superManLoader").remove();
    } else {
        if (typeof obj != "object") {
            obj = $(obj);
        }
        try {
            if (obj.find(" > .superManLoader")) {
                obj.find(" > .superManLoader").remove();
            }
        } catch (e) {}
    }
    var $_ldr = $(document.createElement("div"));
    $_ldr.addClass("loader superManLoader");
    $_ldr.html(
        '<div class="body_loader">' +
        '<span>' +
        '<span></span>' +
        '<span></span>' +
        '<span></span>' +
        '<span></span>' +
        '</span>' +
        '<div class="base">' +
        '<span></span>' +
        '<div class="face"></div>' +
        '</div>' +
        '</div>' +
        '<div class="longfazers">' +
        '<span></span>' +
        '<span></span>' +
        '<span></span>' +
        '<span></span>' +
        '</div>' +
        '<h1>' + $nvl(text, 'Загрузка...') + '</h1>');
    if (obj == undefined || obj == null) {
        var $_before = ($("#main-menu").length ? $("#main-menu") : $("#wwvFlowForm"));
        $_before.after($_ldr);
        if ($(".modal-backdrop").is(":visible")) {
            $_ldr.css({
                left: "0"
            });
        }
    } else {
        var $_obj = obj;
        try {
            $_obj.find(" > .superManLoaderContainer").remove();
        } catch (e) {}
        var $_hldr = $(document.createElement("div"));
        $_hldr.addClass("superManLoaderContainer");
        $_obj.prepend($_hldr);
        $_hldr.append($_ldr);
        $_hldr.css("position", "relative");
        $_ldr.css({
            "position": "absolute",
            "height": $_obj.height()
        });
        $_ldr.find(" > .body_loader").css("left", "45%");
        $_ldr = $_hldr;
    }
    return $_ldr;
}

G2.boxDeloader = function(ldr) {
    var obj;
    if (ldr == undefined || ldr == null) {
        obj = $(".loader,.simpleLoader,.superManLoader,.superManLoaderContainer,.boxLoader,.boxLoaderContainer,.boxLoaderSuper");
    } else {
        obj = ldr;
    }
    obj.fadeOut(250, function() {
        $(this).remove();
        return;
    });
    return;
}

G2.superManDeloaderReal = function(ldr) {
    if (ldr == undefined || ldr == null) {
        $(".loader,.simpleLoader,.superManLoader,.superManLoaderContainer,.boxLoader,.boxLoaderContainer,.boxLoaderSuper").remove();
    } else {
        ldr.remove();
    }
    return;
}

G2.superManDeloader = function(ldr) {
    G2.regionUnLoader(ldr);
    return this.boxDeloader(ldr);
}

G2.deloader = function(ldr) {
    G2.countLoaders--;
    if (G2.countLoaders > 0) {
        return;
    }
    if ((ldr == null) || (ldr == undefined)) {
        $('.G2item.simpleLoader').remove();
    } else {
        ldr.remove();
    }
    return;
}

G2.progress = function(obj, text) {
    if (((obj == null) || (obj == undefined)) && $('.G2item.simpleProgress').length > 0) {
        return $($('.G2item.simpleProgress')[0]);
    }
    G2.loader(obj, text);
    var width = $(document).width(),
        steps = 1000,
        color = "#777";
    $_progress = $(document.createElement('div'));
    $_progress.addClass('G2item simpleProgress');
    $('body').append($_progress);
    $_progress.velocity({
        width: 0
    }, {
        easing: [steps],
        duration: 600
    }).velocity({
        width: width,
        backgroundColor: color
    }, {
        loop: 999,
        delay: 0,
        easing: "easeOut",
        duration: 15000
    });
    return $_progress;
}

G2.deprogress = function(prg) {
    if ((prg == null) || (prg == undefined)) {
        $('.G2item.simpleProgress').remove();
        $('.G2item.simpleLoader').remove();
    } else {
        prg.remove();
    }
    return
}

apex.extLoader = function(obj, text) {
    G2.loader(obj, text);
    return
}
apex.extDeloader = function(ldr) {
    G2.deloader(ldr);
}
apex.extProgress = function(obj, text) {
    G2.progress(obj, text);
    return
}
apex.extDeprogress = function(prg) {
    G2.deprogress(prg);
}

G2.submit = function() {
    $('.dataTables_length select,.dataTables_columnFilter input[type="text"],#main-menu [name="menu_search_g2"],#main-menu [name="menu_search_g2"]+#menu_search_g2_clear').remove();
    return
}

G2.formControl = function(container) {
    container = ((container == null) || (container == undefined)) ? $(document) : container;
    container.find("input[type='text']:not(.form-control, .no-form-control),input[type='password']:not(.form-control, .no-form-control),select:not(.form-control, .no-form-control),textarea:not(.form-control, .no-form-control)").addClass("form-control");
    return
}

G2.dataTablePlugin = function (container) {
    var dataTablesList = (container == undefined | null ? $(document) : container).find('.datatable-ready');
    dataTablesList.each(function () {
        DataTables.tables[$(this).attr('for')]();
        return
    });
    return
}

G2.dataTable = function(object, options) {
    var $_target = object,
        $_table;
    if (!$_target.is('table.table')) {
        $_target = $($_target.find('table.table')[0]);
    }
    if ($_target.hasClass('dataTable')) {
        return $_target;
    }
    try {
        if (!$_target.find('tfoot').length) {
            $_tr = $_target.find('thead tr:has(th)');
            $_trc = $_tr.clone();
            $_trc.children('th').each(function() {
                var title = $(this).text(),
                    $_th = $(document.createElement('th')),
                    $_input = $(document.createElement('input'));
                $_th.attr('colspan', $(this).attr('colspan'));
                $_th.attr('rowspan', '1');
                $_th.addClass('dataTables_columnFilter');
                $_input.attr({
                    'type': 'text',
                    'placeholder': 'Поиск по: ' + title + ''
                });
                $_input.addClass('form-control');
                $_th.html($_input);
                $(this).replaceWith($_th);
                return
            });
            $_tfoot = $(document.createElement('tfoot'));
            $_tfoot.append($_trc);
            $_target.find('thead').after($_tfoot);
        }

        $_target.find('th > div.rpt-sort').each(function() {
            $(this).parent().html($($(this).children('a')[0]).html());
            $(this).remove();
            return
        });

        var optionsOfTable = {
            "language": {
                "lengthMenu": "_MENU_",
                "zeroRecords": "Ничего не найдено ...",
                "info": "Страница _PAGE_ из _PAGES_",
                "infoEmpty": "Данные недоступны ...",
                "infoFiltered": "(выбрано из _MAX_ записей)",
                "processing": "<i class=\"fa fa-refresh fa-spin\"></i>",
                "paginate": {
                    "last": "<i class='fa fa-angle-double-right'></i>",
                    "next": "<i class='fa fa-angle-right'></i>",
                    "previous": "<i class='fa fa-angle-left'></i>",
                    "first": "<i class='fa fa-angle-double-left'></i>"
                }
            },
            "dom": '<"table-header clearfix"<"table-caption"><"DT-lf-right"<"DT-per-page"l><"DT-search"f>>r>t<"table-footer clearfix"<"DT-label"i><"DT-pagination"p><"text-default text-center"r>><"clear">',
            "bLengthChange": true,
            "stateSave": false,
            "pageLength": 50,
            "fnDrawCallback": function() {
                var $_content_wrapper = ($("#content-wrapper").length ? $("#content-wrapper") : $(window));
                $_content_wrapper.trigger("resize.datatable-content-wrapper-" + $_target.attr("id"));
                try {
                    if (typeof options.extraDrawCallback) {
                        options.extraDrawCallback();
                    }
                } catch (drawException) {}
                return
            },
            "pagingType": "full_numbers",
            "initComplete": function() {
                var $_wrapper = $($_target.parents(".dataTables_wrapper")[0]),
                    $_hldr = $_wrapper.parent();
                var $_hdr = $_wrapper.find("> .table-header"),
                    $_ftr = $_wrapper.find("> .table-footer");
                $_wrapper.addClass("table-responsive");
                $_hdr.css({
                    "height": "60px"
                });
                $_ftr.css({
                    "min-height": "60px"
                });
                var $_hght = $_hdr.outerHeight(false) - 1,
                    $_mrgn = $_hdr.outerHeight(true),
                    $_fhght = $_ftr.outerHeight(false);
                $_hdr.css({
                    "position": "absolute",
                    "height": $_hght,
                    "margin-top": ($_mrgn * (-1)),
                    "left": "0"
                });
                $_ftr.css({
                    "position": "absolute",
                    "min-height": $_fhght,
                    "left": "0"
                });
                $_wrapper.css({
                    "padding-top": $_hght,
                    "padding-bottom": $_fhght
                });
                $_hldr.parent().css({
                    "position": "relative"
                });
                var $_content_wrapper = ($("#content-wrapper").length ? $("#content-wrapper") : $(window));
                $_content_wrapper.on("resize.datatable-content-wrapper-" + $_target.attr("id"), function() {
                    var $_wdth = $_wrapper.outerWidth(true);
                    $_hdr.css({
                        "width": $_wdth
                    });
                    $_ftr.css({
                        "width": $_wdth
                    });
                    $_wrapper.css({
                        "padding-bottom": $_ftr.outerHeight(false)
                    });
                });
                $_content_wrapper.trigger("resize.datatable-content-wrapper-" + $_target.attr("id"));
                try {
                    $_hldr.scrolltable(true);
                } catch (scrollTableException) {}
                return
            }
        };
        var optionsExtra = (options == undefined) ? {} : options;

        for (var prop in optionsExtra) {
            if (optionsExtra.hasOwnProperty(prop)) {
                optionsOfTable[prop] = optionsExtra[prop];
            }
        }

        $_table = $_target.DataTable(optionsOfTable);

        $_target.parent().find('.dataTables_filter input').attr('placeholder', 'Поиск...');

        $_table.columns().eq(0).each(function(colIdx) {
            $('input', $_table.column(colIdx).footer()).on('keyup change', function() {
                $_table
                    .column(colIdx)
                    .search(this.value)
                    .draw();
            });
        });
    } catch (exception) {
        return $_target;
    }
    return $_target;
}

G2.checkAndRadioWidth = function($_container) {
    var $_group;
    if ($_container.hasClass("checkbox_group") || $_container.hasClass("radio_group")) {
        $_group = $_container;
    } else {
        $_group = $_container.find(".checkbox_group,.radio_group");
    }
    $_group.find("tr").each(function() {
        var max = $(this).find("td").map(function() {
            return $(this).width()
        }).toArray().max();
        $(this).find("td").width(max);
        return
    })
    return
}

G2.checkAndRadio = function(r) {
    r = ((r == null) || (r == undefined)) ? '' : '#' + r + ' ';
    var cnt = Math.max($('[id^=auto_px]').map(function (i,o){
		return +o.id.match(/\d+$/)[0]
	}).toArray().max() + 1,0);
    $(r + ' input[type="checkbox"]:not(.hide):not(.btn>input),' + r + ' input[type="radio"]:not(.hide):not(.btn>input)').each(function() {
		if (!$(this).next().is('label,.lbl')) {
            var $_lbl = $(document.createElement('label'));
            $_lbl.addClass('lbl');
            var $_id = $(this).attr("id");
            if ($_id === undefined || $_id == null) {
                $_id = 'auto_px_' + cnt;
                $(this).attr("id", $_id);
                cnt++;
            }
            $_lbl.attr("for", $_id);
            $(this).after($_lbl);
        } else {
            $(this).next().addClass('lbl');
        }
        return
    });
    $(r + ' input[type="checkbox"]:not(.nopx):not(.btn>input),' + r + ' input[type="radio"]:not(.nopx):not(.btn>input)').addClass('px');
    return
}

G2.switcher = function(obj, size, enabled, square, onText, offText) {
    var switcherOnText = onText || '<span class="fa fa-check"></span>',
        switcherOffText = offText || '<span class="fa fa-times"></span>';
    if (obj != undefined) {
        if (obj.switcherOnText != undefined) {
            switcherOnText = obj.switcherOnText;
            switcherOffText = obj.switcherOffText;
            width = obj.switcherWidth;
            obj = obj.switcherObj;
        }
    } else {
        obj = $(document);
    }
    size = ((size == null) || (size == undefined)) ? 'small' : size.toLowerCase();
    enabled = ((enabled == null) || (enabled == undefined)) ? true : enabled;
    switch (size) {
        case 'large':
            {
                obj.attr('data-class', 'switcher-lg');
                break;
            }
        case 'normal':
            {
                obj.removeAttr('data-class');
                break;
            }
        default:
            {
                obj.attr('data-class', 'switcher-sm');
                break;
            }
    }
    obj.switcher({
        on_state_content: switcherOnText,
        off_state_content: switcherOffText
    });
    if (enabled == false) {
        obj.parent(".switcher").addClass("disabled");
        obj.attr("disabled", "disabled");
    }
	if (square) {
		obj.parent(".switcher").addClass('switcher-theme-square');
	}
    try {
        if (width != undefined) {
            obj.parent(".switcher").css("width", width);
        }
    } catch (e) {}
    return
}

G2.bTree = function(t) {
    t = ((t == null) || (t == undefined)) ? '' : '#' + t + ' ';
    var collapsedClass = 'collapsed',
        expandedClass = 'expanded';
    $(t + '.btree li:has(ul)').addClass('parent_li').find(' > span').attr('title', 'Свернуть').addClass(expandedClass);
    $(t + '.btree li.parent_li > span').on('click', function(e) {
		e.stopPropagation();
        var children = $(this).siblings('ul').find(' > li'),
            treeObj = $(this).closest('.btree'),
            collapsedIcon = treeObj.hasClass('formal') ? 'fa-plus-circle' : (treeObj.hasClass('people') ? '' : (treeObj.hasClass('custom') ? '' : (treeObj.hasClass('image') ? 'fa-caret-down' : 'fa-folder'))),
            expandedIcon = treeObj.hasClass('formal') ? 'fa-minus-circle' : (treeObj.hasClass('people') ? '' : (treeObj.hasClass('custom') ? '' : (treeObj.hasClass('image') ? 'fa-caret-up' : 'fa-folder-open')));
        if (children.is(":visible")) {
            children.hide('fast');
            $(this).removeClass(expandedClass).addClass(collapsedClass);
            $(this).attr('title', 'Развернуть').find(' > i').addClass(collapsedIcon).removeClass(expandedIcon).addClass(collapsedClass).removeClass(expandedClass);
        } else {
            children.show('fast');
            $(this).removeClass(collapsedClass).addClass(expandedClass);
            $(this).attr('title', 'Свернуть').find(' > i').addClass(expandedIcon).removeClass(collapsedIcon).addClass(expandedClass).removeClass(collapsedClass);
        }
        e.stopPropagation();
        return
    });
    
    $(t + '.btree.collapsed li:has(ul)').children('span').addClass('collapsed');
    $(t + '.btree.collapsed li:has(ul)').children('span').attr('title', 'Развернуть').find(' > i').addClass(collapsedClass).removeClass(expandedClass);
    $(t + '.btree.collapsed li.active').each(function() {
        $(this).parents('li').each(function() {
            $(this).children('ul').children('li').show('fast');
            if ($(this).children('ul').length > 0) {
                $(this).children('span').attr('title', 'Свернуть').find(' > i').addClass(expandedClass).removeClass(collapsedClass);
            }
        });
        if ($(this).children('ul').length > 0) {
            $(this).children('ul').children('li').show('fast');
            $(this).children('span').attr('title', 'Свернуть').find(' > i').addClass(expandedClass).removeClass(collapsedClass);
        }
    });
    $(t + '.btree li:has(ul) > span > i').each(function() {
        var treeObj = $($(this).parents('.btree')[0]),
            collapsedIcon = treeObj.hasClass('formal') ? 'fa-plus-circle' : (treeObj.hasClass('people') ? '' : (treeObj.hasClass('custom') ? '' : (treeObj.hasClass('image') ? 'fa-caret-down' : 'fa-folder'))),
            expandedIcon = treeObj.hasClass('formal') ? 'fa-minus-circle' : (treeObj.hasClass('people') ? '' : (treeObj.hasClass('custom') ? '' : (treeObj.hasClass('image') ? 'fa-caret-up' : 'fa-folder-open')));
        $(this).removeClass($(this).hasClass(collapsedClass) ? expandedIcon : collapsedIcon);
        $(this).addClass($(this).hasClass(collapsedClass) ? collapsedIcon : expandedIcon);
        return
    });
    return
}

G2.dTreeDisable = false;
G2.dTree = function(t) {
    if ((G2.dTreeDisable == true) && ((t == null) || (t == undefined))) {
        return
    }
    t = ((t == null) || (t == undefined)) ? '' : '#' + t + ' ';
    $(t + '.tree li').removeClass('fa-folder').removeClass('fa-folder-open').removeClass('fa-file-o');
    $(t + '.tree li > a > ins').addClass('fa fa-file-o no-bg');
    $(t + '.tree li:has(ul) > a > ins').addClass('fa fa-folder no-bg').removeClass('fa-file-o').removeClass('fa-folder-open');
    $(t + '.tree li:has(ul).open > a > ins').addClass('fa fa-folder-open no-bg').removeClass('fa-file-o').removeClass('fa-folder');

    $(t + '.tree li:has(ul) > a,' + t + '.tree li:has(ul)').click(function(e) {
        var obj = $(this).is('a') ? $(this) : $(this).find(' > a');
        setTimeout(function() {
            switch (obj.parent('li').hasClass('open')) {
                case true:
                    {
                        obj.find(' > ins').addClass('fa-folder-open').removeClass('fa-file-o').removeClass('fa-folder');
                        break;
                    }
                default:
                    {
                        obj.find(' > ins').addClass('fa-folder').removeClass('fa-file-o').removeClass('fa-folder-open');
                        break;
                    }
            }
            return
        }, 150);
        return
    });

    return
}

G2.bTreeExpand = function(t) {
    t = ((t == null) || (t == undefined)) ? '' : '#' + t + ' ';

    var collapsedClass = 'collapsed',
        expandedClass = 'expanded';
    $(t + '.btree li').show('fast');
    $(t + '.btree li:has(ul) > span').addClass(expandedClass).removeClass(collapsedClass).find('> i').addClass(expandedClass).removeClass(collapsedClass)
	.each(function() {
        var treeObj = $($(this).parents('.btree')[0]),
            collapsedIcon = treeObj.hasClass('formal') ? 'fa-plus-circle' : (treeObj.hasClass('people') ? '' : (treeObj.hasClass('custom') ? '' : (treeObj.hasClass('image') ? 'fa-caret-down' : 'fa-folder'))),
            expandedIcon = treeObj.hasClass('formal') ? 'fa-minus-circle' : (treeObj.hasClass('people') ? '' : (treeObj.hasClass('custom') ? '' : (treeObj.hasClass('image') ? 'fa-caret-up' : 'fa-folder-open')));
        $(this).addClass(expandedIcon).removeClass(collapsedIcon);
        return
    });
    return
}

G2.bTreeCollapse = function(t) {
    t = ((t == null) || (t == undefined)) ? '' : '#' + t + ' ';

    var collapsedClass = 'collapsed',
        expandedClass = 'expanded';
    $(t + '.btree li:has(ul) > span').addClass(collapsedClass).removeClass(expandedClass).find('> i').addClass(collapsedClass).removeClass(expandedClass);
    $(t + '.btree li').each(function() {
        var treeObj = $($(this).parents('.btree')[0]),
            collapsedIcon = treeObj.hasClass('formal') ? 'fa-plus-circle' : (treeObj.hasClass('people') ? '' : (treeObj.hasClass('custom') ? '' : (treeObj.hasClass('image') ? 'fa-caret-down' : 'fa-folder'))),
            expandedIcon = treeObj.hasClass('formal') ? 'fa-minus-circle' : (treeObj.hasClass('people') ? '' : (treeObj.hasClass('custom') ? '' : (treeObj.hasClass('image') ? 'fa-caret-up' : 'fa-folder-open')));
        if ($(this).is('li:has(ul)')) {
            $(this).children('span').children('i').addClass(collapsedIcon).removeClass(expandedIcon);
        }
        switch ($(this).is(t + '.btree > ul > li')) {
            case true:
                break;
            default:
                {
                    $(this).hide('fast');
                    break;
                };
        }
    });
    return
}

G2.wizard = function(t, w) {
    t = ((t == null) || (t == undefined)) ? 'both' : t.toLowerCase();
    w = ((w == null) || (w == undefined)) ? '' : '#' + w + ' ';
    $(w + 'ul.wizard-steps,' + w + 'ul.wizard-steps-static').each(function() {
        var wizard = $(this),
            wizardList = $(this).children('li'),
            activeFound = false,
            isStatic = $(this).hasClass('wizard-steps-static'),
            isInit = false;
        if (!isStatic) {
            $($(this).parents('.wizard')[0]).pixelWizard();
        }
        for (var i = 0; i < wizardList.length; i++) {
            $(wizardList[i]).find('.wizard-step-number').text(i + 1); //  && $(wizard).hasClass('wizard-independent')
            if (!$(wizardList[i]).hasClass('active') && activeFound == false) {
                $(wizardList[i]).addClass('completed');
                $(wizardList[i]).click(function() {
                    location.href = $(this).attr('data-target');
                    return
                })
            } else {
                switch (activeFound) {
                    case true:
                        {
                            $(wizardList[i]).removeClass('active');
                            if (isStatic) {
                                if ($(wizardList[i]).hasClass('current')) {
                                    $(wizardList[i]).addClass('non-current').removeClass('current');
                                }
                                if ($(wizardList[i]).hasClass('first-current')) {
                                    $(wizardList[i]).addClass('first-non-current').removeClass('first-current');
                                }
                                if ($(wizardList[i]).hasClass('last-current')) {
                                    $(wizardList[i]).addClass('last-non-current').removeClass('last-current');
                                }
                            }
                            break;
                        }
                    default:
                        {
                            if (!isStatic) {
                                $($(this).parents('.wizard')[0]).pixelWizard('setCurrentStep', i + 1);
                                isInit = true;
                            }
                            break;
                        }
                }
                activeFound = true;
            }
        }
        return
    });
    return
}

G2.mainNavInit = function() {
    if ($('#main-navbar ul.nav').length) {
        $('#main-navbar ul.nav > li.nav-icon-btn').each(function() {
            if ($(this).hasClass('dropdown')) {
                $(this).removeClass('nav-icon-btn').addClass('nav-icon');
                $(this).addClass();
                return;
            }
            var params = $(this).children('a').children('.small-screen-text').html().split('|'),
                $_img;
            $(this).children('a').children('.small-screen-text').html(params[0]);
            if ((params[1] != undefined) && (params[1] != '')) {
                $(this).children('a').attr('href', params[1].replace('&amp;', '&'));
            }
            if ((params[2] != undefined) && (params[2] != '')) {
                $(this).children('a').addClass(params[2]);
            }
            if ((params[3] != undefined) && (params[3] != '')) {
                $(this).children('a').children('.nav-icon').addClass(params[3]);
            }
            if ((params[4] != undefined) && (params[4] != '')) {
                $_img = $(document.createElement('img'));
                $_img.attr('src', params[4]);
                $(this).children('a').children('.nav-icon').append($_img);
            }
            if (((params[3] == undefined) || (params[3] == '')) && ((params[4] == undefined) || (params[4] == ''))) {
                $(this).removeClass('nav-icon-btn').addClass('nav-icon');
            }
            if ((params[5] != undefined) && (params[5] != '')) {
                if (params[5].match(/user/i)) {
                    $_img = $(document.createElement('img'));
                    $_img.attr('src', params[4]);
                    $(this).children('a').children('.nav-icon').replaceWith($_img);
                    $(this).children('a').addClass(params[5]);
                } else {
                    $(this).children('a').addClass(params[5]);
                }
            }
            return
        });
    }
    return
}

G2.mainNavInitDropdown = function() {
    if ($('#main-navbar ul.dropdown-menu').length) {
        var $_um = null;
        $('#main-navbar ul.dropdown-menu').click(function() {
            return false;
        })
        $('#main-navbar ul.dropdown-menu > li').each(function() {
            var a = $(this).children('a');
            var params = a.children('span').html().split('|'),
                $_img;
            $(this).children('a').children('span').html(params[0]);
            if ((params[1] != undefined) && (params[1] != '')) {
                a.attr('href', params[1].replace('&amp;', '&'));
            }
            if ((params[2] != undefined) && (params[2] != '')) {
                a.addClass(params[2]);
            }
            if ((params[3] != undefined) && (params[3] != '')) {
                a.children('.dropdown-icon').addClass(params[3]);
            }
            if ((params[4] != undefined) && (params[4] != '')) {
                $_img = $(document.createElement('img'));
                $_img.attr('src', params[4]);
                a.children('.dropdown-icon').append($_img);
            }
            try {
                if (((params[3] == undefined) || (params[3] == '')) && ((params[4] == undefined) || (params[4] == ''))) {
                    a.children('i').replace();
                    a.html(function(index, oldHtml) {
                        return oldHtml.replace(/^((\&nbsp;)|\s){1,}/i, '');
                    });
                }
            } catch (exception) {}

            if ((params[5] != undefined) && (params[5] != '')) {
                if (params[5].match(/user/i)) {
                    $_img = $(document.createElement('img'));
                    $_img.attr('src', params[4]);
                    a.children('i').replaceWith($_img);
                    a.addClass(params[5]);
                } else {
                    a.addClass(params[5]);
                }
            }
            if (a.hasClass('user-menu')) {
                a.html(function(index, oldHtml) {
                    return oldHtml.replace(/((\&nbsp;)){1,}/i, '');
                });
                $_um = a.parent();
                $('#main-navbar ul.nav.right-navbar-nav li.dropdown').after(a.parent());
            }
            return
        });
        if ($_um != null) {
            var $_uma = $($_um.children('a')[0]);
            $_uma.addClass('dropdown-toggle');
            $_uma.attr('data-toggle', 'dropdown');
            $('#main-navbar ul.nav.right-navbar-nav li.dropdown > a').replaceWith($_uma);
        }
        $('#main-navbar ul.dropdown-menu').unbind('click');
    }
    return
}

G2.mainNavInitSupport = function() {
    var links = $('#main-navbar ul.dropdown-menu').find(".support_link,.man_cur_app,.msg_cur_feedback"),
        postpanel = $('#main-menu .menu-content:not(.top)');
    if ((!links.length) || (!postpanel.length)) {
        // G2.notify("Что-то пошло не так ...");
        return;
    }
    var nav = $(document.createElement("ul"));
    nav.addClass("isu-support navigation padding-sm no-padding-hr no-padding-b");
    if ($($("#main-menu .navigation:not(.hide)")).text().trim().length > 0) {
        nav.addClass("bordered no-border-hr no-border-b");
    }
    links.each(function() {
        var obj = $(this).parent("li"),
            i = $($(this).children("i")[0]),
            span = $($(this).children("span")[0]),
            is_blank = $(this).hasClass("support_blank");
        obj.addClass("has-menu-icon");
        $(this).attr("tabindex", "-1");
        if (is_blank) {
            $(this).attr("target", "_blank");
        }
        i.removeClass("dropdown-icon");
        i.removeClass("fa-fw");
        i.addClass("menu-icon");
        span.addClass("mm-text");
        $(this).html(function(index, oldHtml) {
            return oldHtml.replace("&nbsp;&nbsp;", "");
        });
        nav.append(obj);
        return;
    });
    postpanel.css("margin-top", "11px");
    postpanel.before(nav);
    return;
}

G2.mainNavInitSmall = function() {
    if (!$(".user-menu").length) {
        return
    }
    var $_uMenu = $(".user-menu"),
        $_button = $("button.navbar-toggle"),
        $_uMenuClone;
    $_button.addClass("user-menu");
    $_button.html($_uMenu.find(" > img").clone());
    $_button.height($("#main-navbar").height());
    $_uMenuClone = $_uMenu.clone();
    $_uMenuClone.addClass("user-menu-small");
    var $_i = $(document.createElement("i")),
        $_span = $(document.createElement("span"));
    $_i.addClass("glyphicon glyphicon-th");
    $_span.text("Инструменты");
    $_uMenuClone.html("").append($_i).append($_span);
    $_uMenu.after($_uMenuClone)
        .after("<style>@media(max-width:767px){a.user-menu.dropdown-toggle{display:none;}a.user-menu.dropdown-toggle.user-menu-small{display:block;}}</style>")
        .after("<style>@media(min-width:768px){a.user-menu.dropdown-toggle{display:block;}a.user-menu.dropdown-toggle.user-menu-small{display:none;}}</style>");
    return
}

G2.search = function() {
    if ($('#F50SEARCH').length) {
        var obj = $('#F50SEARCH'),
            $_input = $(document.createElement('input')),
            $_hldr = $('#main-navbar .navbar-form'),
            $_a = $(document.createElement('a')),
            $_i = $(document.createElement('i')),
            $_t = $(document.createElement('span'));
        $_input.attr({
            'type': 'search',
            'name': 'f50',
            'id': 'f50',
            'placeholder': obj.attr("data-search")
        });
        $_input.addClass('form-control');
        try {
            if (obj.text().trim() != '') {
                $_input.attr("placeholder", obj.text());
            }
            $_input.val(obj.text().trim());
        } catch (e) {
            $_input.val(obj.text());
        }
        $_hldr.append($_input);
        obj.remove();
    } else {
        $("#main-navbar-collapse .navbar-search").remove();
    }
    return
}

G2.GRIDINITSIDESZEROMAIN = 'col-md-12';
G2.GRIDINITSIDESONEMAIN = 'col-md-9';
G2.GRIDINITSIDESTWOMAIN = 'col-md-8';
G2.GRIDINITSIDESONESIDE = 'col-md-3';
G2.GRIDINITSIDESTWOSIDE = 'col-md-2';

G2.grid = function() {

    var initSides = $('.content-grid-wrapper > .row:first-child > div.col-side'),
        initSidesLength = initSides.length,
        initSidesRemoved = 0,
        initMain = $('.content-grid-wrapper > .row:first-child > div.col-main'),
        dualLeftSide = $(".profile-row > .left-col"),
        dualRightSide = $(".profile-row > .right-col");;
    if ((initSidesLength == 0) && dualLeftSide.length == 0) {
        return;
    }
    initSides.each(function() {
        if (!$(this).children().length) {
            $(this).remove();
            initSidesRemoved++;
        }
        return
    });
    // mono
    if (initSidesLength > 0) {
        var initSide = $('.content-grid-wrapper > .row:first-child > div.col-side');
        switch (initSidesLength - initSidesRemoved) {
            case 0:
                {
                    initMain.removeClass(G2.GRIDINITSIDESTWOMAIN).removeClass(G2.GRIDINITSIDESONEMAIN).addClass(G2.GRIDINITSIDESZEROMAIN);
                }
            case 1:
                {
                    switch (initSidesLength) {
                        case 1:
                            break;
                        case 2:
                            {
                                initMain.removeClass(G2.GRIDINITSIDESTWOMAIN).addClass(G2.GRIDINITSIDESONEMAIN);
                                initSide.removeClass(G2.GRIDINITSIDESTWOSIDE).addClass(G2.GRIDINITSIDESONESIDE);
                                break;
                            }
                    }
                }
            case 2:
                break;
            default:
                {
                    break;
                }
        }
        return
    }
    // dual
    if (dualLeftSide.length) {
        if (dualLeftSide.find("div").length == 1) {
            dualLeftSide.addClass("hide");
            dualRightSide.addClass("no-padding");
        }
    }
    return
}

G2.menuInit = function() {
    // 1. Remove animation of main menu
    $("body").removeClass("animate-mm-sm animate-mm-md animate-mm-lg");
    // 2. Try menu search
    this.menuSearch();
    // 2. Fix over-menu content block
    try {
        var obj = $('#main-menu .menu-content.top');
        if (!obj.children().length) {
            obj.addClass('fadeIn');
            setTimeout(function() {
                obj.css({
                    height: obj.outerHeight(),
                    overflow: 'hidden'
                }).animate({
                    'padding-top': 0,
                    height: $('#main-navbar').outerHeight()
                }, 300, function() {
                    return;
                });
            }, 300);
        } else {
            obj.addClass("show");
        }
        $('#main-menu .mm-text').html(function(index, oldHtml) {
            return oldHtml.replace(/&nbsp;/i, ' ');
        });
    } catch (e) {
        return
    }
    return
}

G2.menuAttach = function() {
    var menu = $($('#main-menu .navigation')[0]);
    var root = $(menu.children('li.active')[0]);
    var obj = $('.mmc-attacheable'),
        hldr = obj.parent().parent('div.mmc-attach-hldr');
    //  $('.mmc-attacheable li > a > i.menu-icon.fa').each(function() { if (!$(this).attr('class').match(/fa-/)) { $(this).remove(); } return });
    if (!root.length) {
        obj.children('li').each(
            function() {
                var self = $(this);
                // if (self.find("a").find(" > i.fa").length > 1) { $(self.find("a").find(" > i.fa")[0]).remove(); }
                self.find("a").find(" > i.fa").each(function() {
                    if (!$(this).attr("class").match(/fa-/)) {
                        $(this).remove();
                    }
                    return
                });
                if (self.hasClass('mm-dropdown')) {
                    self.addClass('mm-dropdown-root');
                }
                if (!self.children('a').children('i.menu-icon[class*="fa-"]').length) {
                    $_i = $(document.createElement('i'));
                    $_i.addClass('menu-icon');
                    if (self.hasClass('active')) {
                        $_i.addClass('fa fa-toggle-on');
                    } else {
                        $_i.addClass('fa fa-toggle-off');
                    }
                    self.children('a').prepend($_i);
                } else {
                    self.addClass('has-menu-icon');
                }
                menu.append(self);
                return
            }
        );
        obj.remove();
    } else {
        if (obj.text().length) {
            root.addClass('mm-dropdown mm-dropdown-root active open');
            root.append(obj);
        }
    }
    hldr.remove();
    $('.mm-dropdown').each(function() {
        if ($(this).find('li.active').length) {
            $(this).addClass('open active');
            if ($(this).hasClass('mm-dropdown-root') && !$(this).hasClass('has-menu-icon')) {
                $(this).children('a').children('i').removeClass('fa-toggle-off').addClass('fa-toggle-on');
            }
        }
        if ($(this).hasClass('active') && !$(this).hasClass('open')) {
            $(this).addClass('open');
        }
        return
    });
    return
}

G2.addLocalStorage = function(){
    //???
}

G2.menuPrependAndAppend = function(action) {
    var self = this,
        actClass = action == 'p' ? 'prependable' : 'appendable',
        hldrClass = action == 'p' ? 'prepend' : 'append',
        menu = $($('#main-menu .navigation')[0]),
        tempMenu = new Array(),
        obj = $('.mmc-' + actClass),
        hldr = obj.parent().parent('div.mmc-' + hldrClass + '-hldr');
    if (self.menuLoaderFlag == null) { // Start loader on main menu
        G2.menuLoaderFlag=self.superManLoader("", $($("#main-menu-inner")[0]));
    }
    // $('.mmc-' + actClass + ' li > a > i.menu-icon.fa').each(function() { if (!$(this).attr('class').match(/fa-/)) { $(this).remove(); } return });
    obj.children('li').each(
        function() {
            var self = $(this);
            // if (self.find("a").find(" > i.fa").length > 1) { $(self.find("a").find(" > i.fa")[0]).remove(); }
            self.find("a").find(" > i.fa").each(function() {
                if (!$(this).attr("class").match(/fa-/)) {
                    $(this).remove();
                }
                return
            });
            if (self.hasClass('mm-dropdown')) {
                self.addClass('mm-dropdown-root');
            }
            if (!self.children('a').children('i.menu-icon[class*="fa-"]').length) {
                $_i = $(document.createElement('i'));
                $_i.addClass('menu-icon');
                if (self.hasClass('active')) {
                    $_i.addClass('fa fa-toggle-on');
                } else {
                    $_i.addClass('fa fa-toggle-off');
                }
                self.children('a').prepend($_i);
            } else {
                self.addClass('has-menu-icon');
            }
            switch (action) {
                case 'p':
                    {
                        tempMenu[tempMenu.length] = $(this);
                        //menu.prepend($(this));
                        break;
                    }
                default:
                    {
                        menu.append($(this));
                        break;
                    }
            }

            return
        }
    );
    switch (action) {
        case 'p':
            {
                for (var i = tempMenu.length; i >= 0; i--) {
                    menu.prepend(tempMenu[i]);
                }
                break;
            }
        default:
            break;
    }
    obj.remove();
    hldr.remove();
    $('#main-menu-inner li').each(function() {
        if (!$($(this).children("a")[0]).text().length) {
            $($(this).children("a")[0]).remove();
        }
        return
    });
    $('#main-menu-inner .mm-dropdown').each(function() {
        if (!$($(this).children("a")[0]).has("i").length) {
            $($(this).children("a")[0]).remove();
        }
        if ($(this).find('li.active').length) {
            $(this).addClass('open active');
            if ($(this).hasClass('mm-dropdown-root') && !$(this).hasClass('has-menu-icon')) {
                $(this).children('a').children('i').removeClass('fa-toggle-off').addClass('fa-toggle-on');
            }
        }
        if ($(this).hasClass('active') && !$(this).hasClass('open')) {
            $(this).addClass('open');
        }
        return
    });
    self.superManDeloader(self.menuLoaderFlag);
    return
}

G2.menuPrepend = function() {
    this.menuPrependAndAppend('p');
    return
}

G2.menuAppend = function() {
    this.menuPrependAndAppend('a');
    return
}

G2.help = function(itemId, session) {
    if (!$x("pScreenReaderMode")) {
        apex.jQuery.getJSON(
            "wwv_flow_item_help.show_help?p_item_id=" + itemId + "&p_session=" + session + "&p_output_format=JSON",
            function(resp) {
                var d = $("#isu-popup-field-help");
                if (!d.length) {
                    d = $(document.createElement("div"));
                    d.attr("id", "isu-popup-field-help");
                    d.html(resp.helpText);
                    d.dialog({
                        title: resp.title,
                        show: {
                            effect: "blind",
                            duration: 800
                        }
                    });
                } else {
                    d.html(resp.helpText).dialog("option", "title", resp.title).dialog("open");
                }
                return
            }
        )
    }
    return
}

G2.helpBoot = function(itemId, session) {
    if (!$x("pScreenReaderMode")) {
        apex.jQuery.getJSON(
            "wwv_flow_item_help.show_help?p_item_id=" + itemId + "&p_session=" + session + "&p_output_format=JSON",
            function(resp) {
                bootbox.alert({
                    message: resp.helpText,
                    title: resp.title,
                    animate: true,
                    className: "bootbox-sm"
                });
                return
            }
        )
    }
    return
}

G2.panels = function(p) {
    if (typeof p == "object") {
		var obj = $(p);
		obj.find('.panel-heading button, .panel-heading input[type="button"]').addClass('btn-xs');
		obj.find('input[type="button"],button').addClass('btn').removeClass('form-control');
		obj.find('.nav-list-panel-tabdrop').tabdrop();
    } else {
        p = ((p == null) || (p == undefined)) ? '' : '#' + p + ' ';
        $(p + '.panel-heading button, .panel-heading input[type="button"]').addClass('btn-xs');
        $(p + 'input[type="button"],button').addClass('btn').removeClass('form-control');
        $('#main-menu-toggle,.navbar-header>button,button.btn-link,button.ui-dialog-titlebar-close,.modal button.close').removeClass('btn');
        $(p + '.nav-list-panel-tabdrop').tabdrop();
    }
    return
}

G2.rds = function() {
    $(".apex-rds").addClass("nav nav-tabs nav-list-panel-tabdrop");
    $(".apex-rds > li.apex-rds-first > a").html('<i class="fa fa-cubes"></i>');
    return
}

G2.browse = function(i, l) {
    $('#' + i).pixelFileInput({
        placeholder: (l == null || l == undefined ? $('.file_placeholder_' + i).html() : 'Выберите файл ...'),
        'choose_btn_tmpl': '<a href="#" class="btn btn-xs btn-primary">Выбрать</a>',
        'clear_btn_tmpl': '<a href="#" class="btn btn-xs"><i class="fa fa-times"></i> Очистить</a>'
    });
    return
}

G2.notify = function(data, title, urgent, warning, notify, eternal, center) {
    /* if pData is object, then we hadle it as object */
    if (typeof data === "object") {
        try {
            pText = data.text;
            pTitle = data.title;
            pUrgent = data.urgent;
            pWarning = data.warning;
            pNotify = data.notify;
            pEternal = data.eternal;
            pCenter = data.center;    
        } catch (e) { pText = "";}
    } else {
        pText = data;
        pTitle = title;
        pUrgent = urgent;
        pWarning = warning;
        pNotify = notify;
        pEternal = eternal;
        pCenter = center;
    }
    pText = (pText == undefined) ? "" : pText;
    if (pText == "") {
        return null;
    }
    /* else using regular params */
    var $_growl, vDuration = (pEternal == true) ? 9999 * 9999 : 5000;
    pTitle = ((pTitle === undefined) || (pTitle == null)) ? "" : pTitle;
    switch (true) {
        case pUrgent:
            {
                $_growl = $.growl.error({
                    title: pTitle,
                    message: pText,
                    duration: vDuration
                });
                break;
            }
        case pWarning:
            {
                $_growl = $.growl.warning({
                    title: pTitle,
                    message: pText,
                    duration: vDuration
                });
                break;
            }
        case pWarning:
            {
                $_growl = $.growl.notice({
                    title: pTitle,
                    message: pText,
                    duration: vDuration
                });
                break;
            }
        default:
            {
                $_growl = $.growl({
                    title: pTitle,
                    message: pText,
                    duration: vDuration
                });
                break;
            }
    }
    if (pCenter == true) {
        $("#growls").css({
            "left": "45%",
            "width": "270px"
        });
    }
    if (pCenter == false) {
        $("#growls").css({
            "left": "initial",
            "width": "initial"
        });
    }
    return $_growl
}

G2.url = function(params, app, page, reset, request) {
    var uParams = new Array(),
        uVals = new Array();
    if (typeof params != "object") {
        params = {};
    }
    for (var k in params) {
        uParams[uParams.length] = k;
        uVals[uVals.length] = params[k];
    }
    return location.origin + location.pathname + "?p=" + (app == undefined || app == null ? $("#pFlowId").val() : app) + ":" + (page == undefined || page == null ? $("#pFlowStepId").val() : page) + ":" + $("#pInstance").val() + ":" + (request == undefined || request == null ? "" : request) + ":" + ($("#pdebug").val() == undefined || $("#pdebug").val() == null ? "NO" : $("#pdebug").val()) + ":" + (reset === true ? "RP" : "") + ":" + uParams.join(",") + ":" + uVals.join(",");
}

G2.getValueFromURL = function(varname) {
    var url = window.location.href;
    var qparts = url.split("?");
    if (qparts.length == 0) {
        return "";
    }
    var query = qparts[1];
    var parts = query.split(":");
    var vars = parts[parts.length - 2].split(","),
        varindex = -1,
        value = "";
    for (i = 0; i < vars.length; i++) {
        if (vars[i] == varname) {
            varindex = i;
            break;
        }
    }
    if (varindex < 0) {
        return undefined;
    } else {
        value = parts[parts.length - 1].split(",")[varindex];
    }
    // value = unescape(value);
    value.replace(/\+/g, " ");
    return value;
}

//service methods
G2.escapeHtml = function(string) {
    return String(string).replace(/[&<>"'\/]/g, function(s, offset) {
        return Constants.entityMap[s];
    });
};

G2.escapeAndApplyHighlight = function($_containerObject, searchTerm, highLightClass) {
    if (searchTerm == (undefined || null)) {
        searchTerm = "";
    }
    $_containerObject.find(".esc").html(function(index, oldHtml) {
        var escapedHtmlOfObject = G2.escapeHtml(oldHtml),
            re;
        if ($(this).hasClass("use-filter")) {
            if (searchTerm.trim().length) {
                re = new RegExp("(" + decodeURIComponent(searchTerm.trim()) + ")", "ig");
                escapedHtmlOfObject = escapedHtmlOfObject.replace(re, "<span class='" + highLightClass + "'>$1</span>");
            }
        }
        return escapedHtmlOfObject;
    });
    return;
}

G2.Base64 = {
    // private property
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    // public method for encoding
    encode: function(input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;
        input = Base64._utf8_encode(input);

        while (i < input.length) {

            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output +
                Base64._keyStr.charAt(enc1) + Base64._keyStr.charAt(enc2) +
                Base64._keyStr.charAt(enc3) + Base64._keyStr.charAt(enc4);

        }

        return output;
    },

    // public method for decoding
    decode: function(input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < input.length) {

            enc1 = Base64._keyStr.indexOf(input.charAt(i++));
            enc2 = Base64._keyStr.indexOf(input.charAt(i++));
            enc3 = Base64._keyStr.indexOf(input.charAt(i++));
            enc4 = Base64._keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }

        }
        output = Base64._utf8_decode(output);

        return output;

    },

    // private method for UTF-8 encoding
    _utf8_encode: function(string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            } else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            } else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    },

    // private method for UTF-8 decoding
    _utf8_decode: function(utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;

        while (i < utftext.length) {

            c = utftext.charCodeAt(i);

            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            } else if ((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            } else {
                c2 = utftext.charCodeAt(i + 1);
                c3 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }

        }
        return string;
    }
}


G2.convertLinks = function(text) {
    var getUrlsInText = function(inputText, fullObjects) {
        var matches = [],
            match,
            urlRegexp = /(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?/igm;
        while ((match = urlRegexp.exec(inputText))) {
            if (fullObjects) {
                matches.push(match);
            } else {
                matches.push(match[0]);
            }
        }
        return matches;
    };
    urls = getUrlsInText(text, true),
    replaceLink = "",
    offsetValue = 0,
    offsetReplace = 0;

    for (var i = 0; i < urls.length; i++) {
        replaceLink = "<a target=\"_blank\" href=\"" + urls[i][0] + "\">" + urls[i][0] + "</a>";
        text = text.replaceBetween(urls[i].index - offsetReplace + offsetValue, urls[i].index - offsetReplace + offsetValue + urls[i][0].length, replaceLink);
        offsetValue += (replaceLink.length - 1);
        offsetReplace += (urls[i][0].length - 1);
    }
    return text;
};

G2.meta = function () {
    try {
        $('#SYSTEM_META_G2').remove();
        $('#sys-imd-modal').modal({
            keyboard: true,
            backdrop: true
        });
        $('#sys-imd-modal').modal('show');
    } catch (e) {};
    
    return;
}

G2.mustacheRender = function(template, dataSelector, container) {
    var render = function(template, dataSelector, container) {
        try {
            var templateHtml = template.html(),
				$_obj,
				rendered = null;
            Mustache.parse(templateHtml);
            container.find(dataSelector).each(function() {
                $_obj = $(this);
                rendered = Mustache.render(templateHtml, JSON.parse($_obj.text()));
                $_obj.replaceWith(rendered);
                $_obj.remove();
            });
			templateHtml = null;
			$_obj = null;
        } catch (e) {
            console.error(e);
            console.error($_obj);
        }

        return;
    }

    if (template == null) {
        var templates = new Array(),
            popTemplate;

        $(dataSelector).each(function() {
            if (templates.indexOf($(this).attr('data-mustache-template')) < 0) {
                templates.push($(this).attr('data-mustache-template'));
            }
        });

        do {
            popTemplate = templates.pop();
            render($('#' + popTemplate), dataSelector + '[data-mustache-template="' + popTemplate + '"]', container);
        } while (templates.length);
    } else {
        render(template, dataSelector, container);
    }

    return container;
};

G2.menuSearch = function() {
    if ($('body').hasClass('no-tabs') || $('body').hasClass('no-tabs-search')) {
        return;
    }
    function fillTree () {
        try {
            var appLinkArray = document.getElementsByClassName('app-link-in-menu');
            for (var j=0;j<appLinkArray.length;j++) {
                if (appLinkArray[j].classList.contains('app-link-open-blank')) {
                    appLinkArray[j].closest('a').setAttribute('target','_blank');
                }
            }
        } catch (e) {}
        var i = 0;
		$_menu.find('li:has(li),>li').each(function() {
			tree[i] = {
				"obj": $(this),
				"text": $(this).children('a').text(),
				"fullText": $(this)
					.find('a')
					.map(function() {
						return $(this).text();
					})
					.get()
					.reduce(function(pVal, cVal, index) {
						return pVal + ":" + cVal
					})
			}
			i++;
		});

        return i;
	}

    function fillTreeAndHide(input) {
        if (fillTree() == 0) {
            input.attr('disabled', true);
        } else {
            input.removeAttr('disabled');
        }
    }

	var matcher = function(text, re, obj) {
        if (!text.match(re)) {
            obj.addClass('hide notmatched'); // hide
            return false;
        } else {
            obj.removeClass('hide').removeClass('notmatched'); // show
        }
        return true;
    }
    var $_input = $(document.createElement('input'));
    $_input.attr({
        name: "menu_search_g2",
        type: "search",
        class: "form-control menu-search",
        placeholder: "Поиск по меню ..."
    });
    var $_box = $(document.createElement('div'));
    $_box.attr({
        class: "menu-search-box"
    });
    $_box.append($_input);
    $_clear = $(document.createElement('span'));
    $_clear.attr({
        class: "fa fa-times",
        id: "menu_search_g2_clear"
    });
    $_box.append($_clear);
    var $_container = $('#main-menu .menu-content.top');
    $_container.append($_box);
    $_container.css({
        "padding-top": "47px",
        "height": "100px"
    });
    $_container.show();
    var $_menu = $_container.next('.navigation');
    var tree = new Array(),
        i = 0;
    
	fillTreeAndHide($_input);
	
	if (tree.length == 0) {
		var checkAjaxMenuInterval = setInterval(function() {
			if ($_container.find(' + .navigation li').length) {
				clearInterval(checkAjaxMenuInterval);
				fillTreeAndHide($_input);
			}
		}, 200);
		
		setTimeout(function() {
			clearInterval(checkAjaxMenuInterval);
		}, 5000);
	}
	
    $_input.on('keyup', function() {
        var count = 0;
        if ($_input.val().trim().length > 0) {
            var re = new RegExp($(this).val().replace(/(\[|\])/g, '\\$1'), 'i');
            for (j = 0; j < tree.length; j++) {
                if (matcher(tree[j].fullText, re, tree[j].obj)) {
                    tree[j].obj.find('li:not(:has(li))').each(function() {
                        matcher($(this).text(), re, $(this));
                    });
                    count++;
                }
            }
            $_input.addClass('filled');
        } else {
            $_input.removeClass('filled');
        }
        if (count == 0) {
            $_menu.find('li.notmatched').removeClass('hide').removeClass('notmatched');
            if ($_input.val().trim().length > 0) {
                $_input.addClass("menu-search-failed");
            } else {
                $_input.removeClass("menu-search-failed");
            }
        } else {
            $_input.removeClass("menu-search-failed");
        }
        return
    });
    $_clear.on('click', function() {
        $_input.val('').trigger('keyup').trigger('focus');
        return
    });

    return
}

try {
    $(document).ready(function() {
        $(document).on("hidden.bs.modal", "div.modal.bootbox,div.modal.note-image-dialog,div.modal.note-link-dialog", function(e) {
            if ($(".modal.in").length) {
                $("body").addClass("modal-open");
            } else {
                $("body").removeClass("modal-open");
            }
            return
        });
        $(document).on('click.checkbox', '.btn', function (e) {
            if ($(this).find('input[type="checkbox"]').length) {
                if ($(e.toElement).is($(this).find('input[type="checkbox"]'))) {
                    return
                }
                $(this).find('input[type="checkbox"]').prop("checked", $(this).find('input[type="checkbox"]').is(':checked') ? false : true);
            }
            return
        });
        apex.jQuery("body").on('apexrefresh', function(event) { 
            var currentId =  apex.jQuery(event.target).attr("id"),
                 reportId = '#report_' + currentId; 
            if ($(reportId).length) {   
                if (apex.jQuery(reportId).hasClass("dataTable")) {      
                    $(reportId).DataTable().ajax.reload(function() {        
                        G2.checkAndRadio();        
                        apex.event.trigger('#' + currentId, "apexafterrefresh");      
                    });   
                } 
            }
        });
        (function($) {
            $.fn.isOverflowed = function() {
                var element = $(this).get(0);
                return element.scrollWidth > element.clientWidth + 2;
            }
            $.fn.isuModalSetTitle = function (text) {
                if (this.hasClass("modal")) {
                    this.find(".modal-title").html(text);    
                }
                return this;
            }
        })(jQuery);
    });
} catch (e) {}

try {
    $(document).ready(function () {
        apex.jQuery(apex.gPageContext$).on('apexbeforepagesubmit',function () {
            G2.submit();
            return
        });
    });
} catch (e) {}