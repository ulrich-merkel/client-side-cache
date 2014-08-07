/*jslint browser: true, devel: true, continue: true, regexp: true, plusplus: true, unparam: true  */
/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:true, curly:true, browser:true, indent:4, maxerr:50 */
/*global window, document, Blob*/

/**
 * ns.helpers.console
 *
 * @description
 * - provide utility functions for console log
 *
 * @author Ulrich Merkel, 2014
 * @version 0.3.0
 * 
 * @namespace ns
 * 
 * @changelog
 * - 0.3.0 moved log functions to separate helper
 * - 0.2.2 console.save added
 * - 0.2.1 examples added, isFunction added, refactoring
 * - 0.2 improved console.log wrapper, console.warn added
 * - 0.1.9 improved namespacing
 * - 0.1.8 inArray function improved
 * - 0.1.7 trim string + sprintf functions added, isArray function improved
 * - 0.1.6 get queryString function added
 * - 0.1.5 moved dom functions to dom helpers, small function improvements
 * - 0.1.4 refactoring xhr function
 * - 0.1.3 createDomNode added
 * - 0.1.2 refactoring
 * - 0.1.1 bug fix xhr when trying to read binary data on ie
 * - 0.1 basic functions and structure
 *
 * @see
 * -
 *
 * @requires
 * - ns.helpers.namespace
 *
 * @bugs
 * -
 *
 * @example
 *
 *      // for the complete list of available methods
 *      // please take a look at the @interface below
 *
 *
 */
(function (window, document, ns, undefined) {

    'use strict';

    /**
     * undefined is used here as the undefined global
     * variable in ECMAScript 3 and is mutable (i.e. it can
     * be changed by someone else). undefined isn't really
     * being passed in so we can ensure that its value is
     * truly undefined. In ES5, undefined can no longer be
     * modified.
     *
     * window, document and ns are passed through as local
     * variables rather than as globals, because this (slightly)
     * quickens the resolution process and can be more
     * efficiently minified (especially when both are
     * regularly referenced in your plugin).
     *
     */


    /**
     * utility functions
     *
     * following the singleton design pattern
     *
     */
    var log = (function () {

        // init global vars
        var hasConsole = window.console !== undefined,                                                      // @type {boolean} If window.console is available
            console = hasConsole ? window.console : null,                                                   // @type {object} The window.console object
            hasConsoleLog = (hasConsole && console.log !== undefined),                                      // @type {boolean} If console.log is available
            hasConsoleWarn = (hasConsole && console.warn !== undefined),                                    // @type {boolean} If console.warn is available
            hasConsoleError = (hasConsole && console.error !== undefined),                                  // @type {boolean} If console.warn is available
            hasConsoleTime = (hasConsole && console.time !== undefined && console.timeEnd !== undefined);   // @type {boolean} If console.time/console.timeEnd is available


        /**
         * public functions
         *
         * @interface
         */
        return {

            /* start-dev-block */

            /**
             * function to write logging message to screen
             *
             * @param {string} message The message to log
             */
            logToScreen: function (message) {

                // init local vars
                var htmlElement = document.getElementById('log'),
                    p = document.createElement('p'),
                    text = document.createTextNode(message);

                // append message
                if (htmlElement) {
                    p.appendChild(text);
                    htmlElement.appendChild(p);
                }

            },


            /**
             * wrapper for console.log due to some browsers lack of this functions
             *
             * @param {arguments} The messages to log
             */
            log: function () {

                var args = Array.prototype.slice.call(arguments),
                    length = args.length,
                    message;

                if (!length) {
                    return;
                }

                // check for support
                if (hasConsoleLog) {
                    if (!!console.log.apply) {
                        console.log.apply(console, args);
                    } else {
                        console.log(args);
                    }

                }

                // log messages to dom element
                message = args[0];
                log.logToScreen(message);

            },


            /**
             * wrapper for console.warn due to some browsers lack of this functions
             *
             * @param {arguments} The warnings to log
             */
            warn: function () {

                var args = Array.prototype.slice.call(arguments),
                    length = args.length,
                    message;

                if (!length) {
                    return;
                }
                message = args[0];

                // check for support
                if (hasConsoleWarn) {
                    console.warn.apply(console, args);
                } else {
                    // try to log normal message
                    log.log(message);
                }

                // log messages to dom element
                log.logToScreen(message);

            },


            /**
             * wrapper for console.error due to some browsers lack of this functions
             *
             * @param {arguments} The errors to log
             */
            error: function () {

                var args = Array.prototype.slice.call(arguments),
                    length = args.length,
                    message;

                if (!length) {
                    return;
                }
                message = args[0];

                // check for support
                if (hasConsoleError) {
                    console.error.apply(console, args);
                } else {
                    // try to log normal message
                    log.log(message);
                }

                // log messages to dom element
                log.logToScreen(message);

            },


            /**
             * convenient function to save console.log outputs in
             * download folder
             *
             */
            save: function () {

                if (hasConsole && window.Blob && window.JSON && window.URL) {
                    console.save = function (data, filename) {

                        if (!data && hasConsoleError) {
                            console.error('Console.save: No data');
                            return;
                        }

                        if (!filename) {
                            filename = 'console.json';
                        }

                        if (typeof data === 'object') {
                            data = JSON.stringify(data, undefined, 4);
                        }

                        var blob = new Blob([data], {type: 'text/json'}),
                            e = document.createEvent('MouseEvents'),
                            a = document.createElement('a');

                        a.download = filename;
                        a.href = window.URL.createObjectURL(blob);
                        a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');

                        e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                        a.dispatchEvent(e);

                    };
                }

            },


            /**
             * log timer start
             *
             * @param {string} key The timer key
             */
            logTimerStart: function (key) {

                // check for support
                if (hasConsoleTime) {
                    console.time(key);
                }

            },


            /**
             * log timer end
             *
             * @param {string} key The timer key
             */
            logTimerEnd: function (key) {

                // check for support
                if (hasConsoleTime) {
                    console.timeEnd(key);
                }

            }

            /* end-dev-block */

        };

    }());


    /**
     * make the helper available for ns.helpers.log calls under
     * the ns.helpers namespace
     * 
     * @export
     */
    ns.namespace('helpers.console', log);


}(window, document, window.getNs())); // immediately invoke function
