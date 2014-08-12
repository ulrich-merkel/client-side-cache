/*jslint browser: true, devel: true, continue: true, regexp: true, plusplus: true, unparam: true  */
/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:true, curly:true, browser:true, indent:4, maxerr:50 */
/*global window, document*/

/**
 * ns.helpers.utils
 *
 * @description
 * - provide utility functions
 *
 * @author Ulrich Merkel, 2014
 * @version 0.3.1
 * 
 * @namespace ns
 * 
 * @changelog
 * - 0.3.1 isFunction improved
 * - 0.3.0 moved some functions to own helper files, to keep the structure clear
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
 *
 * @bugs
 * -
 *
 * @example

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
        var emptyArray = [];                    // @type {array} Placeholder for array testing


        /**
         * public functions
         *
         * @interface
         */
        return {

            /**
             * check if value is string
             *
             * @param {string} string The value to check
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

                var result = false;

                if (Object.prototype.toString) {

                    /**
                     * @ see Secrets of the JavaScript Ninja, J.Resig (Page. 132)
                     */
                    result = Object.prototype.toString.call(fn) === '[object Function]';

                } else {

                    result = typeof fn === 'function' || fn instanceof Function;

                }

                return result;
            },


            /**
             * check if value is array
             *
             * following the lazy loading design pattern, the isArray function will be
             * overridden with the correct browser implementation the first time it will be
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
                    // Duck-Typing arrays (by Douglas Crockford), assume sort function is only available for arrays
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
             * overridden with the correct browser implementation the first time it will be
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

                // create test link element
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


}(window, document, window.getNs())); // immediately invoke function
