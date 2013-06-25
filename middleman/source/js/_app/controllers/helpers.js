/*global window*/
/*global jQuery*/

/**
 * jQuery
 * 
 * @description
 * -
 * 
 * @author
 * @version 0.1
 * 
 * @requires
 * - 
 * 
 * @changelog
 * - 0.1 basic functions
 *
 * @bugs
 * - 
 * 
 */
(function (window, app, $, undefined) {
    'use strict';


    /**
     * undefined is used here as the undefined global
     * variable in ECMAScript 3 and is mutable (i.e. it can
     * be changed by someone else). undefined isn't really
     * being passed in so we can ensure that its value is
     * truly undefined. In ES5, undefined can no longer be
     * modified.
     *
     * window, app and jquery are passed through as local
     * variables rather than as globals, because this (slightly)
     * quickens the resolution process and can be more
     * efficiently minified (especially when both are
     * regularly referenced in this closure).
     *
     */


    /**
     * helper functions
     *
     * following the singleton design pattern
     *
     */
    var helpers = {


        /**
         * enable recieving events for objects
         * placeholder to be extended to object.fn
         */
        events: {

            // bind events to objects
            bind: function () {
                if (!this.o) {
                    this.o = $({});
                }
                this.o.bind.apply(this.o, arguments);
            },

            // trigger events to objects
            trigger: function () {
                if (!this.o) {
                    this.o = $({});
                }
                this.o.trigger.apply(this.o, arguments);
            }

        },


        /**
         * keeps track over the different view states and
         * make shure that there is only one main view object
         * at the same time
         *
         */
        stateMachine: function () {

            // init local vars
            var StateMachine = function () {};

            // shortcut for prototype and append bind and trigger events to statemachine object
            StateMachine.fn = StateMachine.prototype;
            $.extend(StateMachine.fn, helpers.events);

            /**
             * add state to statemachine and listen for changes
             *
             * @param {object} state The state object
             */
            StateMachine.fn.add = function (state) {

                if (!state) {
                    return;
                }

                this.bind('change', function (e, current) {
                    e.preventDefault();
                    if (state === current) {
                        state.activate();
                    } else {
                        state.deactivate();
                    }
                });

                state.setActive = $.proxy(function () {
                    this.trigger('change', state);
                }, this);

            };

            // return created statemachine
            return StateMachine.fn;

        }

    };


    /**
     * make helpers globally available under app namespace
     */
    app.controllers.helpers = helpers;


}(window, window.app || {}, window.jQuery));