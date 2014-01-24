/*global window*/
/*global document*/

/**
 * app.bootstrap
 *
 * @description
 * - init javascript plugins and functions after dom is ready
 *
 * @author Ulrich Merkel, 2013
 * @version 0.1
 *
 * @namespace app
 *
 * @changelog
 * - 0.1 basic functions and plugin structur
 *
 */
(function (window, document, $, undefined) {

    'use strict';

    // local vars
    var $window = $(window),
		$html = $('html');

    // document is ready
    $(document).ready(function () {

		// client depending init
        $html.removeClass('no-js').addClass('js');

		// mobile fast clicks
		if (!!document.body) {
			new FastClick(document.body);
		}

		// init plugins
		$('.tooltip').tooltip();
		$('body').scrolling();

	});

}(window, document, window.jQuery));