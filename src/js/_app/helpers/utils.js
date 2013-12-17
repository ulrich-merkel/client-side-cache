/*jslint browser: true, devel: true, continue: true, regexp: true, plusplus: true, unparam: true  */
/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:true, curly:true, browser:true, indent:4, maxerr:50 */
/*global window, document, console, XMLHttpRequest, ActiveXObject*/

/**
 * ns.helpers.utils
 *
 * @description
 * - provide utility functions
 *
 * @author Ulrich Merkel, 2013
 * @version 0.2
 * 
 * @namespace ns
 * 
 * @changelog
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
 * - 0.1 basic functions and structur
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
    var utils = (function () {

        // init global vars
        var jsonObject = null,
            hasConsole = window.console !== undefined,
            console = hasConsole ? window.console : null,
            hasConsoleLog = (hasConsole && console.log !== undefined),
            hasConsoleWarn = (hasConsole && console.warn !== undefined),
            hasConsoleTime = (hasConsole && console.time !== undefined && console.timeEnd !== undefined),
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
             * @param {arguments} The messages to log
             */
            log: function () {

                var args = arguments,
                    length = args.length,
                    message;

                if (!length) {
                    return;
                }

                // check for support
                if (hasConsoleLog) {
                    console.log.apply(console, args);
                }

                // log messages to dom element
                message = args[0];
                utils.logToScreen(message);

            },


            /**
             * wrapper for console.warn due to some browsers lack of this functions
             * 
             * @param {arguments} The warnings to log
             */
            warn: function () {

                var args = arguments,
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
                    utils.log(message);
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
                if (hasConsoleTime) {
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
                if (hasConsoleTime) {
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
             * overridden with the correct implemation the first time it will be
             * called. after that all consequent calls deliver the correct one without
             * conditions for different browsers.
             * 
             * @param {string} target The dom object
             * @param {string} eventType The event type to bind
             * @param {function} handler The function to bind
             */
            on: function (target, eventType, handler) {

                /**
                 * override existing function based on
                 * browser capabilities
                 */

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
             * overridden with the correct implemation the first time it will be
             * called. after that all consequent calls deliver the correct one without
             * conditions for different browsers.
             * 
             * @param {string} target The dom object
             * @param {string} eventType The event type to unbind
             * @param {function} handler The function to unbind
             */
            off: function (target, eventType, handler) {

                /**
                 * override existing function based on
                 * browser capabilities
                 */

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

                        } else if (reqObject.readyState === 4) {

                            /**
                             * request is completed but maybe
                             * called with non-existing url
                             */
                            callback(false);
                        }

                    };

                    // open ajax request and listen for events
                    reqObject.open(reqType, url, async);

                    /**
                     * listen to results, onreadystatechange for ie7+ and onload for others
                     * try catch is added for ie6 (object error for onreadystatechange)
                     */
                    try {
                        if (reqObject.onreadystatechange !== undefined) {
                            reqObject.onreadystatechange = reqCallback;
                        } else if (reqObject.onload !== undefined) {
                            reqObject.onload = reqCallback;
                        }
                    } catch (e) {
                        // delete handler if already bound
                        reqObject.onload = null;
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

                //return the json string
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
                    getFolder = function () {
                        var index = url.lastIndexOf('/'),
                            result = url.substr(0, index + 1);
                        return result;
                    },
                    pathname;

                // set props
                a.href = url;
                pathname = a.pathname.match(/\/([^\/?#]+)$/i);

                // return url information
                return {
                    source: url,
                    protocol: a.protocol,
                    host: a.hostname,
                    port: a.port,
                    query: a.search,
                    file: pathname ? pathname[1] : '/',
                    hash: a.hash,
                    path: a.pathname.replace(/^([^\/])/, '/$1'),
                    folder: getFolder()
                };
            },


            /**
             * get url query string
             *
             * @return {object} Current url query strings
             */
            queryString: (function () {

                var query_string = {},
                    query = window.location.search.substring(1),
                    vars = query.split("&"),
                    varsLength = vars.length,
                    i = 0,
                    pair,
                    arr;

                for (i = 0; i < varsLength; i = i + 1) {

                    // get value pairs
                    pair = vars[i].split("=");

                    // if first entry with this name
                    if (query_string[pair[0]] === undefined) {
                        query_string[pair[0]] = pair[1];
                    // if second entry with this name
                    } else if (typeof query_string[pair[0]] === "string") {
                        arr = [query_string[pair[0]], pair[1]];
                        query_string[pair[0]] = arr;
                    // if third or later entry with this name
                    } else {
                        query_string[pair[0]].push(pair[1]);
                    }

                }

                return query_string;

            }()),


            /**
             * text replacement for simple client-side templates
             *
             * @example
             * <li><a href="%s">%s</a></li>
             * var result = sprintf(templateText, "/item/4", "Fourth item");
             *
             * @param {string} text The template string
             *
             * @return {string} The string with replaced placeholders
             */
            sprintf: function (text) {
                var i = 1,
                    args = arguments;

                return text.replace(/%s/g, function () {
                    return (i < args.length) ? args[i++] : "";
                });

            },


            /**
             * trim string, delete whitespace in front/back
             *
             * @param {string} string The string to trim
             *
             * @return {string} The trimmed string value
             */
            trim: function (string) {

                /**
                 * check fo native string trim function, otherwise
                 * initialize it
                 */
                if (typeof String.prototype.trim !== 'function') {
                    String.prototype.trim = function () {
                        return this.replace(/^\s+|\s+$/g, '');
                    };
                }

                // return trimmed string
                return string.trim();

            },


            /**
             * check if value is array
             *
             * following the lazy loading design pattern, the isArray function will be
             * overridden with the correct browser implemation the first time it will be
             * called. after that all consequent calls deliver the correct one without
             * conditions for different browsers.
             *
             * @see nicolas c. zakas - maintainable javascript, writing readable code (o'reilly s.88)
             * 
             * @param {array} value The value to check
             *
             * @return {boolean} Whether the given value is an array or not
             */
            isArray: function (value) {

                /**
                 * override existing function based on
                 * browser capabilities
                 */

                if (!!Array.isArray && typeof Array.isArray === "function") {
                    // ECMA Script 5
                    utils.isArray = function (value) {
                        return Array.isArray(value);
                    };
                } else if (!!Object.prototype.toString && Object.prototype.toString === "function") {
                    // Juriy Zaytsev (aka Kangax)
                    utils.isArray = function (value) {
                        return Object.prototype.toString.call(value) === "[object Array]";
                    };
                } else {
                    // Duck typing arrays (by Douglas Crockford), asume sort function is only available for arrays
                    utils.isArray = function (value) {
                        return (!!value.sort && typeof value.sort === "function");
                    };
                }

                // call the new function
                return utils.isArray(value);

            },


            /**
             * check if value is in array
             *
             * following the lazy loading design pattern, the inArray function will be
             * overridden with the correct browser implemation the first time it will be
             * called. after that all consequent calls deliver the correct one without
             * conditions for different browsers.
             * 
             * @param {string} elem The value to check
             * @param {array} array The array to check
             * @param {number|undefined} index The optional index in array
             *
             * @returns {integer} Whether the value is in (return index) or not (return -1)
             */
            inArray: function (value, array, index) {

                /**
                 * override existing function based on
                 * browser capabilities
                 */

                if (!!Array.prototype.indexOf) {
                    // ECMA Script 5
                    utils.inArray = function (value, array, index) {
                        return emptyArray.indexOf.call(array, value, index);
                    };
                } else {
                    // fallback for old browsers
                    utils.inArray = function (value, array, index) {

                        var arrayLength = array.length,
                            j = 0;

                        // check for index value if set
                        if (!!index) {
                            if (!!array[index] && array[index] === value) {
                                return index;
                            }
                            return -1;
                        }

                        // toggle through array
                        for (j = 0; j < arrayLength; j = j + 1) {
                            if (array[j] === value) {
                                return j;
                            }
                        }

                        // value not found
                        return -1;
                    };
                }

                // call the new function
                return utils.inArray(value, array, index);

            }

        };

    }());


    /**
     * global export
     *
     * @export
     */
    ns.namespace('helpers.utils', utils);


}(window, document, window.getNamespace())); // immediatly invoke function
