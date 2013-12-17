/*global window*/

/**
 * ns.helpers.error
 * 
 * @description
 * - catch javascript errors and log message
 * 
 * @author Ulrich Merkel, 2013
 * @version 0.1
 *
 * @namespace ns
 * 
 * @changelog
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
     * export to globals
     *
     * @export
     */
    window.onerror = function (msg, url, line) {

        // log error message
        ns.helpers.utils.warn(msg + "\nurl: " + url + "\nline: " + line);

        // return true keeps the browser running instead of stopping execution
        return true;
    };

}(window, window.getNamespace()));
