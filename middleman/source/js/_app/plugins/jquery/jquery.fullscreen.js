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