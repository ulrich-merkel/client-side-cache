/*global window*/

/**
 * app.helpers.namespace
 * 
 * @description
 * - init app namespaces and provide helper function
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

(function (exports, app, undefined) {
    'use strict';

    /**
     * undefined is used here as the undefined global
     * variable in ECMAScript 3 and is mutable (i.e. it can
     * be changed by someone else). undefined isn't really
     * being passed in so we can ensure that its value is
     * truly undefined. In ES5, undefined can no longer be
     * modified.
     * 
     * window and app are passed through as local
     * variables rather than as globals, because this (slightly)
     * quickens the resolution process and can be more
     * efficiently minified (especially when both are
     * regularly referenced in this module).
     */


    /**
     * helper function to defining package structur
     *
     * within the global app object the given namespaces will
     * be created as javascript objects
     *
     * @see http://de.slideshare.net/s.barysiuk/javascript-and-ui-architecture-best-practices-presentation
     *
     * @param {string} name The namespace string separated with dots (name.name.name)
     *
     * @return {boolean} The success of this function
     */
    function namespace(name) {
        if (name) {

            // init loop vars
            var names = name.split('.'),
                current = app,
                i;

            // toggle through names array
            for (i in names) {

                // if this namespace doesn't exist, create it
                if (!current[names[i]]) {
                    current[names[i]] = {};
                }

                // set current to checked namespace for the next loop
                current = current[names[i]];

            }

            return true;

        }

        return false;

    };  


    // init app namespaces
    namespace('cache.storage.adapter');
    namespace('helpers');
    namespace('controllers');
    namespace('models');
    namespace('views');


    // export app to globals
    exports.app = app;


}(window, window.app || {}));





/*jslint browser: true, devel: true */
/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:true, curly:true, browser:true, indent:4, maxerr:50 */
/*global window*/
/*global document*/
/*global console*/
/*global XMLHttpRequest*/
/*global ActiveXObject*/

/**
 * app.helpers.utils
 *
 * @description
 * - provide utility functions
 *
 * @author Ulrich Merkel, 2013
 * @version 0.1.3
 * 
 * @namespace app
 * 
 * @changelog
 * - 0.1.3 createDomNode added
 * - 0.1.2 refactoring
 * - 0.1.1 bug fix xhr when trying to read binary data on ie
 * - 0.1 basic functions and structur
 *
 */

(function (window, document, app, undefined) {
    'use strict';

    /**
     * undefined is used here as the undefined global
     * variable in ECMAScript 3 and is mutable (i.e. it can
     * be changed by someone else). undefined isn't really
     * being passed in so we can ensure that its value is
     * truly undefined. In ES5, undefined can no longer be
     * modified.
     *
     * window and document are passed through as local
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
    var utils = (function () {

        // init global vars
        var jsonObject = null,
            isConsole = (window.console !== undefined && window.console.log),
            isTime = (window.console !== undefined && console.time !== undefined && console.timeEnd !== undefined),
            emptyArray = [];

        return {

            /**
             * function to write logging message to screen
             * 
             * @param {string} message The message to log
             */
            logToScreen: function (message) {

                // init local vars
                var log = document.getElementById('log'),
                    p = document.createElement("p"),
                    text = document.createTextNode(message);

                // append message
                if (log) {
                    p.appendChild(text);
                    log.appendChild(p);
                }
            },


            /**
             * wrapper for console.log due to some browsers lack of this functions
             * 
             * @param {string} message The message to log
             */
            log: function (message) {

                // check for support
                if (isConsole) {
                    window.console.log(message);
                }

                // log messages to dom element
                utils.logToScreen(message);
            },


            /**
             * log timer start
             * 
             * @param {string} key The timer key
             */
            logTimerStart: function (key) {

                // check for support
                if (isTime) {
                    window.console.time(key);
                }
            },


            /**
             * log timer end
             * 
             * @param {string} key The timer key
             */
            logTimerEnd: function (key) {

                // check for support
                if (isTime) {
                    window.console.timeEnd(key);
                }

            },


            /**
             * add event handler
             *
             * following the lazy loading design pattern, the bind function will be
             * overridden with the correct implemation the first the it will be
             * called. after that all consequent calls deliver the correct one without
             * conditions for different browsers.
             * 
             * @param {string} target The dom object
             * @param {string} target The event type to bind
             * @param {function} handler The function to bind
             */
            bind: function (target, eventType, handler) {

                // override existing function
                if (typeof window.addEventListener === 'function') {
                    // dom2 event
                    utils.bind = function (target, eventType, handler) {
                        target.addEventListener(eventType, handler, false);
                    };
                } else if (typeof document.attachEvent === 'function') {
                    // ie event
                    utils.bind = function (target, eventType, handler) {
                        target.attachEvent('on' + eventType, handler);
                    };
                } else {
                    // older browers
                    utils.bind = function (target, eventType, handler) {
                        target['on' + eventType] = handler;
                    };
                }

                // call the new function
                utils.bind(target, eventType, handler);
            },


            /**
             * remove event handler
             *
             * following the lazy loading design pattern, the unbind function will be
             * overridden with the correct implemation the first the it will be
             * called. after that all consequent calls deliver the correct one without
             * conditions for different browsers.
             * 
             * @param {string} target The dom object
             * @param {string} target The event type to unbind
             * @param {function} handler The function to unbind
             */
            unbind: function (target, eventType, handler) {

                // override existing function
                if (typeof window.removeEventListener === 'function') {
                    // dom2 event
                    utils.unbind = function (target, eventType, handler) {
                        target.removeEventListener(eventType, handler, false);
                    };
                } else if (typeof document.detachEvent === 'function') {
                    // ie event
                    utils.unbind = function (target, eventType, handler) {
                        target.detachEvent('on' + eventType, handler);
                    };
                } else {
                    // older browsers
                    utils.unbind = function (target, eventType) {
                        target['on' + eventType] = null;
                    };
                }

                // call the new function
                utils.unbind(target, eventType, handler);

            },


            /**
             * create dom node element
             *
             * @param {string} name The node element name type
             * @param {object} attributes Name/value mapping of the element attributes
             *
             * @return {object} The created html object
             */
            createDomNode: function (name, attributes) {

                // init local vars and create node
                var node = document.createElement(name),
                    attribute;

                // check for attributes to set
                if (attributes) {
                    for (attribute in attributes) {

                        if (attributes.hasOwnProperty(attribute)) {
                            node.setAttribute(attribute, attributes[attribute]);
                        }

                    }
                }

                // return created node
                return node;
            },


            /**
             * get xhr object
             *
             * @return {object} The new xhr request object or null
             */
            getXhr: function () {

                // set xhr vars
                var xhrObject = null,
                    XMLHttpFactories = [
                        // mozilla, opera, safari and internet explorer (since version 7)
                        function () {
                            return new XMLHttpRequest();
                        },
                        // internet explorer (since version 5)
                        function () {
                            return new ActiveXObject("Msxml2.XMLHTTP");
                        },
                        function () {
                            return new ActiveXObject("Msxml3.XMLHTTP");
                        },
                        // internet explorer (since version 6)
                        function () {
                            return new ActiveXObject("Microsoft.XMLHTTP");
                        }
                    ],
                    length = XMLHttpFactories.length,
                    i = 0;

                // toggle through factories and try to init xhr object
                for (i = 0; i < length; i = i + 1) {
                    try {
                        xhrObject = XMLHttpFactories[i]();
                    } catch (e) {
                        continue;
                    }
                    break;
                }

                // return ajax object
                return xhrObject;
            },


            /**
             * make ajax request
             * 
             * @param {string} url The url to load
             * @param {function} callback The callback after success
             * @param {string} postData The optional post request data to send
             *
             * @returns {string} Returns recieved data as callback parameter
             */
            xhr: function(url, callback, postData) {

                // init local function vars
                var reqObject = utils.getXhr(),
                    reqCallback,
                    reqType = 'GET';

                // if ajax is available
                if (reqObject) {

                    // check request type and post data
                    if (postData !== undefined) {
                        reqType = 'POST';
                    } else {
                        postData = null;
                    }

                    // listen to results
                    reqCallback = function () {

                        /**
                         * ready states
                         *
                         * reqObject.readyStates:
                         * 0: request not initialized
                         * 1: server connection established
                         * 2: request received
                         * 3: processing request
                         * 4: request finished and response is ready
                         *
                         * reqObject.status:
                         * 200: the request was fulfilled, codes between 200 and < 400 indicate that everything is okay
                         * 400: the request had bad syntax or was inherently impossible to be satisfied, codes >= 400 indicate errors
                         * 
                         */

                        if (reqObject.readyState === 4 && ((reqObject.status >= 200 && reqObject.status < 400) || reqObject.status === 0)) {

                            /**
                             * checking additionally for response text parsing
                             * 
                             * binary data (like images) could not be resolved for ajax
                             * calls in ie and is throwing an error if we try to do so
                             */
                            try {
                                var data = reqObject.responseText;
                                if (data) {
                                    callback(data);
                                } else {
                                    callback(false);
                                }
                            } catch (e) {
                                callback(false);
                            }

                        }

                    };

                    // open ajax request and listen for events
                    reqObject.open(reqType, url, true);

                    // listen to results, onload added for non-standard browers (e.g. camino)
                    if (reqObject.onreadystatechange !== undefined) {
                        reqObject.onreadystatechange = reqCallback;
                    } else if (reqObject.onload !== undefined) {
                        reqObject.onload = reqCallback;
                    }

                    // send request
                    reqObject.send(postData);

                } else {
                    callback(false);
                }

            },


            /**
             * get json object
             *
             * @return {object} The window.JSON object or null
             */
            getJson: function () {

                // check for json support
                if (null === jsonObject) {
                    if (window.JSON && window.JSON.stringify) {
                        jsonObject = window.JSON;
                    }
                }

                //return the json object
                return jsonObject;

            },


            /**
             * convert json object to string
             *
             * @param {object} object The object to be parsed
             * 
             * @return {string} The converted string
             */
            jsonToString: function (object) {

                // init local vars
                var result = false;

                // check for json object
                if (null === jsonObject) {
                    jsonObject = utils.getJson();
                }

                // convert object to string
                if (jsonObject && object) {
                    result = jsonObject.stringify(object);
                }

                //return the json object
                return result;

            },


            /**
             * convert string into json object
             *
             * @param {string} string The string to be parsed
             * 
             * @return {object} The converted object
             */
            jsonToObject: function (string) {

                // init local vars
                var result = false;

                // check for json object
                if (null === jsonObject) {
                    jsonObject = utils.getJson();
                }

                // convert object to string
                if (jsonObject && string) {
                    result = jsonObject.parse(string);
                }

                //return the json object
                return result;
            },


            /**
             * get url information
             * 
             * @param {string} url The url to extract
             *
             * @return {object} Current url information
             */
            url: function (url) {

                // check params
                if (!url) {
                    return;
                }

                // create test link elmenent
                var a = document.createElement('a'),
                    pathname;

                // set props
                a.href = url;
                pathname = a.pathname.match(/\/([^\/?#]+)$/i);

                // return url information
                return ({
                    source: url,
                    protocol: a.protocol,
                    host: a.hostname,
                    port: a.port,
                    query: a.search,
                    file: pathname ? pathname[1] : '/',
                    hash: a.hash,
                    path: a.pathname.replace(/^([^\/])/, '/$1'),
                    folder: (function () {
                        var index = url.lastIndexOf('/'),
                            result = url.substr(0, index + 1);
                        return result;
                    }())
                });
            },


            /**
             * check for callback function
             * 
             * @param {function} callback The function to check
             *
             * @return {function} The checked callback function
             */
            callback: function (callback) {
                // check if param is function, if not set it to empty function
                if (!callback || typeof callback !== 'function') {
                    callback = function () {};
                }

                // return checked callback function
                return callback;
            },


            /**
             * check if value is array
             * 
             * @param {array} value The value to check
             *
             * @param {boolean} Whether the given value is an array or not
             */
            isArray: function (value) {
                return value instanceof Array;
            },


            /**
             * check if value is in array
             * 
             * @param {string} elem The value to check
             * @param {array} arr The array to check
             * @param {string} i The index in array
             *
             * @returns {integer} Whether the value is in (return index) or not (return -1)
             */
            inArray: function (elem, array, i) {
                if (Array.prototype.indexOf) {
                    return emptyArray.indexOf.call(array, elem, i);
                }

                // fallback for older browsers, always return not in array
                return -1;
            },


            /**
             * check if element has given class
             * 
             * @param {object} elem The html object to test
             * @param {string} className The class name to test
             *
             * @returns {boolean} Whether the element has the class (return true) or not (return false)
             */
            hasClass: function(elem, className) {
                return new RegExp(' ' + className + ' ').test(' ' + elem.className + ' ');
            }


        };

    }());


    /**
     * global export
     */
    app.helpers.utils = utils;


}(window, document, window.app || {})); // immediatly invoke function
;
/*global window*/
/*global document*/
/*global navigator*/

