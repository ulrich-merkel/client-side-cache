/*global window*/
/*global document*/

/**
 * jQuery plugin tooltip
 * @description set mouseover tooltip
 * @author hello@ulrichmerkel.com (Ulrich Merkel)
 * @version 0.4.6
 * 
 * @requires
 * - jQuery 1.7.1
 * - jQuery app.client functions
 * 
 * @changelog
 * - 0.4.6 refactoring, check if tooltip position is not null
 * - 0.4.5 new config sel
 * - 0.4.4 new hideTooltip function
 * - 0.4.3 refactoring, stay in viewport added
 * - 0.4.2 changed global client to app
 * - 0.4.1 bug fixes if no attribute is available
 * - 0.4 bug fixes
 * - 0.3 removed coding overhead
 * - 0.2 bug fixes
 * - 0.1 basic functions and plugin structur
 *
 * @bugs
 * -
 * 
 **/

(function (window, document, $, app) {
    'use strict';

    $.fn.tooltip = function (arg, callback) {

        /**
         * init defaults
         */
        $.fn.tooltip.defaults = {
            sel: {
                elem: '.tooltip',
                tooltipId: '#tooltip',
                attrSelector: 'title'
            },
            fadeTime: 300,
            delay: 500,
            boxOffsetX: -60,
            boxOffsetY: 20,
            replaceString: 'Lebenswelt Schule - '
        };


        /**
         * extend options with defaults, global vars for mouseEvent Listener
         */
        var options = $.extend(true, $.fn.tooltip.defaults, arg, {callback: callback}),
            newEventX = 0,
            newEventY = 0,
            timeout;


        /**
         * check and call callback function
         *
         * @param {function} callback The function to check
         */
        function callFn(callback) {
            if ($.isFunction(callback)) {
                callback.call();
            }
        }


        /**
         * grab attribute and save it to data
         *
         * @param {object} obj The jquery object
         */
        function grabAttr(obj) {
            obj.each(function () {
                var $this = $(this),
                    attr = options.sel.attrSelector,
                    titleString =  $this.attr(attr),
                    data = null;

                // check for title attribute
                if (!titleString) {
                    titleString = $this.data(attr);
                }
                if (titleString) {
                    data = $.data(this, attr, titleString.replace(options.replaceString, ''));
                    $this.removeAttr(attr);
                }
            });
        }


        /**
         * get position to stay in viewport
         *
         * @param {object} tooltip The jquery tooltip layer
         *
         * @returns {object} Returns new left and top position
         */
        function getPosition(tooltip) {
            var $document = $(document),
                docWidth = $document.width(),
                docHeight = $document.height(),
                left = 0,
                top = 0;

            // check horizontal
            if (newEventX + tooltip.width + options.boxOffsetX > docWidth) {
                left = docWidth - tooltip.width;
            } else if (newEventX + options.boxOffsetX < 0) {
                left = 0;
            } else {
                left = newEventX + options.boxOffsetX;
            }

            // check vertical
            if (newEventY + tooltip.height + options.boxOffsetY > docHeight) {
                top = newEventY - tooltip.height - 10;
            } else if (newEventY + options.boxOffsetY < 0) {
                top = 0;
            } else {
                top = newEventY + options.boxOffsetY;
            }

            return {
                left: left,
                top: top
            };
        }


        /**
         * show tooltip function
         *
         * @param {string} content The string to display
         */
        function showTooltip(content) {
            var $tooltip,
                tooltip = {},
                sel = options.sel.tooltipId,
                position;

            $tooltip = $('<div>', {
                id: sel.substr(1),
                css: {
                    position: 'absolute',
                    width: options.boxWidth,
                    height: options.boxHeight,
                    display: 'none'
                },
                html: content
            }).appendTo('body');

            tooltip = {
                width: $tooltip.outerWidth(true),
                height: $tooltip.outerHeight(true)
            };

            // fix for older browsers when they don't init mouseposition after window load correctly
            position = getPosition(tooltip);
            if (position.left === 0 && position.right === 0) {
                return;
            }

            $tooltip.css(position).fadeIn(options.fadeTime);
        }


        /**
         * hide tooltip function
         */
        function hideTooltip() {
            $(options.sel.tooltipId).fadeOut(
                options.fadeTime,
                function () {
                    $(this).remove();
                }
            );
            window.clearTimeout(timeout);
        }


        /**
         * bind mouseenter mouseleave mousemove events
         *
         * @param {object} obj The jquery tooltip item object
         */
        function bindEventHandlers(obj) {
            var sel = options.sel,
                tooltipId = sel.tooltipId,
                attr = sel.attrSelector,
                tooltip = {},
                data;

            // item hover events
            obj.each(function () {
                $(this).bind({
                    'mouseenter.tooltip': function (evt) {
                        // check data string
                        data = $.data(this, attr);
                        if (!data) {
                            grabAttr(this);
                        }

                        // remove old tooltip if visible
                        if ($(tooltipId).css("opacity") !== 0) {
                            $(tooltipId).stop().remove();
                        }

                        // show tooltip after delay
                        newEventX = evt.pageX;
                        newEventY = evt.pageY;
                        timeout = window.setTimeout(function () { showTooltip(data); }, options.delay);
                    },
                    'mouseleave.tooltip': function () {
                        hideTooltip();
                    },
                    'mousemove.tooltip': function (evt) {
                        // set new position
                        tooltip = {
                            width: $(tooltipId).outerWidth(true),
                            height: $(tooltipId).outerHeight(true)
                        };
                        newEventX = evt.pageX;
                        newEventY = evt.pageY;
                        $(tooltipId).css(getPosition(tooltip));
                    }
                });
            });
            // hide tooltip while scrolling
            $(window).bind({
                'scrolling': function () {
                    hideTooltip();
                }
            });
        }


        /**
         * main function, init plugin
         *
         * @param {object} opts The plugin options
         * @param {object} obj The plugin selector object
         */
        function initialize(opts, obj) {
            if (!obj.length || (app.client && app.client.isMobile())) {
                return;
            }

            // check init state
            var data = obj.data('tooltip');
            if (!data) {

                // setup functions
                grabAttr(obj);
                bindEventHandlers(obj);
                obj.data('tooltip', 'initialized');

            }

            // check callback
            callFn(opts.callback);
        }


        /**
         * return this for chaining and run
         * initialize function
         */
        return this.each(function () {
            initialize(options, $(this));
        });

    };


}(window, document, window.jQuery, window.app || {}));
/*global window*/
/*global document*/

