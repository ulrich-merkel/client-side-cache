/*global window*/

/**
 * ns.helpers.queue
 * 
 * @description
 * - handle async interfaces with queues
 * 
 * @author Ulrich Merkel, 2014
 * @version 0.1.3
 *
 * @namespace ns
 *
 * @changelog
 * - 0.1.3 rename instance vars for better compression
 * - 0.1.2 refactoring, examples added
 * - 0.1.1 improved namespacing
 * - 0.1 basic functions and plugin structur
 *
 * @see
 * - http://www.dustindiaz.com/async-method-queues/
 *
 * @requires
 * - ns.helpers.namespace
 *
 * @bugs
 * -
 *
 * @example
 *
 *      // init queue
 *      var queue = new app.helpers.queue();
 *
 *      // add functions to queue
 *      queue.add(function1);
 *      queue.add(function2);
 *      queue.add(function3);
 *      ....
 *
 *      // start queued functions
 *      queue.flush();
 *
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

        var self = this;

        // ensure Queue was called as a constructor
        if (!(self instanceof Queue)) {
            return new Queue();
        }

        // @type {array} [[]] Store your method callbacks
        self.m = [];

        // @type {object} [null] Keep a reference to your response
        self.r = null;

        // @type {boolean} [false] All queues start off unflushed, flushed state
        self.f = false;

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

            var self = this;

            // if the queue had been flushed, return immediately
            if (self.f) {
                fn(self.r);

            // otherwise push it on the queue
            } else {
                self.m.push(fn);
            }

        },


        /**
         * call all queued functions
         *
         * @param {} response
         */
        flush: function (response) {

            var self = this;

            // note: flush only ever happens once
            if (self.f) {
                return;
            }

            // store your response for subsequent calls after flush()
            self.r = response;

            // mark that it's been flushed
            self.f = true;

            // shift 'em out and call 'em back
            while (self.m[0]) {
                self.m.shift()(response);
            }

        }

    };


    /**
     * make helper available via ns.helpers.queue namespace
     *
     * @export
     */
    ns.ns('helpers.queue', Queue);


}(window.getNs()));  // immediatly invoke function
