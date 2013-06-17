/*global window*/

/**
 * init namespaces
 */


var app = window.app || {};

app.helper = {};
app.cache = {};
app.cache.storage = {};
app.cache.storage.adapter = {};


/*jslint browser: true, devel: true */
/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:true, curly:true, browser:true, indent:4, maxerr:50 */
/*global window*/
/*global document*/
/*global console*/
/*global XMLHttpRequest*/
/*global ActiveXObject*/

/**
 * app.utils
 *
 * @description
 * - provide utility functions
 * 
 * @version: 0.1
 * @author: Ulrich Merkel, 2013
 * 
 * @namespace: app
 * 
 * @changelog
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
                var log = document.getElementById('log'),
                    p = document.createElement("p"),
                    text = document.createTextNode(message);

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
             * following the lazy loading design pattern
             * 
             * @param {string} target The dom object
             * @param {string} target The event type to bind
             * @param {function} handler The function to bind
             */
            bind: function (target, eventType, handler) {
                // override existing function
                if (typeof window.addEventListener === 'function') { // dom2 event
                    utils.bind = function (target, eventType, handler) {
                        target.addEventListener(eventType, handler, false);
                    };
                } else if (typeof document.attachEvent === 'function') { // ie event
                    utils.bind = function (target, eventType, handler) {
                        target.attachEvent("on" + eventType, handler);
                    };
                } else { // older browers
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
             * following the lazy loading design pattern
             * 
             * @param {string} target The dom object
             * @param {string} target The event type to unbind
             * @param {function} handler The function to unbind
             */
            unbind: function (target, eventType, handler) {

                // override existing function
                if (typeof window.removeEventListener === 'function') { // dom2 event
                    utils.unbind = function (target, eventType, handler) {
                        target.removeEventListener(eventType, handler, false);
                    };
                } else if (typeof document.detachEvent === 'function') { // ie event
                    utils.unbind = function (target, eventType, handler) {
                        target.detachEvent('on' + eventType, handler);
                    };
                } else { // older browsers
                    utils.unbind = function (target, eventType) {
                        target['on' + eventType] = null;
                    };
                }

                // call the new function
                utils.unbind(target, eventType, handler);

            },


            /**
             * get xhr object
             *
             * @return {object} The new xhr request object or null
             */
            getXhr: function () {
                // set xhr var
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
                            var data = reqObject.responseText;
                            if (data) {
                                callback(data);
                            } else {
                                callback(false);
                            }
                        }

                    };

                    // open ajax request and listen for events
                    reqObject.open(reqType, url, true);

                    // listen to results, onload added for non-standard browers (camino)
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
             * get json object
             *
             * @return {object} The window.JSON object or null
             */
            jsonToString: function (object) {

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
             * get json object
             *
             * @return {object} The window.JSON object or null
             */
            jsonToObject: function (string) {

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
             * get url infos
             * 
             * @param {string} url The url to extract
             */
            url: function (url) {

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
             */
            callback: function (callback) {
                if (!callback || typeof callback !== 'function') {
                    callback = function () {};
                }
                return callback;
            },


            /**
             * check if value is array
             * 
             * @param {array} value The value to check
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

            hasClass: function(elem, className) {
                return new RegExp(' ' + className + ' ').test(' ' + elem.className + ' ');
            }


        };

    }());


    /**
     * global export
     */
    //app.helper = app.helper || {};
    app.helper.utils = utils;


}(window, document, window.app || {})); // immediatly invoke function
;
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
/*jslint browser: true, devel: true */
/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:true, curly:true, browser:true, indent:4, maxerr:50 */
/*global window*/
/*global document*/
/*global console*/
/*global XMLHttpRequest*/
/*global ActiveXObject*/

/**
 * app.utils
 *
 * @description
 * - provide utility functions
 * 
 * @version: 0.1.3
 * @author: Ulrich Merkel, 2013
 * 
 * @namespace: app
 * 
 * @changelog
 * - 0.1.3 elemId paramter added
 * - 0.1.2 refactoring
 * - 0.1.1 bug fixes css onload, js onload
 * - 0.1 basic functions and structur
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
     * utility functions
     *
     * following the singleton design pattern
     *
     */
    var append = (function () {

        // init global vars
        var helper = app.helper,
            utils = helper.utils,
            client = helper.client,
            privateAppendedCss = [],
            privateAppendedJs = [],
            privateAppendedImg = [],
            headNode = document.getElementsByTagName('head')[0];

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

                    // check for element id parameter
                    if (node && node.id !== undefined) {
                        link = document.getElementById(node.id);
                    }

                    // if there is data 
                    if (null !== data) {

                        // create style element and set attributes
                        if (!link) {
                            link = document.createElement('style');
                            link.setAttribute('type', 'text/css');
                        }
                        textNode = document.createTextNode(data);
                        link.appendChild(textNode);
                        callback();

                    // if there is no data but the url parameter
                    } else if (url !== null) {

                        // create link element and set attributes
                        if (!link) {
                            link = document.createElement('link');
                            link.rel = 'stylesheet';
                            link.type = 'text/css';
                        }

                        /**
                         * link doesn't support onload function
                         *
                         * only internet explorer and opera support the onload
                         * event handler
                         */
                        if (client.isMsie || client.isOpera) {
                            link.onload = callback;
                        } else {
                            callback();
                        }

                        link.href = url;

                    }

                    if (!node) {
                        headNode.appendChild(link);
                    }
                    privateAppendedCss.push(url);

                } else {
                    // css is already appended to dom
                    callback();
                }

            },


            /**
             * append javascipt to dom
             * 
             * @param {string} url The js url path
             * @param {string} data The js data string
             * @param {function} callback The success function
             * @param {object} node The optional dom node element information object to append the data to
             */
            appendJs: function (url, data, callback, node) {

                // check if script is already appended
                if (utils.inArray(url, privateAppendedJs) === -1) {

                    // dynamic script tag insertion
                    var script = null;

                    // check for element id parameter
                    if (!node) {
                        script = document.createElement('script');
                        script.type = 'text/javascript';
                    } else if (node && node.id !== undefined) {
                        script = document.getElementById(node.id);
                    }

                    if (!script) {
                        callback();
                    }

                    // if there is data 
                    if (null !== data) {

                        // set script content and append it to head dom
                        script.textContent = data;
                        if (!node) {
                            headNode.appendChild(script);
                        }
                        privateAppendedJs.push(url);
                        callback();

                    // if there is no data but the url parameter
                    } else if (url !== null) {

                        /**
                         * setup and unbind event handlers when
                         * called to avoid callback get's called twice
                         */

                        if (script.readyState) { // internet explorer
                            script.onreadystatechange = function () {
                                if (script.readyState === 'loaded' || script.readyState === 'complete') {
                                    script.onreadystatechange = null;
                                    callback();
                                }
                            };
                        } else { // other browsers
                            if (script.onload) {
                                script.onload = function () {
                                    script.onload = script.onerror = null;
                                    callback();
                                };  
                            }
                            if (script.onerror) {
                                script.onerror = function () {
                                    script.onload = script.onerror = null;
                                    callback();
                                };
                            }
                        }

                        // load script and append it to head dom
                        script.src = url;
                        if (!node) {
                            headNode.appendChild(script);
                        }
                        privateAppendedJs.push(url);

                    }

                } else {
                    // script is already appended to dom
                    callback();
                }
            },


            /**
             * append cascading stylesheet to dom
             * 
             * @param {string} url The css url path
             * @param {string} data The css data string
             * @param {function} callback The success function
             * @param {object} node The optional dom node element information object to append the data to
             */
            appendImg: function (url, data, callback, node) {

                var image = null;

                // check for element id parameter
                if (node && node.id !== undefined) {
                    image = document.getElementById(node.id);
                }

                if (!image) {
                    callback();
                    return;
                }

                image.onload = callback;

                // if there is data 
                if (null !== data) {
                    image.src = data;
                // if there is no data but the url parameter
                } else if (url !== null) {
                    image.src = url;
                }

                privateAppendedImg.push(url);

            }


        };

    }());


    /**
     * global export
     */
    app.helper.append = append;


}(document, window.app || {})); // immediatly invoke function
;
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
 * 
 * @version 0.1.3
 * @author Ulrich Merkel, 2013
 * 
 * @namespace app
 *
 * @changelog
 * - 0.1.3 bug fix when checking adapter support - additionally checking with adapter.open and not just isSupported
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
    var controllerType = 'storage controller',                  // controllerType {string} The controller type string
        helper = app.helper,                                    // helper {object} Shortcut for helper functions
        client = helper.client,                                 // client {object} Shortcut for client functions
        utils = helper.utils,                                   // utils {object} Shortcut for utils functions
        log = utils.log,                                        // log {function} Shortcut for utils.log function
        checkCallback = utils.callback,                         // checkCallback {function} Shortcut for utils.callback function
        json = utils.getJson(),                                 // json {function} Global window.Json object if available
        xhr = utils.xhr,                                        // xhr {function} Shortcut for utils.xhr function


        /**
         * adapters {array} Config array with objects for different storage types
         * 
         * this is the place to configure which types of adapters will be checked
         * and which resources are stored in which adapter type
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
            lifetime: 'local'                                   // lifetime {string} Default lifetime for webstorage
        },

        adapterAvailable = null,                                // adapterAvailable {string} The name of the best available adapter
        adapterAvailableConfig = {},                            // adapterAvailableConfig {object} The adapter config for the available type (see adapters)


        /**
         * resourceDefaults {object} The defaults for a single resource
         *
         */
        resourceDefaults = {
            expires: 100000000,                                 // resourceDefaults.expires {integer} Default expires time in milliseconds
            group: 0,                                           // resourceDefaults.group {integer} Default resource group
            lastmod: new Date().getTime(),                      // resourceDefaults.lastmod {integer} Default last modification timestamp
            type: 'css',                                        // resourceDefaults.type {string} Default resource type
            version: 1
        };


    /**
     * helper function convert json object to string
     *
     * @param {object} object The json object to convert
     *
     * @return {string} The converted json string
     */
    function convertObjectToString(object) {
        return utils.jsonToString(object);
    }


    /**
     * helper function convert json string to object
     *
     * @param {string} string The json string to convert
     *
     * @return {string} The converted json object
     */
    function convertStringToObject(string) {
        return utils.jsonToObject(string);
    }


    /**
     * convert image url to base64 string
     * 
     * @param {string} url The image url
     * @param {function} callback The callback function after success
     * @param {string} imageType The image type (jpeg, png)
     *
     * @returns {string} Returns converted data as callback parameter
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
            callback(false);
        }
    }


    /**
     * replace relative with absolute urls, used whithin resource string data (e.g css background urls)
     *
     * @param {string} data The data content string
     * @param {object} resource The resource object item
     *
     * @returns {string} Returns converted data
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
     * copy resource object for the use in storage,
     * remove url from resource data string to avoid duplicate data in storage
     * 
     * @param {object} resource The resource object item
     * 
     * @returns {object} Returns the copied resource
     */
    function copyStorageContent(resource) {

        // set new data for storage content
        return {
            data: resource.data,
            expires: resource.expires || resourceDefaults.expires,
            group: resource.group || resourceDefaults.group,
            lastmod: resource.lastmod || resourceDefaults.lastmod,
            type: resource.type || resourceDefaults.type,
            version: resource.version || resourceDefaults.version
        };
    }


    /**
     * check if resource is cachable due to adapter config
     *
     * @param {string} resourceType The resource type
     * 
     * @returns {boolean} Returns true or false depending on resource type
     */
    function isRessourceStorable(resourceType) {
        return adapterAvailableConfig[resourceType];
    }


    /**
     * get available storage adapter recursivly
     *
     * @param {array} storageAdapters The storage types
     * @param {function} callback The callback function 
     */
    function getAvailableStorageAdapter(storageAdapters, callback) {

        // init local vars
        var adapter = null;

        // end of recursive loop reached
        if (!storageAdapters.length) {
            callback(false);
            return;
        }

        // init storage and check support
        log('[' + controllerType + '] Testing for storage adapter: type ' + storageAdapters[0].type);
        adapter = new app.cache.storage.adapter[storageAdapters[0].type](adapterDefaults);

        if (adapter && adapter.isSupported()) {

            // storage api is avaibable, try to open storage
            adapter.open(function (success) {
                if (!!success) {

                    adapterAvailable = storageAdapters[0].type;
                    adapterAvailableConfig = storageAdapters[0];

                    log('[' + controllerType + '] Used storage type: ' + adapterAvailable);
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
        var adapter = null;

        // if storage type is set, try to initialize it
        if (storageType) {

            try {
                // init storage and check support
                log('[' + controllerType + '] Testing for storage adapter: type ' + storageType);
                adapter = new app.cache.storage.adapter[storageType](adapterDefaults);

                if (adapter && adapter.isSupported()) {
                    // storage api is avaibable, try to open storage
                    adapter.open(function (success) {
                        if (!!success) {
                            adapterAvailable = adapter.type;
                            adapterAvailableConfig = storageAdapters[0];

                            log('[' + controllerType + '] Used storage type: ' + adapterAvailable);
                            callback(adapter);
                        } else {
                            getStorageAdapter(callback);
                        }
                    });
                } else {
                    getStorageAdapter(callback);
                }
            } catch (e) {
                getStorageAdapter(callback);
            }

        } else {
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
         * this.isEnabled = true {boolean} Enable client side storage
         *
         * enable or disable client side cache or load resources just
         * via xhr if this option is set to false
         */
        this.isEnabled = true;
        if (parameters && parameters.isEnabled !== undefined) {
            this.isEnabled = !!parameters.isEnabled;
        }


        /**
         * this.adapter {object} The instance of the best available storage adapter
         */
        this.adapter = null;


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
                createCallback = function (data) {

                    // append data to resource object
                    resource.data = data;

                    if (null !== self.adapter && isRessourceStorable(resource.type)) {

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
                            self.adapter.create(key, content, function (success) {;
                                if (success) {
                                    log('[' + controllerType + '] Create new resource in storage adapter: type ' + resource.type + ', url ' + resource.url);
                                    callback(resource);
                                } else {
                                    log('[' + controllerType + '] Storage adapter could not create resource callback');
                                    callback(false);
                                }
                            });
                        } catch (e) {
                            // just give back the resource to get the data
                            callback(resource);
                        }

                    } else {
                        log('[' + controllerType + '] Resource type is not cachable or storage adapter is not available: type ' + resource.type + ', url ' + resource.url);
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
         * read resource from storage
         *
         * @param {object} resource The resource object
         * @param {function} callback The callback function
         */
        read: function (resource, callback) {

            // init local vars
            var url = resource.url;

            // check callback function
            callback = checkCallback(callback);

            // try to read from storage
            if (null !== this.adapter && isRessourceStorable(resource.type)) {

                log('[' + controllerType + '] Trying to read resource from storage: type ' + resource.type + ', url ' + resource.url);
                /**
                 * there is a bug in older browser versions (seamonkey)
                 * when trying to read from db (due to non-standard implementation),
                 * so we have to use try catch here
                 */
                try {
                    this.adapter.read(convertObjectToString(url), function (data) {
                        if (data) {
                            resource = convertStringToObject(data);
                            resource.url = url;
                            log('[' + controllerType + '] Successfully read resource from storage: type ' + resource.type + ', url ' + resource.url);
                            callback(resource);
                        } else {
                            log('[' + controllerType + '] There is no data coming back from storage: type ' + resource.type + ', url ' + resource.url);
                            callback(false);
                        }
                    });
                } catch (e) {
                    xhr(url, function (data) {
                        // append data to resource object
                        resource.data = data;
                        log('[' + controllerType + '] Try to read resource from storage, but storage adapter is not available: type ' + resource.type + ', url ' + resource.url);
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
                url = resource.url;

            // check callback function
            callback = checkCallback(callback);

            // make ajax request
            xhr(url, function (data) {

                // append data to resource object
                resource.data = data;

                if (null !== self.adapter && isRessourceStorable(resource.type)) {

                    // update storage content
                    var key = convertObjectToString(url),
                        content = convertObjectToString(copyStorageContent(resource));

                    // update storage entry
                    self.adapter.update(key, content, function (success) {
                        if (success) {
                            log('[' + controllerType + '] Update resource in storage: type ' + resource.type + ', url ' + resource.url);
                            callback(resource);
                        } else {
                            log('[' + controllerType + '] Update resource in storage failed, the adapter returned no data: type ' + resource.type + ', url ' + resource.url);
                            callback(false);
                        }
                    });

                } else {
                    log('[' + controllerType + '] Update resource in storage failed, resource type is not cachable or there is no storage adapter: type ' + resource.type + ', url ' + resource.url);
                    callback(resource);
                }

            });
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
                url = resource.url;

            // check callback function
            callback = checkCallback(callback);

            // try to remove resource from storage
            if (null !== self.adapter && isRessourceStorable(resource.type)) {
                self.adapter.remove(convertObjectToString(url), function (data) {
                    resource = convertStringToObject(data);
                    resource.url = url;
                    log('[' + controllerType + '] Delete resource form storage: type ' + resource.type + ', url ' + resource.url);
                    callback(resource);
                });
            } else {
                log('[' + controllerType + '] Delete resource from storage failed, resource type is not cachable or there is no storage adapter: type ' + resource.type + ', url ' + resource.url);
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

            if (this.isEnabled && json) {

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

                callback(self);
            }
        }

    };


    /**
     * make storage controller available under app namespace
     */
    app.cache.storage.controller = Storage;


}(document, window.app || {}));
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
 * @version 0.1.1
 * @author Ulrich Merkel, 2013
 *
 * @namespace app
 *
 * @changelog
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
        utils = app.helper.utils,                               // utils {object} Shortcut for utils functions
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
     * directly called after new Storage()
     * 
     * @param {object} parameters The instance parameters
     */
    function Storage(parameters) {

        // init local vars
        var self = this;

        self.adapter = null;
        self.type = storageType;
        self.size = 1024 * 1024;

        // run init function
        self.init(parameters);

    }


    /**
     * instance methods
     */
    Storage.prototype = {

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
                    callback(adapter);
                }, handleStorageEvents);

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

                        var blob = new Blob([content], {type: 'text/plain'});

                        // write data
                        fileWriter.write(blob);

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
    app.cache.storage.adapter[storageType] = Storage;


}(window, window.app || {})); // immediatly invoke function
;
/*jslint browser: true, devel: true */
/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:false, curly:true, browser:true, indent:4, maxerr:50, devel:true, wsh:false*/
/*global document */
/*global undefined */


/**
 * app.cache.indexedDatabase
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
        utils = app.helper.utils,                               // utils {object} Shortcut for utils functions
        log = utils.log,                                        // log {function} Shortcut for utils.log function
        boolIsSupported = null;                                 // boolIsSupported {boolean} Bool if this type of storage is supported or not


    /**
     * the actual instance constructor
     * directly called after new Storage()
     * 
     * @param {object} parameters The instance parameters
     */
    function Storage(parameters) {

        // init vars
        var self = this;

        // defaults
        self.adapter = null;
        self.type = storageType;
        self.dbName = 'merkel';
        self.dbVersion = '1.0';
        self.dbTable = 'offline';
        self.dbDescription = 'Local cache';
        self.dbKey = 'key';

        // run init function
        self.init(parameters);

    }

    /**
     * instance methods
     */
    Storage.prototype = {

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
                        setVersionRequest.onsuccess = function(e) {
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
                    request = windowObject.open(dbName, self.dbVersion);
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
    app.cache.storage.adapter[storageType] = Storage;


}(window, window.app || {})); // immediatly invoke function
;
/*global window */

/**
 * app.cache.webSqlDatabase
 *
 * @description
 * - provide a storage api for web sql database
 *
 * @version 0.1.2
 * @author Ulrich Merkel, 2013
 * 
 * @namespace app
 *
 * @changelog
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
        utils = app.helper.utils,                               // utils {object} Shortcut for utils functions
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
     * directly called after new Storage()
     * 
     * @param {object} parameters The instance parameters
     */
    function Adapter(parameters) {

        // init local vars
        var self = this;

        self.adapter = null;
        self.type = storageType;
        self.dbName = 'merkel';

        /**
         * Be careful with switch the database number
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
/*jslint unparam: false, browser: true, devel: true */
/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:false, curly:true, browser:true, indent:4, maxerr:50, devel:true, wsh:false */

/*global document */
/*global undefined */
/*gloabl QUOTA_EXCEEDED_ERR */


/**
 * app.cache.webStorage
 *
 * @description
 * - provide a storage api for web storage
 * 
 * @version 0.1.1
 * @author Ulrich Merkel, 2013
 * 
 * @namespace app
 *
 * @changelog
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
        utils = app.helper.utils,                               // utils {object} Shortcut for utils functions
        log = utils.log,                                        // log {function} Shortcut for utils.log function
        boolIsSupported = null;                                 // boolIsSupported {boolean} Bool if this type of storage is supported or not


    /**
     * handle web storage events
     *
     * @param {object} e The event object
     */
    function handleStorageEvents(e) {

        // handle Internet Explorer storage event
        if (!e) {
            e = window.event;
        }

        // init local vars
        var msg = '[' + storageType + ' Adapter] Event - key: ' + e.key + ', url: ' + e.url + ', oldValue: ' + e.oldValue + ', newValue: ' + e.newValue;

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
     * directly called after new Storage()
     * 
     * @param {object} parameters The instance parameters
     */
    function Adapter(parameters) {

        // init local vars
        var self = this;

        self.adapter = null;
        self.type = storageType;
        self.lifetime = 'local';     // session or local

        // run init function
        self.init(parameters);

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
                try {
                    boolIsSupported = !!window.localStorage.getItem && !!window.sessionStorage.getItem;
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

            try {
                // try to load data
                var data = this.adapter.getItem(key);

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
                adapter = self.adapter = window[type];
                utils.bind(window, 'storage', handleStorageEvents);
            }
            callback(adapter);

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
 * - 0.1.1 bug fix load resource (item.expires is set check added)
 * - 0.1 basic functions and plugin structur
 *
 * @see
 * - http://www.winktoolkit.org/ cache component
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
    var controllerType = 'cache controller',                    // controllerType {string} The controller type string
        helper = app.helper,                                    // helper {object} Shortcut for helper functions
        append = helper.append,                                 // append {function} Shortcut for append helper
        utils = helper.utils,                                   // utils {object} Shortcut for utils functions
        log = utils.log,                                        // log {function} Shortcut for utils.log function
        checkCallback = utils.callback,                         // checkCallback {function} Shortcut for utils.callback function
        bind = utils.bind,                                      // bind {function} Shortcut for bind helper
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
                        node = resource.node ? resource.node: null;

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
                            }
                        };

                    // check resource attributes for handling outdated data
                    resource.expires = resource.expires ? parseInt(resource.expires, 10) : 0;
                    resource.lastmod = resource.lastmod ? parseInt(resource.lastmod, 10) : now;
                    resource.version = resource.version ? parseFloat(resource.version) : 1.0;

                    // read resource via storage controller
                    self.storage.read(resource, function (item) {

                        /**
                         * if there is no item create it
                         *
                         * this is also the point where data get's loaded via
                         * xhr when the storage is disabled, the resource isn't then
                         * created - it just returns the data via xhr
                         */
                        if (!item || !item.data) {
                            log('[' + controllerType + '] Resource or resource data is not available in storage adapter: type ' + resource.type + ', url ' + resource.url);
                            self.storage.create(resource, callback);
                            return;
                        }

                        /**
                         * check for outdated data
                         *
                         * if item.expires is set to -1 the resource will always be loaded from cache
                         * also the item.lastmod and cached resource.lastmod (and item.version/resource.version) needs to be the same
                         * finally there is a check if the item is expired using the current timestamp
                         *
                         * if this comparison failed, the resource will be updated
                         */
                        if (parseInt(item.expires) !== -1 && item.lastmod === resource.lastmod && resource.version === item.version && (item.lastmod + item.expires) > now) {
                            log('[' + controllerType + '] Resource is up to date: type ' + resource.type + ', url ' + resource.url);
                            data = item.data;
                        } else {
                            log('[' + controllerType + '] Resource is outdated and needs update: type ' + resource.type + ', url ' + resource.url);
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

                    // init queue manager for this group
                    loadResourceGroupQueue.init(length, callback);

                    // toggle through group
                    for (i = 0; i < length; i = i + 1) {

                        // check resource
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

                        // if resource group isn't set, set it the zero
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
                 * @param {function} callback The callback function
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
            log('[' + controllerType + '] Load resource function called: resources count ' + resources.length);
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
            log('[' + controllerType + '] Cache initializing and checking for storage adapters');
            storage = new app.cache.storage.controller(function (storage) {
                self.storage = storage;
                callback();
            }, parameters);

        }
    };


    /**
     * make cache controller globally available under app namespace
     */
    app.cache.controller = controller;


    /**
     * load additional resources on window load
     *
     */
    bind(window, 'load', function () {
        utils.logTimerStart('Cache');

        var baseUrl = window.baseurl ? window.baseurl : utils.url(window.location.pathname).folder;

        controller.init(function () {

            /**
             * here we define the resources to be loaded and cached
             *
             * there are muliple async calls for resources via controller.load possible
             * the callback function is just used to hide the loading layer
             *
             */
            controller.load([
                { "url": baseUrl + "css/app.css", "type": "css", "group": "0", "version": "1.2123", "lastmod": "1371494419253"},
                { "url": baseUrl + "js/lib.js", "type": "js", "group": "0", "version": "1.5", "lastmod": "1371494419253"},
                { "url": baseUrl + "js/plugin.js", "type": "js", "group": "1", "version": "1.5", "lastmod": "1371494419253"}
            ], function () {
                utils.logTimerEnd('Cache');
                document.getElementById('layer-loading').style.display = 'none';
            });

            controller.load([
                { "url": baseUrl + "img/test/test-1.jpg", "type": "img", "group": "0", "version": "1.2123", "lastmod": "1371494419253", "node": {"id": "image-1"}},
                { "url": baseUrl + "img/test/test-2.jpg", "type": "img", "group": "0", "version": "1.2123", "lastmod": "1371494419253", "node": {"id": "image-2"}},
                { "url": baseUrl + "img/test/test-3.jpg", "type": "img", "group": "0", "version": "1.2123", "lastmod": "1371494419253", "node": {"id": "image-3"}}
            ]);
        });

    });

}(window, document, window.app || {}));











