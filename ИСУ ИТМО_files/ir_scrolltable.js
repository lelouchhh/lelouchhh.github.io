function set_ir_overflowed_scroll() {
	try {
		if ($('#apexir_WORKSHEET_REGION').length == 0 || $('#apexir_DATA_PANEL div.apexir_table_top_scroll').length != 0){
			return false;
		}
		function scrollbarWidth() {
			var $outer = $('<div>').css({visibility: 'hidden', width: 100, overflow: 'scroll'}).appendTo('body'),
				widthWithScroll = $('<div>').css({width: '100%'}).appendTo($outer).outerWidth();
			$outer.remove();
			var scrollbarSize = 100 - widthWithScroll;
			scrollbarSize = ((scrollbarSize == null) || (scrollbarSize == undefined) ? "15px" : scrollbarSize);
			return scrollbarSize;
		}
		function getStickyHeight () {
			var stikyPos = $('.plugin-sticky-fixed').css('position') || 'static',
				headerPos = $('.page-header').css('position') || 'static',
				sticky = stikyPos != 'static' ? $(".plugin-sticky-fixed:visible").height() || 0 : 0,
				header = headerPos != 'static' ? $('.page-header').outerHeight() || 0 : 0;
			return sticky + header;
		}
		function visible_check (table) {
			if (table[0].scrollWidth <= table.width()) {
				table.prev('.' + scroll_class).addClass('hide');
				table.prev('.' + scroll_class).prev('.' + scroll_dummy_class).addClass('hide');
			} else {
				if (table.prev('.' + scroll_class).is(':hidden')){
					table.prev('.' + scroll_class).removeClass('hide');
					table.prev('.' + scroll_class).prev('.' + scroll_dummy_class).removeClass('hide');
				}
			}
			return table
		}
		function get_table_borders (table) {
			return parseInt(table.css('border-left-width').replace('px','')) + parseInt(table.css('border-right-width').replace('px',''))
		}
		function on_resize () {
			var stickyHeight = getStickyHeight(),
				scroll_offset = table.scrollTop() + navbarHeight + barWidth + stickyHeight;
			if (!(scroll_offset > table.offset().top && scroll_offset < table.offset().top + table.height()) && !topScrollDummy.is(':hidden')) { topScroll.css({'width': table.width() + get_table_borders(table)}); }
			table.prev('.' + scroll_class).find('> div').css({'width': table[0].scrollWidth + get_table_borders(table) + 'px'});
			visible_check(table);
		}
		var table_class = 'scrollable_ir', scroll_class = 'apexir_table_top_scroll', scroll_dummy_class = 'apexir_table_top_scroll_dummy';
		var barWidth = scrollbarWidth(), navbarHeight = ($("#main-navbar").length ? $("#main-navbar").height() : 0);
		barWidth = ((barWidth == null) || (barWidth == undefined) ? "15px" : barWidth);
		var table = $('#apexir_DATA_PANEL table.apexir_WORKSHEET_DATA').addClass(table_class);
		if (table.length > 0) {
			var table_borders_width = get_table_borders(table);
			var topScroll = $('<div>').insertBefore(table).
					addClass(scroll_class).
					css({'height':barWidth,
						 //'width':table.width() + get_table_borders(table),
						 'overflow-x':'auto',
						 'overflow-y':'hidden'});
			var topScrollFill = $('<div>').
					appendTo(topScroll).
					css({'width': table[0].scrollWidth + table_borders_width + 'px',
						  'height': barWidth + 'px'});
			var topScrollDummy = $('<div>').insertBefore(topScroll).css({'display':'none','height':barWidth + 'px'}).addClass(scroll_dummy_class);;
			
			// events
			topScroll.on('scroll',function(e){
				$(this).next().scrollLeft($(this).scrollLeft());
			});
			table.on('scroll',function(e){
				$(this).prev('.' + scroll_class).scrollLeft($(this).scrollLeft());
			});
			table.on('resize.scrollable_ir',on_resize);
			table.find(' > tbody').on('resize',on_resize);
			$(window).on('scroll.scrollable_ir',function(){
				if (!topScroll.is(':hidden')) {
					var stickyHeight = getStickyHeight(),
						scroll_offset = $(this).scrollTop() + navbarHeight + barWidth + stickyHeight,
						displayDummy = !topScrollDummy.is(':hidden');
					if (scroll_offset > table.offset().top && scroll_offset < table.offset().top + table.height()) {
						if (!displayDummy) {
							topScroll.css({'position':'fixed',
											'top':navbarHeight + stickyHeight,
											'z-index':400,
											'width': table.width() + get_table_borders(table)});
							topScrollDummy.show();
						}
					}
					else {
						if (displayDummy) {
							topScroll.css({'position':'static', 'width' : 'auto'});
							topScrollDummy.hide();
						}
					}
				}
			});
			
			//on run
			visible_check(table);
		}
		apex.jQuery('#apexir_WORKSHEET_REGION').on('apexafterrefresh',function () {
			set_ir_overflowed_scroll();
		});
	} catch (e) {
		console.error('Ошибка инициализации scrolltable для IR' + e);
	}
	return true
}

$(document).ready(function(){
	set_ir_overflowed_scroll();
});