/**
 * app.helpers.client
 * 
 * @description
 * - provide information about the client and device
 * 
 * @author Ulrich Merkel, 2013
 * @version 0.3.6
 *
 * @namespace app
 * 
 * @changelog
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
        var privateIsiOS,                                                   // privateIsiOS {boolean} Whether this browser is ios or not
            privateIsWebkit,                                                // privateIsWebkit {boolean} Whether this browser is webkit or not
            privateIsAndroid,                                               // privateIsAndroid {boolean} Whether this browser is android or not
            privateIsBlackberry,                                            // privateIsBlackberry {boolean} Whether this browser blackberry ios or not
            privateIsOpera,                                                 // privateIsOpera {boolean} Whether this browser is opera or not
            privateIsChrome,                                                // privateIsChrome {boolean} Whether this browser is chrome or not
            privateIsSafari,                                                // privateIsSafari {boolean} Whether this browser is safari or not
            privateIsFirefox,                                               // privateIsFirefox {boolean} Whether this browser is firefox or not
            privateIsSeamonkey,                                             // privateIsSeamonkey {boolean} Whether this browser is seamonkey or not
            privateIsCamino,                                                // privateIsCamino {boolean} Whether this browser is camino or not
            privateIsMsie,                                                  // privateIsMsie {boolean} Whether this browser is msie or not
            privateIsiPad,                                                  // privateIsiPad {boolean} Whether this device is an ipad tablet or not
            privateIsMobileBrowser,                                         // privateIsMobileBrowser {boolean} Whether this device is mobile or not
            privateBrowserVersion,                                          // privateBrowserVersion {string} The version of this browser
            privateNetworkConnection,                                       // privateNetworkConnection {object} The navigator.connection object if available
            privateLandscapeMode = "landscapeMode",                         // privateLandscapeMode {string} The landscape mode string
            privatePortraitMode = "portraitMode",                           // privatePortraitMode {string} The portrait mode string
            privateOrientationMode,                                         // privateOrientationMode {boolean} The current view mode (landscape/portrait)
            privateHasCanvas,                                               // privateHasCanvas {boolean} Whether the browser has canvas support or not
            privateHideStatusbarTimeout,                                    // privateHideStatusbarTimeout {integer} Placeholder for window.setTimeout
            ua = navigator.userAgent || navigator.vendor || window.opera,   // ua {string} The user agent string of the current browser
            utils = app.helpers.utils,                                      // utils {object} Shortcut for utils functions
            bind = utils.bind;                                              // bind {object} Shortcut for bind function


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
         * check for firefox browser
         */
        function checkIfIsFirefox() {
            privateIsFirefox = ua.toLowerCase().match(/(firefox)/) !== null;
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
         * check for ios browser
         */
        function checkIfIsiPad() {
            privateIsiPad = ua.toLowerCase().match(/(ipad)/) !== null;
            if (privateIsiPad) {
                bind(window, "orientationchange", detectOrientation);
            }
        }


        /**
         * detect mobile browsers
         *
         * @see:http://detectmobilebrowsers.com/
         */
        function checkIfIsMobileBrower() {
            privateIsMobileBrowser = false;
            if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(ua) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(ua.substr(0, 4))) {
                privateIsMobileBrowser = true;
            }
            if (privateIsMobileBrowser) {
                bind(window, "orientationchange", detectOrientation);
            }
        }


        /**
         * check for browser version
         */
        function checkBrowserVersion() {
            var temp,
                info;

            info = ua.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i);
            if (info && (temp = ua.match(/version\/([\.\d]+)/i)) !== null) {
                info[2] = temp[1];
            }

            privateBrowserVersion = info ? info[2] : navigator.appVersion;
        }


        /**
         * check for network information
         *
         * navigator.connection object (Android 2.2+, W3C proposal)
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

            // get network connection
            getNetworkConnection: function () {
                if (privateNetworkConnection === undefined) {
                    checkNetworkConnection();
                }
                return privateNetworkConnection;
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
                    if (parseInt(window.pageYOffset, 10) === 0) {
                        window.scrollTo(0, 1);
                    }
                }, delay);
            }

        };

    }());


    /**
     * make helper available via app.client namespace
     */
    app.helpers.client = client;


}(window, navigator, window.app || {}));
/*jslint browser: true, devel: true */
/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:true, curly:true, browser:true, indent:4, maxerr:50 */
/*global window*/
/*global document*/
/*global console*/
/*global XMLHttpRequest*/
/*global ActiveXObject*/

/**
 * app.helpers.append
 *
 * @description
 * - provide interface to append css, js and images to dom
 *
 * @author Ulrich Merkel, 2013
 * @version 0.1.6
 * 
 * @namespace app
 * 
 * @changelog
 * - 0.1.6 new checkNodeParameters function
 * - 0.1.5 bug fixes for appending images, when there is no data
 * - 0.1.4 bug fixes script loading ie < 8, 
 * - 0.1.3 elemId paramter added
 * - 0.1.2 refactoring
 * - 0.1.1 bug fixes css onload, js onload
 * - 0.1 basic functions and structur
 *
 * @see
 * - http://www.jspatterns.com/the-ridiculous-case-of-adding-a-script-element/
 *
 */

(function (document, app, undefined) {
    'use strict';

    /**
     * undefined is used here as the undefined global
     * variable in ECMAScript 3 and is mutable (i.e. it can
     * be changed by someone else). undefined isn't really
     * being passed in so we can ensure that its value is
     * truly undefined. In ES5, undefined can no longer be
     * modified.
     *
     * window and document are passed through as local
     * variables rather than as globals, because this (slightly)
     * quickens the resolution process and can be more
     * efficiently minified (especially when both are
     * regularly referenced in your plugin).
     *
     */


    /**
     * check node parameters
     *
     * @param {object|null} element The node element
     * @param {object} node Object to test for parameters
     *
     * @return {object} The converted element
     */
    function checkNodeParameters(element, node) {

        if (node) {
            if (node.dom) {
                element = node.dom;
            } else if (node.id) {
                element = document.getElementById(node.id);
            }
        }

        return element;
    }


    /**
     * utility functions
     *
     * following the singleton design pattern
     *
     */
    var append = (function () {

        // init global vars
        var helpers = app.helpers,                                  // helpers {object} Shortcut for helper functions
            utils = helpers.utils,                                  // utils {object} Shortcut for utils functions
            createDomNode = utils.createDomNode,                    // createDomNode {function} Shortcut for createDomNode function
            client = helpers.client,                                // client {object} Shortcut for client functions
            privateAppendedCss = [],                                // privateAppendedCss {array} Storage for appended css files
            privateAppendedJs = [],                                 // privateAppendedJs {array} Storage for appended js files
            privateAppendedImg = [],                                // privateAppendedImg {array} Storage for appended img files
            privateAppendedHtml = [],                               // privateAppendedHtml {array} Storage for appended html files
            headNode = document.getElementsByTagName('head')[0];    // headNode {object} The html dom head object


        return {

            /**
             * append cascading stylesheet to dom
             * 
             * @param {string} url The css url path
             * @param {string} data The css data string
             * @param {function} callback The success function
             * @param {object} node The optional dom node element information object to append the data to
             */
            appendCss: function (url, data, callback, node) {

                // check if css is already appended
                if (utils.inArray(url, privateAppendedCss) === -1) {

                    // init local vars
                    var link = null,
                        textNode;

                    // check for node parameter
                    link = checkNodeParameters(link, node);

                    // if there is data 
                    if (null !== data) {

                        // create style element and set attributes
                        if (!link) {
                            link = createDomNode('style', {'type': 'text/css'});
                        }

                        /**
                         * ie lt9 doesn't allow the appendChild() method on a
                         * link element, so we have to check this here
                         *
                         * these ie's also need that the link element is appended
                         * before the css data could be set/parsed in browser
                         */
                        if (!node) {
                            headNode.appendChild(link);
                        }

                        try {
                            textNode = document.createTextNode(data);
                            link.appendChild(textNode);
                        } catch (e) {
                            link.styleSheet.cssText = data;
                        } finally {
                            callback();
                        }

                    // if there is no data but the url parameter
                    } else if (url !== null) {

                        // create link element and set attributes
                        if (!link) {
                            link = createDomNode('link', {'rel': 'stylesheet', 'type': 'text/css'});
                        }

                        if (!node) {
                            headNode.appendChild(link);
                        }

                        /**
                         * link element doesn't support onload function
                         *
                         * only internet explorer and opera support the onload
                         * event handler for link elements
                         */

                        if (client.isMsie || client.isOpera) {
                            link.onload = callback;
                        } else {
                            callback();
                        }

                        link.href = url;

                    }

                    privateAppendedCss.push(url);

                } else {
                    // css is already appended to dom
                    callback();
                }

            },


            /**
             * append javascript to dom
             * 
             * @param {string} url The js url path
             * @param {string} data The js data string
             * @param {function} callback The success function
             * @param {object} node The optional dom node element information object to append the data to
             */
            appendJs: function (url, data, callback, node) {

                // check if script is already appended
                if (utils.inArray(url, privateAppendedJs) === -1) {

                    // init dom and local vars
                    var script = createDomNode('script'),
                        firstScript = document.getElementsByTagName('script')[0],
                        loaded = false;

                    // check for dom node parameter
                    script = checkNodeParameters(script, node);

                    // set sript attributes
                    script.type = 'text/javascript';
                    script.async = true;

                    // add script event listeners when loaded
                    script.onreadystatechange = script.onload = function () {
                        if (!loaded && (!this.readyState || this.readyState === 'complete' || this.readyState === 'loaded')) {

                            // avoid memory leaks in ie
                            this.onreadystatechange = this.onload = null;
                            loaded = true;
                            privateAppendedJs.push(url);

                            callback();
                        }
                    };

                    // try to handle script errors
                    if (script.onerror) { // ????? really needed condition?
                        script.onerror = function () {

                            // avoid memory leaks in ie
                            this.onload = this.onreadystatechange = this.onerror = null;
                            callback();

                        };
                    }

                    // append script to according dom node
                    if (!node) {
                        if (firstScript) {
                            firstScript.parentNode.insertBefore(script, firstScript);
                        } else {
                            headNode.appendChild(script);
                        }   
                    }

                    // if there is data 
                    if (!!data && !loaded) {

                        /**
                         * try to add data string to script element
                         *
                         * due to different browser capabilities we have to test
                         * for sundry dom methods (e.g. old ie's (lt 8) need script.text)
                         */
                        if (script.textContent) {
                            script.textContent = data;
                        } else if (script.nodeValue) {
                            script.nodeValue = data;
                        } else {
                            script.text = data;
                        }

                        // mark script as loaded
                        loaded = true;

                    } else if (null !== url) {
                        script.src = url;
                    }

                    // check loaded state if file is already loaded
                    if (loaded) {
                        privateAppendedJs.push(url);
                        callback();
                    }

                } else {

                    // script is already appended to dom
                    callback();

                }
            },


            /**
             * append image files to dom
             * 
             * @param {string} url The css url path
             * @param {string} data The css data string
             * @param {function} callback The success function
             * @param {object} node The optional dom node element information object to append the data to
             */
            appendImg: function (url, data, callback, node) {

                // init local vars
                var image = null;

                // check for node parameter
                image = checkNodeParameters(image, node);

                // create empty image object if there is no node param
                if (!image) {
                    image = new Image();
                }

                // add loaded event listener
                image.onload = callback;

                if (data) {
                    // if there is data 
                    image.src = data;
                } else if (url) {
                    // if there is no data but the url parameter
                    image.src = url;
                }

                privateAppendedImg.push(url);

            },


            /**
             * append image files to dom
             * 
             * @param {string} url The css url path
             * @param {string} data The css data string
             * @param {function} callback The success function
             * @param {object} node The optional dom node element information object to append the data to
             */
            appendHtml: function (url, data, callback, node) {

                // init local vars
                var html = null,
                    textNode;

                // check for node parameter
                html = checkNodeParameters(html, node);

                if (!html) {
                    callback();
                    return;
                }

                // if there is data 
                if (data) {
                    /**
                     * innerHTML is not possible for table elements (table, thead, tbody, tfoot and tr) in internet explorer
                     *
                     * in IE8, html.innerHTML will do nothing if the HTML coming in isn't perfectly formatted (against the DTD
                     * being used) - it doesn't tolerate any mistakes unlike when it's parsing normally.
                     *
                     * @see
                     * - http://blog.rakeshpai.me/2007/02/ies-unknown-runtime-error-when-using.html
                     * - http://msdn.microsoft.com/en-us/library/ms533897%28VS.85%29.aspx
                     * - http://domscripting.com/blog/display.php/99
                     */
                    try {
                        html.innerHTML = data;
                        if (node.id) {
                            // force ie 8 to render (or update) the html content
                            document.styleSheets[0].addRule("#" + node.id + ":after", "content: ' ';");
                        }   
                    } catch (e) {
                        html.innerText = data;
                    }

                }

                callback();
                privateAppendedHtml.push(url);

            }


        };

    }());


    /**
     * global export
     */
    app.helpers.append = append;


}(document, window.app || {})); // immediatly invoke function
;
/*jslint unparam: false, browser: true, devel: true */
/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:false, curly:true, browser:true, indent:4, maxerr:50, devel:true, wsh:false */

/*global undefined */
/*global FileError*/
/*global FileReader*/
/*global Blob*/


/**
 * app.cache.storage.adapter.fileSystem
 *
 * @description
 * - provide a storage api for file system
 *
 * @version 0.1.2
 * @author Ulrich Merkel, 2013
 *
 * @namespace app
 *
 * @changelog
 * - 0.1.2 creating test item while open added, bug fixes for chrome 17
 * - 0.1.1 refactoring, js lint
 * - 0.1 basic functions and structur
 *
 * @see
 * - http://www.w3.org/TR/file-system-api/
 *
 * @bugs
 * -
 *
 */

