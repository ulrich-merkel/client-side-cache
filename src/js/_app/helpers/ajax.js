/*jslint browser: true, devel: true, continue: true, regexp: true, plusplus: true, unparam: true  */
/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:true, curly:true, browser:true, indent:4, maxerr:50 */
/*global window, XMLHttpRequest, ActiveXObject*/

/**
 * ns.helpers.ajax
 *
 * @description
 * - provide utility functions for ajax
 *
 * @author Ulrich Merkel, 2014
 * @version 0.3.0
 * 
 * @namespace ns
 * 
 * @changelog
 * - 0.3.0 moved ajax functions to separate helper
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
 * - 0.1 basic functions and structure
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
 *      // make ajax request
 *      app.helpers.ajax.xhr('ajax.html', function (data) {
 *          if (data) {
 *              // ajax data is ready to use
 *          }
 *      });

 *      // for the complete list of available methods
 *      // please take a look at the @interface below
 *
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
     * regularly referenced in your plugin).
     *
     */


    /**
     * utility functions
     *
     * following the singleton design pattern
     *
     */
    var ajax = (function () {

        // init global vars
        var utils = ns.helpers.utils;                                                                       // @type {object} Shortcut for utils helpers


        /**
         * public functions
         *
         * @interface
         */
        return {

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
                var reqObject = ajax.getXhr(),
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

            }


        };

    }());


    /**
     * make the helper available for ns.helpers.ajax calls under
     * the ns.helpers namespace
     * 
     * @export
     */
    ns.namespace('helpers.ajax', ajax);


}(window, window.getNs())); // immediately invoke function
