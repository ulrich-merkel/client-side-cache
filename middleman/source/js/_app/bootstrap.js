(function ($, window, document, app) {
	'use strict';

	// local vars
	var $window = $(window),
		$html = $('html'),
		helpers = app.helpers,
		client = helpers.client,
		bind = helpers.utils.bind;



	$(document).ready(function () {

		// client depending init
        $html.removeClass('no-js').addClass('js');
		if (client.isMobile()) {
			$html.addClass('mobile');
			client.hideStatusbar(1000);
			bind(document, 'DOMContentLoaded', hideStatusbar);
			bind(window, 'orientationchange', hideStatusbar);
		} else {
			$html.addClass('desktop');
		}

		// mobile fast clicks
		new FastClick(document.body);

		//app.controllers.controller.init(function () {
            //alert("page controller loaded");
        //});

		//alert("document ready");
	});

}(window.jQuery, window, document, window.app));