(function (window, app, undefined) {
    'use strict';

    /**
     * undefined is used here as the undefined global
     * variable in ECMAScript 3 and is mutable (i.e. it can
     * be changed by someone else). undefined isn't really
     * being passed in so we can ensure that its value is
     * truly undefined. In ES5, undefined can no longer be
     * modified.
     * 
     * window and app are passed through as local
     * variables rather than as globals, because this (slightly)
     * quickens the resolution process and can be more
     * efficiently minified (especially when both are
     * regularly referenced in this module).
     */

    // create the global vars once
    var storageType = 'fileSystem',                             // storageType {string} The storage type string
        utils = app.helpers.utils,                              // utils {object} Shortcut for utils functions
        log = utils.log,                                        // log {function} Shortcut for utils.log function
        checkCallback = utils.callback,                         // shortcut for utils.callback function
        boolIsSupported = null;                                 // boolIsSupported {boolean} Bool if this type of storage is supported or not


    /**
     * handle storage events
     *
     * @param {object} e The event object
     */
    function handleStorageEvents(e) {

        // init local vars
        var msg = '';

        switch (e.code) {
        case FileError.QUOTA_EXCEEDED_ERR:
            msg = '[' + storageType + ' Adapter] File System Event: QUOTA_EXCEEDED_ERR';
            break;
        case FileError.NOT_FOUND_ERR:
            msg = '[' + storageType + ' Adapter] File System Event: NOT_FOUND_ERR, file does not exist';
            break;
        case FileError.SECURITY_ERR:
            msg = '[' + storageType + ' Adapter] File System Event: SECURITY_ERR';
            break;
        case FileError.INVALID_MODIFICATION_ERR:
            msg = '[' + storageType + ' Adapter] File System Event: INVALID_MODIFICATION_ERR';
            break;
        case FileError.INVALID_STATE_ERR:
            msg = '[' + storageType + ' Adapter] File System Event: INVALID_STATE_ERR';
            break;
        default:
            msg = '[' + storageType + ' Adapter] File System Event: Unknown Error';
            break;
        }

        // log message string
        log(msg);

    }


    /**
     * create directory recursiv
     *
     * @param {object} storageRoot The storage root
     * @param {array} folders The value string from database
     */
    function createDirectory(root, folders, callback) {

        // throw out './' or '/' and move on to prevent something like '/foo/.//bar'
        if (folders[0] === '.' || folders[0] === '') {
            folders = folders.slice(1);
        }

        if (folders[0]) {

            // create directory if not exist
            root.getDirectory(folders[0], {create: true}, function (dirEntry) {

                // recursively add the new subfolder (if we still have another to create)
                if (folders.length) {
                    createDirectory(dirEntry, folders.slice(1), callback);
                } else {
                    callback();
                }

            }, handleStorageEvents);

        } else {
            callback();
        }

    }


    /**
     * check directory path
     *
     * @param {object} storage The storage object
     * @param {srting} url The url string to check
     */
    function checkDirectory(fileSystem, url, callback) {

        // init local vars
        var folders = url.split('/'),
            length = folders.length,
            result = '',
            i = 0;

        // check callback
        callback = checkCallback(callback);

        if (length) {
            // get path without filename
            for (i = 0; i < length - 1; i = i + 1) {
                result = result + folders[i] + '/';
            }

            // create dir if not exist
            createDirectory(fileSystem.root, result.split('/'), callback);
        } else {
            callback();
        }

    }




    /**
     * the actual instance constructor
     * directly called after new Adapter()
     * 
     * @param {object} parameters The instance parameters
     */
    function Adapter(parameters) {

        // init local vars
        var self = this;

        // adapter vars
        self.adapter = null;
        self.type = storageType;

        // default filesystem size 50 MB
        self.size = 50 * 1024 * 1024;

        // run init function
        self.init(parameters);

    }


    /**
     * public instance methods
     *
     * Adapter.fn is just a shortcut for Adapter.prototype
     */
    Adapter.prototype = Adapter.fn = {

        /**
         * test if the browser supports this type of caching
         * 
         * @returns {boolean} Whether this type of storage is supported or not
         */
        isSupported: function () {

            // check for global var
            if (null === boolIsSupported) {
                boolIsSupported = (!!window.requestFileSystem || !!window.webkitRequestFileSystem) && !!window.Blob;
                if (!boolIsSupported) {
                    log('[' + storageType + ' Adapter] ' + storageType + ' is not supported');
                }
            }

            // return bool
            return boolIsSupported;

        },


        /**
         * open and initialize storage if not already done
         * 
         * @param {function} callback The function called on success
         */
        open: function (callback) {

            // init local function vars
            var self = this,
                adapter = self.adapter;

            // check for database
            if (null === adapter) {

                // note: the file system has been prefixed as of google chrome 12:
                window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

                // open filesystem
                window.requestFileSystem(window.TEMPORARY, self.size, function (filesystem) {
                    adapter = self.adapter = filesystem;

                    /* create test item */
                    log('[' + storageType + ' Adapter] Try to create test resource');
                    try {
                        self.create('test-item', utils.jsonToString({test: "test-content"}), function (success) {
                            if (!!success) {
                                self.remove('test-item', function () {
                                    log('[' + storageType + ' Adapter] Test resource created and successfully deleted');
                                    callback(adapter);
                                    return;
                                });
                            } else {
                                callback(false);
                            }
                        });
                    } catch (e) {
                        handleStorageEvents(e);
                        callback(false);
                    }
                    //callback(adapter);
                }, handleStorageEvents);

            } else {
                callback(adapter);
            }

        },


        /**
         * create a new resource in storage
         * 
         * @param {object} resource The resource object
         * @param {string} data The content string
         * @param {function} callback Function called on success
         */
        create: function (key, content, callback) {

            // init local function vars
            var adapter = this.adapter,
                errorHandler = function (e) {
                    handleStorageEvents(e);
                    callback(false, e);
                };

            // check directory exists
            checkDirectory(adapter, key, function () {

                // try to read file, if there is no one it will be created
                adapter.root.getFile(key, {create: true}, function (fileEntry) {

                    // create a fileWriter object for our fileEntry
                    fileEntry.createWriter(function (fileWriter) {

                        // success callback
                        fileWriter.onwriteend = function () {
                            callback(true);
                        };

                        // error callback
                        fileWriter.onerror = errorHandler;

                        /**
                         * try catch added for chrome 17, complains "illegal constructor"
                         * while creating new blob
                         */
                        try {
                            var blob = new Blob([content], {type: 'text/plain'});

                            // write data
                            fileWriter.write(blob);

                        } catch (e) {
                            errorHandler(e);
                        }
                        

                        
                        

                    }, errorHandler);

                }, errorHandler);

            });

        },


        /**
         * read storage item
         *
         * @param {object} resource The resource object
         * @param {function} callback Function called on success
         */
        read: function (key, callback) {

            // init local function vars
            var adapter = this.adapter,
                errorHandler = function (e) {
                    handleStorageEvents(e);
                    callback(false, e);
                };

            // check directory exists
            checkDirectory(adapter, key, function () {

                // try to read file
                adapter.root.getFile(key, {create: false}, function (fileEntry) {

                    /**
                     * get a file object representing the file and
                     * then use FileReader to read its contents
                     */
                    fileEntry.file(function (file) {
                        var reader = new FileReader();

                        // success callback, get resource object
                        reader.onloadend = function () {
                            callback(this.result);
                        };

                        // read file
                        reader.readAsText(file);

                    }, errorHandler);

                }, errorHandler);

            });

        },


        /**
         * update a resource in storage
         * 
         * @param {object} resource The resource object
         * @param {string} data The content string
         * @param {function} callback Function called on success
         */
        update: function (key, content, callback) {

            this.create(key, content, callback);

        },


        /**
         * delete a resource from storage
         * 
         * @param {object} resource The resource object
         * @param {function} callback Function called on success
         */
        remove: function (key, callback) {

            // init local function vars
            var adapter = this.adapter,
                errorHandler = function (e) {
                    handleStorageEvents(e);
                    callback(key, e);
                };

            // check directory exists
            checkDirectory(adapter, key, function () {

                // try to read file
                adapter.root.getFile(key, {create: false}, function (fileEntry) {

                    // remove file
                    fileEntry.remove(function () {
                        callback();
                    }, errorHandler);

                }, errorHandler);

            }, errorHandler);

        },


        /**
         * init storage
         *
         * @param {object} parameters The instance parameters
         * @param {string} [parameters.size=1024*1024] Set storage size
         *
         * @return {this} The instance if supported or false
         */
        init: function (parameters) {
            // init local vars
            var self = this;

            // check for support
            if (self.isSupported()) {

                // set parameters
                if (parameters) {
                    if (parameters.size) {
                        self.size = parameters.size;
                    }
                }

                // return instance
                return self;
            }

            // return false if there is no support
            return false;
        }

    };


    /**
     * make the storage constructor available for
     * app.cache.webStorage() calls under the
     * app.cache namespace
     */
    app.cache.storage.adapter[storageType] = Adapter;


}(window, window.app || {})); // immediatly invoke function
;
/*jslint browser: true, devel: true */
/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:false, curly:true, browser:true, indent:4, maxerr:50, devel:true, wsh:false*/
/*global document */
/*global undefined */


/**
 * app.cache.storage.adapter.indexedDatabase
 *
 * @description
 * - provide a storage api for indexed database
 * 
 * @version 0.1.2
 * @author Ulrich Merkel, 2013
 * 
 * @namespace app
 *
 * @changelog
 * - 0.1.2 several fixes for indexedDB.open for non-standard browsers
 * - 0.1.1 bug fixes delete, js lint
 * - 0.1 basic functions and structur
 * 
 * @see
 * - http://www.w3.org/TR/IndexedDB/
 * - https://developer.mozilla.org/de/docs/IndexedDB
 * - https://developer.mozilla.org/en-US/docs/IndexedDB/Using_IndexedDB
 *
 *
 * @bugs
 * -
 */

(function (window, app, undefined) {
    'use strict';

    /**
     * undefined is used here as the undefined global
     * variable in ECMAScript 3 and is mutable (i.e. it can
     * be changed by someone else). undefined isn't really
     * being passed in so we can ensure that its value is
     * truly undefined. In ES5, undefined can no longer be
     * modified.
     * 
     * window and app are passed through as local
     * variables rather than as globals, because this (slightly)
     * quickens the resolution process and can be more
     * efficiently minified (especially when both are
     * regularly referenced in this module).
     */

    // create the global vars once
    var storageType = 'indexedDatabase',                        // storageType {string} The storage type string
        utils = app.helpers.utils,                              // utils {object} Shortcut for utils functions
        log = utils.log,                                        // log {function} Shortcut for utils.log function
        boolIsSupported = null;                                 // boolIsSupported {boolean} Bool if this type of storage is supported or not


    /**
     * the actual instance constructor
     * directly called after new Adapter()
     * 
     * @param {object} parameters The instance parameters
     */
    function Adapter(parameters) {

        // init vars
        var self = this;

        // adapter vars
        self.adapter = null;
        self.type = storageType;

        // defaults
        self.dbName = 'merkel';
        self.dbVersion = '1.0';
        self.dbTable = 'offline';
        self.dbDescription = 'Local cache';
        self.dbKey = 'key';

        // run init function
        self.init(parameters);

    }

    /**
     * public instance methods
     *
     * Adapter.fn is just a shortcut for Adapter.prototype
     */
    Adapter.prototype = Adapter.fn = {

        /**
         * test if the browser supports this type of caching
         * 
         * @returns {boolean} Whether this type of storage is supported or not
         */
        isSupported: function () {

            // check for global var
            if (null === boolIsSupported) {
                boolIsSupported =  !!window.indexedDB || !!window.webkitIndexedDB || !!window.mozIndexedDB || !!window.OIndexedDB || !!window.msIndexedDB;
                if (!boolIsSupported) {
                    log('[' + storageType + ' Adapter] ' + storageType + ' is not supported');
                }
            }

            // return bool
            return boolIsSupported;

        },


        /**
         * create a new resource in storage
         * 
         * @param {object} resource The resource object
         * @param {string} data The content string
         * @param {function} callback Function called on success
         */
        create: function (key, content, callback) {

            // init local vars
            var self = this,
                dbTable = self.dbTable,
                dbName = self.dbName,
                transaction = self.adapter.transaction([dbTable], 'readwrite'),
                request = transaction.objectStore(dbTable).put({
                    key: key,
                    content: content
                });

            // check for transaction error
            transaction.onerror = function (e) {
                log('[' + storageType + ' Adapter] Failed to init transaction while creating/updating database entry ' + dbName + ' ' + e);
                callback(false, e);
            };

            // check for request error
            request.onerror = function (e) {
                log('[' + storageType + ' Adapter] Failed to create/update database entry ' + dbName + ' ' + e);
                callback(false, e);
            };

            // return result on success
            request.onsuccess = function () {
                callback(true);
            };

        },


        /**
         * read storage item
         *
         * @param {string} url The url from the resource to get
         * @param {function} callback Function called on success
         */
        read: function (key, callback) {

            // init local vars
            var self = this,
                dbTable = self.dbTable,
                dbName = self.dbName,
                transaction = self.adapter.transaction([dbTable], "readonly"),
                request = transaction.objectStore(dbTable).get(key);

            /**
             * check for valid transaction and request objects
             */
            if (!transaction || !request) {
                callback(false);
                return;
            }

            // check for transaction error
            transaction.onerror = function (e) {
                log('[' + storageType + ' Adapter] Failed to init transaction while reading database ' + dbName + ' ' + e);
            };

            // check for request error
            request.onerror = function (e) {
                log('[' + storageType + ' Adapter] Failed to read database entry ' + dbName + ' ' + e);
                callback(false, e);
            };

            // return result on success
            request.onsuccess = function (e) {
                if (e.target.result && e.target.result.content) {
                    callback(e.target.result.content);
                } else {
                    callback(false);
                }
            };

        },


        /**
         * update a resource in storage
         * 
         * @param {object} resource The resource object
         * @param {string} data The content string
         * @param {function} callback Function called on success
         */
        update: function (key, content, callback) {

            // same logic as this.create
            this.create(key, content, callback);

        },


        /**
        * delete a resource from storage
        * 
        * @param {string} url Url of the resource to delete
        * @param {function} callback Function called on success
        */
        remove: function (key, callback) {

            /**
             * objectStore.delete(url) fails while parsing the js code on older
             * devices due to the reserved word 'delete',
             * so we just set the values empty here to avoid errors
             */

            // init local vars
            var self = this,
                dbTable = self.dbTable,
                dbName = self.dbName,
                transaction = self.adapter.transaction([dbTable], "readwrite"),
                objectStore = transaction.objectStore(dbTable),
                request = objectStore(dbTable).put({
                    key: key,
                    content: ''
                });

            // check for transaction error
            transaction.onerror = function (e) {
                log('[' + storageType + ' Adapter] Failed to init transaction while deleting database entry ' + dbName + ' ' + e);
                callback(false, e);
            };

            // check for request error
            request.onerror = function (e) {
                log('[' + storageType + ' Adapter] Failed to delete database entry ' + dbName + ' ' + e);
                callback(false, e);
            };

            // return result on success
            request.onsuccess = function () {
                callback(true);
            };

        },


        /**
         * open and initialize storage if not already done
         * 
         * @param {function} callback The function called on success
         * @param {boolean} setVersion The optional parameter to set the db version on indexeddb.open(), used for recursiv self.open() call if first option failed
         */
        open: function (callback, setVersion) {

            // init local function vars
            var self = this,
                windowObject = null,
                request = null,
                setVersionRequest = null,
                dbName = self.dbName,
                dbTable = self.dbTable,

                onsuccess,
                onupgradeneeded,
                onerror,
                onblocked;

            // check params
            if (!setVersion) {
                setVersion = false;
            }

            // check for database
            if (null === self.adapter) {

                // get window indexeddb object according to browser prefixes
                windowObject = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.OIndexedDB || window.msIndexedDB;

                // indexeddb is not supported
                if (!windowObject) {
                    callback(false);
                    return;
                }

                // chrome fix (prior version 17)
                if (window.webkitIndexedDB !== undefined) {
                    window.IDBTransaction = window.webkitIDBTransaction;
                    window.IDBKeyRange = window.webkitIDBKeyRange;
                }

                // get database after it is opened
                onsuccess = function (e) {
                    var db = request.result;
                    self.adapter = db;

                    /**
                     * chrome till version 23 supports setVersion instead of onupgradeneeded
                     * upgradeneeded event until chrome 17 won't be fired so the objectstore isn't created
                     *
                     * @see:
                     * - https://code.google.com/p/chromium/issues/detail?id=108223
                     * - https://code.google.com/p/chromium/issues/detail?id=161114
                     * - https://groups.google.com/a/chromium.org/forum/?fromgroups#!topic/chromium-discuss/XZbKEsLQkrY
                     */

                    if ((self.dbVersion !== db.version) && (!!db.setVersion || typeof db.setVersion === 'function')) {

                        // get db type according to bug report
                        setVersionRequest = e.currentTarget.result.setVersion(self.dbVersion);

                        // request failed
                        setVersionRequest.onfailure = function (e) {
                            log('[' + storageType + ' Adapter] Failed to open database: ' + dbName + ' ' + e);
                            callback(false);
                        };

                        // set version is successful, create new object store
                        setVersionRequest.onsuccess = function (e) {
                            var db = request.result,
                                store = db.createObjectStore(dbTable, {keyPath: self.dbKey});

                            log('[' + storageType + ' Adapter] Database needs upgrade: ' + dbName + ' ' + e.oldVersion + ' ' + e.newVersion);

                            // create new database indexes
                            store.createIndex('key',  'key',  { unique: true });
                            store.createIndex('content',  'content',  { unique: false });

                        };

                    } else {
                        callback(db);
                    }
                };

                // database needs upgrade to new version or is not created
                onupgradeneeded = function (e) {
                    var db = request.result,
                        store = db.createObjectStore(dbTable, {keyPath: self.dbKey});

                    log('[' + storageType + ' Adapter] Database needs upgrade: ' + dbName + ' ' + e.oldVersion + ' ' + e.newVersion);

                    // create new database indexes
                    store.createIndex('key',  'key',  { unique: true });
                    store.createIndex('content',  'content',  { unique: false });

                };

                // database can't be opened
                onerror = function (e) {
                    log('[' + storageType + ' Adapter] Failed to open database: ' + dbName + ' ' + e);
                    if (!setVersion) {
                        self.open(callback, true);
                    }
                    callback(false);
                };

                // database is blocked by another process
                onblocked = function (e) {
                    log('[' + storageType + ' Adapter] Opening database request is blocked! ' + dbName + ' ' + e);
                    callback(false);
                };

                /**
                 * open db
                 *
                 * different implementations for windowObject.open(dbName, dbVersion) in some browers
                 * to keep it working in older versions (e.g. firefox 18.0.1 produces version error due to dbVersion param)
                 * we just set dbName parameter if setVersion param isn't set
                 */

                if (setVersion) {

                    /**
                     * try catch here if ie tries to access database and the disc space is full
                     * (tested with ie10)
                     */
                    try {
                        request = windowObject.open(dbName, self.dbVersion);
                    } catch(e) {
                        log(e);
                        request = windowObject.open(dbName);
                    }
                    
                } else {
                    request = windowObject.open(dbName);
                }

                request.onsuccess = onsuccess;
                request.onupgradeneeded = onupgradeneeded;
                request.onerror = onerror;
                request.onblocked = onblocked;

            } else {
                callback(self.adapter);
            }
        },


        /**
         * init storage
         *
         * @param {object} parameters The instance parameters
         * @param {string} [parameters.dbName=merkel] The database name
         * @param {string} [parameters.dbVersion=1.0] The database version
         * @param {string} [parameters.dbTable=offline] The database table name
         * @param {string} [parameters.dbDescription=Local cache] The database description
         * @param {string} [parameters.dbKeyPath=url] The database key
         *
         * @return {this} The instance if supported or false
         */
        init: function (parameters) {
            // init local vars
            var self = this;

            // check for support
            if (self.isSupported()) {

                // set parameters
                if (parameters) {
                    if (parameters.name) {
                        self.dbName = parameters.name;
                    }
                    if (parameters.version) {
                        self.dbVersion = parameters.version;
                    }
                    if (parameters.table) {
                        self.dbTable = parameters.table;
                    }
                    if (parameters.description) {
                        self.dbDescription = parameters.description;
                    }
                    if (parameters.key) {
                        self.dbKey = parameters.key;
                    }
                }

                // return instance
                return self;
            }

            // return false if there is no support
            return false;
        }

    };


    /**
     * make the storage constructor available for
     * app.cache.storage.adapter.indexedDatabase() calls under the
     * app.cache namespace
     */
    app.cache.storage.adapter[storageType] = Adapter;


}(window, window.app || {})); // immediatly invoke function
;
/*global window */

