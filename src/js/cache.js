/*global window*/

/**
 * app.helpers.namespace
 * 
 * @description
 * - init app namespaces and provide helper function
 * 
 * @author Ulrich Merkel, 2013
 * @version 0.1.2
 *
 * @namespace app
 * 
 * @changelog
 * - 0.1.2 createNamespace and getNamespace added
 * - 0.1.1 refactoring
 * - 0.1 basic functions and plugin structur
 * 
 */
(function (window, undefined) {

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

    // init module vars
    var namespaceName = 'app',                                  // @type {string} The name of the global javascript namespace (directly accessable via window)
        ns;                                                     // @type {object} The current global window namespace object


    /**
     * create global window namespace as object
     *
     */
    function createNamespace() {
        window[namespaceName] = {};
    }


    /**
     * get global window namespace
     *
     */
    function getNamespace() {
        if (!window[namespaceName]) {
            createNamespace();
        }
        return window[namespaceName];
    }


    /**
     * helper function to defining package structur
     *
     * within the global app object the given namespaces will
     * be created as javascript objects
     *
     * @see
     * - nicolas c. zakas - maintainable javascript, writing readable code (o'reilly s.72)
     * - http://de.slideshare.net/s.barysiuk/javascript-and-ui-architecture-best-practices-presentation
     *
     * @example
     * // Creates both YourGlobal.Items and YourGlobal.Items.MaintainableCode. Neither exists before hand, so each is created from scratch.
     * YourGlobal.namespace("Items.MaintainableCode");
     * // Leaves YourGlobal.Items alone and adds HighPerformance to it. This leaves YourGlobal.Items.MaintainableCode intact.
     * YourGlobal.namespace("Items.HighPerformance");
     * // You can also start adding new properties right off the method call
     * YourGlobal.namespace("Items.ANewItem", {});
     * YourGlobal.namespace("Items").ANewItem = {};
     *
     * @param {string} name The namespace string separated with dots (name.name.name)
     * @param {string|integer|object|function} value The optional value to set for the last item in given namespace
     *
     * @return {object|boolean} The last referenced namespace object or false if there is no correct name param
     */
    function namespace(name, value) {

        if (name) {

            // convert name param to string
            name = String(name);

            // init loop vars
            var names = name.split('.'),
                length = names.length,
                current = window[namespaceName],
                i;

            if (!current) {
                createNamespace();
            }

            // check for names array
            if (!names) {
                return false;
            }

            // toggle through names array
            for (i = 0; i < length; i = i + 1) {

                // if this namespace doesn't exist, create it
                if (!current[names[i]]) {

                    // set empty object
                    current[names[i]] = {};

                    // set value if set and last namespace item reached
                    if (i === length - 1 && !!value) {
                        current[names[i]] = value;
                    }

                }

                // set current to this checked namespace for the next loop
                current = current[names[i]];

            }

            // return last namespace item
            return current;

        }

        return false;

    }


    // create basic object and init namespace function
    ns = getNamespace();
    ns.namespace = namespace;


    /**
     * export app to globals
     *
     * @export
     */
    window[namespaceName] = ns;
    window.getNamespace = window.getNs = getNamespace;

}(window));

/*global window*/

/**
 * ns.helpers.error
 * 
 * @description
 * - catch javascript errors and log according message
 * 
 * @author Ulrich Merkel, 2013
 * @version 0.1.1
 *
 * @namespace ns
 * 
 * @changelog
 * - 0.1.1 switched to console.warn (if available)
 * - 0.1 basic functions and plugin structur
 * 
 */
(function (window, ns, undefined) {

    'use strict';

    /**
     * undefined is used here as the undefined global
     * variable in ECMAScript 3 and is mutable (i.e. it can
     * be changed by someone else). undefined isn't really
     * being passed in so we can ensure that its value is
     * truly undefined. In ES5, undefined can no longer be
     * modified.
     * 
     * window and ns are passed through as local variables
     * rather than as globals, because this (slightly)
     * quickens the resolution process and can be more
     * efficiently minified (especially when both are
     * regularly referenced in this module).
     */


    /**
     * handle javascript errors
     *
     * this function will just cache undefined vars and functions,
     * syntax errors and other stuff can't be catched
     *
     * @export
     * @param {string} msg The error message
     * @param {string} url The url where the error occurs
     * @param {string} line The script code line where the error occurs
     */
    window.onerror = function (msg, url, line) {
    
        // log error message
        //ns.helpers.utils.warn(msg + "\nurl: " + url + "\nline: " + line);
        //
        //// return true keeps the browser running instead of stopping execution
        //return true;

    };

}(window, window.getNamespace()));

/*global window*/

/**
 * ns.helpers.queue
 * 
 * @description
 * - handle async interfaces
 * 
 * @author Ulrich Merkel, 2013
 * @version 0.1.1
 *
 * @namespace ns
 *
 * @see
 * - http://www.dustindiaz.com/async-method-queues/
 
 * @changelog
 * - 0.1.1 improved namespacing
 * - 0.1 basic functions and plugin structur
 * 
 */
