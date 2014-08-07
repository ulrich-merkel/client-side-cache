/*global window, document, navigator*/

/**
 * ns.helpers.client
 * 
 * @description
 * - provide information about the client and device
 * 
 * @author Ulrich Merkel, 2014
 * @version 0.4.2
 *
 * @namespace ns
 * 
 * @changelog
 * - 0.4.2 removed unused functions for client-side-cache optimization, complete client helper moved to separate git
 * - 0.4.1 example added
 * - 0.4 improved detectOrientation function calls
 * - 0.3.9 improved namespacing
 * - 0.3.8 improved module vars (uaToLowercase added for better compression)
 * - 0.3.7 ios version check added, improved check for mobile browsers, better namespace include
 * - 0.3.6 hide (mobile) status bar added
 * - 0.3.5 checkNetworkConnection added
 * - 0.3.4 check for mobile browsers modified and browser version check added
 * - 0.3.3 check if is ipad added
 * - 0.3.2 init client moved to separate function
 * - 0.3.1 changed namespace to app
 * - 0.3 isTouchDevice, hasMatrix added
 * - 0.2 Safari, Chrome, Opera Check added, global var useragent
 * - 0.1 basic functions and plugin structure
 *
 * @see
 * -
 *
 * @requires
 * - ns.helpers.namespace
 * - ns.helpers.utils
 *
 * @bugs
 * -
 *
 * @example
 *
 *        // check for isiOS devices
 *        var isMicrosoftBrowser = app.helpers.client.isMsie();
 *        
 *        // for the complete list of available methods
 *        // please take a look at the @interface below
 *
 *
 */
(function (window, navigator, ns, undefined) {

    'use strict';

    /**
     * undefined is used here as the undefined global
     * variable in ECMAScript 3 and is mutable (i.e. it can
     * be changed by someone else). undefined isn't really
     * being passed in so we can ensure that its value is
     * truly undefined. In ES5, undefined can no longer be
     * modified.
     * 
     * window, navigator and ns are passed through as local
     * variables rather than as globals, because this (slightly)
     * quickens the resolution process and can be more
     * efficiently minified (especially when both are
     * regularly referenced in this module).
     */


    /**
     * client functions
     *
     * following the singleton design pattern
     *
     */
    var client = (function () {

        /**
         * private functions and vars
         */

        // init global vars
        var privateIsWebkit,                                                // @type {boolean} Whether this browser is webkit or not
            privateIsOpera,                                                 // @type {boolean} Whether this browser is opera or not
            privateIsMsie,                                                  // @type {boolean} Whether this browser is msie or not
            privateIsOnline,                                                // @type {boolean} Whether this device has network connection or not
            privateHasCanvas,                                               // @type {boolean} Whether the browser has canvas support or not

            ua = navigator.userAgent || navigator.vendor || window.opera,   // @type {string} The user agent string of the current browser
            uaLowerCase = ua.toLowerCase(),                                 // @type {string} The lower case user agent string for easier matching
            on = ns.helpers.events.on;                                      // @type {object} Shortcut for events.on function


        /**
         * check for webkit browser
         */
        function checkIfIsWebkit() {
            privateIsWebkit = uaLowerCase.match(/(webkit)/) !== null;
        }

        /**
         * check for microsoft internet explorer
         */
        function checkIfIsMsie() {
            privateIsMsie = uaLowerCase.match(/(msie)/) !== null;
        }

        /**
         * check for opera browser
         */
        function checkIfIsOpera() {
            privateIsOpera = uaLowerCase.match(/(opera)/) !== null;
        }

        /**
         * check for browser online state
         */
        function checkIfIsOnline() {
            if (privateIsOnline === undefined) {
                on(window, 'online', checkIfIsOnline);
                on(window, 'offline', checkIfIsOnline);
            }

            privateIsOnline = navigator.onLine !== undefined ? !!navigator.onLine : true;
        }

        /**
         * public functions
         *
         * @interface
         */
        return {

            // is webkit
            isWebkit: function () {
                if (privateIsWebkit === undefined) {
                    checkIfIsWebkit();
                }
                return privateIsWebkit;
            },

            // is microsoft internet explorer
            isMsie: function () {
                if (privateIsMsie === undefined) {
                    checkIfIsMsie();
                }
                return privateIsMsie;
            },

            // is opera
            isOpera: function () {
                if (privateIsOpera === undefined) {
                    checkIfIsOpera();
                }
                return privateIsOpera;
            },

            // is online or offline
            isOnline: function () {
                if (privateIsOnline === undefined) {
                    checkIfIsOnline();
                }
                return privateIsOnline;
            },

            // has canvas support
            hasCanvas: function () {
                if (privateHasCanvas === undefined) {
                    var canvas = document.createElement('canvas');
                    privateHasCanvas = (!!(canvas.getContext && canvas.getContext('2d')));
                }
                return privateHasCanvas;
            }
        };

    }());


    /**
     * make the helper available for ns.helpers.client calls under
     * the ns.helper namespace
     * 
     * @export
     */
    ns.ns('helpers.client', client);


}(window, window.navigator, window.getNs()));