/**
 * app.cache.storage.adapter.webSqlDatabase
 *
 * @description
 * - provide a storage api for web sql database
 *
 * @version 0.1.3
 * @author Ulrich Merkel, 2013
 * 
 * @namespace app
 *
 * @changelog
 * - 0.1.3 refactoring, js lint
 * - 0.1.2 several version change bug fixes
 * - 0.1.1 refactoring, js lint
 * - 0.1 basic functions and structur
 *
 * @see
 * - http://www.w3.org/TR/webdatabase/
 * - http://developer.apple.com/library/safari/#documentation/iphone/conceptual/safarijsdatabaseguide/UsingtheJavascriptDatabase/UsingtheJavascriptDatabase.html
 * - http://html5doctor.com/introducing-web-sql-databases/
 *
 *@bugs
 * -
 *
 */

(function (window, app, undefined) {
    'use strict';

    /**
     * undefined is used here as the undefined global
     * variable in ECMAScript 3 and is mutable (i.e. it can
     * be changed by someone else). undefined isn't really
     * being passed in so we can ensure that its value is
     * truly undefined. In ES5, undefined can no longer be
     * modified.
     * 
     * window, document and app are passed through as local
     * variables rather than as globals, because this (slightly)
     * quickens the resolution process and can be more
     * efficiently minified (especially when both are
     * regularly referenced in this module).
     */


    // create the global vars once
    var storageType = 'webSqlDatabase',                         // storageType {string} The storage type string
        utils = app.helpers.utils,                              // utils {object} Shortcut for utils functions
        log = utils.log,                                        // log {function} Shortcut for utils.log function
        boolIsSupported = null;                                 // boolIsSupported {boolean} Bool if this type of storage is supported or not


    /**
     * execute sql statement
     *
     * @param {object} adapter The current storage object interface
     * @param {string} sqlStatement The sql statement
     * @param {array} parameters The statement parameters
     * @param {function} callback The callback function on success
     * @param {function} transaction The optinional transaction if available
     */
    function executeSql(adapter, sqlStatement, parameters, successCallback, errorCallback, transaction) {

        // execute sql
        if (!transaction && adapter) {
            adapter.transaction(function (transaction) {
                transaction.executeSql(
                    sqlStatement,
                    parameters,
                    successCallback,
                    errorCallback
                );
            });
        } else if (transaction) {
            transaction.executeSql(
                sqlStatement,
                parameters,
                successCallback,
                errorCallback
            );
        } else {
            errorCallback(null, {
                code: 0,
                message: 'The storage adapter isn\'t available'
            });
        }

    }


    /**
     * handle storage events
     *
     * @param {object} e The event object
     */
    function handleStorageEvents(e) {

        // init local vars
        var msg = '[' + storageType + ' Adapter] Errorcode: ' + e.code + ', Message: ' + e.message;

        if (e.info) {
            msg = msg + ' - ' + e.info;
        }

        // log message string
        log(msg);

    }


    /**
     * the actual instance constructor
     * directly called after new Adapter()
     * 
     * @param {object} parameters The instance parameters
     */
    function Adapter(parameters) {

        // init local vars
        var self = this;

        // adapter vars
        self.adapter = null;
        self.type = storageType;
        self.dbName = 'merkel';

        /**
         * Be careful with switching the database number
         * there are known bugs with the changeVersion method
         */
        self.dbVersion = '1.0';
        self.dbDescription = 'resource cache';
        self.dbTable = 'cache';

        /**
         * only Safari prompts the user if you try to create a database over the size of the default database size, 5MB
         * on ios less due to meta data it prompts greater than 4MB
         */
        self.dbSize = 4 * 1024 * 1024;

        // run init function
        self.init(parameters);

    }


    /**
     * public instance methods
     *
     * Adapter.fn is just a shortcut for Adapter.prototype
     */
    Adapter.prototype = Adapter.fn = {

        /**
         * test if the browser supports this type of caching
         * 
         * @returns {boolean} Whether this type of storage is supported or not
         */
        isSupported: function () {

            // check for global var
            if (null === boolIsSupported) {
                boolIsSupported = !!window.openDatabase;
                if (!boolIsSupported) {
                    log('[' + storageType + ' Adapter] ' + storageType + ' is not supported');
                }
            }

            // return bool
            return boolIsSupported;

        },


        /**
         * create a new resource in storage
         * 
         * @param {object} resource The resource object
         * @param {string} data The content string
         * @param {function} callback Function called on success
         */
        create: function (key, content, callback) {

            // init vars and create success callback
            var self = this,
                sqlSuccess = function () {
                    //resource.data = data;
                    callback(true);
                },
                sqlError = function (transaction, e) {
                    handleStorageEvents(e);
                    callback(false, e, {transaction: transaction});
                };

            // execute sql
            executeSql(
                self.adapter,
                'INSERT INTO ' + self.dbTable + ' (key, content) VALUES (?,?);',
                [
                    key,
                    content
                ],
                sqlSuccess,
                sqlError
            );
        },


        /**
         * read storage item
         *
         * @param {object} resource The resource object
         * @param {function} callback Function called on success
         */
        read: function (key, callback) {

            // init vars and create success callback
            var self = this,
                sqlSuccess = function (transaction, data) {

                    // parse item data
                    var content = null;
                    if (data && data.rows && (data.rows.length === 1)) {
                        content = data.rows.item(0).content;
                    }
                    callback(content, null, {transaction: transaction});

                },
                sqlError = function (transaction, e) {
                    handleStorageEvents(e);
                    callback(false, e, {transaction: transaction});
                };

            // execute sql
            executeSql(
                self.adapter,
                'SELECT content FROM ' + self.dbTable + ' WHERE key=?;',
                [key],
                sqlSuccess,
                sqlError
            );

        },


        /**
         * update a resource in storage
         * 
         * @param {object} resource The resource object
         * @param {string} data The content string
         * @param {function} callback Function called on success
         */
        update: function (key, content, callback) {

            // init vars and update success callback
            var self = this,
                sqlSuccess = function () {
                    //resource.data = data;
                    callback(true);
                },
                sqlError = function (transaction, e) {
                    handleStorageEvents(e);
                    callback(false, e, {transaction: transaction});
                };

            // execute sql
            executeSql(
                self.adapter,
                'UPDATE ' + self.dbTable + ' SET content = ?  WHERE key=?;',
                [content, key],
                sqlSuccess,
                sqlError
            );

        },


        /**
         * delete a resource from storage
         * 
         * @param {object} resource The resource object
         * @param {function} callback Function called on success
         */
        remove: function (key, callback) {

            // init vars and delete success callback
            var self = this,
                sqlSuccess = function () {
                    callback(true);
                },
                sqlError = function (transaction, e) {
                    handleStorageEvents(e);
                    callback(false, e, {transaction: transaction});
                };

            // execute sql
            executeSql(
                self.adapter,
                'DELETE FROM ' + self.dbTable + ' WHERE key = ?;',
                [key],
                sqlSuccess,
                sqlError
            );

        },


        /**
         * open and initialize storage if not already done
         * 
         * @param {function} callback The function called on success
         */
        open: function (callback) {

            // init local function vars
            var self = this,
                adapter = self.adapter,


                /**
                 * sql helper function to create table if not exists
                 *
                 * @param {object} currentAdapter The currently initialized adapter
                 * @param {object} transaction The optinional transaction object
                 */
                createTableIfNotExists = function (currentAdapter, transaction) {
                    executeSql(
                        currentAdapter,
                        'CREATE TABLE IF NOT EXISTS ' + self.dbTable + '(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, key TEXT NOT NULL UNIQUE, content TEXT NOT NULL);',
                        [],
                        function () {
                            callback(currentAdapter);
                        },
                        function (e) {
                            handleStorageEvents(e);
                            callback(false);
                        },
                        transaction
                    );
                },

                /**
                 * function to be executed on version change
                 *
                 * @param {object} transaction The transaction object
                 */
                changeVersionTransaction = function (transaction) {
                    createTableIfNotExists(null, transaction);
                },

                /**
                 * function to be executed on version change error
                 *
                 * @param {object} e The error information object
                 */
                changeVersionError = function (e) {

                    // add more information and display error
                    e.info = 'Can\'t migrate to new database version and using localStorage instead. This may be caused by non-standard implementation of the changeVersion method. Please switch back your database version to use webSql on this device.';
                    handleStorageEvents(e);

                    callback(false);
                };

            // try to open database
            try {

                if (null === adapter && self.isSupported()) {

                    /**
                     * obtaining the current database version, calling openDatabase without version parameter
                     * 
                     * if you specify an empty string for the version, the database is opened regardless of the database version.
                     * but then safari always indicates version 1.0
                     * 
                     * safari (6.0.4) doesn't fire the success callback parameter on openDatabase(), so we just can
                     * pass in name, the empty version number, the table description and size
                     *
                     * also, changeVersion, the method to change the database version, is not fully supported in Webkit.
                     * it works in Chrome and Opera, but not in Safari or Webkit. 
                     */
                    self.adapter = window.openDatabase(self.dbName, '', self.dbDescription, self.dbSize);

                    // check for new version
                    if (String(self.adapter.version) !== String(self.dbVersion) && !!self.adapter.changeVersion && typeof self.adapter.changeVersion === 'function') {
                        try {
                            self.adapter.changeVersion(
                                self.adapter.version,
                                self.dbVersion,
                                changeVersionTransaction,
                                changeVersionError
                            );
                        } catch (e) {
                            handleStorageEvents(e);
                            callback(false);
                        }
                    } else {

                        // reopen database with the correct version number to avoid errors
                        self.adapter = window.openDatabase(self.dbName, self.dbVersion, self.dbDescription, self.dbSize);
                        createTableIfNotExists(self.adapter);

                    }

                } else if (self.isSupported()) {

                    // db already initialized
                    callback(adapter);

                }
            } catch (e) {

                // no connection possible
                handleStorageEvents(e);
                callback(false);

            }

        },


        /**
         * init storage
         *
         * @param {object} parameters The instance parameters
         * @param {string} [parameters.dbName=merkel] Set dbName
         *
         * @return {this} The instance if supported or false
         */
        init: function (parameters) {

            // init local vars
            var self = this;

            // check for support
            if (self.isSupported()) {

                // set parameters
                if (parameters) {
                    if (parameters.description) {
                        self.dbDescription = parameters.description;
                    }
                    if (parameters.name) {
                        self.dbName = parameters.name;
                    }
                    if (parameters.size) {
                        self.dbSize = parameters.size;
                    }
                    if (parameters.table) {
                        self.dbTable = parameters.table;
                    }
                    if (parameters.version) {
                        self.dbVersion = String(parameters.version);
                    }
                }

                // return instance
                return self;
            }

            // return false if there is no support
            return false;

        }

    };


    /**
     * make the storage constructor available for
     * app.cache.webSqlDatabase() calls under the
     * app.cache namespace
     */
    app.cache.storage.adapter[storageType] = Adapter;


}(window, window.app || {})); // immediatly invoke function
;
/*jslint unparam: false, browser: true, devel: true, ass: true, plusplus: true, regexp: true */
/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:false, curly:true, browser:true, indent:4, maxerr:50, devel:true, wsh:false */

