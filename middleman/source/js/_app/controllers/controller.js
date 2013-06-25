/*global window*/
/*global jQuery*/

/**
 * jQuery controller
 * 
 * @description
 * - main page controller
 * 
 * @author
 * @version 0.2.1
 * 
 * @requires
 * - jQuery 1.8.2
 * 
 * @changelog
 * - 0.2.1 refactoring
 * - 0.2 new controller structur
 * - 0.1 basic functions and structur
 *
 * @bugs
 * - 
 * 
 */
(function (app, $) {
    'use strict';

    /**
     * undefined is used here as the undefined global
     * variable in ECMAScript 3 and is mutable (i.e. it can
     * be changed by someone else). undefined isn't really
     * being passed in so we can ensure that its value is
     * truly undefined. In ES5, undefined can no longer be
     * modified.
     * 
     * document and jquery are passed through as local
     * variables rather than as globals, because this (slightly)
     * quickens the resolution process and can be more
     * efficiently minified (especially when both are
     * regularly referenced in this module).
     */

    // init global vars
    var helpers = app.helpers,                                      // helpers {object} Shortcut for helper functions
        utils = helpers.utils,                                      // utils {object} Shortcut for utils functions
        eventSplitter = /^(\w+)\s*(.*)$/,                           // eventSplitter {regex} Placeholder regex to check for events
        controller = {};                                            // controller {object} Placeholder for controller api


    /**
     * proxy helper for calling functions to control scope
     *
     * @param {function} func The function to call
     * @return {function} The wrapped function
     */
    function $proxy(func) {
        return $.proxy(func, this);
    }


    /**
     * wrap elements to context
     *
     * @param {string} selector The dom element selector
     * @param {object} controller The current main controller
     * 
     * @return {object} The jquery wrapped dom element
     */
    function getJqueryElement(selector, controller) {
        return $(selector, controller.views[controller.activeView].el);
    }


    /**
     * set view elements
     *
     * @param {object} controller The current main controller
     */
    function setViewElements(controller) {

        // init local vars
        var activeViewName = controller.activeView,
            viewScript = controller.views.scripts[activeViewName],
            target,
            key;

        // toggle through module elements
        for (key in viewScript.elements) {
            if (viewScript.elements.hasOwnProperty(key)) {

                // set view element 
                target = viewScript.elements[key];
                viewScript.elements[target] = getJqueryElement(key, controller);

            }
        }
    }


    /**
     * delegate events to view objects
     *
     * @param {object} controller The current main controller
     */
    function delegateEvents(controller) {

        // init local vars
        var activeViewName = controller.activeView,
            viewScript = controller.views.scripts[activeViewName],
            namespace = '',
            key,
            methodName,
            method,
            match,
            eventName,
            event,
            selector;

        // check event namespace
        if (viewScript.ns) {
            namespace = '.' + viewScript.ns;
        }

        // toggle through event list
        for (key in viewScript.events) {

            if (viewScript.events.hasOwnProperty(key)) {

                // get event information
                methodName = viewScript.events[key];
                method = $proxy(viewScript[methodName]);

                match = key.match(eventSplitter);
                eventName = match[1];
                selector = match[2];
                event = eventName + namespace;

                // decission for bind or delegate
                if (selector === '') {
                    $(viewScript.sel).on(event, method);
                } else {
                    $(viewScript.sel).delegate(selector, event, method);
                }
            }

        }

    }


    /**
     * undelegate events
     *
     * @param {object} controller The current main controller
     */
    function unDelegateEvents(controller) {

        // init local vars
        var activeViewName = controller.activeView,
            viewScript = controller.views.script[activeViewName],
            namespace = '',
            key,
            methodName,
            method,
            match,
            eventName,
            event,
            selector;

        // check event namespace
        if (viewScript.ns) {
            namespace = '.' + viewScript.ns;
        }

        // toggle through event list
        for (key in viewScript.events) {

            if (viewScript.events.hasOwnProperty(key)) {

                // get event information
                methodName = viewScript.events[key];
                method     = $proxy(viewScript[methodName]);
                match      = key.match(eventSplitter);
                eventName  = match[1];
                selector = match[2];
                event = eventName + namespace;

                // decission for bind or delegate
                if (selector === '') {
                    $(viewScript.sel).off(event, method);
                } else {
                    $(viewScript.sel).undelegate(selector, event, method);
                }
            }

        }

    }



    /**
     * controllers controller
     *
     * implements the singleton design pattern
     *
     */
    controller = {

        // controller view vars
        views: null,
        activeView: null,

        // controller router vars
        router: null,
        routes: null,
        activeRoute: null,


        /**
         * init given view script
         *
         * @param {object} setup The setup parameters for the view script
         * @param {function} callback The optional callback function
         */
        initView: function (setup, callback) {

            // init local vars
            var self = this,
                name = setup.name || null,
                view;

            // check callback function
            callback = utils.callback(callback);

            // check if view script is already initialized
            if (name && !self.views.scripts[name].initialized) {

                // init view script and run init function
                self.views[name] = view = setup;
                self.activeView = name;

                if (view.elements) {
                    setViewElements(self);
                }

                if (view.events) {
                    delegateEvents(self);
                }

                if (view.init) {
                    view.init.apply();
                    view.initialized = true;
                }

                // callback result
                callback(view);

            } else if (name && self.views.scripts[name]) {

                // view already initialized
                callback(self.views.scripts[name]);

            } else {

                // there is no view script or name param
                callback();

            }

        },


        /**
         * destroy given view script
         *
         * @param {object} setup The setup parameters for the view script
         * @param {function} callback The optional callback function
         */
        destroyView: function (setup, callback) {

            // init local vars
            var self = this,
                name = setup.name || null,
                view;

            // check callback function
            callback = utils.callback(callback);

            // check if view script is initialized
            if (name && !!self.views.scripts[name].initialized) {

                // destroy view scrip
                view = self.views[name];
                self.activeView = name;

                if (view.elements) {
                    setViewElements(self);
                }

                if (view.events) {
                    unDelegateEvents(self);
                }

                self.activeView = null;
                delete view.initialized;

                // callback result
                callback(view);

            } else if (name && !self.views.scripts[name].initialized) {

                // view not initialized
                callback(self.views.scripts[name]);

            } else {

                // there is no view script or name param
                callback();

            }
        },


        /**
         * destroy given view script
         *
         * @param {object} setup The setup parameters for the view script
         * @param {function} callback The optional callback function
         *
         * @return {object|null} The view object if found
         */
        getView: function (name, callback) {

            // init local vars
            var self = this,
                view = self.views.scripts[name] || null;

            // check callback function
            callback = utils.callback(callback);

            // return result
            callback(view);
            return view;

        },


        /**
         * destroy given view script
         *
         * @param {function} callback The optional callback function
         * @param {object} parameters The setup parameters for the controller
         */
        init: function (callback, parameters) {

            // init local vars
            var self = this,
                states = app.controllers.states || null,
                routes = [],
                router = null,

                /**
                 * check for controller state
                 *
                 * @param {string} routeState The controller state route name
                 */
                checkStateCallback = function (routeState) {

                    // check for controller states
                    if (states) {

                        /**
                         * check for initialized state in statemachine to set given route state
                         * active or set default state active if available
                         */
                        if (routeState && states[routeState] && !!states[routeState].setActive) {
                            states[routeState].setActive();
                        } else if (states.defaults && !!states.defaults.setActive) {
                            states.defaults.setActive();
                        }

                        callback(self);

                    } else {
                        callback(self);
                    }

                },


                /**
                 * check for router
                 *
                 * @param {object} router The controller router object
                 */
                checkRouterCallback = function (router) {

                    var routeState = false;

                    if (router) {
                        self.activeRoute = router.getRoute();

                        if (self.activeRoute) {
                            routeState = self.activeRoute.content.state || 'defaults';
                        }

                        checkStateCallback(routeState);
                    } else {
                        checkStateCallback();
                    }

                };

            // check callback function
            callback = utils.callback(callback);

            // init view objects
            if (!!app.views) {
                self.views = app.views;
            }

            // check for router
            if (null === self.router && !!app.controllers.router) {

                // get routes config
                if (app.models.routes) {
                    routes = app.models.routes;
                }

                // init router
                router = new app.controllers.router(routes, function (result) {
                    self.router = result;
                    checkRouterCallback(result);
                });

            } else {
                checkRouterCallback();
            }

        }

    };


    /**
     * make controllers controller globally available under app namespace
     */
    app.controllers.controller = controller;


}(window.app || {}, window.jQuery));