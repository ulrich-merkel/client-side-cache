/*global window*/

/**
 * ns.helpers.queue
 * 
 * @description
 * - handle async interfaces with queues
 * 
 * @author Ulrich Merkel, 2013
 * @version 0.1.2
 *
 * @namespace ns
 *
 * @changelog
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

        /**
         * @type {array} [this.methods=[]] Store your callbacks
         */
        self.methods = [];

        /**
         * @type {object} [this.response=null] Keep a reference to your response
         */
        self.response = null;

        /**
         * @type {boolean} [this.flushed=false] All queues start off unflushed
         */
        self.flushed = false;

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
            if (self.flushed) {
                fn(self.response);

            // otherwise push it on the queue
            } else {
                self.methods.push(fn);
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
            if (self.flushed) {
                return;
            }

            // store your response for subsequent calls after flush()
            self.response = response;

            // mark that it's been flushed
            self.flushed = true;

            // shift 'em out and call 'em back
            while (self.methods[0]) {
                self.methods.shift()(response);
            }

        }

    };


    /**
     * make helper available via ns.helpers.queue namespace
     *
     * @export
     */
    ns.namespace('helpers.queue', Queue);


}(window.getNs()));  // immediatly invoke function
