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