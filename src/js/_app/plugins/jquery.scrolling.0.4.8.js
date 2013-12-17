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