/*global document */
/*global undefined */
/*gloabl QUOTA_EXCEEDED_ERR */


/**
 * app.cache.storage.adapter.webStorage
 *
 * @description
 * - provide a storage api for web storage
 * 
 * @version 0.1.3
 * @author Ulrich Merkel, 2013
 * 
 * @namespace app
 *
 * @changelog
 * - 0.1.3 polyfill for globalStorage and ie userdata added
 * - 0.1.2 bug fixes for non-standard browsers, added trying to read item to open function
 * - 0.1.1 refactoring, js lint
 * - 0.1 basic functions and structur
 *
 * @see
 * - http://www.w3.org/TR/webstorage/
 *
 *
 * @bugs
 * -
 * 
 */

(function (window, app, undefined) {
    'use strict';

    /**
     * undefined is used here as the undefined global
     * variable in ECMAScript 3 and is mutable (i.e. it can
     * be changed by someone else). undefined isn't really
     * being passed in so we can ensure that its value is
     * truly undefined. In ES5, undefined can no longer be
     * modified.
     * 
     * window and app are passed through as local
     * variables rather than as globals, because this (slightly)
     * quickens the resolution process and can be more
     * efficiently minified (especially when both are
     * regularly referenced in this module).
     */

    // create the global vars once
    var storageType = 'webStorage',                             // storageType {string} The storage type string
        utils = app.helpers.utils,                              // utils {object} Shortcut for utils functions
        log = utils.log,                                        // log {function} Shortcut for utils.log function
        boolIsSupported = null,                                 // boolIsSupported {boolean} Bool if this type of storage is supported or not
        div,                                                    // div {object} Placeholder for polyfill
        attrKey,                                                // attrKey {string} Placeholder for polyfill
        localStorage,                                           // localStorage {object} Placeholder for polyfill
        cleanKey,                                               // cleanKey {function} Placeholder for polyfill
        attr;                                                   // attr {object} Placeholder for polyfill


    /**
     * polyfill for localstorage
     * 
     * check to see if we have non-standard support for localStorage and
     * implement that behaviour
     *
     * try catch here if ie tries to access database and the disc space is full
     * (tested with ie10)
     *
     * @see https://github.com/wojodesign/local-storage-js/blob/master/storage.js
     */
    try {

        if (!window.localStorage) {

            /**
             * globalStorage
             *
             * non-standard: Firefox 2+
             * https://developer.mozilla.org/en/dom/storage#globalStorage
             */
            if (window.globalStorage) {

                // try/catch for file protocol in Firefox
                try {
                    window.localStorage = window.globalStorage;
                } catch (e) {
                    log('[' + storageType + ' Adapter] Try to init globalStorage failed');
                }

            }


            /**
             * ie userData
             *
             * non-standard: IE 5+
             * http://msdn.microsoft.com/en-us/library/ms531424(v=vs.85).aspx
             */
            if (!window.localStorage) {

                // create dom element to store the data
                div = document.createElement('div');
                attrKey = 'localStorage';

                div.style.display = 'none';
                document.getElementsByTagName('head')[0].appendChild(div);

                if (div.addBehavior) {
                    div.addBehavior('#default#userdata');
                    //div.style.behavior = "url('#default#userData')";

                    /**
                     * convert invalid characters to dashes
                     * simplified to assume the starting character is valid
                     *
                     * @see http://www.w3.org/TR/REC-xml/#NT-Name
                     */
                    cleanKey = function (key) {
                        return key.replace(/[^\-._0-9A-Za-z\xb7\xc0-\xd6\xd8-\xf6\xf8-\u037d\u37f-\u1fff\u200c-\u200d\u203f\u2040\u2070-\u218f]/g, '-');
                    };


                    // set polfyfill api
                    localStorage = window[attrKey] = {

                        length: 0,

                        setItem: function (key, value) {
                            div.load(attrKey);
                            key = cleanKey(key);

                            if (!div.getAttribute(key)) {
                                this.length = this.length + 1;
                            }
                            div.setAttribute(key, value);

                            div.save(attrKey);
                        },

                        getItem: function (key) {
                            div.load(attrKey);
                            key = cleanKey(key);
                            return div.getAttribute(key);

                        },

                        removeItem: function (key) {
                            div.load(attrKey);
                            key = cleanKey(key);
                            div.removeAttribute(key);

                            div.save(attrKey);
                            this.length = this.length - 1;
                            if (this.length < 0) {
                                this.length = 0;
                            }
                        },

                        clear: function () {
                            div.load(attrKey);
                            var i = 0;
                            while (attr = div.XMLDocument.documentElement.attributes[i++]) {
                                div.removeAttribute(attr.name);
                            }
                            div.save(attrKey);
                            this.length = 0;
                        },

                        key: function (key) {
                            div.load(attrKey);
                            return div.XMLDocument.documentElement.attributes[key];
                        }

                    };


                    div.load(attrKey);
                    localStorage.length = div.XMLDocument.documentElement.attributes.length;

                }
            }
        }
    } catch (e) {
        log(e);
    }


    /**
     * handle web storage events
     *
     * the event only fires on other windows – it won’t fire on the window that did the storing.
     * the event won’t fire if the data doesn’t change, i.e. if you store .name = 'test' and set it to 'test'
     * again it won’t fire the storage event (obviously, since nothing was stored).
     * 
     * @see http://html5doctor.com/storing-data-the-simple-html5-way-and-a-few-tricks-you-might-not-have-known/
     *
     * @param {object} e The event object
     */
    function handleStorageEvents(e) {

        // handle Internet Explorer storage event
        if (!e && window.event) {
            e = window.event;
        }

        // init local vars
        var msg = '[' + storageType + ' Adapter] Event - key: ' + (e.key || 'no e.key event') + ', url: ' + (e.url || 'no e.url event');

        // log event
        log(msg);
    }


    /**
     * get storage type
     * 
     * @param {string} type Local or session
     *
     * @return {string} The storage type string
     */
    function getStorageType(type) {

        // init local vars
        var result = false;

        // get type string
        switch (type) {
        case 'local':
            result = 'localStorage';
            break;
        case 'session':
            result = 'sessionStorage';
            break;
        default:
            result = 'localStorage';
            break;
        }

        // return result
        return result;
    }


    /**
     * the actual instance constructor
     * directly called after new Adapter()
     * 
     * @param {object} parameters The instance parameters
     */
    function Adapter(parameters) {

        // init local vars
        var self = this;

        // adapter vars
        self.adapter = null;
        self.type = storageType;

        // default lifetime (session or local)
        self.lifetime = 'local';

        // run init function
        self.init(parameters);

    }


    /**
     * public instance methods
     *
     * Adapter.fn is just a shortcut for Adapter.prototype
     */
    Adapter.prototype = Adapter.fn = {

        /**
         * test if the browser supports this type of caching
         * 
         * @returns {boolean} Whether this type of storage is supported or not
         */
        isSupported: function () {

            var self = this,
                type = getStorageType(self.lifetime);

            // check for global var
            if (null === boolIsSupported) {
                try {
                    boolIsSupported = !!window[type].getItem;
                } catch (e) {
                    log('[' + storageType + ' Adapter] ' + storageType + ' is not supported');
                    boolIsSupported = false;
                }
            }

            // return bool
            return boolIsSupported;

        },


        /**
         * create a new resource in storage
         * 
         * @param {object} resource The resource object
         * @param {string} data The content string
         * @param {function} callback Function called on success
         */
        create: function (key, content, callback) {

            try {
                // save data and call callback
                this.adapter.setItem(key, content);
                callback(true);

            } catch (e) {
                // handle errors
                handleStorageEvents(e);
                callback(false, e);

            }

        },


        /**
         * read storage item
         *
         * @param {object} resource The resource object
         * @param {function} callback Function called on success
         */
        read: function (key, callback) {

            var self = this,
                data;

            try {
                // try to load data
                data = self.adapter.getItem(key);

                // return data
                if (data) {
                    callback(data);
                } else {
                    callback(false);
                }

            } catch (e) {

                // handle errors
                handleStorageEvents(e);
                callback(false, e);

            }


        },


        /**
         * update a resource in storage
         * 
         * @param {object} resource The resource object
         * @param {string} data The content string
         * @param {function} callback Function called on success
         */
        update: function (key, content, callback) {

            // same logic as this.create
            this.create(key, content, callback);

        },


        /**
         * delete a resource from storage
         * 
         * @param {object} resource The resource object
         * @param {function} callback Function called on success
         */
        remove: function (key, callback) {

            try {
                // delete data and call callback
                this.adapter.removeItem(key);
                callback(key);

            } catch (e) {
                // handle errors
                handleStorageEvents(e);
                callback(false, e);

            }

        },


        /**
         * open and initialize storage if not already done
         * 
         * @param {function} callback The function called on success
         */
        open: function (callback) {

            // init local function vars
            var self = this,
                adapter = self.adapter,
                type = getStorageType(self.lifetime);

            // check for database
            if (null === adapter) {
                try {

                    /* init global object */
                    adapter = self.adapter = window[type];
                    utils.bind(window, 'storage', handleStorageEvents);

                    /* create test item */
                    log('[' + storageType + ' Adapter] Try to create test resource');
                    self.create('test-item', '{test: "test-content"}', function (success) {
                        if (!!success) {
                            self.remove('test-item', function () {
                                log('[' + storageType + ' Adapter] Test resource created and successfully deleted');
                                callback(adapter);
                                return;
                            });
                        } else {

                            callback(false);
                        }

                    });

                } catch (e) {
                    callback(false);
                    return;
                }
            } else if (self.isSupported()) {

                // adapter already initialized
                callback(adapter);
            }

        },


        /**
         * init storage
         *
         * @param {object} parameters The instance parameters
         * @param {string} [parameters.type=localStorage] Set storage type to localStorage or sessionStorage
         *
         * @return {this} The instance if supported or false
         */
        init: function (parameters) {

            // init local vars
            var self = this;

            // check for support
            if (self.isSupported()) {

                // set parameters
                if (parameters) {
                    if (parameters.lifetime) {
                        self.lifetime = parameters.lifetime;
                    }
                }

                // return instance
                return self;
            }

            // return false if there is no support
            return false;
        }

    };


    /**
     * make the storage constructor available for
     * app.cache.webStorage() calls under the
     * app.cache namespace
     */
    app.cache.storage.adapter[storageType] = Adapter;


}(window, window.app || {})); // immediatly invoke function
;
/*global window*/
/*global document*/
/*global confirm*/

/**
 * app.cache.storage.adapter.applicationCache
 * 
 * @description
 * - handle html5 offline application cache
 * 
 * @version 0.1.3
 * @author Ulrich Merkel, 2013
 *
 * @namespace app
 *
 * @changelog
 * - 0.1.4 renamed addEventListener to adapterEvent, bug fixes progress event
 * - 0.1.3 improved module structur
 * - 0.1.2 initializing call via images loaded removed (seems to be buggy on edge connections), invoke main callback after 10 sec for slow connections
 * - 0.1.1 update ready event bug fixes
 * - 0.1 basic functions
 *
 * @see
 * - http://www.w3.org/TR/offline-webapps/
 * - http://www.html5rocks.com/de/tutorials/appcache/beginner/
 *
 * @bugs
 * -
 *
 */

