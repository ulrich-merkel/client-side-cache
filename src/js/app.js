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

/**
 * jQuery plugin scrolling
 * @description
 * - scroll to id position given in attribute (example: href='#top')
 *
 * @version 0.4.8
 * @author hello@ulrichmerkel.com (Ulrich Merkel)
 * 
 * @requires
 * - jQuery 1.7.1
 * 
 * @changelog
 * - 0.4.8 refactoring
 * - 0.4.7 removed touchclick due to fastclick
 * - 0.4.6 bug fixes
 * - 0.4.5 bug fixes for standalone mode
 * - 0.4.4 removed body delegate for mobile
 * - 0.4.3 reorganize plugin structur
 * - 0.4.2 page load scroll target added
 * - 0.4.1 explorer lower version 8 excluded
 * - 0.4 default selectors added
 * - 0.3 bug fixes, js lint
 * - 0.2 jQuery plugin structur
 * - 0.1 basic functions
 *
 * @bugs
 * - check scrolling for explorer lower v.8
 * 
 */
(function (window, $) {
    'use strict';

    /**
     * create the defaults and globals once
     */
    var pluginName = 'scrolling',
        defaults = {
            sel: {
                wrapper: 'body',
                elements: 'a[href*=#]'
            },
            fadeTime: 300
        };


    /**
     * the actual plugin constructor
     * 
     * @constructor
     * @param {object} elem The jQuery object input
     * @param {object} opts The plugins options
     * @param {function} callback The function to call after initializing
     */
    function Plugin(elem, opts, callback) {
        this.$elem = $(elem);
        this.opts = $.extend(true, {}, defaults, opts, {callback: callback});
        this.init();
    }

    /**
     * plugin methods
     */
    Plugin.prototype = {

        /**
         * call function
         *
         * @param {function} callback The function to call
         */
        callFn: function (callback) {
            if ($.isFunction(callback)) {
                callback.call();
            }
        },


        /**
         * get scrolling object
         * due to different browser scrolling objects, we need to
         * test for window and body
         *
         * @return {object} The available scrolling object
         */
        getScrollObject: function () {

            // init local vars
            var $windowObjects = $('html, body'),
                $selectedObject = $windowObjects.eq(1);

            // try to scroll windowObjects
            $windowObjects.each(function () {

                var $eachElement = $(this),
                    top = $eachElement.scrollTop(),
                    test;

                // scroll current object
                $eachElement.scrollTop(top + 1);
                test = $eachElement.scrollTop();
                $eachElement.scrollTop(top - 1);

                // scrolling was successful, return current object
                if (test > 0) {
                    $selectedObject = $eachElement;
                    return false;
                }

            });

            // return scrolling object
            return $selectedObject;
        },


        /**
         * scroll to object top position
         *
         * @param {object} target The jQuery object to scroll to
         */
        scrollToTarget: function ($target) {

            // check for target object
            if (!$target.length) {
                return;
            }

            // init local vars
            var self = this,
                position = $target.offset().top;

            // scroll to top object position
            if (position >= 0) {
                self.$scrollObject.animate({scrollTop: position}, self.opts.fadeTime);
            }

        },


        /**
         * bind events
         */
        bindEvents: function () {

            // init local vars
            var self = this;

            // handle click
            self.$targets.on({
                'click.scrolling': function (e) {
                    e.preventDefault();

                    // check for href target
                    var $target = $($(this).attr('href'));
                    if (!$target.length) {
                        return false;
                    }
                    self.scrollToTarget($target);

                    // return false for mobile
                    return false;

                }
            });

        },


        /**
         * initialize plugin, main function
         */
        init: function () {

            // init local vars
            var self = this,
                opts = self.opts,
                $target;

            // dom vars
            self.$targets = self.$elem.find(opts.sel.elements);
            self.$scrollObject = self.getScrollObject();

            // basic functions
            self.bindEvents();

            // check for scroll targets on load
            if (window.scrolltarget || window.location.hash) {
                if (window.scrolltarget) {
                    $target = $("#" + window.scrolltarget);
                } else if (window.location.hash) {
                    $target = $(window.location.hash);
                }

                if (!$target.length) {
                    return;
                }

                self.scrollToTarget($target);
            }

            // check for callback
            self.callFn(opts.callback);

        }
    };

    /* a really lightweight plugin wrapper around the constructor,
     * preventing against multiple instantiations
     */
    $.fn[pluginName] = function (options, callback) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName, new Plugin(this, options, callback));
            }
        });
    };

}(window, window.jQuery));

/*global window*/
/*global document*/

/**
 * app.bootstrap
 *
 * @description
 * - init javascript plugins and functions after dom is ready
 *
 * @author
 * @version 0.1
 *
 * @namespace app
 *
 * @changelog
 * - 0.1 basic functions and plugin structur
 *
 */
(function (window, document, $, ns, undefined) {

    'use strict';

    // local vars
    var $window = $(window),
		$html = $('html'),
        helpers = ns.helpers,
        client = helpers.client,
		utils = helpers.utils,
        on = utils.on,
		hideStatusbar = client.hideStatusbar;

    // document is ready
    $(document).ready(function () {

		// client depending init
        $html.removeClass('no-js').addClass('js');
		if (client.isMobile() || client.isiOS()) {
			$html.addClass('mobile');
			hideStatusbar();
			on(document, 'DOMContentLoaded', hideStatusbar);
			on(window, 'orientationchange', hideStatusbar);
		} else {
			$html.addClass('desktop');
		}

		// mobile fast clicks
		if (!!document.body) {
			new FastClick(document.body);
		}

		// init plugins
		$('.tooltip').tooltip();
		$('body').scrolling();

	});

}(window, document, window.jQuery, window.getNs()));