/*jslint unparam: true */
/*global window*/


/**
 * ns.cache.interface
 * 
 * @description
 * - interface functions for the cache files
 * - enable chaining (fluent interface) and make sure the cache with given parameters is just initialized once
 * 
 * @author Ulrich Merkel (hello@ulrichmerkel.com)
 * @version 0.2
 *
 * @namespace ns
 *
 * @changelog
 * - 0.2 complete rewrite, remove interface added, examples added
 * - 0.1.3 refactoring
 * - 0.1.2 improved namespacing
 * - 0.1.1 bug fixes for different cache parameters
 * - 0.1 basic functions and plugin structur
 *
 * @see
 * -
 * 
 * * @requires
 * - ns.helpers.namespace
 * - ns.helpers.utils
 * - ns.helpers.queue
 * 
 * @bugs
 * - tbd new interface api
 *      load([], {
 *          adapters: {},
 *          resources: {},
 *          success: function () {},
 *          error: function () {},
 *      });
 *
 *      {url: baseUrl + "js/lib.js", type: "js", success: function () {}, error: function () {} }
 *
 *      or done/fail
 *      or loaded with callback data success
 * 
 * @example
 *
 *        // load data from cache
 *        ns.cache.load([
 *            {url: baseUrl + "css/app.css", type: "css"},
 *            {url: baseUrl + "js/lib.js", type: "js", loaded: function () {
 *              // lib.js loaded
 *            }},
 *            {url: baseUrl + "js/app.js", type: "js", group: 1}
 *        ], function () {
 *            // page css and js files loaded
 *        });
 *
 *        // remove data from cache
 *        ns.cache.remove([
 *            {url: baseUrl + "css/app.css", type: "css"},
 *            {url: baseUrl + "js/lib.js", type: "js"}
 *        ], function () {
 *            // page css and js files removed
 *        });
 *
 *        // set cache defaults
 *        ns.cache.setup({
 *            adapters: {
 *                // set preferred adapter type
 *                preferredType: 'webStorage'
 *            },
 *            resources: {
 *                // set resource defaults
 *                defaults: {
 *                    lifetime: -1
 *                }
 *            }
 *        });
 *
 *
 **/
