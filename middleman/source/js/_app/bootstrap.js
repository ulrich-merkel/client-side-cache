(function ($, window, document, app) {
	'use strict';

	// local vars
	var $window = $(window),
		$html = $('html'),
		helpers = app.helpers,
		client = helpers.client,
		bind = helpers.utils.bind,
		timeout;

	/**
	 * hide status bar on mobile devices
	 *
	 */
	function hideStatusbar() {
		window.clearTimeout(timeout);
        timeout = window.setTimeout(function () {
            if (parseInt(window.pageYOffset, 10) === 0) {
                window.scrollTo(0, 1);
            }
        }, 1000);
    }


	$(document).ready(function () {

		// client depending init
        $html.removeClass('no-js').addClass('js');
		if (client.isMobile()) {
			$html.addClass('mobile');
			hideStatusbar();
			bind(document, 'DOMContentLoaded', hideStatusbar);
			bind(window, 'orientationchange', hideStatusbar);
		} else {
			$html.addClass('desktop');
		}

		// mobile fast clicks
		new FastClick(document.body);

		app.controllers.controller.init(function () {
            alert("controller loaded");
        });

		
	});

}(window.jQuery, window, document, window.app));