/**
 * jQuery plugin fullscreen
 * 
 * @description
 * - toggle fullscreen mode if available
 * 
 * @author hello@ulrichmerkel.com (Ulrich Merkel)
 * @version 0.1.1
 * 
 * @requires
 * - jQuery 1.8.2
 * 
 * @changelog
 * - 0.1.1 refactoring
 * - 0.1 basic functions
 *
 * @bugs
 * - 
 * 
 */

(function (document, $, app) {
    'use strict';

    $.fn.fullscreen = function (args, cb) {

        /**
         * init defaults
         */
        $.fn.fullscreen.defaults = {
            sel: {
                elem: '.btn-fullscreen'
            }
        };


        /**
         * extend options with defaults, global vars 
         */
        var opts = $.extend(true, {}, $.fn.fullscreen.defaults, args, {cb: cb}),
            docElm = document.documentElement,
            boolIsSupported = null;


        /**
         * check support
         *
         * @param {boolean} Whether fullscreen is supported or not
         */
        function isSupported() {
            if (null === boolIsSupported) {
                boolIsSupported = (!!docElm.requestFullscreen || !!docElm.mozRequestFullScreen || !!docElm.webkitRequestFullScreen) && !app.client.isChrome() && !app.client.isSeamonkey();
            }
            return boolIsSupported;
        }


        /**
         * check is fullscreen active
         *
         * @param {boolean} Whether fullscreen is active or not
         */
        function isFullscreenActive() {
            return !!document.fullScreen || !!document.mozFullScreen || !!document.webkitIsFullScreen;
        }


        /**
         * enter fullscreen mode
         */
        function enter() {
            // check vendor prefixes
            if (docElm.requestFullscreen) {
                docElm.requestFullscreen();
            } else if (docElm.mozRequestFullScreen) {
                docElm.mozRequestFullScreen();
            } else if (docElm.webkitRequestFullScreen) {
                docElm.webkitRequestFullScreen();
            }
        }


        /**
         * exit fullscreen mode
         */
        function exit() {
            // check vendor prefixes
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            }
        }


        /**
         * custom change event handler
         */
        function change() {
        }


        /**
         * bind events
         *
         * @param {object} $obj The jQuery object
         */
        function bindEventHandlers($obj) {

            // fullscreen events
            var $doc = $(document);
            $doc.bind('fullscreenchange', change);
            $doc.bind('mozfullscreenchange', change);
            $doc.bind('webkitfullscreenchange', change);

            // btn click
            $obj.bind({
                'click.fullscreen': function (e) {
                    e.preventDefault();
                    if (isFullscreenActive()) {
                        exit();
                    } else {
                        enter();
                    }
                }
            });

        }


        /**
         * main function, init plugin
         *
         * @param {object} opts The plugin options
         * @param {object} obj The plugin selector object
         */
        function initialize(opts, $obj) {
            if (!$obj.length) {
                return;
            }

            // check for support
            if (isSupported()) {

                $obj.show();

                // check init state
                var data = $obj.data('fullscreen');
                if (!data) {

                    // setup functions
                    bindEventHandlers($obj);
                    $obj.data('fullscreen', 'initialized');

                }
            } else {
                $obj.hide();
            }

            // check for callback function
            if ($.isFunction(opts.cb)) {
                opts.cb.call();
            }
        }


        /**
         * return this for chaining and run
         * initialize function, allow multiple items via each
         */
        return this.each(function () {
            initialize(opts, $(this));
        });

    };

}(document, window.jQuery, window.app || {}));
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

		// init sample plugins
		$('.tooltip').tooltip();
		$('.btn-fullscreen').fullscreen();

		alert("document ready");

	});

}(window.jQuery, window, document, window.app));