(function (window, document, app, undefined) {
    'use strict';

    /**
     * undefined is used here as the undefined global
     * variable in ECMAScript 3 and is mutable (i.e. it can
     * be changed by someone else). undefined isn't really
     * being passed in so we can ensure that its value is
     * truly undefined. In ES5, undefined can no longer be
     * modified.
     *
     * window, document and app are passed through as local
     * variables rather than as globals, because this (slightly)
     * quickens the resolution process and can be more
     * efficiently minified (especially when both are
     * regularly referenced in this module).
     */

    /**
     * The overall limit for saving files is round abound 5 MB (depending on device)
     *  
     * the application cache can be checked/debugged in chrome with
     * chrome://appcache-internals/ to view and delete cached files or check the console
     * while the page is loading
     *
     * firefox on desktop in general promts a popup
     * when trying to save data with application cache
     */


    // create the global vars once
    var storageType = 'applicationCache',                       // storageType {string} The storage type string
        helpers = app.helpers,                                  // helpers {object} Shortcut for helper functions
        utils = helpers.utils,                                  // utils {object} Shortcut for utils functions
        log = utils.log,                                        // log {function} Shortcut for utils.log function
        checkCallback = utils.callback,                         // shortcut for utils.callback function
        boolIsSupported = null,                                 // boolIsSupported {boolean} Bool if this type of storage is supported or not
        htmlNode = document.getElementsByTagName('html')[0];    // htmlNode {object} The dom html element


    /**
     * the actual instance constructor
     * directly called after new Adapter()
     * 
     */
    function Adapter() {

        // init local vars
        var self = this;

        // adapter vars
        self.adapter = null;
        self.type = storageType;
        self.isLoaded = false;
        self.delay = 25;

        // run init function
        self.init();

    }


     /**
     * instance methods
     */
    Adapter.prototype = {

        /**
         * test if the browser supports this type of caching
         * 
         * @returns {boolean} Whether this type of storage is supported or not
         */
        isSupported: function () {

            // check for global var
            if (null === boolIsSupported) {
                boolIsSupported = !!window.applicationCache && !!htmlNode.getAttribute('manifest');
                if (!boolIsSupported) {
                    log('[' + storageType + ' Adapter] ' + storageType + ' is not supported');
                }
            }

            // return bool
            return boolIsSupported;

        },


        /**
         * invoke a callback function and make shure it's
         * only called once
         *
         * @param {function} callback The function to be called on loaded
         */
        loaded: function (callback) {

            var self = this;

            if (!self.isLoaded) {
                self.isLoaded = true;
                window.setTimeout(function () {
                    callback();
                }, self.delay);
            }

        },


        /**
         * open and initialize storage if not already done
         * 
         * @param {function} callback The function called on success
         */
        open: function (callback) {

            // init local function vars
            var self = this,
                adapter = self.adapter,
                adapterEvent = adapter.addEventListener,
                manifestProgressCount = 0,
                onUpdateReady;

            // check parameters
            callback = checkCallback(callback);

            // check for database
            if (self.isSupported() && null !== adapter) {

                /**
                 * handle updates
                 */
                onUpdateReady = function () {
                    log('[' + storageType + ' Adapter] Event updateready');

                    // avoid errors in browsers that are not capable of swapCache
                    try {
                        adapter.swapCache();
                    } catch (e) {
                        log('[' + storageType + ' Adapter] Event updateready: swapcache is not available');
                    }

                    // ask user for refreshing the page
                    if (confirm("A new version of this website is available. Do you want to an update?")) {
                        window.location.reload(true);
                    } else {
                        self.loaded(callback);
                    }

                    return false;
                };


                /**
                 * checking event
                 *
                 * If the manifest file has not changed, and the app is already cached,
                 * the noupdate event is fired and the process ends.
                 */
                adapterEvent('checking', function () {
                    log('[' + storageType + ' Adapter] Event checking');

                    return false;
                });


                /**
                 * no update event
                 * 
                 * If the manifest file has not changed, and the app is already cached,
                 * the noupdate event is fired and the process ends.
                 */
                adapterEvent('noupdate', function () {
                    log('[' + storageType + ' Adapter] Event noupdate');
                    self.loaded(callback);

                    return false;
                });


                /**
                 * downloading cache files starts
                 * 
                 * If the application is not already cached, or if the manifest has changed,
                 * the browser downloads and caches everything listed in the manifest.
                 * The downloading event signals the start of this download process.
                 */
                adapterEvent('downloading', function () {
                    log('[' + storageType + ' Adapter] Event downloading');
                    manifestProgressCount = 0;

                    return false;
                });


                /**
                 * download progress event
                 * 
                 * progress events are fired periodically during the downloading process,
                 * typically once for each file downloaded.
                 *
                 * @param {object} e The progress event object holding additionally information
                 */
                adapterEvent('progress', function (e) {
                    log('[' + storageType + ' Adapter] Event progress');

                    var progress = "",
                        bar = document.getElementById('layer-loading-bar');

                    // to run the css animation smooth until end
                    self.delay = 500;

                    manifestProgressCount = manifestProgressCount + 1;

                    // Progress event: compute percentage
                    if (e && e.lengthComputable !== undefined) {
                        progress = " " + Math.round(100 * e.loaded / e.total) + "%";
                    } else {
                        progress = " " + Math.round(100 * manifestProgressCount / 20) + "%";
                    }

                    if (bar) {
                        bar.style.width = progress;
                    }

                    return false;
                });


                /**
                 * files are cached event
                 * 
                 * The first time an application is downloaded into the cache, the browser
                 * fires the cached event when the download is complete.
                 */
                adapterEvent('cached', function () {
                    log('[' + storageType + ' Adapter] Event cached');
                    self.loaded(callback);

                    return false;
                });


                /**
                 * update is available event
                 *
                 * When an already-cached application is updated, and the download is complete
                 * the browser fires "updateready". Note that the user will still be seeing
                 * the old version of the application when this event arrives.
                 */
                adapterEvent('updateready', function () {
                    onUpdateReady();
                });


                /**
                 * cache is obsolete event
                 *
                 * If a cached application references a manifest file that does not exist,
                 * an obsolete event is fired and the application is removed from the cache.
                 * Subsequent loads are done from the network rather than from the cache.
                 */
                adapterEvent('obsolete', function () {
                    log('[' + storageType + ' Adapter] Event obsolete');
                    window.location.reload(true);

                    return false;
                });


                /**
                 * cache error event
                 *
                 * If there is an error with the cache file or
                 * ressources can't be loaded
                 */
                adapterEvent('error', function () {
                    log('[' + storageType + ' Adapter] Event error');
                    self.loaded(callback);

                    return false;
                });


                /**
                 * additionally check for status constants
                 *
                 * since a cache manifest file may have been updated or loaded before a script attaches event
                 * listeners to test for the events, we check additionally for the current manifest status
                 */
                switch (adapter.status) {
                case adapter.UNCACHED:
                    // UNCACHED == 0, occurs when there is a bug while downloading files
                    self.loaded(callback);
                    break;
                case adapter.IDLE:
                    // IDLE == 1, files are already loaded
                    self.loaded(callback);
                    break;
                case adapter.UPDATEREADY:
                    // UPDATEREADY == 4, update is available
                    onUpdateReady();
                    break;
                case adapter.OBSOLETE:
                    // OBSOLETE == 5, cache isn't valid anymore
                    self.loaded(callback);
                    break;
                default:
                    break;
                }


                /**
                 * check for manifest updates if a online network is available
                 *
                 */
                utils.bind(window, 'online', function () {
                    try {
                        adapter.update();
                    } catch (e) {
                        log('[' + storageType + ' Adapter] Window event online: update cache is not available');
                    }
                });


                /**
                 * call the main callback after certain time for slow
                 * internet connections or uncovered non-standard behaviours
                 * throwing errors
                 *
                 * the page is already accessable because all application cache
                 * files will be loaded async in the background
                 */
                window.setTimeout(function () {
                    if (!self.isLoaded) {
                        self.loaded(callback);
                    }
                }, 12000);


            } else {

                self.loaded(callback);

            }
        },


        /**
         * init storage
         *
         * @return {this} The instance if supported or false
         */
        init: function () {

            // init local vars
            var self = this,
                adapter = self.adapter;

            // check for support
            if (self.isSupported()) {

                if (null === adapter) {
                    adapter = self.adapter = window.applicationCache;
                }

            }

            // return false if there is no support
            return self;
        }

    };


    /**
     * make the storage adapter available under the
     * app.cache namespace
     */
    app.cache.storage.adapter[storageType] = Adapter;


}(window, document, window.app || {}));
/*jslint browser: true, devel: true, regexp: true */
/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:false, curly:true, browser:true, indent:4, maxerr:50 */

/*global document*/
/*global undefined*/


/**
 * app.cache.storage.controller
 *
 * @description
 * - connect to different storage types if available
 * - provide consistent api for different storage types
 * - store and read via storage adapter
 * - convert resource data, encode data into storable formats and decode data form storage
 * 
 * @version 0.1.3
 * @author Ulrich Merkel, 2013
 * 
 * @namespace app
 *
 * @changelog
 * - 0.1.3 bug fix when checking adapter support - additionally checking with adapter.open and not just isSupported, modified getStorageAdapter function
 * - 0.1.2 refactoring, js lint
 * - 0.1.1 bug fix init when cache storage is disabled
 * - 0.1 basic functions and structur
 *
 * @bugs
 * -
 * 
 */

