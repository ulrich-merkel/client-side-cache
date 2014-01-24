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
//        helpers = ns.helpers,
//        client = helpers.client,
//		utils = helpers.utils,
//        on = utils.on,
//		hideStatusbar = client.hideStatusbar;

    // document is ready
    $(document).ready(function () {

		// client depending init
        $html.removeClass('no-js').addClass('js');
		//if (client.isMobile() || client.isiOS()) {
		//	$html.addClass('mobile');
		//	hideStatusbar();
		//	on(document, 'DOMContentLoaded', hideStatusbar);
		//	on(window, 'orientationchange', hideStatusbar);
		//} else {
		//	$html.addClass('desktop');
		//}

		// mobile fast clicks
		if (!!document.body) {
			new FastClick(document.body);
		}

		// init plugins
		$('.tooltip').tooltip();
		$('body').scrolling();

	});

}(window, document, window.jQuery));