(function (window, ns, undefined) {

    'use strict';

    /**
     * undefined is used here as the undefined global
     * variable in ECMAScript 3 and is mutable (i.e. it can
     * be changed by someone else). undefined isn't really
     * being passed in so we can ensure that its value is
     * truly undefined. In ES5, undefined can no longer be
     * modified.
     * 
     * window and ns is passed through as local
     * variables rather than as globals, because this (slightly)
     * quickens the resolution process and can be more
     * efficiently minified (especially when both are
     * regularly referenced in this module).
     */

    // module vars
    var cacheInterface,                                             // @type {function} Storage var for cache interface
        interfaces = [],                                            // @type {array} Storage for cache controller instances
        helpers = ns.helpers,                                       // @type {object} Shortcut for ns.helpers
        Queue = helpers.queue,                                      // @type {function} Shortcut for queuing functions
        utils = helpers.utils,                                      // @type {object} Shortcut for ns.helpers.utils
        log = utils.log,                                            // @type {function} Shortcut for utils.log function
        isArray = utils.isArray,                                    // @type {function} Shortcut for isArray function
        jsonToString = utils.jsonToString,                          // @type {function} Shortcut for jsonToString function
        checkCallback = utils.callback,                             // @type {function} Shortcut for utils.callback function
        interval = 25,                                              // @type {integer} Milliseconds for interval controller check
        timeout = 5000,                                             // @type {integer} Maximum time in milliseconds after we will give up checking
        setupParameters = {};                                       // @type {object} Store parameters from setup call

    /**
     * -------------------------------------------
     * general helper functions
     * -------------------------------------------
     */

    /* start-dev-block */

    /**
     * console log helper
     *
     * @param {string} message The message to log
     */
    function interfaceLog(message) {
        log('[cache interface] ' + message);
    }

    /* end-dev-block */


    /**
     * cache controller interface
     *
     * instance to keep track of currently called parameters and to
     * initialize different controllers when these params changed
     *
     * @constructor
     */
    function Interface(parameters) {

        var self = this;

        self.controller = null;
        self.storage = null;
        self.params = parameters;
        self.queue = new Queue();
        self.calls = 0;
        self.interval = 0;
        self.timeout = 0;

    }


    /**
     * get cache controller interface
     *
     * check for already initialized cache controller (due to parameters) and
     * return it or initialize new standard cache controller interface.
     *
     * @params {object} parameters The cache controller parameters
     */
    function getInterface(parameters) {

        // init local vars
        var currentInterface = null,
            length = interfaces.length,
            i;

        // check parameters
        if (!parameters) {
            parameters = setupParameters;
        }

        // toggle through already initialized cache controller interfaces
        for (i = 0; i < length; i = i + 1) {

            /**
             * convert objects to strings for easier comparison
             *
             * check if this parameter config object is already
             * stored in the interface array
             */
            if (jsonToString(interfaces[i].params) === jsonToString(parameters)) {
                currentInterface = interfaces[i];
            }

        }

        // init new interface if not already done
        if (!currentInterface) {
            currentInterface = new Interface(parameters);
            interfaces.push(currentInterface);
        }

        // return interface
        return currentInterface;

    }


    /**
     * check for existing interface
     *
     * try to find interface or queue load calls until
     * current controller (via params) is available
     *
     * @param {object} parameters
     * @param {function} success
     * @param {function} error
     * 
     */
    function checkInterface(parameters, success, error) {

        // init local vars
        var currentInterface = getInterface(parameters),
            currentInterfaceInterval,
            currentInterfaceTimeout,

            /**
             * wait for loaded controller via timeout
             * callback when cache controller and storage
             * isn't ready yet
             */
            startInterval = function () {

                // faster access
                currentInterfaceInterval = currentInterface.interval;

                window.clearInterval(currentInterfaceInterval);
                currentInterfaceInterval = window.setInterval(function () {

                    // save vars for faster access
                    currentInterface.timeout = currentInterfaceTimeout = currentInterface.timeout + interval;

                    // if interface is completly loaded, start queue
                    if (currentInterface.controller && currentInterface.storage) {
                        window.clearInterval(currentInterfaceInterval);
                        currentInterface.queue.flush();
                    }

                    // just wait for maximum time, otherwise give up
                    if (currentInterfaceTimeout > timeout) {
                        window.clearInterval(currentInterfaceInterval);

                        /* start-dev-block */
                        interfaceLog('Timeout reached while waiting for cache controller!!!');
                        /* end-dev-block */

                        error();
                    }

                }, interval);

            };

        // handle system errors
        if (!currentInterface) {

            /* start-dev-block */
            interfaceLog('Whether finding nor initializing a cache interface is possible!!!');
            /* end-dev-block */

            error();
            return;
        }

        // wait for intializing
        if (!currentInterface.storage) {

            // add current load/remove call to queue
            currentInterface.queue.add(function () {
                success(currentInterface);
            });

            // increase interface load calls
            currentInterface.calls = currentInterface.calls + 1;

            // init interface just once
            if (currentInterface.calls === 1) {

                // init new controller with params
                currentInterface.controller = new ns.cache.controller(function (storage) {

                    currentInterface.storage = storage;

                    if (!!currentInterface.controller) {
                        // if interface is loaded, start queue
                        currentInterface.queue.flush();
                    } else {
                        // wait for asynchronous initializing
                        startInterval();
                    }
                //}, setupParameters);
                }, parameters);

            } else {

                // wait for asynchronous initializing
                startInterval();

            }

        } else {

            // interface is already available
            success(currentInterface);

        }

    }

    /**
     * defining interface functions
     *
     */
    cacheInterface = (function () {


        /**
         * load interface
         *
         * @param {array} resources The required array with resource objects
         * @param {function} callback The optional callback function
         * @param {object} parameters The optional parameters for the init function
         */
        function load(resources, callback, parameters) {

            // check callback function
            callback = checkCallback(callback);

            checkInterface(parameters, function (currentInterface) {

                if (isArray(resources)) {

                    // handle resource loading from cache
                    currentInterface.controller.load(resources, callback);

                } else if (resources === 'applicationCache') {

                    var storage = currentInterface.storage;

                    // handle application cache loading
                    if (storage && storage.appCacheAdapter && !storage.appCacheAdapter.opened) {
                        storage.appCacheAdapter.open(callback, parameters);
                    } else {
                        callback(false);
                    }

                } else {
                    callback(false);
                }

            }, function () {

                /* start-dev-block */
                interfaceLog('Get interface failed!');
                /* end-dev-block */

                callback(false);

            });

            // return this for chaining
            return this;

        }


        /**
         * remove interface
         *
         * @param {array} resources The required array with resource objects
         * @param {function} callback The optional callback function
         * @param {object} parameters The optional parameters for the init function
         */
        function remove(resources, callback, parameters) {

            // check callback function
            callback = checkCallback(callback);

            checkInterface(parameters, function (currentInterface) {

                if (isArray(resources)) {

                    // handle resource removing from cache
                    currentInterface.controller.remove(resources, callback);

                } else {
                    callback(false);
                }

            }, function () {

                /* start-dev-block */
                interfaceLog('Get interface failed!');
                /* end-dev-block */

                callback(false);

            });

            // return this for chaining
            return this;

        }

        /**
         * setup defaults for interface
         *
         * @param {object} parameters The optional parameters for the init function
         *
         * @return {this} Return instance for chaining
         */
        function setup(parameters) {

            if (parameters) {
                setupParameters = parameters;
            }

            // return this for chaining
            return this;
        }


        /**
         * publish private interface functions
         * 
         * @interface
         */
        return {
            load: load,
            remove: remove,
            setup: setup
        };


    }());


    /**
     * global export
     *
     * @export
     */
    ns.namespace('cache.load', cacheInterface.load);
    ns.namespace('cache.remove', cacheInterface.remove);
    ns.namespace('cache.setup', cacheInterface.setup);


}(window, window.getNs()));
