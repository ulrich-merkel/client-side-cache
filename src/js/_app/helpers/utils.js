/*jslint browser: true, devel: true, continue: true, regexp: true, plusplus: true, unparam: true  */
/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:true, curly:true, browser:true, indent:4, maxerr:50 */
/*global window, document, XMLHttpRequest, ActiveXObject*/

/**
 * ns.helpers.utils
 *
 * @description
 * - provide utility functions
 *
 * @author Ulrich Merkel, 2014
 * @version 0.2.4
 * 
 * @namespace ns
 * 
 * @changelog
 * - 0.2.4 bug fix legacy browsers isArray, bug fix console.log ie9
 * - 0.2.3 bug fix xhr ie6
 * - 0.2.2 removed unused functions for client-side-cache optimization, complete utils helper moved to separate git
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
 * - 0.1 basic functions and structur
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
 *      // add event handler
 *      app.helpers.utils.on(window, 'scroll', function () {
 *          // do something while window scrolling
 *      });
 *
 *      // make ajax request
 *      app.helpers.utils.xhr('ajax.html', function (data) {
 *          if (data) {
 *              // ajax data is ready to use
 *          }
 *      });
 *
 *      // check for array type
 *      var isArray = app.helpers.utils.isArray(array);
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
    var utils = (function () {

        // init global vars
        var jsonObject = null,                  // @type {object} The current json object
            emptyArray = [];                    // @type {array} Placeholder for array testing


        /**
         * public functions
         *
         * @interface
         */
        return {

            /**
             * check if value is string
             *
             * @param {string} value The value to check
             *
             * @return {boolean} Whether the given value is a string or not
             */
            isString: function (string) {
                return typeof string === 'string' || string instanceof String;
            },


            /**
             * check if value is function
             *
             * @param {function} fn The value to check
             *
             * @return {boolean} Whether the given value is a function or not
             */
            isFunction: function (fn) {
                return typeof fn === 'function' || fn instanceof Function;
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

                // local vars for better compression and faster access
                var arrayIsArray = Array.isArray,
                    objectProtoypeToString = Object.prototype.toString;

                /**
                 * override existing function based on
                 * browser capabilities
                 */

                if (!!arrayIsArray && typeof arrayIsArray === 'function') {
                    // ECMA Script 5
                    utils.isArray = function (value) {
                        return arrayIsArray(value);
                    };
                } else if (!!objectProtoypeToString && objectProtoypeToString === 'function') {
                    // Juriy Zaytsev (aka Kangax)
                    utils.isArray = function (value) {
                        return objectProtoypeToString.call(value) === '[object Array]';
                    };
                } else {
                    // Duck-Typing arrays (by Douglas Crockford), asume sort function is only available for arrays
                    // Duck-Typing: "If it looks like a duck, walks like a duck, and smells like a duck - it must be an Array"
                    utils.isArray = function (value) {
                        return (!!value && !!value.sort && typeof value.sort === 'function');
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
                if (!utils.isFunction(callback)) {
                    callback = function () {
                        return undefined;
                    };
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
             * @see
             * - http://coding.smashingmagazine.com/2013/11/12/an-introduction-to-dom-events/
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
             * @see
             * - http://coding.smashingmagazine.com/2013/11/12/an-introduction-to-dom-events/
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
                            return new ActiveXObject('Msxml2.XMLHTTP');
                        },
                        function () {
                            return new ActiveXObject('Msxml3.XMLHTTP');
                        },
                        // internet explorer (since version 6)
                        function () {
                            return new ActiveXObject('Microsoft.XMLHTTP');
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
                    } catch (ignore) {
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
                if (jsonObject && object !== undefined) {
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
                if (jsonObject && string !== undefined) {
                    result = jsonObject.parse(string);
                }

                //return the json object
                return result;
            },


            /* start-dev-block */

            /**
             * function to write logging message to screen
             *
             * @param {string} message The message to log
             */
            logToScreen: function (message) {

                // init local vars
                var log = document.getElementById('log'),
                    p = document.createElement('p'),
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
                    message,
                    hasConsole = window.console !== undefined,
                    console = hasConsole ? window.console : null,
                    hasConsoleLog = (hasConsole && console.log !== undefined);

                if (!length) {
                    return;
                }

                // check for support
                if (hasConsoleLog) {
                    // fix for ie9
                    if (console.log.apply) {
                        console.log.apply(console, args);
                    } else {
                        console.log(args);
                    }
                }

                // log messages to dom element
                message = args[0];
                utils.logToScreen(message);

            },

            /* end-dev-block */


            /**
             * get url information
             * 
             * @param {string} url The url to extract
             *
             * @return {object} Current url information
             */
            url: function (url) {

                // check params
                if (!utils.isString(url)) {
                    return;
                }

                // create test link elmenent
                var a = document.createElement('a'),
                    getFolder = function () {
                        var index = url.lastIndexOf('/'),
                            result = url.substr(0, index + 1);
                        return result;
                    },
                    getExtension = function (urlString) {
                        var extension = urlString.split('.');

                        return extension.length ? extension[extension.length - 1] : false;
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
                    extension: getExtension(url),
                    folder: getFolder()
                };
            },


            /**
             * trim string, delete whitespace in front/back
             *
             * @param {string} string The string to trim
             *
             * @return {string} The trimmed string value
             */
            trim: function (string) {

                if (!utils.isString(string)) {
                    return string;
                }

                /**
                 * check fo native string trim function, otherwise
                 * initialize it
                 */
                if (!utils.isFunction(String.prototype.trim)) {
                    String.prototype.trim = function () {
                        return this.replace(/^\s+|\s+$/g, '');
                    };
                }

                // return trimmed string
                return string.trim();

            }


        };

    }());


    /**
     * make the helper available for ns.helpers.utils calls under
     * the ns.helpers namespace
     * 
     * @export
     */
    ns.ns('helpers.utils', utils);


}(window, document, window.getNs())); // immediatly invoke function
