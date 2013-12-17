/*global window*/
/*global document*/
/*global navigator*/

/**
 * ns.helpers.client
 * 
 * @description
 * - provide information about the client and device
 * 
 * @author Ulrich Merkel, 2013
 * @version 0.4
 *
 * @namespace ns
 * 
 * @changelog
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
 * - 0.1 basic functions and plugin structur
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
        var privateIsiOS,                                                   // @type {boolean} Whether this browser is ios or not
            privateIsWebkit,                                                // @type {boolean} Whether this browser is webkit or not
            privateIsAndroid,                                               // @type {boolean} Whether this browser is android or not
            privateIsBlackberry,                                            // @type {boolean} Whether this browser blackberry ios or not
            privateIsOpera,                                                 // @type {boolean} Whether this browser is opera or not
            privateIsChrome,                                                // @type {boolean} Whether this browser is chrome or not
            privateIsSafari,                                                // @type {boolean} Whether this browser is safari or not
            privateIsFirefox,                                               // @type {boolean} Whether this browser is firefox or not
            privateIsSeamonkey,                                             // @type {boolean} Whether this browser is seamonkey or not
            privateIsCamino,                                                // @type {boolean} Whether this browser is camino or not
            privateIsMsie,                                                  // @type {boolean} Whether this browser is msie or not
            privateIsiPad,                                                  // @type {boolean} Whether this device is an ipad tablet or not
            privateIsiPhone,                                                // @type {boolean} Whether this device is an iphone device or not
            privateIsMobileBrowser,                                         // @type {boolean} Whether this device is mobile or not
            privateBrowserVersion,                                          // @type {string} The version of this browser
            privateIOSVersion,                                              // @type {string} The ios version of this browser or undefined
            privateIsOnline,                                                // @type {boolean} Whether this device has network connection or not
            privateNetworkConnection,                                       // @type {object} The navigator.connection object if available
            privateLandscapeMode = "landscapeMode",                         // @type {string} The landscape mode string
            privatePortraitMode = "portraitMode",                           // @type {string} The portrait mode string
            privateOrientationMode,                                         // @type {boolean} The current view mode (landscape/portrait)
            privateHasCanvas,                                               // @type {boolean} Whether the browser has canvas support or not
            privateHideStatusbarTimeout,                                    // @type {integer} Storage placeholder for window.setTimeout

            privateDetectOrientationBound,                                  // @type {boolean} Check to bind detectOrientation function just once

            ua = navigator.userAgent || navigator.vendor || window.opera,   // @type {string} The user agent string of the current browser
            uaLowerCase = ua.toLowerCase(),                                 // @type {string} The lower case user agent string for easier matching
            on = ns.helpers.utils.on;                                       // @type {object} Shortcut for on function


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
		 * bind event to orientation change and make sure
		 * it is bound only once
		 */
		function bindOrientationChange() {
			 if (!privateDetectOrientationBound) {
                on(window, "orientationchange", detectOrientation);
                privateDetectOrientationBound = true;
            }
		}


        /**
         * check for ios browser
         */
        function checkIfIsiOS() {
            privateIsiOS = uaLowerCase.match(/(iphone|ipod|ipad)/) !== null;
            if (privateIsiOS) {
                bindOrientationChange();
            }
        }


        /**
         * check for ios browser
         */
        function checkIfIsWebkit() {
            privateIsWebkit = uaLowerCase.match(/(webkit)/) !== null;
        }


        /**
         * check for android browser
         */
        function checkIfIsAndroid() {
            privateIsAndroid = uaLowerCase.match(/(android)/) !== null;
            if (privateIsAndroid) {
               bindOrientationChange();
            }
        }


        /**
         * check for blackberry browser
         */
        function checkIfIsBlackberry() {
            privateIsBlackberry = uaLowerCase.match(/(blackberry)/) !== null;
            if (privateIsBlackberry) {
				bindOrientationChange();
            }
        }


        /**
         * check for opera browser
         */
        function checkIfIsOpera() {
            privateIsOpera = uaLowerCase.match(/(opera)/) !== null;
        }


        /**
         * check for chrome browser
         */
        function checkIfIsChrome() {
            privateIsChrome = uaLowerCase.match(/(chrome)/) !== null;
        }


        /**
         * check for safari browser
         */
        function checkIfIsSafari() {
            privateIsSafari = uaLowerCase.match(/(safari)/) !== null;
        }


        /**
         * check for firefox browser
         */
        function checkIfIsFirefox() {
            privateIsFirefox = uaLowerCase.match(/(firefox)/) !== null;
        }


        /**
         * check for seamonkey browser
         */
        function checkIfIsSeamonkey() {
            privateIsSeamonkey = uaLowerCase.match(/(seamonkey)/) !== null;
        }


        /**
         * check for camino browser
         */
        function checkIfIsCamino() {
            privateIsCamino = uaLowerCase.match(/(camino)/) !== null;
        }


        /**
         * check for microsoft internet explorer
         */
        function checkIfIsMsie() {
            privateIsMsie = uaLowerCase.match(/(msie)/) !== null;
        }


        /**
         * check for ios browser
         */
        function checkIfIsiPad() {
            privateIsiPad = uaLowerCase.match(/(ipad)/) !== null;
            if (privateIsiPad) {
                bindOrientationChange();
            }
        }


        /**
         * check for ios browser
         */
        function checkIfIsiPhone() {
            privateIsiPhone = uaLowerCase.match(/(iphone)/) !== null;
            if (privateIsiPhone) {
                bindOrientationChange();
            }
        }


        /**
         * detect mobile browsers
         *
         * @see http://detectmobilebrowsers.com/
         */
        function checkIfIsMobileBrower() {

            if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(uaLowerCase)
                || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(uaLowerCase.substr(0, 4))) {
                privateIsMobileBrowser = true;
                bindOrientationChange();
            } else {
				privateIsMobileBrowser = false;
			}
        }


        /**
         * check for browser version
         */
        function checkBrowserVersion() {
            var temp,
                info;

            info = uaLowerCase.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i);
            if (info && (temp = ua.match(/version\/([\.\d]+)/i)) !== null) {
                info[2] = temp[1];
            }

            privateBrowserVersion = info ? info[2] : navigator.appVersion;
        }


        /**
         * check for ios version
         */
        function checkiOSVersion() {
			if (privateIsiOS === undefined) {
				checkIfIsiOS();
			}
        	
        	if (privateIsiOS) {

        		// supports iOS 2.0 and later: <http://bit.ly/TJjs1V>
        		var v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);

        		privateIOSVersion = [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || 0, 10)];
        	}
        }


        /**
         * check for browser online state
         */
        function checkIfIsOnline() {
            if (privateIsOnline === undefined) {
                on(window, "online", checkIfIsOnline);
                on(window, "offline", checkIfIsOnline);
            }

            privateIsOnline = navigator.onLine !== undefined ? !!navigator.onLine : true;
        }


        /**
         * check for network information
         *
         * try to use navigator.connection object (Android 2.2+, W3C proposal)
         */
        function checkNetworkConnection() {

            // try to get connection object and create custom one if it's not available
            var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection || {
                    type: 0,
                    UNKNOWN: 0,
                    ETHERNET: 1,
                    WIFI: 2,
                    CELL_2G: 3,
                    CELL_3G: 4
                },
                detectNetwork = function () {
                    privateNetworkConnection = connection;
                };

            connection.onchange = detectNetwork;
            detectNetwork();
        }


        /**
         * public functions
         *
         * @interface
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

            // is firefox
            isFirefox: function () {
                if (privateIsFirefox === undefined) {
                    checkIfIsFirefox();
                }
                return privateIsFirefox;
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

            // is apple ipad
            isiPad: function () {
                if (privateIsiPad === undefined) {
                    checkIfIsiPad();
                }
                return privateIsiPad;
            },

            // is apple ipad
            isiPhone: function () {
                if (privateIsiPhone === undefined) {
                    checkIfIsiPhone();
                }
                return privateIsiPhone;
            },

            // is mobile
            isMobile: function () {
                if (privateIsMobileBrowser === undefined) {
                    checkIfIsMobileBrower();
                }
                return privateIsMobileBrowser;
            },

            // get browser version
            getBrowserVersion: function () {
                if (privateBrowserVersion === undefined) {
                    checkBrowserVersion();
                }
                return privateBrowserVersion;
            },

            // get ios version
            getiOSVersion: function () {
                if (privateIOSVersion === undefined) {
                    checkiOSVersion();
                }
                return privateIOSVersion;
            },

            // is online or offline
            isOnline: function () {
                if (privateIsOnline === undefined) {
                    checkIfIsOnline();
                }
                return privateIsOnline;
            },

            // get network connection
            getNetworkConnection: function () {
                if (privateNetworkConnection === undefined) {
                    checkNetworkConnection();
                }
                return privateNetworkConnection;
            },

            // is standalone mode (apple web-app)
            isStandalone: function () {
                return (navigator.standalone !== undefined && navigator.standalone);
            },

            // is touch device
            isTouchDevice: function () {
				// ontouchstart works on most browsers, msMaxTouchPoints is for ie10
                return !!('ontouchstart' in window) || window.navigator.msMaxTouchPoints;
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
            },

            // hide mobile status bar
            hideStatusbar: function (delay) {

                // check params
                if (!delay) {
                    delay = 0;
                }

                // set delay and hide status bar if view is on top
                window.clearTimeout(privateHideStatusbarTimeout);
                privateHideStatusbarTimeout = window.setTimeout(function () {

					// stop if view is already on top
                    if (parseInt(window.pageYOffset, 10) === 0) {
						/**
						 * won't work in ios7 anymore
						 * @see http://www.mobilexweb.com/blog/safari-ios7-html5-problems-apis-review
						 */
                        window.scrollTo(0, 1);
                    }

                }, delay);
            }

        };

    }());


    /**
     * global export
     *
     * @export
     */
    ns.namespace('helpers.client', client);


}(window, window.navigator, window.getNamespace()));