/*jslint browser: true, devel: true, continue: true, regexp: true  */
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
 * @version 0.1.5
 * 
 * @namespace app
 * 
 * @changelog
 * - 0.1.5 moved dom functions to dom helpers, small function improvements
 * - 0.1.4 refactoring xhr function
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

        /**
         * public functions
         *
         * @interface
         */
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
             * add event handler
             *
             * following the lazy loading design pattern, the on function will be
             * overridden with the correct implemation the first the it will be
             * called. after that all consequent calls deliver the correct one without
             * conditions for different browsers.
             * 
             * @param {string} target The dom object
             * @param {string} eventType The event type to bind
             * @param {function} handler The function to bind
             */
            on: function (target, eventType, handler) {

                // override existing function
                if (typeof window.addEventListener === 'function') {
                    // dom2 event
                    utils.on = function (target, eventType, handler) {
                        target.addEventListener(eventType, handler, false);
                    };
                } else if (typeof document.attachEvent === 'function') {
                    // ie event
                    utils.on = function (target, eventType, handler) {
                        target.attachEvent('on' + eventType, handler);
                    };
                } else {
                    // older browers
                    utils.on = function (target, eventType, handler) {
                        target['on' + eventType] = handler;
                    };
                }

                // call the new function
                utils.on(target, eventType, handler);
            },


            /**
             * remove event handler
             *
             * following the lazy loading design pattern, the off function will be
             * overridden with the correct implemation the first the it will be
             * called. after that all consequent calls deliver the correct one without
             * conditions for different browsers.
             * 
             * @param {string} target The dom object
             * @param {string} eventType The event type to unbind
             * @param {function} handler The function to unbind
             */
            off: function (target, eventType, handler) {

                // override existing function
                if (typeof window.removeEventListener === 'function') {
                    // dom2 event
                    utils.off = function (target, eventType, handler) {
                        target.removeEventListener(eventType, handler, false);
                    };
                } else if (typeof document.detachEvent === 'function') {
                    // ie event
                    utils.off = function (target, eventType, handler) {
                        target.detachEvent('on' + eventType, handler);
                    };
                } else {
                    // older browsers
                    utils.off = function (target, eventType) {
                        target['on' + eventType] = null;
                    };
                }

                // call the new function
                utils.off(target, eventType, handler);

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
             * @param {string} url The required url to load
             * @param {function} callback The required callback after success
             * @param {boolean} async The optional async parameter to load xhr async or sync 
             * @param {string} postData The optional post request data to send
             */
            xhr: function (url, callback, async, postData) {

                /**
                 * setTimeout() "yielding" prevents some weird race/crash conditions in older browsers
                 *
                 * @see
                 * - lab.js async script loader
                 */
                window.setTimeout(function () {

                    // init local function vars
                    var reqObject = utils.getXhr(),
                        reqCallback,
                        reqType = 'GET';

                    // check callback parameter
                    callback = utils.callback(callback);

                    // if ajax is available
                    if (reqObject) {

                        // check parameters (url, request type, async and post data)
                        if (!url) {
                            callback(false);
                            return;
                        }
                        if (postData !== undefined) {
                            reqType = 'POST';
                        } else {
                            postData = null;
                        }
                        if (async === undefined) {
                            async = true;
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
                        reqObject.open(reqType, url, async);

                        // listen to results, onreadystatechange for ie7+ and onload for others
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

                }, 0);
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
             * check if value is array
             * 
             * @param {array} value The value to check
             *
             * @return {boolean} Whether the given value is an array or not
             */
            isArray: function (value) {
                return value instanceof Array;
            },


            /**
             * check if value is in array
             * 
             * @param {string} elem The value to check
             * @param {array} array The array to check
             * @param {number|undefined} i The index in array
             *
             * @returns {integer} Whether the value is in (return index) or not (return -1)
             */
            inArray: function (elem, array, i) {
                if (Array.prototype.indexOf) {
                    return emptyArray.indexOf.call(array, elem, i);
                }

                // fallback for older browsers, always return not in array
                return -1;
            }

        };

    }());


    /**
     * global export
     *
     * @export
     */
    app.namespace('helpers.utils', utils);


}(window, document, window.app || {})); // immediatly invoke function
