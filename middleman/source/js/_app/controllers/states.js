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
(function (window, app, $) {
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

    var states,
        stateMachine,
        controllers = app.controllers;

    /**
     * helper functions
     *
     * following the singleton design pattern
     *
     */
    states = {

        index: {
            activate: function () {
                var view = app.views.scripts.index;
                if (view && !view.initialized) {
                    controllers.controller.initView(view);
                }
                //console.log("activate index");
            },
            deactivate: function () {
                var view = app.views.scripts.index;
                if (view && !!view.initialized) {
                    controllers.controller.destroyView(view);
                }
                //console.log("deactivate index");
            }
        },

        page1: {
            activate: function () {
                var view = app.views.scripts.page1;
                if (view && !view.initialized) {
                    controllers.controller.initView(view);
                }
                //console.log("activate page1");
            },
            deactivate: function () {
                var view = app.views.scripts.page1;
                if (view && !!view.initialized) {
                    controllers.controller.destroyView(view);
                }
                //console.log("deactivate page1");
            }
        },

        page2: {
            activate: function () {
                var view = app.views.scripts.page2;
                if (view && !view.initialized) {
                    controllers.controller.initView(view);
                }
                //console.log("activate page2");
            },
            deactivate: function () {
                var view = app.views.scripts.page2;
                if (view && !!view.initialized) {
                    controllers.controller.destroyView(view);
                }
                //console.log("deactivate page2");
            }
        },

        defaults: {
            activate: function () {
                var view = app.views.scripts.defaults;
                if (view && !view.initialized) {
                    controllers.controller.initView(view);
                }
                //console.log("activate defaults");
            },
            deactivate: function () {
                var view = app.views.scripts.defaults;
                if (view && !!view.initialized) {
                    controllers.controller.destroyView(view);
                }
                //console.log("deactivate defaults");
            }
        }

    };


    // add controller states to state machine if available
    if (!!app.controllers.helpers && !!app.controllers.helpers.stateMachine) {
        stateMachine = new app.controllers.helpers.stateMachine();

        stateMachine.add(states.index);
        stateMachine.add(states.page1);
        stateMachine.add(states.page2);
        stateMachine.add(states.defaults);

    }


    /**
     * make helpers globally available under app namespace
     */
    app.controllers.states = states;


}(window, window.app || {}, window.jQuery));