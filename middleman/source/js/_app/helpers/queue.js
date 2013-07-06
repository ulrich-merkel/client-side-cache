/*global window*/
/*global document*/
/*global navigator*/

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
(function (window, navigator, app, undefined) {
    'use strict';

    /**
     * undefined is used here as the undefined global
     * variable in ECMAScript 3 and is mutable (i.e. it can
     * be changed by someone else). undefined isn't really
     * being passed in so we can ensure that its value is
     * truly undefined. In ES5, undefined can no longer be
     * modified.
     * 
     * window, navigator and app are passed through as local
     * variables rather than as globals, because this (slightly)
     * quickens the resolution process and can be more
     * efficiently minified (especially when both are
     * regularly referenced in this module).
     */


    function Queue() {

        // store your callbacks
        this._methods = [];

        // keep a reference to your response
        this.response = null;

        // all queues start off unflushed
        this._flushed = false;

    }


    Queue.prototype = {

        // adds callbacks to your queue

        add: function (fn) {

            // if the queue had been flushed, return immediately
            if (this._flushed) {
                fn(this.response);

            // otherwise push it on the queue
            } else {
                this._methods.push(fn);
            }

        },



        flush: function(response) {

            // note: flush only ever happens once
            if (this._flushed) {
                return;
            }

            // store your response for subsequent calls after flush()
            this.response = response;

            // mark that it's been flushed
            this._flushed = true;

            // shift 'em out and call 'em back
            while (this._methods[0]) {
                this._methods.shift()(response);
            }

        }

    };

    /**
     * make helper available via app.helpers.client namespace
     *
     * @export
     */
    app.namespace('helpers.queue', Queue);


}(window, navigator, window.app || {}));