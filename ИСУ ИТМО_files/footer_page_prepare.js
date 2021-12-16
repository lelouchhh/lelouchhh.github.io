"use strict";

(function () {
	var prepared = false;

	function prepare() {
		if (!prepared) {
			prepared = true;
			try {
				$("#wwvFlowForm").fadeTo(250, 1);
			} catch (e) {
				document.getElementById("wwvFlowForm").style.opacity = "1";
			}
			try {
				document.getElementById("init-text").remove();
			} catch (e) {

			}
		}
	}

	Array.prototype.slice.apply(document.querySelectorAll('input[type="text"]:not(.form-control), select:not(.form-control), textarea:not(.form-control)')).forEach(function (t) {
		t.classList.add('form-control');
	});

	try {
		$(window).load(function () {
			prepare();
		});
		$(document).ready(function () {
			setTimeout(function () {
				prepare();
			}, 50);

			//Добавление пункта меню для локальной разработки
			if ($("#dev_panel_container").length) {
				$('#dev_panel_container .dp_but_container').append('<a class="dp_icon dp_local_storage_proxy ' +
					($v('LOCAL_STORAGE_PROXY') === 'Y' ? 'dp_icon_active ' : '') +
					'" href="javascript:void(0);"><div class="dp_icon_text_cont"><div class="dp_icon_text">' +
					($v('LOCAL_STORAGE_PROXY') === 'Y' ? 'Local Storage Proxy OFF' : 'Local Storage Proxy ON') +
					'</div></div><i class="fa fa-file-user"></i></a>');

				$(document).on('click', '.dp_local_storage_proxy', function () {
					$s('LOCAL_STORAGE_PROXY', $v('LOCAL_STORAGE_PROXY') === 'Y' ? '' : 'Y')
					G2.ajax({
						process: 'SEND_PARAMS',
						params: ['LOCAL_STORAGE_PROXY'],
						data_type: 'JSON',
						success: function (result) {
							window.location.reload();
						}
					});
				});
			}
		});
	} catch (e) {
		try {
			document.getElementById("init-text").remove();
		} catch (e) {

		}
	}

	try {
		if ($('[data-mustache-template]').length) {
			G2.mustacheRender(null, '[data-mustache-template]', $('body'));
		}
	} catch (e) {

	}
})();