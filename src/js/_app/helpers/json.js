/*jslint browser: true, devel: true, continue: true, regexp: true, plusplus: true, unparam: true  */
/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:true, curly:true, browser:true, indent:4, maxerr:50 */
/*global window, document*/

/**
 * ns.helpers.json
 *
 * @description
 * - provide utility functions for json
 *
 * @author Ulrich Merkel, 2014
 * @version 0.3.0
 * 
 * @namespace ns
 * 
 * @changelog
 * - 0.3.0 moved json functions to separate helper
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
 * - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/
 *
 * @requires
 * - ns.helpers.namespace
 *
 * @bugs
 * -
 *
 * @example
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
    var json = (function () {

        var jsonObject = null,                                                                              // @type {object} The current json object
            windowJsonObject = window.JSON;                                                                 // @type {object} The window json object

        /**
         * public functions
         *
         * @interface
         */
        return {


            /**
             * get json object
             *
             * @return {object} The window.JSON object or null
             */
            getJson: function () {

                // check for json support
                if (null === jsonObject) {
                    if (windowJsonObject && windowJsonObject.stringify) {
                        jsonObject = windowJsonObject;
                    }
                }

                //return the json object
                return jsonObject;

            },


            /**
             * convert json object to string
             *
             * @param {object} object The object to be parsed
             * @param {array|function} replacer The optional replacer
             * @param {object} space The optional space for pretty print
             * 
             * @return {string} The converted string
             */
            jsonToString: function (object, replacer, space) {

                // init local vars
                var result = false;

                // check for json object
                if (null === jsonObject) {
                    jsonObject = json.getJson();
                }

                // convert object to string
                if (jsonObject && jsonObject.stringify && object !== undefined) {

                    /**
                     * Syntax JSON.stringify
                     *
                     * object (required)
                     * - The value to convert to a JSON string
                     *
                     * replacer (optional)
                     * - If a function, transforms values and properties encountered while stringifying
                     * - if an array, specifies the set of properties included in objects in the final string.
                     * - @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_native_JSON#The_replacer_parameter
                     *
                     * space (optional)
                     * - Causes the resulting string to be pretty-printed.
                     *
                     */

                    result = jsonObject.stringify(object, replacer, space);
                }

                //return the json string
                return result;

            },


            /**
             * convert string into json object
             *
             * @param {string} string The string to be parsed
             * @param {function} reviver The optional reviver function
             * 
             * @return {object} The converted object
             */
            jsonToObject: function (string, reviver) {

                // init local vars
                var result = false;

                // check for json object
                if (null === jsonObject) {
                    jsonObject = json.getJson();
                }

                // convert object to string
                if (jsonObject && jsonObject.parse && string !== undefined) {

                    /**
                     * Syntax JSON.parse
                     *
                     * string (required)
                     * - The string to parse as JSON. See the JSON object for a description of JSON syntax.
                     *
                     * reviver (optional)
                     * - If a function, prescribes how the value originally produced by parsing is transformed, before being returned.
                     * - @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
                     *
                     * Support: Android 2.3
                     * - Additional String parsing is added as workaround failure to string-cast null input
                     * - @see jQuery.parseJSON (v.1.10)
                     *
                     */

                    result = jsonObject.parse(String(string), reviver);
                }

                //return the json object
                return result;
            }


        };

    }());


    /**
     * make the helper available for ns.helpers.json calls under
     * the ns.helpers namespace
     * 
     * @export
     */
    ns.namespace('helpers.json', json);


}(window, document, window.getNs())); // immediately invoke function
