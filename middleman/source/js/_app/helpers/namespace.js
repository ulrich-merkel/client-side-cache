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
     * @see http://de.slideshare.net/s.barysiuk/javascript-and-ui-architecture-best-practices-presentation
     *
     * @param {string} name The namespace string separated with dots (name.name.name)
     *
     * @return {boolean} The success of this function
     */
    function namespace(name) {
        if (name) {

            // init loop vars
            var names = name.split('.'),
                current = app,
                i;

            // toggle through names array
            for (i in names) {

                // if this namespace doesn't exist, create it
                if (!current[names[i]]) {
                    current[names[i]] = {};
                }

                // set current to checked namespace for the next loop
                current = current[names[i]];

            }

            return true;

        }

        return false;

    };  


    // init app namespaces
    namespace('cache.storage.adapter');
    namespace('helpers');
    namespace('controllers');
    namespace('models');
    namespace('views');


    // export app to globals
    exports.app = app;


}(window, window.app || {}));





