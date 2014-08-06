/*jslint browser: true, devel: true, continue: true, regexp: true, plusplus: true, unparam: true  */
/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:true, curly:true, browser:true, indent:4, maxerr:50 */
/*global window, document*/

/**
 * ns.helpers.events
 *
 * @description
 * - provide utility functions for events
 *
 * @author Ulrich Merkel, 2014
 * @version 0.3.0
 * 
 * @namespace ns
 * 
 * @changelog
 * - 0.3.0 moved events to separate helper
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
 *
 *      // add event handler
 *      app.helpers.events.on(window, 'scroll', function () {
 *          // do something while window scrolling
 *      });
 *
 *      // add event handler
 *      app.helpers.events.on(window, 'load', function () {
 *          // do something when window fires load event
 *      });
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
    var events = (function () {

        /**
         * public functions
         *
         * @interface
         */
        return {

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
                    events.on = function (target, eventType, handler) {
                        target.addEventListener(eventType, handler, false);
                    };
                } else if (typeof document.attachEvent === 'function') {
                    // ie event
                    events.on = function (target, eventType, handler) {
                        target.attachEvent('on' + eventType, handler);
                    };
                } else {
                    // older browers
                    events.on = function (target, eventType, handler) {
                        target['on' + eventType] = handler;
                    };
                }

                // call the new function
                events.on(target, eventType, handler);

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
                    events.off = function (target, eventType, handler) {
                        target.removeEventListener(eventType, handler, false);
                    };
                } else if (typeof document.detachEvent === 'function') {
                    // ie event
                    events.off = function (target, eventType, handler) {
                        target.detachEvent('on' + eventType, handler);
                    };
                } else {
                    // older browsers
                    events.off = function (target, eventType) {
                        target['on' + eventType] = null;
                    };
                }

                // call the new function
                events.off(target, eventType, handler);

            }

        };

    }());


    /**
     * make the helper available for ns.helpers.events calls under
     * the ns.helpers namespace
     * 
     * @export
     */
    ns.namespace('helpers.events', events);


}(window, document, window.getNs())); // immediately invoke function
