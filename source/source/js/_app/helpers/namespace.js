/*global window*/

/**
 * app.helpers.namespace
 * 
 * @description
 * - init app namespaces and provide helper function
 * 
 * @author Ulrich Merkel, 2013
 * @version 0.1
 *
 * @namespace app
 * 
 * @changelog
 * - 0.1 basic functions and plugin structur
 * 
 */
(function (exports, app, undefined) {
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


    /**
     * helper function to defining package structur
     *
     * within the global app object the given namespaces will
     * be created as javascript objects
     *
     * @see
     * - http://de.slideshare.net/s.barysiuk/javascript-and-ui-architecture-best-practices-presentation
     *
     * @param {string} name The namespace string separated with dots (name.name.name)
     * @param {string|integer|object|function} value The optional value to set for the last item in given namespace
     *
     * @return {object|boolean} The last referenced namespace object or false if there is no name param
     */
    function namespace(name, value) {

        if (name) {

            // convert name param to string
            name = String(name);

            // init loop vars
            var names = name.split('.'),
                length = names.length,
                current = app,
                i;

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


    // init app namespaces
    app.namespace = namespace;

    /**
     * export app to globals
     *
     * @export
     */
    exports.app = app;


}(window, window.app || {}));
