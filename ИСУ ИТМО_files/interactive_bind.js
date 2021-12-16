$(document).ready(function() {
	if (!document.querySelectorAll('#apexir_WORKSHEET').length) {
		return false;
	}
	
	try {
		function set_short_but (){
			$('#apexir_ACTIONSMENUROOT').append('<i class="fa fa-bars apexir_short_actionmenuroot"></i>');
			$('#apexir_btn_SEARCH').append('<i class="fa fa-search apexir_short_btn_search"></i>');
		}
		
		function mutation_event (mutations) {  
			$.each(mutations,function(e){
				if (this.target.style.display == '' || this.target.style.display == 'block') {
					$('#apexir_CONTROL_PANEL_DROP').find('#apexir_btn_CANCEL').addClass('btn');
					$('#apexir_CONTROL_PANEL_DROP').find('#apexir_btn_APPLY').addClass('btn').addClass('btn-success');
					$('#apexir_CONTROL_PANEL_DROP').find('#apexir_btn_DELETE').addClass('btn').addClass('btn-danger');
					$('#apexir_CONTROL_PANEL_DROP').find('input[type="text"],select,textarea').addClass('form-control');
					$('#apexir_CONTROL_PANEL_DROP').find('input[type="checkbox"]').each(function(){
						$(this).addClass('px');
						$(this).after('<label class="lbl" for="' + $(this)[0].id + '" style="display:inline-block;"></label>');
					});
					$('#apexir_CONTROL_PANEL_DROP').find('input[type="text"]').filter(function(){
						return $(this).next('.pb').length;
					}).each(function(){
						$(this).attr('style','width:auto');
					});
					return false;
				}
			});
		}
		
		function mutation_event_2 (mutations) {  
			$.each(mutations,function(e){
				if (this.attributeName == "class"){
					$('#apexir_ACTIONSMENUROOT').addClass('btn');
				}
			});
		}
		
		function set_observe (selector,mutation_function) {
			var observer = new MutationObserver(function(e) {mutation_function(e)});
			var list = document.querySelector(selector);
			observer.observe(list, {attributes: true});
		}
		
		set_short_but ();
		
		var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

		set_observe('#apexir_CONTROL_PANEL_DROP', mutation_event);
		set_observe('#apexir_ACTIONSMENUROOT', mutation_event_2);
		
		$('#apexir_WORKSHEET_REGION').find('#apexir_btn_SEARCH').addClass('btn').addClass('btn-info'); 
		$('#apexir_WORKSHEET_REGION').find('#apexir_NO_DATA_FOUND_MSG').addClass('bordered').addClass('nodatafound');
		$('#apexir_WORKSHEET_REGION').find('.apexir_WORKSHEET_DATA').addClass('table-striped table-hover table-light');
		apex.jQuery('#apexir_WORKSHEET_REGION').on('apexafterrefresh',function () {
			$(this).find('#apexir_btn_SEARCH').addClass('btn').addClass('btn-info');
			$(this).find('#apexir_ACTIONSMENUROOT').addClass('btn');
			$(this).find('#apexir_NO_DATA_FOUND_MSG').addClass('bordered').addClass('nodatafound');
			$(this).find('.apexir_WORKSHEET_DATA').addClass('table-striped table-hover');
			$('#apexir_TOOLBAR').find('input[type="text"],select,textarea').addClass('form-control');
			set_observe('#apexir_CONTROL_PANEL_DROP',mutation_event);
			set_observe('#apexir_ACTIONSMENUROOT',mutation_event_2);
			set_short_but();
		});
		
		$(document.body).on('click', '.dhtmlSubMenuS', function () {
			return false;
		});
	}
	catch (e) {}
});