(function (document, app, undefined) {
    'use strict';

    /**
     * undefined is used here as the undefined global
     * variable in ECMAScript 3 and is mutable (i.e. it can
     * be changed by someone else). undefined isn't really
     * being passed in so we can ensure that its value is
     * truly undefined. In ES5, undefined can no longer be
     * modified.
     * 
     * document and app are passed through as local
     * variables rather than as globals, because this (slightly)
     * quickens the resolution process and can be more
     * efficiently minified (especially when both are
     * regularly referenced in this module).
     */

    // module vars
    var controllerType = 'storage',                             // controllerType {string} The controller type string
        helpers = app.helpers,                                  // helper {object} Shortcut for helper functions
        client = helpers.client,                                // client {object} Shortcut for client functions
        utils = helpers.utils,                                  // utils {object} Shortcut for utils functions
        log = utils.log,                                        // log {function} Shortcut for utils.log function
        checkCallback = utils.callback,                         // checkCallback {function} Shortcut for utils.callback function
        json = utils.getJson(),                                 // json {function} Global window.Json object if available
        xhr = utils.xhr,                                        // xhr {function} Shortcut for utils.xhr function
        appCacheStorageAdapter = app.cache.storage.adapter,     // appCacheStorageAdapter {object} Shortcut for app.cache.storage.adapter namespace


        /**
         * adapters {array} Config array with objects for different storage types
         * 
         * this is the place to configure which types of adapters will be checked
         * and which resource types are stored in which adapter type
         */
        adapters = [
            {type: 'fileSystem', css: true, js: true, html: true, img: true },
            {type: 'indexedDatabase', css: true, js: true, html: true, img: true },
            {type: 'webSqlDatabase', css: 1, js: 1, html: 1, img: 0 },
            {type: 'webStorage', css: true, js: true, html: false, img: false }
        ],


        /**
         * adapterDefaults {object} The default option to initialize the adapter
         *
         * this config could be overridden by the passed in parameters
         */
        adapterDefaults = {
            name: 'merkel',                                     // adapterDefaults.name {string} Default db name
            table: 'cache',                                     // adapterDefaults.table {string} Default db table name
            description: 'resource cache',                      // adapterDefaults.description {string} Default db description
            size: 4 * 1024 * 1024,                              // adapterDefaults.size {integer} Default db size 4 MB
            version: '1.0',                                     // adapterDefaults.version {string} Default db version, needs to be string for web sql database and should be 1.0
            key: 'key',                                         // adapterDefaults.key {string} Default db primary key
            lifetime: 'local',                                  // adapterDefaults.lifetime {string} Default lifetime for webstorage
            offline: true                                       // adapterDefaults.offline {boolean||string} Default switch for using application cache
        },

        adapterAvailable = null,                                // adapterAvailable {string} The name of the best available adapter
        adapterAvailableConfig = null,                          // adapterAvailableConfig {object} The adapter config for the available type (see adapters)


        /**
         * resourceDefaults {object} The defaults for a single resource
         *
         */
        resourceDefaults = {
            lifetime: 10000,                                    // resourceDefaults.lifetime {integer} Default lifetime time in milliseconds (10000 ca 10sec)
            group: 0,                                           // resourceDefaults.group {integer} Default resource group
            lastmod: new Date().getTime(),                      // resourceDefaults.lastmod {integer} Default last modification timestamp
            type: 'css',                                        // resourceDefaults.type {string} Default resource type
            version: 1.0                                        // resourceDefaults.version {float} Default resource version
        };


    /**
     * helper function to convert a json object to string
     *
     * @param {object} object The json object to convert
     *
     * @return {string} The converted json string
     */
    function convertObjectToString(object) {
        return utils.jsonToString(object);
    }


    /**
     * helper function to convert a json string to object
     *
     * @param {string} string The json string to convert
     *
     * @return {string} The converted json object
     */
    function convertStringToObject(string) {

        // init local vars
        var result = null;

        // avoid console errors if the resource loading parameters changed
        try {
            result = utils.jsonToObject(string);
        } catch (e) {
            log('[' + controllerType + ' controller] Couldn\'t convert json string to object.');
        }

        // return result
        return result;
    }


    /**
     * convert image url to base64 string
     * 
     * @param {string} url The image url
     * @param {function} callback The callback function after success
     * @param {string} imageType The image type (jpeg, png)
     *
     * @returns {string} Returns converted data as callback parameter or false
     */
    function convertImageToBase64(url, callback, imageType) {

        // check for canvas support
        if (client.hasCanvas()) {

            // init local function vars
            var canvas = document.createElement('canvas'),
                context,
                image = new Image(),
                result = null,
                height = 0,
                width = 0;

            // check imageType parameter
            if (!imageType) {
                imageType = "jpeg";
            }

            // asynch event handler when image is loaded
            image.onload = function () {

                // set canvas dimensions
                height = canvas.height = image.height;
                width = canvas.width = image.width;

                // get 2d context
                context = canvas.getContext("2d");

                // set background color (for jpeg images out of transparent png files)
                context.fillStyle = "rgba(50, 50, 50, 0)";

                // draw background, start on top/left and set fullwith/height
                context.fillRect(0, 0, width, height);

                // draw image in canvas on top/left
                context.drawImage(image, 0, 0);

                // get base64 data string and return result
                result = canvas.toDataURL("image/" + imageType);
                callback(result);
            };

            // set image source
            image.src = url;

        } else {

            /**
             * just do a false callback and don't get the data via xhr to
             * avoid the parsing of binary data via response text
             */
            callback(false);
        }
    }


    /**
     * replace relative with absolute urls, used whithin resource string data (e.g css background urls)
     *
     * @param {string} data The data content string
     * @param {object} resource The resource object item
     *
     * @returns {string} Returns converted or source data
     */
    function convertRelativeToAbsoluteUrls(data, resource) {

        // just do it for css files
        if (resource.type === 'css') {

            var urlParts = utils.urlParts(resource.url);

            return data.replace(/url\("../g, 'url("' + urlParts.folder + '..');
        }

        return data;
    }


    /**
     * copy resource object for the use in storage
     * 
     * remove url from resource data string to avoid duplicate data in storage.
     * we also set the new expires timestamp here, because this function will
     * only be called from create/update to get a copy from the resource content.
     * 
     * @param {object} resource The resource object item
     * 
     * @returns {object} Returns the copied resource
     */
    function copyStorageContent(resource) {

        // set new data for storage content
        return {
            data: resource.data,
            lifetime: resource.lifetime || resourceDefaults.lifetime,
            expires: new Date().getTime() + (resource.lifetime || resourceDefaults.lifetime),
            group: resource.group || resourceDefaults.group,
            lastmod: resource.lastmod || resourceDefaults.lastmod,
            type: resource.type || resourceDefaults.type,
            version: resource.version || resourceDefaults.version
        };
    }


    /**
     * check if resource is cachable due to adapter config
     *
     * @param {string} resourceType The resource type (css, js, html, ...)
     * 
     * @returns {boolean} Returns true or false depending on resource type
     */
    function isRessourceStorable(resourceType) {

        // check if type is available in adapter config and return bool
        if (adapterAvailableConfig && adapterAvailableConfig[resourceType]) {
            return !!adapterAvailableConfig[resourceType];
        }
        return false;

    }


    /**
     * get available storage adapter recursivly
     * automatically try to init each storage adapter until a supported adapter is found
     *
     * @param {array} storageAdapters The storage types
     * @param {function} callback The callback function 
     */
    function getAvailableStorageAdapter(storageAdapters, callback) {

        // init local vars
        var adapter = null,
            storageType;

        // end of recursive loop reached, no adapter available
        if (!storageAdapters || !storageAdapters.length) {
            if (!adapterAvailable) {
                callback(false);
            }
            return;
        }

        // init storage and check support
        storageType = storageAdapters[0].type;
        log('[' + controllerType + ' controller] Testing for storage adapter type: ' + storageType);

        if (appCacheStorageAdapter[storageType]) {
            adapter = new appCacheStorageAdapter[storageType](adapterDefaults);
        } else {
            // recursiv call
            getAvailableStorageAdapter(storageAdapters.slice(1), callback);
        }

        // check for general javascript api support
        if (adapter && adapter.isSupported()) {

            // storage api is avaibable, try to open storage
            adapter.open(function (success) {

                if (!!success) {

                    adapterAvailable = storageType;
                    adapterAvailableConfig = storageAdapters[0];

                    log('[' + controllerType + ' controller] Used storage adapter type: ' + adapterAvailable);
                    callback(adapter);

                } else {

                    // recursiv call
                    getAvailableStorageAdapter(storageAdapters.slice(1), callback);

                }
            });

        } else {

            // recursiv call
            getAvailableStorageAdapter(storageAdapters.slice(1), callback);
        }
    }


    /**
     * get storage adapter
     *
     * @param {function} callback The callback function
     * @param {string} type The optional storage type to initialize
     */
    function getStorageAdapter(callback, storageType) {

        // init local vars
        var adapter = null,
            i = 0,
            length;

        // if storage type is set, try to initialize it
        if (storageType) {

            try {
                // init storage and check support
                log('[' + controllerType + ' controller] Testing for storage adapter type: ' + storageType);
                if (appCacheStorageAdapter[storageType]) {
                    adapter = new appCacheStorageAdapter[storageType](adapterDefaults);
                } else {
                    getStorageAdapter(callback);
                }

                if (adapter && adapter.isSupported()) {

                    // storage api is avaibable, try to open storage
                    adapter.open(function (success) {
                        if (!!success) {

                            adapterAvailable = storageType;
                            length = adapters.length;

                            for (i = 0; i < length; i = i + 1) {
                                if (adapters[i].type === storageType) {
                                    adapterAvailableConfig = adapters[i];
                                }
                            }

                            if (adapterAvailableConfig) {
                                log('[' + controllerType + ' controller] Used storage type: ' + adapterAvailable);
                                callback(adapter);
                                return;
                            }

                            log('[' + controllerType + ' controller] Storage config not found: ' + adapterAvailable);
                            getStorageAdapter(callback);

                        } else {

                            getStorageAdapter(callback);

                        }
                    });
                } else {
                    getStorageAdapter(callback);
                }
            } catch (e) {
                log('[' + controllerType + ' controller] Storage adapter could not be initialized: type ' + storageType);
                getStorageAdapter(callback);
            }

        } else {
            // automatic init with global adapters array
            getAvailableStorageAdapter(adapters, callback);
        }
    }


    /**
     * storage constructor
     *
     * @param {function} callback The callback function
     * @param {object} parameters The optional parameters for the init function
     */
    function Storage(callback, parameters) {

        /**
         * this.isEnabled = true {boolean} Enable or disable client side storage
         *
         * enable or disable client side cache or load resources just
         * via xhr if this option/parameter is set to false
         */
        this.isEnabled = true;


        /**
         * this.adapter {object} The instance of the best available storage adapter
         */
        this.adapter = null;


        /**
         * this.appCacheAdapter {object} The instance of the application cache storage adapter
         */
        this.appCacheAdapter = null;


        /**
         * this.resourceDefaults {object} Make the resource defaults available to instance calls
         */
        this.resourceDefaults = resourceDefaults;


        // run init function
        this.init(callback, parameters);
    }


    /**
     * storage methods
     *
     */
    Storage.prototype = {

        /**
         * create resource in storage
         *
         * @param {object} resource The resource object
         * @param {function} callback The callback function
         */
        create: function (resource, callback) {

            // init local vars
            var self = this,
                url = resource.url,
                type = resource.type,
                createCallback = function (data) {

                    // append data to resource object
                    resource.data = data;

                    if (null !== self.adapter && isRessourceStorable(type)) {

                        // create storage content
                        var key = convertObjectToString(url),
                            content = convertObjectToString(copyStorageContent(resource));

                        /**
                        * there is a bug in older browser versions (seamonkey)
                        * when trying to read or write from db (due to non-standard implementation),
                        * so we have to use try catch here
                        */
                        try {
                            // create storage entry
                            self.adapter.create(key, content, function (success) {
                                if (success) {
                                    log('[' + controllerType + ' controller] Create new resource in storage adapter: type ' + type + ', url ' + url);
                                    callback(resource);
                                } else {
                                    log('[' + controllerType + ' controller] Create new resource in storage adapter failed');
                                    callback(false);
                                }
                            });
                        } catch (e) {
                            // just give back the resource to get the data
                            callback(resource);
                        }

                    } else {
                        log('[' + controllerType + ' controller] Trying to create new resource, but resource type is not cachable or storage adapter is not available: type ' + type + ', url ' + url);
                        callback(resource);
                    }
                };

            // check callback function
            callback = checkCallback(callback);

            // get resource data based on type
            if (type === 'img') {
                convertImageToBase64(url, createCallback);
            } else {
                xhr(url, createCallback);
            }

        },


        /**
         * read resource from storage
         *
         * @param {object} resource The resource object
         * @param {function} callback The callback function
         */
        read: function (resource, callback) {

            // init local vars
            var self = this,
                url = resource.url,
                type = resource.type;

            // check callback function
            callback = checkCallback(callback);

            // try to read from storage
            if (null !== this.adapter && isRessourceStorable(type)) {

                log('[' + controllerType + ' controller] Trying to read resource from storage: type ' + type + ', url ' + url);

                /**
                 * there is a bug in older browser versions (seamonkey)
                 * when trying to read from db (due to non-standard implementation),
                 * so we have to use try catch here and fallback to xhr to get the data
                 * 
                 */
                try {
                    self.adapter.read(convertObjectToString(url), function (data) {
                        if (data) {
                            resource = convertStringToObject(data);

                            /**
                             * check if the convertStringToObject function succeeded
                             * could fail if resource is saved properly or resource parameters changed,
                             * so we remove the old resource from storage instead to create
                             * a new one
                             */
                            if (!resource) {
                                self.adapter.remove(convertObjectToString(url), function () {
                                    log('[' + controllerType + ' controller] Resource deleted from storage adapter to create a new one: type ' + type + ', url ' + url);
                                    callback(false);
                                });
                                return;
                            }

                            resource.url = url;
                            log('[' + controllerType + ' controller] Successfully read resource from storage: type ' + type + ', url ' + url);
                            callback(resource);
                        } else {
                            log('[' + controllerType + ' controller] There is no data coming back from storage while reading: type ' + type + ', url ' + url);
                            callback(false);
                        }
                    });
                } catch (e) {
                    xhr(url, function (data) {
                        resource.data = data;
                        log('[' + controllerType + ' controller] Try to read resource from storage, but storage adapter is not available: type ' + type + ', url ' + url);
                        callback(resource);
                    });
                }

            } else {
                callback(resource);
            }
        },


        /**
         * update resource from storage
         *
         * @param {object} resource The resource object
         * @param {function} callback The callback function
         */
        update: function (resource, callback) {

            // init local vars
            var self = this,
                url = resource.url,
                type = resource.type,
                createCallback = function (data) {

                    // append data to resource object
                    resource.data = data;

                    if (null !== self.adapter && isRessourceStorable(type)) {

                        // create storage content
                        var key = convertObjectToString(url),
                            content = convertObjectToString(copyStorageContent(resource));

                        /**
                        * there is a bug in older browser versions (seamonkey)
                        * when trying to read or write from db (due to non-standard implementation),
                        * so we have to use try catch here
                        */
                        try {
                            // create storage entry
                            self.adapter.update(key, content, function (success) {
                                if (success) {
                                    log('[' + controllerType + ' controller] Update existing resource in storage adapter: type ' + type + ', url ' + url);
                                    callback(resource);
                                } else {
                                    log('[' + controllerType + ' controller] Updating resource in storage failed.');
                                    callback(false);
                                }
                            });
                        } catch (e) {
                            // just give back the resource to get the data
                            callback(resource);
                        }

                    } else {
                        log('[' + controllerType + ' controller] Resource type is not cachable or storage adapter is not available: type ' + type + ', url ' + url);
                        callback(resource);
                    }
                };

            // check callback function
            callback = checkCallback(callback);

            // get resource data based on type
            if (resource.type === 'img') {
                convertImageToBase64(url, createCallback);
            } else {
                xhr(url, createCallback);
            }
        },


        /**
         * remove resource from storage
         *
         * @param {object} resource The resource object
         * @param {function} callback The callback function
         */
        remove: function (resource, callback) {

            // init local vars
            var self = this,
                url = resource.url,
                type = resource.type;

            // check callback function
            callback = checkCallback(callback);

            // try to remove resource from storage
            if (null !== self.adapter && isRessourceStorable(type)) {
                self.adapter.remove(convertObjectToString(url), function (data) {
                    resource = convertStringToObject(data);

                    if (!resource) {
                        callback(false);
                        return;
                    }

                    resource.url = url;
                    log('[' + controllerType + ' controller] Delete resource form storage: type ' + type + ', url ' + url);
                    callback(resource);
                });
            } else {
                log('[' + controllerType + ' controller] Delete resource from storage failed, resource type is not cachable or there is no storage adapter: type ' + type + ', url ' + url);
                callback(resource);
            }

        },


        /**
         * init storage
         *
         * @param {function} callback The callback function
         * @param {object} parameters The optional storage parameters
         */
        init: function (callback, parameters) {

            // init local vars
            var self = this,
                storageType = false;

            if (parameters && parameters.isEnabled !== undefined) {
                self.isEnabled = !!parameters.isEnabled;
            }

            if (self.isEnabled && json) {

                // set parameters
                if (parameters) {
                    if (parameters.description) {
                        adapterDefaults.description = String(parameters.description);
                    }
                    if (parameters.key) {
                        adapterDefaults.key = String(parameters.key);
                    }
                    if (parameters.lifetime) {
                        adapterDefaults.lifetime = String(parameters.lifetime);
                    }
                    if (parameters.name) {
                        adapterDefaults.name = String(parameters.name);
                    }
                    if (parameters.size) {
                        adapterDefaults.size = parseInt(parameters.size, 10);
                    }
                    if (parameters.table) {
                        adapterDefaults.table = String(parameters.table);
                    }
                    if (parameters.type) {
                        adapterDefaults.type = storageType = String(parameters.type);
                    }
                    if (parameters.version) {
                        adapterDefaults.version = parameters.version;
                    }
                    if (parameters.offline) {
                        adapterDefaults.offline = parameters.offline;
                    }
                }

                if (adapterDefaults.offline && appCacheStorageAdapter.applicationCache) {
                    self.appCacheAdapter = new appCacheStorageAdapter.applicationCache(adapterDefaults);
                }


                /**
                 * storage checking and initializing takes some time
                 * (especially for db's), so we return the current storage
                 * instance via callbacks, after the adapter get's
                 * successfully initialized
                 *
                 * the returned adapter will already be opened
                 */

                getStorageAdapter(function (adapter) {
                    self.adapter = adapter;
                    callback(self);
                }, storageType);

            } else {

                /**
                 * just return the instance to get the ressource
                 * via xhr if storage is disabled or json is not
                 * available
                 */

                if (!json) {
                    log('[' + controllerType + ' controller] There is no json support');
                }
                if (!self.isEnabled) {
                    log('[' + controllerType + ' controller] Caching data is disabled');
                }

                callback(self);
            }
        }

    };


    /**
     * make storage controller available under app namespace
     */
    app.cache.storage.controller = Storage;


}(document, window.app || {})); // immediatly invoke function
;
/*jslint unparam: true */

/*global window*/
/*global document*/

/**
 * app.cache.controller
 * 
 * @description
 * - main functions/controller for handling client-side cache
 * - connect to storage controller and read/write data or get data via xhr
 * - handle logic to check for outdated data
 * 
 * @author Ulrich Merkel (hello@ulrichmerkel.com)
 * @version 0.1.3
 *
 * @namespace app
 *
 * @changelog
 * - 0.1.3 bug fix check for outdated data
 * - 0.1.2 resource attrib check on loadResource function added
 * - 0.1.1 bug fix load resource (item.lifetime is set check added)
 * - 0.1 basic functions and plugin structur
 *
 * @see
 * - http://www.winktoolkit.org/
 * - http://www.winktoolkit.org/documentation/symbols/wink.cache.html
 *
 * 
 * 
 * @bugs
 * - 
 *
 **/

(function (window, document, app, undefined) {
    'use strict';

    /**
     * undefined is used here as the undefined global
     * variable in ECMAScript 3 and is mutable (i.e. it can
     * be changed by someone else). undefined isn't really
     * being passed in so we can ensure that its value is
     * truly undefined. In ES5, undefined can no longer be
     * modified.
     * 
     * document and app are passed through as local
     * variables rather than as globals, because this (slightly)
     * quickens the resolution process and can be more
     * efficiently minified (especially when both are
     * regularly referenced in this module).
     */

    // module vars
    var controllerType = 'cache',                               // controllerType {string} The controller type string
        helpers = app.helpers,                                  // helpers {object} Shortcut for helper functions
        append = helpers.append,                                // append {function} Shortcut for append helper
        utils = helpers.utils,                                  // utils {object} Shortcut for utils functions
        log = utils.log,                                        // log {function} Shortcut for utils.log function
        checkCallback = utils.callback,                         // checkCallback {function} Shortcut for utils.callback function
        controller = {};                                        // controller {object} Cache controller public functions and vars


    /**
     * cache controller
     *
     * implements the singleton design pattern
     *
     */
    controller = {

        /**
         * {object} The storage controller instance
         */
        storage: null,


        /**
         * load multiple resources
         *
         * @param {array} resources The array with resource objects
         * @param {function} mainCallback The callback after all resources are loaded
         */
        load: function (resources, mainCallback) {

            // declare vars and functions
            var self = this,
                now = new Date().getTime(),


                /**
                 * functions are also saved in local vars rather than
                 * saving them as instance functions (via this) for
                 * faster access and better compression results
                 */

                /**
                 * queue manager for loading all groups of resources after each other
                 *
                 * @return {object} Helper functions to handle callbacks after load
                 */
                loadResourceGroupQueue = (function () {

                    // init local vars
                    var queueSize = 0,
                        queueLoaded = 0,
                        queueCallback = null;

                    return {

                        /**
                         * init group to queue
                         * 
                         * @param {integer} size The length of the group
                         * @param {function} callback The callback after the group is loaded
                         */
                        init: function (size, callback) {
                            queueCallback = callback;
                            queueSize = size;
                            queueLoaded = 0;
                        },

                        /**
                         * mark resource as loaded
                         * if all group resources have been loaded, invoke callback
                         */
                        loaded: function () {
                            queueLoaded = queueLoaded + 1;
                            if (queueLoaded === queueSize) {
                                queueCallback();
                            }
                        }
                    };

                }()), // immediatly invoke function to make init and loaded accessable


                /**
                 * append file to dom
                 * helper function to switch append function according to file type
                 *
                 * @param {object} resource The resource
                 * @param {string} data The resource data string
                 */
                appendFile = function (resource, data) {

                    // init local vars
                    var url = resource.url,
                        callback = function () {
                            loadResourceGroupQueue.loaded();
                        },
                        node = resource.node || null;

                    // load file according to type
                    switch (resource.type) {
                    case 'js':
                        append.appendJs(url, data, callback, node);
                        break;
                    case 'css':
                        append.appendCss(url, data, callback, node);
                        break;
                    case 'img':
                        append.appendImg(url, data, callback, node);
                        break;
                    case 'html':
                        append.appendHtml(url, data, callback, node);
                        break;
                    default:
                        break;
                    }

                },


                /**
                 * load data from cache
                 * this function loads a single resource from cache
                 *
                 * @param {object} resource The resource
                 */
                loadResource = function (resource) {

                    var data = null,
                        callback = function (cbResource) {
                            if (cbResource && cbResource.data) {
                                appendFile(cbResource, cbResource.data);
                            } else {
                                appendFile(cbResource);
                            }
                        },
                        resourceDefaults = self.storage.resourceDefaults,
                        lastmodCheck = true;


                    // check optional resource attributes and set defaults
                    resource.version = resource.version ? parseFloat(resource.version) : resourceDefaults.version;
                    resource.group = resource.group ? parseFloat(resource.group) : resourceDefaults.group;

                    // read resource via storage controller
                    self.storage.read(resource, function (item) {

                        // check resource lastmod for handling outdated data
                        if (resource.lastmod && item && item.lastmod) {
                            resource.lastmod = parseInt(resource.lastmod, 10);
                            lastmodCheck = (item.lastmod === resource.lastmod);
                        } else if (!resource.lastmod && item && item.lastmod) {
                            resource.lastmod = item.lastmod;
                        } else {
                            resource.lastmod = resourceDefaults.lastmod;
                        }


                        /**
                         * if there is no item create it
                         *
                         * this is also the point where data get's loaded via
                         * xhr when the storage is disabled, the resource isn't then
                         * created - it just returns the data via xhr
                         */
                        if (!item || !item.data) {
                            log('[' + controllerType + ' controller] Resource or resource data is not available in storage adapter: type ' + resource.type + ', url ' + resource.url);
                            self.storage.create(resource, callback);
                            return;
                        }


                        /**
                         * check for outdated data
                         *
                         * if item.lifetime is set to '-1' the resource will always be loaded from network
                         * also the item.lastmod and cached resource.lastmod (and item.version/resource.version) needs to be the same
                         * finally there is a check if the item is expired using the current timestamp
                         */
                        if (parseInt(item.lifetime, 10) !== -1 && lastmodCheck && resource.version === item.version && item.expires > now) {
                            log('[' + controllerType + ' controller] Resource is up to date: type ' + resource.type + ', url ' + resource.url);
                            data = item.data;
                        } else {
                            log('[' + controllerType + ' controller] Resource is outdated and needs update: type ' + resource.type + ', url ' + resource.url);
                            self.storage.update(resource, callback);
                            return;
                        }

                        // append file if data is valid
                        if (data) {
                            appendFile(resource, data);
                        }

                    });

                },


                /**
                 * load resource group
                 *
                 * @param {array} group The resources group
                 * @param {function} callback The callback function
                 */
                loadResourceGroup = function (group, callback) {

                    // init local vars
                    var i = 0,
                        length = group.length,
                        resource = null;

                    // init queue manager for this group to invoke a callback when group finished loading
                    loadResourceGroupQueue.init(length, callback);

                    // toggle through group
                    for (i = 0; i < length; i = i + 1) {

                        // check resource and load it
                        resource = group[i];
                        if (resource && resource.url) {
                            loadResource(resource);
                        }

                    }
                },


                /**
                 * sort given resources according to group parameter
                 * this will allow us to load resources in a certain order to
                 * keep all the dependencies save
                 * 
                 * @param {array} resources The resources to sort
                 *
                 * @returns {array} Sorted array with resource objects
                 */
                groupResources = function(resources) {

                    // init local vars
                    var result = [],
                        group,
                        i = 0,
                        resource,
                        resourceGroup,
                        length = resources.length;

                    // toggle through resources
                    for (i = 0; i < length; i = i + 1) {

                        // get resource information
                        resource = resources[i];
                        resourceGroup = resource.group;

                        // if resource group isn't set in resource parameters, set it the zero
                        if (!resourceGroup) {
                            resourceGroup = 0;
                        }

                        // check if group exists in result, otherwise create it
                        if (result[resourceGroup]) {
                            // select according group
                            group = result[resourceGroup];
                        } else {
                            // set new group and content to new array
                            group = result[resourceGroup] = [];
                        }

                        // push resource into group
                        group.push(resource);
                    }

                    // return group sorted array
                    return result;

                },


                /**
                 * main load function, chain resource group loading
                 *
                 * @param {array} resources All the grouped resources
                 * @param {function} callback The main callback function
                 * @param {integer} index The optional group index
                 */
                load = function (resources, callback, index) {

                    // init local vars
                    var length = resources.length,
                        group;

                    /**
                     * check for corrent index value
                     * on first load index is undefined/optional, so we set
                     * it to zero to run the loop correctly
                     */
                    if (!index) {
                        index = 0;
                    }

                    while (!resources[index] && index < length) {
                        index = index + 1;
                    }

                    // end of resources array reached
                    if (index >= length) {
                        callback();
                        return;
                    }

                    // load resources, increase group index recursiv
                    group = resources[index];
                    loadResourceGroup(group, function () {
                        load(resources, callback, index + 1);
                    });

                };

            // call main function
            log('[' + controllerType + ' controller] Load resource function called: resources count ' + resources.length);
            load(groupResources(resources), checkCallback(mainCallback));

        },


        /**
         * init cache controller
         *
         * @param {function} callback The callback function after initializing
         * @param {object} parameters The optional storage parameters
         */
        init: function (callback, parameters) {

            // init local vars
            var self = this,
                storage;

            // check callback function
            callback = checkCallback(callback);

            // init storage
            log('[' + controllerType + ' controller] Cache initializing and checking for storage adapters');
            storage = new app.cache.storage.controller(function (storage) {

                self.storage = storage;
                callback(storage);

            }, parameters);

        }
    };


    /**
     * make cache controller globally available under app namespace
     */
    app.cache.controller = controller;


}(window, document, window.app || {})); // immediatly invoke function
;
/*jslint unparam: true */

/*global window*/
/*global document*/

/**
 * app.cache.init
 * 
 * @description
 * - initialize cache functions and resources
 * 
 * @author Ulrich Merkel (hello@ulrichmerkel.com)
 * @version 0.1
 *
 * @namespace app
 *
 * @changelog
 * - 0.1 basic functions and plugin structur
 *
 * @see
 * -
 * 
 * @bugs
 * - 
 *
 **/

(function (window, document, app, undefined) {
    'use strict';

    /**
     * undefined is used here as the undefined global
     * variable in ECMAScript 3 and is mutable (i.e. it can
     * be changed by someone else). undefined isn't really
     * being passed in so we can ensure that its value is
     * truly undefined. In ES5, undefined can no longer be
     * modified.
     * 
     * document and app are passed through as local
     * variables rather than as globals, because this (slightly)
     * quickens the resolution process and can be more
     * efficiently minified (especially when both are
     * regularly referenced in this module).
     */

    // module vars
    var helpers = app.helpers,                                  // helpers {object} Shortcut for helper functions
        utils = helpers.utils,                                  // utils {object} Shortcut for utils functions
        bind = utils.bind,                                      // bind {function} Shortcut for bind helper
        controller = {};                                        // controller {object} Cache controller public functions and vars



    /**
     * get controller
     */
    controller = app.cache.controller;


    /**
     * load additional resources on window load
     *
     */
    bind(window, 'load', function () {
        utils.logTimerStart('Page css and js files loaded');
        utils.logTimerStart('Page images loaded');
        utils.logTimerStart('Html loaded');


        var baseUrl = window.baseurl || utils.url(window.location.pathname).folder,
            loaded = 0,
            loadedCallback = function () {
                loaded = loaded + 1;
                if (loaded === 2) {
                    document.getElementById('layer-loading').style.display = 'none';
                }
            };

        controller.init(function (storage) {

            /**
             * here we define the resources to be loaded and cached
             *
             * there are muliple async calls for resources via controller.load possible
             * the callback function is just used to hide the loading layer
             *
             * possible options are:
             *
             * {string} url The required url of the resource
             * {string} type The required content type of the resource (css, js, img, html)
             * {string|integer} group The optional loading group of the resource, this is used for handling dependencies, a following group begins to start loading when the previous has finished
             * {string|integer} version The optional version number of the resource, used to mark a resource to be updated
             * {string|integer} lastmod The optional lastmod timestamp of the resource, used to mark a resource to be updated
             * {string|integer} lifetime The optional lifetime time in milliseconds of the resource, used to mark a resource to be updated after a given period if time, if set to -1 the resource will always be loaded from network
             * {object} node Container for additional dom node informations
             * {string} node.id The id from the dom element to append the data to
             * {string} node.dom The current dom element to append the data to
             *
             */

            // load page css and js files
            controller.load([
                {url: baseUrl + "css/app.css", type: "css"},
                {url: baseUrl + "js/lib.js", type: "js"},
                {url: baseUrl + "js/app.js", type: "js", group: 1}
            ], function () {
                utils.logTimerEnd('Page css and js files loaded');
                loadedCallback();
            });

            // load page images
            controller.load([
                {url: baseUrl + "img/410x144/test-1.jpg", type: "img", node: {id: "image-1"}},
                {url: baseUrl + "img/410x144/test-2.jpg", type: "img", node: {id: "image-2"}},
                {url: baseUrl + "img/410x144/test-3.jpg", type: "img", node: {id: "image-3"}}
            ], function () {
                utils.logTimerEnd('Page images loaded');
            });

            // load html
            controller.load([
                {url: baseUrl + "ajax.html", type: "html", node: {id: "ajax"}}
            ], function () {
                utils.logTimerEnd('Html loaded');
            });

            // initialize application cache and wait for loaded
            if (storage && storage.appCacheAdapter) {
                storage.appCacheAdapter.open(function () {
                    loadedCallback();
                });
            } else {
                loadedCallback();
            }


        });

    });

}(window, document, window.app || {}));













