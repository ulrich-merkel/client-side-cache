/*global window*/
/*global document*/
/*global navigator*/

/**
 * app.client.helper
 * 
 * @description
 * - provide information about the client
 * 
 * @author Ulrich Merkel, 2013
 * @version 0.3.2
 *
 * @namespace app
 * 
 * @changelog
 * - 0.3.2 init client moved to separate function
 * - 0.3.1 changed namespace to app
 * - 0.3 isTouchDevice, hasMatrix added
 * - 0.2 Safari, Chrome, Opera Check added, global var useragent
 * - 0.1 basic functions and plugin structur
 * 
 */
(function (window, navigator, app, undefined) {
    'use strict';

    /**
     * undefined is used here as the undefined global
     * variable in ECMAScript 3 and is mutable (i.e. it can
     * be changed by someone else). undefined isn't really
     * being passed in so we can ensure that its value is
     * truly undefined. In ES5, undefined can no longer be
     * modified.
     * 
     * window, navigator and app are passed through as local
     * variables rather than as globals, because this (slightly)
     * quickens the resolution process and can be more
     * efficiently minified (especially when both are
     * regularly referenced in this module).
     */

    var client = (function () {

        /**
         * private functions and vars
         */

        // init global vars
        var privateIsiOS,
            privateIsWebkit,
            privateIsAndroid,
            privateIsBlackberry,
            privateIsOpera,
            privateIsChrome,
            privateIsSafari,
            privateIsSeamonkey,
            privateIsCamino,
            privateIsMsie,
            privateLandscapeMode = "landscapeMode",
            privatePortraitMode = "portraitMode",
            privateOrientationMode,
            privateHasCanvas,
            ua = navigator.userAgent,
            utils = app.helper.utils,
            bind = utils.bind;


        /**
         * detect orientation
         */
        function detectOrientation() {
            var orienation = parseInt(window.orientation, 10);
            switch (orienation) {
            case 0:
                privateOrientationMode = privatePortraitMode;
                break;
            case 180:
                privateOrientationMode = privatePortraitMode;
                break;
            case 90:
                privateOrientationMode = privateLandscapeMode;
                break;
            case -90:
                privateOrientationMode = privateLandscapeMode;
                break;
            default:
                break;
            }
        }


        /**
         * check for ios browser
         */
        function checkIfIsiOS() {
            privateIsiOS = ua.toLowerCase().match(/(iphone|ipod|ipad)/) !== null;
            if (privateIsiOS) {
                bind(window, "orientationchange", detectOrientation);
            }
        }


         /**
         * check for ios browser
         */
        function checkIfIsWebkit() {
            privateIsWebkit = ua.toLowerCase().match(/(webkit)/) !== null;
        }


        /**
         * check for android browser
         */
        function checkIfIsAndroid() {
            privateIsAndroid = ua.toLowerCase().match(/(android)/) !== null;
            if (privateIsAndroid) {
                bind(window, "orientationchange", detectOrientation);
            }
        }


        /**
         * check for blackberry browser
         */
        function checkIfIsBlackberry() {
            privateIsBlackberry = ua.toLowerCase().match(/(blackberry)/) !== null;
            if (privateIsBlackberry) {
                bind(window, "orientationchange", detectOrientation);
            }
        }


        /**
         * check for opera browser
         */
        function checkIfIsOpera() {
            privateIsOpera = ua.toLowerCase().match(/(opera)/) !== null;
        }


        /**
         * check for chrome browser
         */
        function checkIfIsChrome() {
            privateIsChrome = ua.toLowerCase().match(/(chrome)/) !== null;
        }


        /**
         * check for safari browser
         */
        function checkIfIsSafari() {
            privateIsSafari = ua.toLowerCase().match(/(safari)/) !== null;
        }


        /**
         * check for seamonkey browser
         */
        function checkIfIsSeamonkey() {
            privateIsSeamonkey = ua.toLowerCase().match(/(seamonkey)/) !== null;
        }


        /**
         * check for camino browser
         */
        function checkIfIsCamino() {
            privateIsCamino = ua.toLowerCase().match(/(camino)/) !== null;
        }


        /**
         * check for microsoft internet explorer
         */
        function checkIfIsMsie() {
            privateIsMsie = ua.toLowerCase().match(/(msie)/) !== null;
        }


        /**
         * public functions
         */
        return {

            // is ios
            isiOS: function () {
                if (privateIsiOS === undefined) {
                    checkIfIsiOS();
                }
                return privateIsiOS;
            },

            // is webkit
            isWebkit: function () {
                if (privateIsWebkit === undefined) {
                    checkIfIsWebkit();
                }
                return privateIsWebkit;
            },

            // is android
            isAndroid: function () {
                if (privateIsAndroid === undefined) {
                    checkIfIsAndroid();
                }
                return privateIsAndroid;
            },

            // is blackberry
            isBlackberry: function () {
                if (privateIsBlackberry === undefined) {
                    checkIfIsBlackberry();
                }
                return privateIsBlackberry;
            },

            // is chrome
            isChrome: function () {
                if (privateIsChrome === undefined) {
                    checkIfIsChrome();
                }
                return privateIsChrome;
            },

            // is opera
            isOpera: function () {
                if (privateIsOpera === undefined) {
                    checkIfIsOpera();
                }
                return privateIsOpera;
            },

            // is safari
            isSafari: function () {
                if (privateIsSafari === undefined) {
                    checkIfIsSafari();
                }
                return privateIsSafari;
            },

            // is seamonkey
            isSeamonkey: function () {
                if (privateIsSeamonkey === undefined) {
                    checkIfIsSeamonkey();
                }
                return privateIsSeamonkey;
            },

            // is camino
            isCamino: function () {
                if (privateIsCamino === undefined) {
                    checkIfIsCamino();
                }
                return privateIsCamino;
            },

            // is microsoft internet explorer
            isMsie: function () {
                if (privateIsMsie === undefined) {
                    checkIfIsMsie();
                }
                return privateIsMsie;
            },

            // is mobile
            isMobile: function () {
                return (this.isiOS() || this.isAndroid() || this.isBlackberry());
            },

            // is standalone mode (apple web-app)
            isStandalone: function () {
                return (navigator.standalone !== undefined && window.navigator.standalone);
            },

            // is online or offline
            isOnline: function () {
                return navigator.onLine;
            },

            // get orientation degree
            orientation: function () {
                if (window.orientation) {
                    return window.orientation;
                }
                return 0;
            },

            // get orientation mode
            orientationMode: function () {
                if (privateOrientationMode === undefined) {
                    detectOrientation();
                }
                return privateOrientationMode;
            },

            // has retina display
            hasRetinaDisplay: function () {
                return (window.devicePixelRatio >= 2);
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
     * make helper available via app.client namespace
     */
    app.helper.client = client;


}(window, navigator, window.app || {}));