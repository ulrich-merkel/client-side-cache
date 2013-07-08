/*global window*/

/**
 * app.helpers.queue
 * 
 * @description
 * - 
 * 
 * @author Ulrich Merkel, 2013
 * @version 0.1
 *
 * @namespace app
 *
 * @see
 * - http://www.dustindiaz.com/async-method-queues/
 
 * @changelog
 * - 0.1 basic functions and plugin structur
 * 
 */
(function (app, undefined) {
    'use strict';

    /**
     * undefined is used here as the undefined global
     * variable in ECMAScript 3 and is mutable (i.e. it can
     * be changed by someone else). undefined isn't really
     * being passed in so we can ensure that its value is
     * truly undefined. In ES5, undefined can no longer be
     * modified.
     * 
     * app is passed through as local
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

        /**
         * @type {array} [this.methods=[]] Store your callbacks
         */
        this.methods = [];

        /**
         * @type {object} [this.response=null] Keep a reference to your response
         */
        this.response = null;

        /**
         * @type {boolean} [this.flushed=false] All queues start off unflushed
         */
        this.flushed = false;

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

            // if the queue had been flushed, return immediately
            if (this.flushed) {
                fn(this.response);

            // otherwise push it on the queue
            } else {
                this.methods.push(fn);
            }

        },


        /**
         * call all queued functions
         *
         * @param {} response
         */
        flush: function (response) {

            // note: flush only ever happens once
            if (this.flushed) {
                return;
            }

            // store your response for subsequent calls after flush()
            this.response = response;

            // mark that it's been flushed
            this.flushed = true;

            // shift 'em out and call 'em back
            while (this.methods[0]) {
                this.methods.shift()(response);
            }

        }

    };


    /**
     * make helper available via app.helpers.queue namespace
     *
     * @export
     */
    app.namespace('helpers.queue', Queue);


}(window.app || {}));