(function (ns, undefined) {

    'use strict';

    /**
     * undefined is used here as the undefined global
     * variable in ECMAScript 3 and is mutable (i.e. it can
     * be changed by someone else). undefined isn't really
     * being passed in so we can ensure that its value is
     * truly undefined. In ES5, undefined can no longer be
     * modified.
     * 
     * ns is passed through as local
     * variables rather than as globals, because this (slightly)
     * quickens the resolution process and can be more
     * efficiently minified (especially when both are
     * regularly referenced in this module).
     */


    /**
     * queue constructor
     *
     * @constructor
     */
    function Queue() {

        /**
         * @type {array} [this.methods=[]] Store your callbacks
         */
        this.methods = [];

        /**
         * @type {object} [this.response=null] Keep a reference to your response
         */
        this.response = null;

        /**
         * @type {boolean} [this.flushed=false] All queues start off unflushed
         */
        this.flushed = false;

    }

    /**
     * queue methods
     *
     * @interface
     */
    Queue.prototype = Queue.fn = {

        /**
         * add queue function
         *
         * @param {function} fn
         */
        add: function (fn) {

            // if the queue had been flushed, return immediately
            if (this.flushed) {
                fn(this.response);

            // otherwise push it on the queue
            } else {
                this.methods.push(fn);
            }

        },


        /**
         * call all queued functions
         *
         * @param {} response
         */
        flush: function (response) {

            // note: flush only ever happens once
            if (this.flushed) {
                return;
            }

            // store your response for subsequent calls after flush()
            this.response = response;

            // mark that it's been flushed
            this.flushed = true;

            // shift 'em out and call 'em back
            while (this.methods[0]) {
                this.methods.shift()(response);
            }

        }

    };


    /**
     * make helper available via ns.helpers.queue namespace
     *
     * @export
     */
    ns.namespace('helpers.queue', Queue);


}(window.getNamespace()));  // immediatly invoke function

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
             * @param {string} url The optional url to get the query string from
             *  
             * @return {object} Current url query strings
             */
            queryString: (function (url) {

                var query_string = {},
                    //query = this.isString(url) ? this.url(url).query : window.location.search.substring(1),
                    query = window.location.search.substring(1),
                    vars = query.split('&'),
                    varsLength = vars.length,
                    i = 0,
                    pair,
                    pair0,
                    pair1,
                    arr;

                for (i = 0; i < varsLength; i = i + 1) {

                    // get value pairs
                    pair = vars[i].split('=');

                    if (query_string[pair[0]] === undefined) {
                        // if first entry with this name
                        query_string[pair[0]] = pair[1];
                    } else if (typeof query_string[pair[0]] === 'string') {
                        // if second entry with this name
                        arr = [query_string[pair[0]], pair[1]];
                        query_string[pair[0]] = arr;
                    } else {
                        // if third or later entry with this name
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

                if (!utils.isString(string)) {
                    return string;
                }

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
             *
             *
             */
            isString: function (string) {
                return typeof string == 'string' || string instanceof String;
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
                        return (!!value.sort && typeof value.sort === 'function');
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
			// @ see http://remysharp.com/2010/08/05/doing-it-right-skipping-the-iphone-url-bar/
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
/*jslint browser: true, devel: true, continue: true, regexp: true, nomen: true  */
/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:true, curly:true, browser:true, indent:4, maxerr:50 */
/*global window, document*/

/**
 * ns.helpers.dom
 *
 * @description
 * - provide utility functions for dom elements
 *
 * @author Ulrich Merkel, 2013
 * @version 0.1.5
 * 
 * @namespace ns
 * 
 * @changelog
 * - 0.1.5 setAttribute added, improved namespacing
 * - 0.1.4 refactoring xhr function
 * - 0.1.3 createDomNode added
 * - 0.1.2 refactoring
 * - 0.1.1 bug fix xhr when trying to read binary data on ie
 * - 0.1 basic functions and structur
 *
 * @bugs:
 * - append dynamic updated data when resource is already appended
 * - set media all for css, adjust createDomNode function for arguments
 *
 */
(function (document, ns, undefined) {

    'use strict';

    /**
     * undefined is used here as the undefined global
     * variable in ECMAScript 3 and is mutable (i.e. it can
     * be changed by someone else). undefined isn't really
     * being passed in so we can ensure that its value is
     * truly undefined. In ES5, undefined can no longer be
     * modified.
     *
     * document and ns are passed through as local
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
    var dom = (function () {

        // init global vars
        var helpers = ns.helpers,                                   // @type {object} Shortcut for helper functions
            utils = helpers.utils,                                  // @type {object} Shortcut for utils functions
            client = helpers.client,                                // @type {object} Shortcut for client functions
            privateAppendedCss = [],                                // @type {array} Storage for appended css files
            privateAppendedJs = [],                                 // @type {array} Storage for appended js files
            privateAppendedImg = [],                                // @type {array} Storage for appended img files
            privateAppendedHtml = [],                               // @type {array} Storage for appended html files
            headNode = document.getElementsByTagName('head')[0],    // @type {object} The html dom head object
            classLoaded = 'lazyloaded';                             // @type {string} The css class for appended elements

        /**
         * public functions
         *
         * @interface
         */
        return {

            /**
             * access to some private vars for testing
             *
             */
            _destroy: function () {
                privateAppendedCss = [];
                privateAppendedJs = [];
                privateAppendedImg = [];
                privateAppendedHtml = [];
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
             * check if element has given class
             * 
             * @param {object} elem The html object to test
             * @param {string} className The class name to test
             *
             * @returns {boolean} Whether the element has the class (return true) or not (return false)
             */
            hasClass: function (elem, className) {
                return new RegExp(' ' + className + ' ').test(' ' + elem.className + ' ');
            },


            /**
             * get attribute from element
             * 
             * @param {object} elem The html object
             * @param {string} attribute The attribute name
             *
             * @returns {string}
             */
            getAttribute: function (elem, attribute) {
                return elem.getAttribute(attribute);
            },


            /**
             * set attribute from element
             * 
             * @param {object} elem The html object
             * @param {string} attribute The attribute name
             * @param {string} value The attribute value
             *
             */
            setAttribute: function (elem, attribute, value) {
                elem.setAttribute(attribute, value);
            },


            /**
             * append cascading stylesheet to dom
             * 
             * @param {string} url The css url path
             * @param {string} data The css data string
             * @param {function} callback The success function
             * @param {object} node The optional dom node element information object to append the data to
             * @param {boolean} update Indicates if the resource data needs to be updated (if already appended)
             */
            appendCss: function (url, data, callback, node, update) {

                // check if css is already appended
                if (utils.inArray(url, privateAppendedCss) === -1 || !!update) {

                    // init local vars
                    var link = null,
                        textNode;

                    // check for node parameter
                    link = checkNodeParameters(link, node);

                    // if there is data 
                    if (null !== data) {

                        // create style element and set attributes
                        if (!link) {
                            link = dom.createDomNode('style', {'type': 'text/css'});
                            link.className = classLoaded;
                        }

                        // handle errors
                        link.onerror = function () {
                            callback(false);
                        };

                        /**
                         * hack: ie lt9 doesn't allow the appendChild() method on a
                         * link element, so we have to check this with try catch here
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
                            link = dom.createDomNode('link', {'rel': 'stylesheet', 'type': 'text/css'});
                            link.className = classLoaded;
                        }

                        // handle errors
                        link.onerror = function () {
                            callback(false);
                        };

                        if (!node) {
                            headNode.appendChild(link);
                        }

                        /**
                         * link element doesn't support onload function
                         *
                         * only internet explorer and opera support the onload
                         * event handler for link elements
                         */

                        if (client.isMsie() || client.isOpera()) {
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
             * @param {boolean} update Indicates if the resource data needs to be updated (if already appended)
             */
            appendJs: function (url, data, callback, node, update) {

                // check if script is already appended
                if (utils.inArray(url, privateAppendedJs) === -1 || !!update) {

                    // init dom and local vars
                    var script = dom.createDomNode('script'),
                        firstScript = document.getElementsByTagName('script')[0],
                        loaded = false;

                    // check for dom node parameter
                    script = checkNodeParameters(script, node);

                    /**
                     * check for valid script element
                     * 
                     * can occur when node with non-existing
                     * id is passed
                     */
                    if (!script) {
                        callback();
                        return;
                    }

                    // set sript attributes
                    script.type = 'text/javascript';
                    script.className = classLoaded;

                    /**
                     * scripts that are dynamically created and added to the document are async by default,
                     * they don’t block rendering and execute as soon as they download.
                     * 
                     * we set this value here just to be sure it's async, but it's normally not neccesary
                     */
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
                    script.onerror = function () {

                        // avoid memory leaks in ie
                        this.onload = this.onreadystatechange = this.onerror = null;
                        callback();

                    };

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

                    // check state if file is already loaded
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
             * @param {string} url The image url path
             * @param {string} data The image data string (base64 encoded)
             * @param {function} callback The success function
             * @param {object} node The optional dom node element information object to append the data to
             *
             * @todo: check loaded, see imagesLoaded Remy Sharp
             */
            appendImg: function (url, data, callback, node) {

                // init local vars
                var image = null;

                // check for node parameter
                image = checkNodeParameters(image, node);

                // create empty image placeholder if there is no node param
                if (!image) {
                    image = new Image();
                }

                // catch errors
                image.onerror = function () {

                    // avoid memory leaks
                    image.onload = image.onerror = null;
                    callback();

                };

                // add loaded event listener
                image.onload = function () {

                    // avoid memory leaks
                    image.onload = image.onerror = null;
                    callback();

                };

                // set image source
                if (data) {
                    // if there is data 
                    image.src = data;
                } else if (url) {
                    // if there is no data but the url parameter
                    image.src = url;
                }

                /**
                 * check if image is cached, trigger load manually
                 *
                 * @see http://github.com/desandro/imagesloaded
                 */
                if (!!image.complete && image.naturalWidth !== undefined) {
                    image.onload();
                }

                privateAppendedImg.push(url);

            },


            /**
             * append html files to dom
             * 
             * @param {string} url The html url path
             * @param {string} data The html data string
             * @param {function} callback The success function
             * @param {object} node The optional dom node element information object to append the data to
             */
            appendHtml: function (url, data, callback, node) {

                // check for node parameter
                var html = checkNodeParameters(null, node);

                // no dom node to append found
                if (!html) {
                    callback();
                    return;
                }

                // if there is data 
                if (data) {

                    /**
                     * innerHTML is not possible for table elements (table, thead, tbody, tfoot and tr) in internet explorer
                     *
                     * in IE8, html.innerHTML will do nothing or throw errors if the HTML coming in isn't perfectly formatted (against the DTD
                     * being used) - it doesn't tolerate any mistakes unlike when it's parsing HTML normally.
                     *
                     * @see
                     * - http://blog.rakeshpai.me/2007/02/ies-unknown-runtime-error-when-using.html
                     * - http://msdn.microsoft.com/en-us/library/ms533897%28VS.85%29.aspx
                     * - http://domscripting.com/blog/display.php/99
                     */
                    try {
                        html.innerHTML = data;
                        if (node.id && client.isMsie()) {
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
     *
     * @export
     */
    ns.namespace('helpers.dom', dom);


}(document, window.getNamespace())); // immediatly invoke function

/*jslint unparam: false, browser: true, devel: true */
/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:false, curly:true, browser:true, indent:4, maxerr:50, devel:true, wsh:false */
/*global undefined, FileError, FileReader, Blob */


/**
 * ns.cache.storage.adapter.fileSystem
 *
 * @description
 * - provide a storage api for file system
 * - support:
 *      - Google Crome 26.0 +
 *      - Maxthon 4.0.5 +
 *
 * @version 0.1.4
 * @author Ulrich Merkel, 2013
 *
 * @namespace ns
 *
 * @changelog
 * - 0.1.4 improved logging
 * - 0.1.3 improved namespacing, handleStorageEvents adjusted to for current browser updates (event object error)
 * - 0.1.2 creating test item while open added, bug fixes for chrome 17
 * - 0.1.1 refactoring, js lint
 * - 0.1 basic functions and structur
 *
 * @see
 * - http://www.w3.org/TR/file-system-api/
 * - http://www.w3.org/TR/FileAPI/
 * - http://www.html5rocks.com/de/tutorials/file/filesystem/
 * - http://updates.html5rocks.com/2011/08/Debugging-the-Filesystem-API
 *
 * @bugs
 * -
 *
 */
(function (window, ns, undefined) {

    'use strict';

    /**
     * undefined is used here as the undefined global
     * variable in ECMAScript 3 and is mutable (i.e. it can
     * be changed by someone else). undefined isn't really
     * being passed in so we can ensure that its value is
     * truly undefined. In ES5, undefined can no longer be
     * modified.
     * 
     * window and ns are passed through as local
     * variables rather than as globals, because this (slightly)
     * quickens the resolution process and can be more
     * efficiently minified (especially when both are
     * regularly referenced in this module).
     */

    // create the global vars once
    var storageType = 'fileSystem',                             // @type {string} The storage type string
        utils = ns.helpers.utils,                               // @type {object} Shortcut for utils functions
        log = utils.log,                                        // @type {function} Shortcut for utils.log function
        checkCallback = utils.callback,                         // @type {function} Shortcut for utils.callback function
        boolIsSupported = null;                                 // @type {boolean} Bool if this type of storage is supported or not


    /**
     * -------------------------------------------
     * general helper functions
     * -------------------------------------------
     */

    /**
     * console log helper
     *
     * @param {string} message The message to log
     */
    function moduleLog(message) {
        log('[' + storageType + ' Adapter] ' + message);
    }


    /**
     * -------------------------------------------
     * storage adapter
     * -------------------------------------------
     */

    /**
     * handle storage events
     *
     * @param {object} e The event object
     */
    function handleStorageEvents(e) {

        // check for corrent event object
        if (!e) {
            return;
        }

        // init local vars
        var msg = '',
            code = e.name || e.message || e.code;

        switch (code) {
        case FileError.QUOTA_EXCEEDED_ERR:
            msg = 'File System Event: QUOTA_EXCEEDED_ERR';
            break;
        case FileError.NOT_FOUND_ERR:
            msg = 'File System Event: NOT_FOUND_ERR, file does not exist';
            break;
        case FileError.SECURITY_ERR:
            msg = 'File System Event: SECURITY_ERR';
            break;
        case FileError.INVALID_MODIFICATION_ERR:
            msg = 'File System Event: INVALID_MODIFICATION_ERR';
            break;
        case FileError.INVALID_STATE_ERR:
            msg = 'File System Event: INVALID_STATE_ERR';
            break;
        default:
            msg = 'File System Event: Unknown Error';
            break;
        }

        // log message string
        moduleLog(msg, e);

    }


    /**
     * create directory recursiv
     *
     * @param {object} root The storage root
     * @param {array} folders The value string from database
     * @param {function} callback The callback after success
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
     * @param {object} fileSystem The fileSystem to check
     * @param {srting} url The url string to check
     * @param {function} callback The callback after success
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
     * @constructor
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
     *
     * @interface
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
                    moduleLog(storageType + ' is not supported');
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
                    moduleLog('Try to create test resource');
                    try {
                        self.create('test-item', utils.jsonToString({test: "test-content"}), function (success) {
                            if (!!success) {
                                self.remove('test-item', function () {
                                    moduleLog('Test resource created and successfully deleted');
                                    callback(adapter);
                                    //return;
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
         * @param {object} key The resource object
         * @param {string} content The content string
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

                            /**
                             * create transparent binary file copy via blobs
                             *
                             * @see https://developer.mozilla.org/de/docs/Web/API/Blob
                             */
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
         * @param {object} key The resource object
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
         * @param {object} key The resource object
         * @param {string} content The content string
         * @param {function} callback Function called on success
         */
        update: function (key, content, callback) {

            this.create(key, content, callback);

        },


        /**
         * delete a resource from storage
         * 
         * @param {object} key The resource object
         * @param {function} callback Function called on success
         */
        remove: function (key, callback) {

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

                    // remove file
                    fileEntry.remove(function () {
                        callback(true);
                    }, errorHandler);

                }, errorHandler);

            });

        },


        /**
         * init storage
         *
         * @param {object} parameters The instance parameters
         * @param {integer} [parameters.size] Set storage size
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
     * ns.cache.storage.adapter.fileSystem() calls under the
     * ns.cache namespace
     *
     * @export
     */
    ns.namespace('cache.storage.adapter.' + storageType, Adapter);


}(window, window.getNs())); // immediatly invoke function

/*jslint browser: true, devel: true */
/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:false, curly:true, browser:true, indent:4, maxerr:50, devel:true, wsh:false*/
/*global document, undefined */


/**
 * ns.cache.storage.adapter.indexedDatabase
 *
 * @description
 * - provide a storage api for indexed database
 * - support:
 *      - Internet Explorer 10.0 +
 *      - Firefox 20.0 +
 *      - Google Crome 17.0 +
 *      - Opera 12.5 +
 *      - Maxthon 4.0.5 +
 *      - Seamonkey 2.15 +
 * 
 * @version 0.1.3
 * @author Ulrich Merkel, 2013
 * 
 * @namespace ns
 *
 * @changelog
 * - 0.1.3 improved namespacing
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
(function (window, ns, undefined) {

    'use strict';

    /**
     * undefined is used here as the undefined global
     * variable in ECMAScript 3 and is mutable (i.e. it can
     * be changed by someone else). undefined isn't really
     * being passed in so we can ensure that its value is
     * truly undefined. In ES5, undefined can no longer be
     * modified.
     * 
     * window and ns are passed through as local
     * variables rather than as globals, because this (slightly)
     * quickens the resolution process and can be more
     * efficiently minified (especially when both are
     * regularly referenced in this module).
     */

    // create the global vars once
    var storageType = 'indexedDatabase',                        // @type {string} The storage type string
        utils = ns.helpers.utils,                               // @type {object} Shortcut for utils functions
        log = utils.log,                                        // @type {function} Shortcut for utils.log function
        boolIsSupported = null;                                 // @type {boolean} Bool if this type of storage is supported or not


    /**
     * -------------------------------------------
     * general helper functions
     * -------------------------------------------
     */

    /**
     * console log helper
     *
     * @param {string} message The message to log
     */
    function moduleLog(message) {
        log('[' + storageType + ' Adapter] ' + message);
    }


    /**
     * -------------------------------------------
     * storage adapter
     * -------------------------------------------
     */

    /**
     * the actual instance constructor
     * directly called after new Adapter()
     *
     * @constructor
     * @param {object} parameters The instance parameters
     */
    function Adapter(parameters) {

        // init vars
        var self = this;

        // adapter vars
        self.adapter = null;
        self.type = storageType;

        // defaults
        self.dbName = 'cache';
        self.dbVersion = '1.0';
        self.dbTable = 'offline';
        self.dbDescription = 'Local offline cache';
        self.dbKey = 'key';

        // run init function
        self.init(parameters);

    }

    /**
     * public instance methods
     *
     * Adapter.fn is just a shortcut for Adapter.prototype
     *
     * @interface
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
                    moduleLog(storageType + ' is not supported');
                }
            }

            // return bool
            return boolIsSupported;

        },


        /**
         * create a new resource in storage
         * 
         * @param {object} key The resource object
         * @param {string} content The content string
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
                moduleLog('Failed to init transaction while creating/updating database entry ' + dbName + ' ' + e);
                callback(false, e);
            };

            // check for request error
            request.onerror = function (e) {
                moduleLog('Failed to create/update database entry ' + dbName + ' ' + e);
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
         * @param {string} key The url from the resource to get
         * @param {function} callback Function called on success
         */
        read: function (key, callback) {

            // init local vars
            var self = this,
                dbTable = self.dbTable,
                dbName = self.dbName,
                transaction = self.adapter.transaction([dbTable], 'readonly'),
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
                moduleLog('Failed to init transaction while reading database ' + dbName + ' ' + e);
            };

            // check for request error
            request.onerror = function (e) {
                moduleLog('Failed to read database entry ' + dbName + ' ' + e);
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
         * @param {object} key The resource object
         * @param {string} content The content string
         * @param {function} callback Function called on success
         */
        update: function (key, content, callback) {

            // same logic as this.create
            this.create(key, content, callback);

        },


        /**
        * delete a resource from storage
        * 
        * @param {string} key Url of the resource to delete
        * @param {function} callback Function called on success
        */
        remove: function (key, callback) {

            /**
             * objectStore.delete(url) fails while parsing the js code on older
             * devices due to the reserved word 'delete',
             * so we just set the values empty here to avoid errors.
             */

            // init local vars
            var self = this,
                dbTable = self.dbTable,
                dbName = self.dbName,
                transaction = self.adapter.transaction([dbTable], 'readwrite'),
                objectStore = transaction.objectStore(dbTable),
                request = objectStore(dbTable).put({
                    key: key,
                    content: ''
                });

            // check for transaction error
            transaction.onerror = function (e) {
                moduleLog('Failed to init transaction while deleting database entry ' + dbName + ' ' + e);
                callback(false, e);
            };

            // check for request error
            request.onerror = function (e) {
                moduleLog('Failed to delete database entry ' + dbName + ' ' + e);
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

                    var db = request.result,
                        dbResult,
                        store;

                    self.adapter = db;

                    /**
                     * chrome till version 23 supports setVersion instead of onupgradeneeded
                     * upgradeneeded event until chrome 17 won't be fired so the objectstore isn't created.
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
                            moduleLog('Failed to open database: ' + dbName + ' ' + e);
                            callback(false);
                        };

                        // set version is successful, create new object store
                        setVersionRequest.onsuccess = function (e) {
                            dbResult = request.result;
                            store = dbResult.createObjectStore(dbTable, {keyPath: self.dbKey});

                            moduleLog('Database needs upgrade: ' + dbName + ' ' + e.oldVersion + ' ' + e.newVersion);

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

                    moduleLog('Database needs upgrade: ' + dbName + ' ' + e.oldVersion + ' ' + e.newVersion);

                    // create new database indexes
                    store.createIndex('key',  'key',  { unique: true });
                    store.createIndex('content',  'content',  { unique: false });

                };

                // database can't be opened
                onerror = function (e) {

                    moduleLog('Failed to open database: ' + dbName + ' ' + e);
                    if (!setVersion) {
                        self.open(callback, true);
                    }
                    callback(false);

                };

                // database is blocked by another process
                onblocked = function (e) {

                    moduleLog('Opening database request is blocked! ' + dbName + ' ' + e);
                    callback(false);

                };

                /**
                 * open db
                 *
                 * hack: different implementations for windowObject.open(dbName, dbVersion) in some browers,
                 * to keep it working in older versions (e.g. firefox 18.0.1 produces version error due to dbVersion param)
                 * we just set dbName parameter if setVersion param isn't set. ie10 also trigger an error here if they
                 * try to access database and the disc space is full
                 */
                if (setVersion) {

                    try {
                        request = windowObject.open(dbName, self.dbVersion);
                    } catch (e) {
                        moduleLog(e);
                        request = windowObject.open(dbName);
                    }

                } else {
                    request = windowObject.open(dbName);
                }

                // set event handlers
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
     * ns.cache.storage.adapter.indexedDatabase() calls under the
     * ns.cache namespace
     *
     * @export
     */
    ns.namespace('cache.storage.adapter.' + storageType, Adapter);


}(window, window.getNs())); // immediatly invoke function

/*global window, undefined */

/**
 * ns.cache.storage.adapter.webSqlDatabase
 *
 * @description
 * - provide a storage api for web sql database
 * - support:
 *      - Safari 3.1 +
 *      - Google Crome 4.0 +
 *      - Opera 10.5 +
 *      - Maxthon 4.0.5 +
 *      - iOs 6.1 + (3.2)
 *      - Android 2.1 +
 *
 * @version 0.1.6
 * @author Ulrich Merkel, 2013
 * 
 * @namespace ns
 *
 * @changelog
 * - 0.1.6 example doc added
 * - 0.1.5 improved namespacing
 * - 0.1.4 improved namespacing
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
 * @requires
 * - ns.helpers.utils
 * 
 * @bugs
 * -
 *
 * @example
 * 
 *      // init storage adapter
 *      var storage = new ns.cache.storage.adapter.webSqlDatabase(optionalParametersObject);
 *      storage.open(function (success) {
 *          if (!!success) {
 *              // instance is ready to use via e.g. storage.read()
 *          } else {
 *              // storage adapter is not supported or data couldn't be written
 *          }
 *      });
 *
 *      // read data from storage (similar to storage.remove)
 *      storage.read('key', function (data) {
 *          if (!!data) {
 *              // data successfully read
 *              var jsonObject = JSON.parse(data);
 *          } else {
 *              // data could not be read
 *          }
 *      });
 *
 *      // create data in storage (similar to storage.update)
 *      var data = {
 *              custom: data
 *          },
 *          jsonString = JSON.stringify(data);
 *     
 *      storage.create('key', jsonString, function (success) {
 *          if (!!success) {
 *              // data successfully created
 *          } else {
 *              // data could not be created
 *          }
 *      });
 *
 *      
 */
(function (window, undefined) {

    'use strict';

    /**
     * undefined is used here as the undefined global
     * variable in ECMAScript 3 and is mutable (i.e. it can
     * be changed by someone else). undefined isn't really
     * being passed in so we can ensure that its value is
     * truly undefined. In ES5, undefined can no longer be
     * modified.
     * 
     * window is passed through as local variable rather
     * than as global, because this (slightly)
     * quickens the resolution process and can be more
     * efficiently minified (especially when both are
     * regularly referenced in this module).
     */


    // create the global vars once
    var storageType = 'webSqlDatabase',                             // @type {string} The storage type string
        ns = (window.getNs && window.getNs()) || window,            // @type {object} The current javascript namespace object
        utils = ns.helpers.utils,                                   // @type {object} Shortcut for utils functions
        log = utils.log,                                            // @type {function} Shortcut for utils.log function
        checkCallback = utils.callback,                             // @type {function} Shortcut for utils.callback function
        boolIsSupported = null;                                     // @type {boolean} Bool if this type of storage is supported or not


    /**
     * -------------------------------------------
     * general helper functions
     * -------------------------------------------
     */

    /**
     * console log helper
     *
     * @param {string} message The required message to log
     */
    function moduleLog(message) {
        log('[' + storageType + ' Adapter] ' + message);
    }


    /**
     * -------------------------------------------
     * storage adapter
     * -------------------------------------------
     */

    /**
     * execute sql statement
     *
     * @param {object} adapter The required current storage object interface
     * @param {string} sqlStatement The required sql statement
     * @param {array} parameters The required statement parameters
     * @param {function} successCallback The required callback function on success
     * @param {function} errorCallback The required callback function on error
     * @param {function} transaction The optional transaction if available
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
        var msg = 'Errorcode: ' + (e.code || 'Code not present') + ', Message: ' + (e.message || 'Message not present');

        if (e.info) {
            msg = msg + ' - ' + e.info;
        }

        // log message string
        moduleLog(msg);

    }


    /**
     * the actual instance constructor
     * directly called after new Adapter()
     *
     * @constructor
     * @param {object} parameters The optional instance parameters
     */
    function Adapter(parameters) {

        // init local vars
        var self = this;

        // adapter vars
        self.adapter = null;
        self.type = storageType;
        self.dbName = 'cache';

        /**
         * be careful with switching the database number
         * there are known bugs with the changeVersion method.
         */
        self.dbVersion = '1.0';
        self.dbDescription = 'resource cache';
        self.dbTable = 'websql';

        /**
         * only Safari prompts the user if you try to create a database over the size of the default database size (5MB).
         * for ios we define less, due to meta data it prompts for databases greater than 4MB.
         */
        self.dbSize = 4 * 1024 * 1024;

        // run init function
        self.init(parameters);

    }


    /**
     * public instance methods
     *
     * Adapter.fn is just a shortcut for Adapter.prototype
     *
     * @interface
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
                    moduleLog(storageType + ' is not supported');
                }
            }

            // return bool
            return boolIsSupported;

        },


        /**
         * create a new resource in storage
         * 
         * @param {string} key The required resource key
         * @param {string} content The required content string
         * @param {function} callback The optional function called on success
         */
        create: function (key, content, callback) {

            // check params
            callback = checkCallback(callback);

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
         * @param {string} key The required resource key
         * @param {function} callback The optional function called on success
         */
        read: function (key, callback) {

            // check params
            callback = checkCallback(callback);

            // init vars and read success callback
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
         * @param {string} key The required resource key
         * @param {string} content The required content string
         * @param {function} callback The optional function called on success
         */
        update: function (key, content, callback) {

            // check params
            callback = checkCallback(callback);

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
         * @param {string} key The required resource key
         * @param {function} callback The optional function called on success
         */
        remove: function (key, callback) {

            // check params
            callback = checkCallback(callback);

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
         * @param {function} callback The optional function called on success
         */
        open: function (callback) {

            // check params
            callback = checkCallback(callback);

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
                     * but then safari always indicates version 1.0.
                     * 
                     * hack: safari (6.0.4) doesn't fire the success callback parameter on openDatabase(), so we just can
                     * pass in name, the empty version number, the table description and size. changeVersion, the method
                     * to change the database version, is not fully supported in Webkit. it works in Chrome and Opera,
                     * but not in Safari or Webkit.
                     */
                    self.adapter = adapter = window.openDatabase(self.dbName, '', self.dbDescription, self.dbSize);

                    // check for new version
                    if (String(adapter.version) !== String(self.dbVersion) && !!adapter.changeVersion && typeof adapter.changeVersion === 'function') {
                        try {
                            adapter.changeVersion(
                                adapter.version,
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
                        adapter = window.openDatabase(self.dbName, self.dbVersion, self.dbDescription, self.dbSize);
                        createTableIfNotExists(adapter);

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
         * @param {object} parameters The optional instance parameters
         * @param {string} [parameters.description] Set db description
         * @param {string} [parameters.name] Set db name
         * @param {string} [parameters.size] Set db size
         * @param {string} [parameters.table] Set db table
         * @param {string} [parameters.version] Set db version
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
     * make the storage constructor available for ns.cache.storage.adapter.webSqlDatabase()
     * calls under the ns.cache namespace, alternativly save it to window object
     * 
     * @export
     */
    if (!!ns.namespace && typeof ns.namespace === 'function') {
        ns.namespace('cache.storage.adapter.' + storageType, Adapter);
    } else {
        ns[storageType] = Adapter;
    }


}(window)); // immediatly invoke function

/*jslint unparam: false, browser: true, devel: true, ass: true */
/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:false, curly:true, browser:true, indent:4, maxerr:50, devel:true, wsh:false */
/*global window, undefined */


/**
 * ns.cache.storage.adapter.webStorage
 *
 * @description
 * - provide a storage api for web storage
 * - support:
 *      - Internet Explorer 8.0 +
 *      - Firefox 3.5 +
 *      - Safari 4.0 +
 *      - Google Crome 4.0 +
 *      - Opera 10.5 +
 *      - Opera Mobile 11.5 +
 *      - Maxthon 4.0.5 +
 *      - iOs 2.0 (3.2) +
 *      - Android 2.0 (2.1) +
 *      - Camino 2.1.2 +
 *      - Fake 1.8 +
 *      - Omni Web 5.11 +
 *      - Stainless 0.8 +
 *      - Seamonkey 2.15 +
 *      - Sunrise 2.2 +
 * 
 * @version 0.1.7
 * @author Ulrich Merkel, 2013
 * 
 * @namespace ns
 * 
 * @changelog
 * - 0.1.7 example doc added, synchronous interface added
 * - 0.1.6 improved namespacing
 * - 0.1.5 improved namespacing
 * - 0.1.4 polyfill moved to separate function
 * - 0.1.3 polyfill for globalStorage and ie userdata added
 * - 0.1.2 bug fixes for non-standard browsers, trying to read item added to open function
 * - 0.1.1 refactoring, js lint
 * - 0.1 basic functions and structur
 *
 * @see
 * - http://www.w3.org/TR/webstorage/
 * - http://diveintohtml5.info/storage.html
 *
 * @requires
 * - ns.helpers.utils
 * 
 * @bugs
 * -
 * 
 * @example
 * 
 *      // init storage adapter
 *      var storage = new ns.cache.storage.adapter.webStorage(optionalParametersObject);
 *      storage.open(function (success) {
 *          if (!!success) {
 *              // instance is ready to use via e.g. storage.read()
 *          } else {
 *              // storage adapter is not supported or data couldn't be written
 *          }
 *      });
 *
 *      // read data from storage (similar to storage.remove)
 *      // there is a asynchronous and synchronous interface
 *      // available
 *
 *      // asynchronous way
 *      storage.read('key', function (data) {
 *          if (!!data) {
 *              // data successfully read
 *              var jsonObject = JSON.parse(data);
 *          } else {
 *              // data could not be read
 *          }
 *      });
 *      
 *      // synchronous way
 *      var data = storage.read('key'),
 *          jsonObject;
 *          
 *      if (!!data) {
 *          // data successfully read
 *          jsonObject = JSON.parse(data);
 *      } else {
 *          // data could not be read
 *      }
 *
 *      // create data in storage (similar to storage.update)
 *      // there is a asynchronous and synchronous interface
 *      // available
 *
 *      // asynchronous way
 *      var data = {
 *              custom: data
 *          },
 *          jsonString = JSON.stringify(data);
 *     
 *      storage.create('key', jsonString, function (success) {
 *          if (!!success) {
 *              // data successfully created
 *          } else {
 *              // data could not be created
 *          }
 *      });
 *
 *      // synchronous way
 *      var data = {
 *              custom: data
 *          },
 *          jsonString = JSON.stringify(data),
 *          success;
 *     
 *      success = storage.create('key', jsonString);
 *      if (!!success) {
 *          // data successfully created
 *      } else {
 *          // data could not be created
 *      }
 *      
 */
(function (window, undefined) {

    'use strict';

    /**
     * undefined is used here as the undefined global
     * variable in ECMAScript 3 and is mutable (i.e. it can
     * be changed by someone else). undefined isn't really
     * being passed in so we can ensure that its value is
     * truly undefined. In ES5, undefined can no longer be
     * modified.
     * 
     * window is passed through as local variable rather
     * than as global, because this (slightly)
     * quickens the resolution process and can be more
     * efficiently minified (especially when both are
     * regularly referenced in this module).
     */

    // create the global vars once
    var storageType = 'webStorage',                                 // @type {string} The storage type string
        ns = (window.getNs && window.getNs()) || window,            // @type {object} The current javascript namespace object
        utils = ns.helpers.utils,                                   // @type {object} Shortcut for utils functions
        on = utils.on,                                              // @type {function} Shortcut for utils.on function
        log = utils.log,                                            // @type {function} Shortcut for utils.log function
        checkCallback = utils.callback,                             // @type {function} Shortcut for utils.callback function
        boolIsSupported = null;                                     // @type {boolean} Bool if this type of storage is supported or not


    /**
     * -------------------------------------------
     * general helper functions
     * -------------------------------------------
     */

    /**
     * console log helper
     *
     * @param {string} message The required message to log
     */
    function moduleLog(message) {
        log('[' + storageType + ' Adapter] ' + message);
    }


    /**
     * -------------------------------------------
     * storage adapter
     * -------------------------------------------
     */

    /**
     * handle web storage events
     *
     * the event only fires on other windows – it won’t fire on the window that did the storing.
     * the event won’t fire if the data doesn’t change, i.e. if you store .name = 'test' and set it to 'test'
     * again it won’t fire the storage event (obviously, since nothing was stored).
     * 
     * @see
     * - http://html5doctor.com/storing-data-the-simple-html5-way-and-a-few-tricks-you-might-not-have-known/
     *
     * @param {object} e The storage event object
     */
    function handleStorageEvents(e) {

        // handle Internet Explorer storage event
        if (!e && window.event) {
            e = window.event;
        }

        // log event
        moduleLog('Event - key: ' + (e.key || 'no e.key event') + ', url: ' + (e.url || 'no e.url event'));
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
        var result;

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
     * @constructor
     * @param {object} parameters The optional instance parameters
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
     *
     * @interface
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
                    // additionally test for getItem method
                    boolIsSupported = !!window[type] && !!window[type].getItem;
                } catch (e) {
                    moduleLog(storageType + ' is not supported');
                    boolIsSupported = false;
                }
            }

            // return bool
            return boolIsSupported;

        },


        /**
         * create a new resource in storage
         * 
         * @param {string} key The required resource object
         * @param {string} content The required content string
         * @param {function} callback The optional function called on success
         *
         * @returns {boolean} The functions success state
         */
        create: function (key, content, callback) {

            // init local vars
            var self = this,
                result = true;

            // check params
            callback = checkCallback(callback);

            try {

                // save data and call callback
                self.adapter.setItem(key, content);
                callback(result);

            } catch (e) {

                // handle errors
                handleStorageEvents(e);
                result = !result;
                callback(result, e);

            }

            // return synchron result
            return result;

        },


        /**
         * read storage item
         *
         * @param {string} key The required resource object
         * @param {function} callback The optional function called on success
         *
         * @returns {(boolean|string)} The resource data string if found
         */
        read: function (key, callback) {

            var self = this,
                data;

            // check params
            callback = checkCallback(callback);

            try {
                // try to load data
                data = self.adapter.getItem(key);

                // return data
                if (!!data) {
                    callback(data);
                } else {
                    callback(false);
                }

            } catch (e) {

                // handle errors
                handleStorageEvents(e);
                callback(false, e);

            }

            // return synchron result
            return data;

        },


        /**
         * update a resource in storage
         * 
         * @param {string} key The required resource object
         * @param {string} content The required content string
         * @param {function} callback The optional function called on success
         *
         * @returns {boolean} The functions success state
         */
        update: function (key, content, callback) {

            // same logic as this.create
            return this.create(key, content, callback);

        },


        /**
         * delete a resource from storage
         * 
         * @param {string} key The required resource object
         * @param {function} callback The optional function called on success
         *
         * @returns {boolean} The functions success state
         */
        remove: function (key, callback) {

            // init local vars
            var self = this,
                result = true;

            // check params
            callback = checkCallback(callback);

            try {

                // delete data and call callback
                self.adapter.removeItem(key);
                callback(result);

            } catch (e) {

                // handle errors
                handleStorageEvents(e);
                result = !result;
                callback(result, e);

            }

            // return synchron result
            return result;

        },


        /**
         * open and initialize storage if not already done
         * 
         * @param {function} callback The optional function called on success
         */
        open: function (callback) {

            // init local function vars
            var self = this,
                adapter = self.adapter,
                type = getStorageType(self.lifetime);

            // check params
            callback = checkCallback(callback);

            // check for adapter already initiliazed
            if (null === adapter) {
                try {

                    // init global object
                    adapter = self.adapter = window[type];
                    on(window, 'storage', handleStorageEvents);

                    // create test item
                    moduleLog('Try to create test resource');
                    self.create('test-item', '{test: "test-content"}', function (success) {
                        if (!!success) {
                            self.remove('test-item', function () {
                                moduleLog('Test resource created and successfully deleted');
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
         * @param {object} parameters The optional instance parameters
         * @param {string} [parameters.lifetime=localStorage] Set storage type to localStorage or sessionStorage
         *
         * @return {(this|false)} The instance if supported or false
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
     * make the storage constructor available for ns.cache.storage.adapter.webStorage()
     * calls under the ns.cache namespace, alternativly save it to window object
     * 
     * @export
     */
    if (!!ns.namespace && typeof ns.namespace === 'function') {
        ns.namespace('cache.storage.adapter.' + storageType, Adapter);
    } else {
        ns[storageType] = Adapter;
    }


}(window)); // immediatly invoke function

/*global window, document, confirm*/


/**
 * ns.cache.storage.adapter.applicationCache
 * 
 * @description
 * - handle html5 offline application cache
 * - support:
 *      - Internet Explorer 10.0 +
 *      - Firefox 20.0 +
 *      - Safari 5.1 +
 *      - Google Crome 17.0 +
 *      - Opera 12.5 +
 *      - Maxthon 4.0.5 +
 *      - iOs 3.2 +
 * 
 * @version 0.1.6
 * @author Ulrich Merkel, 2013
 *
 * @namespace app
 *
 * @changelog
 * - 0.1.6 improved logging
 * - 0.1.5 improved namespacing
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
     * regularly referenced in this module).
     */


    /**
     * The overall limit for saving files is round abound 5 MB (depending on device).
     *  
     * the application cache can be checked/debugged in chrome with
     * chrome://appcache-internals/ to view and delete cached files 
     * or check the console while the page is loading.
     *
     * firefox on desktop in general promts a popup
     * when trying to save data with application cache.
     */


    // create the global vars once
    var storageType = 'applicationCache',                       // @type {string} The storage type string
        helpers = ns.helpers,                                  // @type {object} Shortcut for helper functions
        utils = helpers.utils,                                  // @type {object} Shortcut for utils functions
        dom = helpers.dom,                                      // @type {object} Shortcut for dom functions
        on = utils.on,                                          // @type {object} Shortcut for on function
        log = utils.log,                                        // @type {function} Shortcut for utils.log function
        checkCallback = utils.callback,                         // @type {function} Shortcur for utils.callback function
        boolIsSupported = null,                                 // @type {boolean} Bool if this type of storage is supported or not
        htmlNode = document.getElementsByTagName('html')[0];    // @type {object} The dom html element


    /**
     * -------------------------------------------
     * general helper functions
     * -------------------------------------------
     */

    /**
     * console log helper
     *
     * @param {string} message The message to log
     */
    function moduleLog(message) {
        log('[' + storageType + ' Adapter] ' + message);
    }


    /**
     * -------------------------------------------
     * storage adapter
     * -------------------------------------------
     */

    /**
     * the actual instance constructor
     * directly called after new Adapter()
     *
     * @constructor
     */
    function Adapter(parameters) {

        // init local vars
        var self = this;

        // adapter vars
        self.adapter = null;
        self.type = storageType;
        self.isLoaded = false;
        self.delay = 25;

        // run init function
        self.init(parameters);

    }


    /**
     * instance methods
     *
     * Adapter.fn is just a shortcut for Adapter.prototype
     * 
     * @interface
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
                boolIsSupported = !!window.applicationCache && !!dom.getAttribute(htmlNode, 'manifest');
                if (!boolIsSupported) {
                    moduleLog(storageType + ' is not supported or there is no manifest html attribute');
                }
            }

            // return bool
            return boolIsSupported;

        },


        /**
         * adapter files loaded
         * 
         * invoke a callback function and make shure it's
         * only called once.
         *
         * @param {function} callback The function to be called on loaded
         */
        loaded: function (callback) {

            var self = this;

            if (!self.isLoaded) {
                self.isLoaded = true;
                window.setTimeout(function () {
                    callback();
                    moduleLog('Event loaded');
                }, self.delay);
            }

        },


        /**
         * open adapter
         * 
         * open and initialize storage if not already done.
         * 
         * @param {function} callback The function called on success
         */
        open: function (callback, parameters) {

            // init local function vars
            var self = this,
                adapter = self.adapter,
                manifestProgressCount = 0,
                progressCallback,
                onUpdateReady;

            // check parameters
            callback = checkCallback(callback);

            if (parameters) {
                if (parameters.progress) {
                    progressCallback = parameters.progress;
                }
            }
            progressCallback = checkCallback(progressCallback);

            // check for application cache support
            if (self.isSupported() && null !== adapter) {

                /**
                 * handle updates
                 */
                onUpdateReady = function () {
                    moduleLog('Event updateready');

                    // avoid errors in browsers that are not capable of swapCache
                    try {
                        adapter.swapCache();
                    } catch (e) {
                        moduleLog('Event updateready: swapcache is not available', e);
                    }

                    // ask user for refreshing the page
                    if (confirm('A new version of this website is available. Do you want to an update?')) {
                        window.location.reload(true);
                    } else {
                        self.loaded(callback);
                    }

                    return false;
                };


                /**
                 * checking event
                 *
                 * if the manifest file has not changed, and the app is already cached,
                 * the noupdate event is fired and the process ends.
                 */
                on(adapter, 'checking', function () {
                    moduleLog('Event checking');

                    return false;
                });


                /**
                 * no update event
                 * 
                 * if the manifest file has not changed, and the app is already cached,
                 * the noupdate event is fired and the process ends.
                 */
                on(adapter, 'noupdate', function () {
                    moduleLog('Event noupdate');
                    self.loaded(callback);

                    return false;
                });


                /**
                 * downloading cache files starts
                 * 
                 * if the application is not already cached, or if the manifest has changed,
                 * the browser downloads and caches everything listed in the manifest.
                 * the downloading event signals the start of this download process.
                 */
                on(adapter, 'downloading', function () {
                    moduleLog('Event downloading');
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
                on(adapter, 'progress', function (e) {
                    moduleLog('Event progress');

                    var progress = "";

                    // to run the css animation smooth until end
                    self.delay = 500;

                    // manually count progress (fallback for e.lengthComputable)
                    manifestProgressCount = manifestProgressCount + 1;

                    // Progress event: compute percentage
                    if (e && e.lengthComputable !== undefined) {
                        progress = Math.round(100 * e.loaded / e.total);
                    } else {
                        progress = Math.round(100 * manifestProgressCount / 20);
                    }

                    progressCallback(progress);

                    return false;
                });


                /**
                 * files are cached event
                 * 
                 * the first time an application is downloaded into the cache, the browser
                 * fires the cached event when the download is complete.
                 */
                on(adapter, 'cached', function () {
                    moduleLog('Event cached');
                    self.loaded(callback);

                    return false;
                });


                /**
                 * update is available event
                 *
                 * when an already-cached application is updated, and the download is complete
                 * the browser fires "updateready". Note that the user will still be seeing
                 * the old version of the application when this event arrives.
                 */
                on(adapter, 'updateready', function () {
                    onUpdateReady();
                });


                /**
                 * cache is obsolete event
                 *
                 * if a cached application references a manifest file that does not exist,
                 * an obsolete event is fired and the application is removed from the cache.
                 * subsequent loads are done from the network rather than from the cache.
                 */
                on(adapter, 'obsolete', function () {
                    moduleLog('Event obsolete');
                    window.location.reload(true);

                    return false;
                });


                /**
                 * cache error event
                 *
                 * if there is an error with the cache file or
                 * ressources can't be loaded.
                 */
                on(adapter, 'error', function () {
                    moduleLog('Event error');
                    self.loaded(callback);

                    return false;
                });


                /**
                 * additionally check for status constants
                 *
                 * since a cache manifest file may have been updated or loaded before a script attaches event
                 * listeners to test for the events, we check additionally for the current manifest status.
                 */
                switch (adapter.status) {
                case adapter.UNCACHED:
                    // UNCACHED == 0, occurs when there is a bug while downloading files
                    self.loaded(callback);
                    break;
                case adapter.IDLE:
                    // IDLE == 1, files are already loaded
                    progressCallback(100);
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
                on(window, 'online', function () {
                    try {
                        adapter.update();
                    } catch (e) {
                        moduleLog('Window event online: update cache is not available', e);
                    }
                });


                /**
                 * call the main callback after certain time for slow
                 * internet connections or uncovered non-standard behaviours
                 * throwing errors.
                 *
                 * the page is already accessable because all application cache
                 * files will be loaded async in the background.
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
         * @param {object} parameters The instance parameters
         * 
         * @return {this} The instance if supported or false
         */
        init: function (parameters) {

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
     * ns.cache namespace
     *
     * @export
     */
    ns.namespace('cache.storage.adapter.' + storageType, Adapter);


}(window, document, window.getNs())); // immediatly invoke function

/*jslint browser: true, devel: true, regexp: true */
/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:false, curly:true, browser:true, indent:4, maxerr:50 */
/*global document, undefined*/


/**
 * ns.cache.storage.controller
 *
 * @description
 * - connect to different storage types if available
 * - provide consistent api for different storage types
 * - store and read via storage adapter
 * - convert resource data, encode data into storable formats and decode data form storage
 * - implementing the strategy pattern for storage adapters
 * 
 * @version 0.1.6
 * @author Ulrich Merkel, 2013
 * 
 * @namespace ns
 *
 * @changelog
 * - 0.1.6 logging improved
 * - 0.1.5 improved namespacing
 * - 0.1.4 timeout for xhr connections added
 * - 0.1.3 bug fix when checking adapter support - additionally checking with adapter.open and not just isSupported, modified getStorageAdapter function
 * - 0.1.2 refactoring, js lint
 * - 0.1.1 bug fix init when cache storage is disabled
 * - 0.1 basic functions and structur
 *
 * @see
 * - http://www.html5rocks.com/en/tutorials/offline/storage/
 * - http://www.html5rocks.com/de/features/storage
 *
 * @bugs
 * - 
 * 
 */
(function (document, ns, undefined) {

    'use strict';

    /**
     * undefined is used here as the undefined global
     * variable in ECMAScript 3 and is mutable (i.e. it can
     * be changed by someone else). undefined isn't really
     * being passed in so we can ensure that its value is
     * truly undefined. In ES5, undefined can no longer be
     * modified.
     * 
     * document and ns are passed through as local
     * variables rather than as globals, because this (slightly)
     * quickens the resolution process and can be more
     * efficiently minified (especially when both are
     * regularly referenced in this module).
     */

    // module vars
    var controllerType = 'storage',                                 // @type {string} The controller type string
        helpers = ns.helpers,                                       // @type {object} Shortcut for helper functions
        client = helpers.client,                                    // @type {object} Shortcut for client functions
        utils = helpers.utils,                                      // @type {object} Shortcut for utils functions
        log = utils.log,                                            // @type {function} Shortcut for utils.log function
        checkCallback = utils.callback,                             // @type {function} Shortcut for utils.callback function
        json = utils.getJson(),                                     // @type {function} Global window.Json object if available
        xhr = utils.xhr,                                            // @type {function} Shortcut for utils.xhr function
        appCacheStorageAdapter = ns.cache.storage.adapter,          // @type {object} Shortcut for ns.cache.storage.adapter namespace
        hasCanvasSupport = client.hasCanvas(),                      // @type {boolean} Whether there is canvas support or not

        /**
         * @type {array} Config array with objects for different storage types
         * 
         * this is the place to configure the defaults values which types of
         * adapters will be checked in which order and which resource types 
         * are stored in which adapter type.
         */
        adapters = [
            {type: 'fileSystem', css: true, js: true, html: true, img: true },
            {type: 'indexedDatabase', css: true, js: true, html: true, img: true },
            {type: 'webSqlDatabase', css: true, js: true, html: true, img: true },
            {type: 'webStorage', css: true, js: true, html: true, img: true }
        ],


        /**
         * @type {object} The default option to initialize the adapter
         *
         * this is the default config for strorage adapters and could be
         * overridden by the passed in parameters.
         */
        adapterDefaults = {
            name: 'localcache',                                 // @type {string} [adapterDefaults.name=localcache] Default db name
            table: 'cache',                                     // @type {string} [adapterDefaults.table=cache] Default db table name
            description: 'local resource cache',                // @type {string} [adapterDefaults.description] Default db description
            size: 4 * 1024 * 1024,                              // @type {integer} [adapterDefaults.size=4194304] Default db size 4 MB (prevents popup on old ios versions)
            version: '1.0',                                     // @type {string} [adapterDefaults.version=1.0] Default db version, needs to be string for web sql database and should be 1.0
            key: 'key',                                         // @type {string} [adapterDefaults.key=key] Default db primary key
            lifetime: 'local',                                  // @type {string} [adapterDefaults.lifetime=local] Default lifetime for webstorage
            offline: true                                       // @type {boolean} [adapterDefaults.offline=true] Default switch for using application cache event handling
        },

        adapterAvailable = null,                                // @type {string} The name of the best available adapter after testing
        adapterAvailableConfig = null,                          // @type {object} The adapter config for the available type (see adapters object)


        /**
         * @type {object} The defaults for a single resource
         *
         * this config could be overridden by the passed in resource parameters
         */
        resourceDefaults = {
            ajax: true,                                         // @type {boolean} [resourceDefaults.ajax=true] Default value for loading a resource via xhr or not
            lifetime: 20000,                                    // @type {integer} [resourceDefaults.lifetime=20000] Default lifetime time in milliseconds (10000 = 10sec)
            group: 0,                                           // @type {integer} [resourceDefaults.group=0] Default resource group
            lastmod: new Date().getTime(),                      // @type {integer} [resourceDefaults.lastmod] Default last modification timestamp
            type: 'css',                                        // @type {string} [resourceDefaults.type=css] Default resource type
            version: 1.0                                        // @type {float} [resourceDefaults.version=1.0] Default resource version
        };


    /**
     * -------------------------------------------
     * general helper functions
     * -------------------------------------------
     */

    /**
     * console log helper
     *
     * @param {string} message The message to log
     */
    function moduleLog(message) {
        log('[' + controllerType + ' controller] ' + message);
    }


    /**
     * helper function for ajax requests
     *
     * set timeout for network functions, useful if connection is lost
     *
     * @param {string} url The url from the resource to load
     * @param {function} callback The callback function to be called after load or failure
     * @param {object} resource The resource object
     */
    function handleXhrRequests(url, callback, resource) {

        // set timeout if network get lost
        resource.timeout = window.setTimeout(function () {
            callback(false);
        }, 5000);

        // make xhr call and check data
        xhr(url, function (data) {
            window.clearTimeout(resource.timeout);
            delete resource.timeout;
            if (data) {
                callback(data);
            } else {
                callback(false);
            }
        });
    }


    /**
     * -------------------------------------------
     * helper functions for converting data
     * -------------------------------------------
     */


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

        /**
         * avoid javaScript errors if the resource loading parameters changed
         * 
         * hack: there is a strange behaviour in some browsers if the resource parameters 
         * changed while calling load and the resource is stored in cache, so we 
         * have to use try/catch here.
         */
        try {
            result = utils.jsonToObject(string);
        } catch (e) {
            moduleLog('Couldn\'t convert json string to object.' + e);
        }

        // return result
        return result;
    }


    /**
     * convert image url to base64 string
     * 
     * @param {string} url The image url
     * @param {function} callback The callback function after success
     * @param {string} imageType The optional image type (jpeg, png), standard is jpeg
     *
     * @returns {string} Returns converted data as callback parameter or false
     *
     * @todo: check loaded, see imagesLoaded Remy Sharp
     */
    function convertImageToBase64(url, callback, imageType) {

        // check for canvas support
        if (hasCanvasSupport) {

            // init local function vars
            var canvas = document.createElement('canvas'),
                context,
                image = new Image(),
                result = null,
                height = 0,
                width = 0;

            // check imageType parameter
            if (!imageType) {
                imageType = 'jpeg';
            }

            // catch loading errors
            image.onerror = function () {

                // avoid memory leaks
                image.onload = image.onerror = null;

                callback();

            };

            // asynch event handler when image is loaded
            image.onload = function () {

                // avoid memory leaks
                image.onload = image.onerror = null;

                // set canvas dimensions
                height = canvas.height = image.height;
                width = canvas.width = image.width;

                // get 2d context
                context = canvas.getContext('2d');

                // set background color (for jpeg images out of transparent png files)
                context.fillStyle = 'rgba(50, 50, 50, 0)';

                // draw background, start on top/left and set fullwith/height
                context.fillRect(0, 0, width, height);

                // draw image in canvas on top/left
                context.drawImage(image, 0, 0);

                // get base64 data string and return result
                result = canvas.toDataURL('image/' + imageType);
                callback(result);

            };

            // set image source after the event handler is attached
            image.src = url;

            /**
             * check if image is cached, trigger load manually
             *
             * @see
             * - http://github.com/desandro/imagesloaded
             * - http://www.html5rocks.com/en/tutorials/es6/promises/?redirect_from_locale=de
             */
            if (!!image.complete && image.naturalWidth !== undefined) {
                image.onload();
            }

        } else {

            /**
             * just do a false callback and don't get the data via xhr to
             * avoid the parsing of binary data via response text.
             */
            callback(false);

        }
    }


    /**
     * replace relative with absolute urls 
     *
     * used whithin css resource string  data (e.g css background urls),
     * this needs to be done because the css string a put directly into the
     * html structur and therefor all relative url pathes needs to change
     *
     * @param {object} resource The resource object item
     *
     * @returns {object} Returns the resource with converted or source data
     */
    function convertRelativeToAbsoluteUrls(resource) {

        var data = resource.data,
            url = resource.url,
            type = resource.type,
            urlParts,
            result,
            folder;

        // just do it for css files
        if (type === 'css') {

            urlParts = utils.url(url);
            folder = urlParts.folder;

            /**
             * search for different css code styles for embeding urls
             * in css rules (this is important for some css minifiers
             * and different coding styles)
             */
            result = data.replace(/url\(\../g, 'url(' + folder + '..');
            result = result.replace(/url\(\'../g, 'url(\'' + folder + '..');
            result = result.replace(/url\(\"../g, 'url("' + folder + '..');

            resource.data = result;
            return resource;

        }

        return resource;
    }


    /**
     * copy resource object for the use in storage
     * 
     * remove url from resource data string to avoid duplicate data in storage.
     * we also set the new expires timestamp here, because this function will
     * only be called from create/update to get a copy from the resource content.
     *
     * node parameters won't be saved to append one resource to multiple elements.
     * 
     * @param {object} resource The resource object item
     * 
     * @returns {object} Returns the copied resource data
     */
    function copyStorageContent(resource) {

        // set new data for storage content
        return {
            ajax: resource.ajax,
            data: resource.data,
            expires: new Date().getTime() + (resource.lifetime || resourceDefaults.lifetime),
            group: (resource.group !== undefined ? resource.group : resourceDefaults.group),
            lastmod: resource.lastmod || resourceDefaults.lastmod,
            lifetime: (resource.lifetime !== undefined ? resource.lifetime : resourceDefaults.lifetime),
            type: resource.type || resourceDefaults.type,
            version: resource.version || resourceDefaults.version
        };
    }


    /**
     * -------------------------------------------
     * helper functions for storage adapters
     * -------------------------------------------
     */


    /**
     * check if resource is cachable due to adapter config
     *
     * @param {string} resourceType The resource type (css, js, html, ...)
     * 
     * @returns {boolean} Returns true or false depending on resource type
     */
    function isRessourceStorable(resourceType) {

        // check if type is available in adapter config and return boolean
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
        moduleLog('Testing for storage adapter type: ' + storageType);

        // check for storage adapter
        if (!!appCacheStorageAdapter[storageType]) {
            // get new storage adapter instance
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

                    moduleLog('Used storage adapter type: ' + adapterAvailable);
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
                moduleLog('Testing for storage adapter type: ' + storageType);
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

                            // get adapter config from supported type
                            for (i = 0; i < length; i = i + 1) {
                                if (adapters[i].type === storageType) {
                                    adapterAvailableConfig = adapters[i];
                                }
                            }
                            if (adapterAvailableConfig) {
                                moduleLog('Used storage type: ' + adapterAvailable);
                                callback(adapter);
                                return;
                            }

                            // if there is no config, test the next adapter type
                            moduleLog('Storage config not found: ' + adapterAvailable);
                            getStorageAdapter(callback);

                        } else {

                            // recursiv call
                            getStorageAdapter(callback);

                        }
                    });
                } else {
                    // javascript api is not supported, recursiv call
                    getStorageAdapter(callback);
                }
            } catch (e) {
                // javascript api is not (or mayby in a different standard way implemented and) supported, recursiv call
                moduleLog('Storage adapter could not be initialized: type ' + storageType, e);
                getStorageAdapter(callback);
            }

        } else {
            // automatic init with global adapters array
            getAvailableStorageAdapter(adapters, callback);
        }
    }


    /**
     * -------------------------------------------
     * storage controller
     * -------------------------------------------
     */


    /**
     * storage controller constructor
     *
     * @constructor
     * @param {function} callback The callback function
     * @param {object} parameters The optional parameters for the init function
     */
    function Storage(callback, parameters) {

        var self = this;

        /**
         * @type {boolean} Enable or disable client side storage
         *
         * load resources just via xhr if
         * this option is set to false.
         */
        self.isEnabled = true;


        /**
         * @type {object} The instance of the best (or given) available storage adapter
         */
        self.adapter = null;


        /**
         * @type {object} Make the adapter types and defaults available to instance calls
         */
        self.adapters = {
            types: adapters,
            defaults: adapterDefaults
        };


        /**
         * @type {object} The instance of the application cache storage adapter
         */
        self.appCacheAdapter = null;


        /**
         * @type {object} Make the resource defaults available to instance calls
         */
        self.resourceDefaults = resourceDefaults;


        // run init function
        self.init(callback, parameters);

    }


    /**
     * storage controller methods
     *
     * @interface
     */
    Storage.prototype = Storage.fn = {

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

                    if (!data) {
                        moduleLog('Couldn\'t get data via network');
                        callback(resource);
                        return;
                    }

                    // append data to resource object and check for css urls
                    resource.data = data;
                    resource = convertRelativeToAbsoluteUrls(resource);

                    if (null !== self.adapter && isRessourceStorable(type)) {

                       // create storage content
                        var key = convertObjectToString(url),
                            storageContent = copyStorageContent(resource),
                            content = convertObjectToString(storageContent);

                        // update meta data, mainly for test suites
                        resource.expires = storageContent.expires;
                        resource.version = storageContent.version;

                        /**
                        * there is a bug in older browser versions (seamonkey)
                        * when trying to read or write from db (due to non-standard implementation),
                        * so we have to use try catch here.
                        */
                        try {
                            // create storage entry
                            self.adapter.create(key, content, function (success) {
                                if (success) {
                                    moduleLog('Create new resource in storage adapter: type ' + type + ', url ' + url);
                                    callback(resource);
                                } else {
                                    moduleLog('Create new resource in storage adapter failed');
                                    callback(false);
                                }
                            });
                        } catch (e) {
                            // just give back the resource to get the data
                            callback(resource);
                        }

                    } else {
                        moduleLog('Trying to create new resource, but resource type is not cachable or storage adapter is not available: type ' + type + ', url ' + url);
                        callback(resource);
                    }

                };

            // check callback function
            callback = checkCallback(callback);

            // get resource data based on type
            if (!!resource.ajax) {
                if (type === 'img') {
                    convertImageToBase64(url, createCallback);
                } else {
                    handleXhrRequests(url, createCallback, resource);
                }
            } else if (!!resource.data) {
                createCallback(resource.data);
            } else {
                callback(false);
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

                moduleLog('Trying to read resource from storage: type ' + type + ', url ' + url);

                /**
                 * there is a bug in older browser versions (seamonkey)
                 * when trying to read from db (due to non-standard implementation),
                 * so we have to use try catch here and fallback to xhr to get the data.
                 * 
                 */
                try {
                    self.adapter.read(convertObjectToString(url), function (data) {
                        if (data) {

                            resource = convertStringToObject(data);

                            /**
                             * check if the convertStringToObject function succeeded.
                             * could fail if resource isn't saved properly or resource parameters changed,
                             * so we remove the old resource from storage instead to create a new one.
                             */
                            if (!resource) {
                                self.remove({url: url, type: type}, function () {
                                    callback(false);
                                });
                                return;
                            }

                            resource.url = url;
                            moduleLog('Successfully read resource from storage: type ' + type + ', url ' + url);
                            callback(resource, true);
                        } else {
                            moduleLog('There is no data coming back from storage while reading: type ' + type + ', url ' + url);
                            callback(false);
                        }
                    });
                } catch (e) {
                    handleXhrRequests(url, function (data) {
                        resource.data = data;
                        moduleLog('Try to read resource from storage, but storage adapter is not available: type ' + type + ', url ' + url);
                        callback(resource, true);
                    }, resource);
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
                updateCallback = function (data) {

                    // try to use stored data if resource couldn't be updated via network
                    if (!data) {
                        moduleLog('Couldn\'t get data via network, trying to used stored version');
                        self.read(resource, function (item) {
                            if (item && item.data) {
                                resource.data = item.data;
                                callback(resource);
                            } else {
                                callback(false);
                            }
                        });

                        return;
                    }

                    // append data to resource object and check for css urls
                    resource.data = data;
                    resource = convertRelativeToAbsoluteUrls(resource);

                    if (null !== self.adapter && isRessourceStorable(type)) {

                        // create storage content
                        var key = convertObjectToString(url),
                            storageContent = copyStorageContent(resource),
                            content = convertObjectToString(storageContent);

                        // update meta data, mainly for test suites
                        resource.expires = storageContent.expires;
                        resource.version = storageContent.version;

                        /**
                        * there is a bug in older browser versions (seamonkey)
                        * when trying to read or write from db (due to non-standard implementation),
                        * so we have to use try catch here.
                        */
                        try {
                            // create storage entry
                            self.adapter.update(key, content, function (success) {
                                if (!!success) {
                                    moduleLog('Update existing resource in storage adapter: type ' + type + ', url ' + url);
                                    callback(resource);
                                } else {
                                    moduleLog('Updating resource in storage failed.');
                                    callback(false);
                                }
                            });
                        } catch (e) {
                            // just give back the resource to get the data
                            callback(resource);
                        }

                    } else {
                        moduleLog('Resource type is not cachable or storage adapter is not available: type ' + type + ', url ' + url);
                        callback(resource);
                    }
                };

            // check callback function
            callback = checkCallback(callback);

            // get resource data based on type
            if (!!resource.ajax) {
                if (type === 'img') {
                    convertImageToBase64(url, updateCallback);
                } else {
                    handleXhrRequests(url, updateCallback, resource);
                }
            } else if (!!resource.data) {
                updateCallback(resource.data);
            } else {
                callback(false);
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
                self.adapter.remove(convertObjectToString(url), function (success) {

                    if (!success) {
                        moduleLog('Deleting resource form storage failed: type ' + type + ', url ' + url);
                        callback(false);
                        return;
                    }

                    moduleLog('Delete resource form storage: type ' + type + ', url ' + url);
                    callback(resource);
                });
            } else {
                moduleLog('Delete resource from storage failed, resource type is not cachable or there is no storage adapter: type ' + type + ', url ' + url);
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

            // check basic params
            callback = checkCallback(callback);
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
                    if (parameters.offline) {
                        adapterDefaults.offline = Boolean(parameters.offline);
                    }
                    if (parameters.version) {
                        adapterDefaults.version = String(parameters.version);
                    }
                }

                if (adapterDefaults.offline && appCacheStorageAdapter.applicationCache) {
                    self.appCacheAdapter = new appCacheStorageAdapter.applicationCache(adapterDefaults);
                }


                /**
                 * storage checking and initializing takes some time
                 * (especially for db's), so we return the current storage
                 * instance via callbacks, after the adapter get's
                 * successfully initialized.
                 *
                 * the returned adapter will already be opened and checked
                 * for support.
                 */

                getStorageAdapter(function (adapter) {
                    self.adapter = adapter;
                    callback(self);
                }, storageType);

            } else {

                /**
                 * just return the instance to get the ressource
                 * via xhr if storage is disabled or json is not
                 * available.
                 */

                if (!json) {
                    moduleLog('There is no json support');
                }
                if (!self.isEnabled) {
                    moduleLog('Caching data is disabled');
                }

                callback(self);
            }
        }

    };


    /**
     * make storage controller available under app namespace
     *
     * @export
     */
    ns.namespace('cache.storage.controller', Storage);


}(document, window.getNs())); // immediatly invoke function

/*jslint unparam: true */
/*global window, document*/

/**
 * ns.cache.controller
 * 
 * @description
 * - main functions/controller for handling client-side cache
 * - connect to storage controller and read/write data
 * - handle logic to check for outdated data
 * 
 * @author Ulrich Merkel (hello@ulrichmerkel.com)
 * @version 0.1.7
 *
 * @namespace ns
 *
 * @changelog
 * - 0.1.8 improved logging
 * - 0.1.7 bug fix isResourceValid, remove added, improvements for testing
 * - 0.1.6 improved namespacing
 * - 0.1.5 separated check for outdated data in new isResourceValid function, resource loaded callback param added
 * - 0.1.4 refactoring
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
     * document and app are passed through as local
     * variables rather than as globals, because this (slightly)
     * quickens the resolution process and can be more
     * efficiently minified (especially when both are
     * regularly referenced in this module).
     */

    // module vars
    var controllerType = 'cache',                               // @type {string} The controller type string
        helpers = ns.helpers,                                   // @type {object} Shortcut for ns.helper functions
        dom = helpers.dom,                                      // @type {object} Shortcut for dom functions
        utils = helpers.utils,                                  // @type {object} Shortcut for utils functions
        client = helpers.client,                                // @type {object} Shortcut for client functions
        log = utils.log,                                        // @type {function} Shortcut for utils.log function
        checkCallback = utils.callback;                         // @type {function} Shortcut for utils.callback function


    /**
     * -------------------------------------------
     * general helper functions
     * -------------------------------------------
     */

    /**
     * console log helper
     *
     * @param {string} message The message to log
     */
    function moduleLog(message) {
        log('[' + controllerType + ' controller] ' + message);
    }


    /**
     * -------------------------------------------
     * cache controller
     * -------------------------------------------
     */

    /**
     * cache controller constructor
     *
     * @constructor
     * @param {function} callback The callback function
     * @param {object} parameters The optional parameters for the init function
     */
    function Controller(callback, parameters) {

        var self = this;

        /**
         * @type {object} The storage controller instance
         */
        self.storage = null;


        // run prototype init function
        self.init(callback, parameters);

    }


    /**
     * cache controller methods
     *
     * @interface
     */
    Controller.prototype = Controller.fn = {

        /**
         * load multiple resources
         *
         * @param {array} resources The array with resource objects
         * @param {function} mainCallback The callback after all resources are loaded
         */
        load: function (resources, mainCallback) {

            // declare load vars and functions
            var self = this,
                now = new Date().getTime(),


                /**
                 * load functions are also saved in local vars rather than
                 * saving them as controller instance functions (via this) for
                 * faster access and better compression results.
                 */


                /**
                 * managing loading queues
                 * 
                 * queue manager for loading all groups of resources after each other.
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
                         * mark resource as loaded - if all group resources have been loaded, invoke group callback
                         */
                        loaded: function () {
                            queueLoaded = queueLoaded + 1;
                            if (queueLoaded === queueSize) {
                                queueCallback();
                            }
                        }
                    };

                }()), // immediatly invoke function to make init() and loaded() accessable via loadResourceGroupQueue


                /**
                 * append file to dom
                 * 
                 * helper function to switch append function according to file type.
                 *
                 * @param {object} resource The resource
                 * @param {string} data The resource data string
                 * @param {boolean} update Indicates if the resource data needs to be updated (if already appended to dom)
                 */
                appendFile = function (resource, data, update) {

                    // init local vars
                    var url = resource.url,
                        resourceLoaded = checkCallback(resource.loaded),
                        callback = function () {
                            loadResourceGroupQueue.loaded();
                            resourceLoaded(resource);
                        },
                        node = resource.node || null;

                    // check update parameter
                    update = !!update;

                    // load file according to type
                    switch (resource.type) {
                    case 'js':
                        dom.appendJs(url, data, callback, node, update);
                        break;
                    case 'css':
                        dom.appendCss(url, data, callback, node, update);
                        break;
                    case 'img':
                        dom.appendImg(url, data, callback, node, update);
                        break;
                    case 'html':
                        dom.appendHtml(url, data, callback, node, update);
                        break;
                    default:
                        // didn't match any type
                        callback();
                        break;
                    }

                },


                /**
                 * check if cached item is still valid
                 *
                 * @param {object} resource The resource object
                 * @param {object} item The cached resource object for comparison
                 *
                 * @return {object} resource The resource object with isValid and lastmod properties
                 */
                isResourceValid = function (resource, item) {

                    // init local vars
                    var resourceDefaults = self.storage.resourceDefaults,
                        itemLifetime = parseInt(item.lifetime, 10),
                        itemVersion = item.version,
                        itemLastmod = !!item.lastmod ? item.lastmod : 0,
                        itemResourceVersionAndLastmodCheck = false,
                        resourceVersion,
                        resourceLastmod = !!resource.lastmod ? resource.lastmod : 0,
                        lastmodCheck = true,
                        isValid = false;

                    // check optional resource attributes and set defaults
                    resource.version = resourceVersion = resource.version !== undefined ? parseFloat(resource.version) : resourceDefaults.version;
                    resource.group = resource.group !== undefined ? parseFloat(resource.group) : resourceDefaults.group;

                    // check resource lastmod
                    if (resourceLastmod && itemLastmod) {

                        /**
                         * lastmod is set for resource and item, so compare it
                         * and save the result in lastmodCheck var
                         */
                        resource.lastmod = parseInt(resourceLastmod, 10);
                        lastmodCheck = (itemLastmod === resource.lastmod);

                    } else if (!resourceLastmod && itemLastmod) {

                        /**
                         * lastmod isn't set for resource load request, but the cache
                         * item got one so we use the stored items lastmod value
                         */
                        resourceLastmod = itemLastmod;

                    } else if (!resourceLastmod) {

                        /**
                         * there is no lastmod option set for the resouce request
                         * so use the defaults
                         */
                        resourceLastmod = resourceDefaults.lastmod;

                    }

                    // shortcut for version and lastmod check for better compression results
                    itemResourceVersionAndLastmodCheck = (lastmodCheck && resourceVersion === itemVersion);

                    /**
                     * check for outdated data
                     *
                     * if item.lifetime is set to '-1' the resource will never expires (if lastmod and version stay the same).
                     * if item.lifetime is set to '0' the resource will always expires.
                     * 
                     * if item.lifetime isn't set to '-1' the item.lastmod and cached resource.lastmod (and item.version/resource.version)
                     * needs to be the same and finally there is a check if the item is expired using the current timestamp.
                     */
                    isValid = (itemLifetime !== 0) && (
                        (itemLifetime !== -1 && itemResourceVersionAndLastmodCheck && item.expires > now) ||
                        (itemLifetime === -1 && itemResourceVersionAndLastmodCheck)
                    );

                    // update meta data, mainly for test suites
                    resource.lastmod = resourceLastmod;
                    resource.isValid = isValid;

                    // return result
                    return resource;

                },


                /**
                 * load data from cache
                 * 
                 * this function loads a single resource from cache.
                 *
                 * @param {object} resource The resource object
                 */
                loadResource = function (resource) {

                    // init local vars
                    var data = resource.data || null,
                        callback = function (cbResource, update) {
                            if (cbResource && cbResource.data) {
                                appendFile(cbResource, cbResource.data, update);
                            } else {
                                appendFile(cbResource, null, update);
                            }
                        },
                        storage = self.storage,
                        resourceDefaults = storage.resourceDefaults;

                    // check optional resource attributes and set defaults
                    resource.ajax = resource.ajax !== undefined ? !!resource.ajax : resourceDefaults.ajax;

                    // read resource via storage controller
                    storage.read(resource, function (item) {

                        /**
                         * if there is no item create it
                         *
                         * this is also the point where data get's loaded via
                         * xhr when the storage is disabled, the resource isn't
                         * created then - it just returns the data via xhr.
                         */
                        if (!item || !item.data) {
                            moduleLog('Resource or resource data is not available in storage adapter: type ' + resource.type + ', url ' + resource.url);
                            storage.create(resource, callback);
                            return;
                        }

                        // check for outdated data and network connection
                        resource = isResourceValid(resource, item);
                        if (resource.isValid || !client.isOnline()) {
                            moduleLog('Resource is up to date: type ' + resource.type + ', url ' + resource.url);
                            data = item.data;
                        } else {
                            moduleLog('Resource is outdated and needs update: type ' + resource.type + ', url ' + resource.url);
                            storage.update(resource, callback);
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
                 * group resources
                 * 
                 * sort given resources according to group parameter because
                 * this will allow us to load resources in a certain order to
                 * keep all the dependencies save.
                 * 
                 * @param {array} resources The resources to sort
                 *
                 * @returns {array} Sorted array with resource objects
                 */
                groupResources = function (resources) {

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

                    /**
                     * get current index value in resources array, this is a
                     * workaround if there are gaps in group indexes (e.g. there
                     * is group 1 and 3, but no group 2).
                     */
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

                },


                /**
                 * init loading, check parameters
                 *
                 * @param {array} resources All the given resources
                 * @param {function} callback The main callback function
                 */
                init = function (resources, callback) {

                    // check load parameters
                    if (!resources || !utils.isArray(resources)) {
                        resources = [];
                    }
                    resources = groupResources(resources);
                    callback = checkCallback(mainCallback);

                    // call main load function to start the process
                    moduleLog('Load resource function called: resources count ' + resources.length);
                    load(resources, callback);

                };


            // start routine
            init(resources, mainCallback);


        },


        /**
         * load multiple resources
         *
         * @param {array} resources The array with resource objects
         * @param {function} mainCallback The callback after all resources are loaded
         */
        remove: function (resources, mainCallback) {

            // init local vars
            var self = this,
                storage = self.storage,

                /**
                 * main remove function
                 *
                 * @param {array} resources All the grouped resources
                 * @param {function} callback The main callback function
                 */
                remove = function (resources, callback) {

                    var length = resources.length,
                        i,
                        resource,
                        resourceRemovedCallback = function (current, url) {
                            moduleLog('Successfully removed resource: url ' + url);
                            if (current === length - 1) {
                                callback();
                            }
                        };

                    if (!length) {
                        callback();
                        return;
                    }

                    // toggle through resources
                    for (i = 0; i < length; i = i + 1) {

                        // remove each resource if it is a valid array entry
                        resource = resources[i];
                        if (resource) {
                            storage.remove(resource, resourceRemovedCallback(i, resource.url));
                        }

                    }

                },

                /**
                 * init remove, check parameters
                 *
                 * @param {array} resources All the given resources
                 * @param {function} callback The main callback function
                 */
                init = function (resources, callback) {

                    // check function parameters
                    if (!resources || !utils.isArray(resources)) {
                        resources = [];
                    }
                    callback = checkCallback(mainCallback);

                    // call main load function to start the process
                    moduleLog('Remove resource function called: resources count ' + resources.length);
                    remove(resources, callback);

                };


            // start routine
            init(resources, mainCallback);


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
            moduleLog('Cache initializing and checking for storage adapters');
            storage = new ns.cache.storage.controller(function (storage) {

                self.storage = storage;
                callback(storage);

            }, parameters);

        }
    };


    /**
     * make cache controller globally available under app namespace
     *
     * @export
     */
    ns.namespace('cache.controller', Controller);


}(window, document, window.getNs())); // immediatly invoke function

/*jslint unparam: true */
/*global window*/


/**
 * ns.cache.interface
 * 
 * @description
 * - interface functions for the cache files
 * - enable chaining (fluent interface) and make sure the cache with given parameters is just initialized once
 * 
 * @author Ulrich Merkel (hello@ulrichmerkel.com)
 * @version 0.1.2
 *
 * @namespace ns
 *
 * @changelog
 * - 0.1.2 improved namespacing
 * - 0.1.1 bug fixes for different cache parameters
 * - 0.1 basic functions and plugin structur
 *
 * @see
 * -
 * 
 * @bugs
 * -
 *
 * @todo
 * - api for storage params
 * - custom data as input parameter
 * - custom resource types
 *
 **/
(function (window, ns, undefined) {

    'use strict';

    /**
     * undefined is used here as the undefined global
     * variable in ECMAScript 3 and is mutable (i.e. it can
     * be changed by someone else). undefined isn't really
     * being passed in so we can ensure that its value is
     * truly undefined. In ES5, undefined can no longer be
     * modified.
     * 
     * ns is passed through as local
     * variables rather than as globals, because this (slightly)
     * quickens the resolution process and can be more
     * efficiently minified (especially when both are
     * regularly referenced in this module).
     */

    // module vars
    var Controller = ns.cache.controller,                                       // @type {object} Shortcut for cache controller public functions and vars
        helpers = ns.helpers,                                                   // @type {object} Shortcut for ns.helpers
        utils = helpers.utils,                                                  // @type {object} Shortcut for ns.helpers.utils
        isArray = utils.isArray,                                                // @type {function} Shortcut for isArray function
        jsonToString = utils.jsonToString,                                      // @type {function} Shortcut for jsonToString function
        Queue = helpers.queue,                                                  // @type {function} Shortcut for queuing functions
        cacheInterface,                                                         // @type {function} Interface function
        cacheControllers = [];                                                  // @type {array} Storage for cache controller instances


    /**
     * cache controller interface
     *
     * @constructor
     */
    function CacheControllerInterface(parameters) {

        var self = this;

        self.controller = null;
        self.storage = null;
        self.params = parameters;
        self.queue = new Queue();
        self.calls = 0;
    }


    /**
     * get cache controller interface
     *
     * check for already initialized cache controller (due to parameters) and
     * return it or new standard cache controller interface.
     *
     * @params {object} parameters The cache controller parameters
     */
    function getCacheControllerInterface(parameters) {

        // init local vars
        var result = null,
            length = cacheControllers.length,
            i;

        // check parameters
        if (!parameters) {
            parameters = {};
        }

        // toggle through already initialized cache controller interfaces
        for (i = 0; i < length; i = i + 1) {

            /**
             * convert objects to strings for easier comparison
             *
             * check if this parameter config object is already
             * stored in the interface cacheControllers array
             */
            if (jsonToString(cacheControllers[i].params) === jsonToString(parameters)) {
                result = cacheControllers[i];
            }

        }

        // init new interface if not already done
        if (!result) {
            result = new CacheControllerInterface(parameters);
            cacheControllers.push(result);
        }

        // return interface
        return result;
    }


    /**
     * cache controller interface
     *
     * @param {array} resources
     * @param {function} callback
     * @param {object} parameters
     */
    cacheInterface = function (resources, callback, parameters) {

        // get cache controller interface
        var controllerInterface = getCacheControllerInterface(parameters),

            /**
             * callback if cache controller interface is initialized
             *
             * @params see cacheInterface()
             */
            controllerInterfaceLoaded = function (queueResources, queueCallback, queueParameters) {

                var storage;

                if (isArray(queueResources)) {

                    // handle resource loading from cache
                    controllerInterface.controller.load(queueResources, queueCallback);

                } else if (queueResources === 'applicationCache') {

                    storage = controllerInterface.storage;

                    // handle application cache loading
                    if (storage && storage.appCacheAdapter) {
                        storage.appCacheAdapter.open(queueCallback, parameters);
                    } else {
                        queueCallback();
                    }

                }
            };


        // check if already initialized
        if (!controllerInterface.storage) {

            // add load function to queue
            controllerInterface.queue.add(function () {
                controllerInterfaceLoaded(resources, callback, parameters);
            });

            // increase the calls with the current parameters
            controllerInterface.calls = controllerInterface.calls + 1;

            // init controller just once
            if (controllerInterface.calls === 1) {

                // initialize new cache controller instance
                controllerInterface.controller = new Controller(function (storageResult) {

                    controllerInterface.storage = storageResult;

                    // if controller storage is loaded, start queue
                    if (!!controllerInterface.controller) {
                        controllerInterface.queue.flush(this);
                    } else {

                        // wait for cacheController.controller if the cache is disabled
                        controllerInterface.interval = window.setInterval(function () {
                            
                            if (!!controllerInterface.controller) {
                                window.clearInterval(controllerInterface.interval);
                                controllerInterface.queue.flush(this);
                            }

                        }, 25);

                    }

                }, parameters);

            }

        } else {

            // storage already initialized
            controllerInterfaceLoaded(resources, callback, parameters);

        }

        // return this for chaining
        return this;

    };


    /**
     * global export
     *
     * @export
     */
    ns.namespace('cache.load', cacheInterface);


}(window, window.getNs()));
