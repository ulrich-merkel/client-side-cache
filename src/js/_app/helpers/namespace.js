/*global window*/

/**
 * app.helpers.namespace
 * 
 * @description
 * - init app namespaces and provide helper function
 * 
 * @author Ulrich Merkel, 2013
 * @version 0.1.3
 *
 * @namespace app
 * 
 * @changelog
 * - 0.1.3 examples added
 * - 0.1.2 createNamespace and getNamespace added
 * - 0.1.1 refactoring
 * - 0.1 basic functions and plugin structur
 *
 * @see
 * - nicolas c. zakas - maintainable javascript, writing readable code (o'reilly s.72)
 * - http://de.slideshare.net/s.barysiuk/javascript-and-ui-architecture-best-practices-presentation
 *
 * @requires
 * - 
 *
 * @bugs
 * -
 *
 * @example
 *
 *      // get current namespace object
 *      var app = window.getNamespace();
 *      var app = window.getNs();
 *
 *      // creates both app.items and app.items.subitem - neither exists before hand, so each is created from scratch.
 *      app.namespace("items.subitem");
 *
 *      // leaves app.items alone and adds entry to it. this leaves app.items.subitem intact.
 *      app.namespace("items.entry");
 *
 *      // you can also start adding new properties right off the method call
 *      app.namespace("items.new", {});
 *      app.namespace("items").new = {};
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
     * @param {string} name The namespace string separated with dots (name.name.name)
     * @param {(string|integer|object|function)} value The optional value to set for the last item in given namespace
     *
     * @return {(object|boolean)} The last referenced namespace object or false if there is no correct name param
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

                // if this namespace doesn't exist, create it with empty object
                if (!current[names[i]]) {
                    current[names[i]] = {};
                }
                // set value if set and last namespace item reached
                if (i === length - 1 && value !== undefined) {
                    current[names[i]] = value;
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
    ns.namespace = ns.ns = namespace;


    /**
     * export app to globals
     *
     * @export
     */
    window[namespaceName] = ns;
    window.getNamespace = window.getNs = getNamespace;


}(window));
