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
 * @version 0.1.2
 *
 * @namespace ns
 *
 * @changelog
 * - 0.1.2 improved namespacing
 * - 0.1.1 bug fixes for different cache parameters
 * - 0.1 basic functions and plugin structur
 *
 * @see
 * -
 * 
 * @bugs
 * -
 *
 * @todo
 * - api for storage params
 * - custom data as input parameter
 * - custom resource types
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
     * ns is passed through as local
     * variables rather than as globals, because this (slightly)
     * quickens the resolution process and can be more
     * efficiently minified (especially when both are
     * regularly referenced in this module).
     */

    // module vars
    var Controller = ns.cache.controller,                                       // @type {object} Shortcut for cache controller public functions and vars
        helpers = ns.helpers,                                                   // @type {object} Shortcut for ns.helpers
        utils = helpers.utils,                                                  // @type {object} Shortcut for ns.helpers.utils
        isArray = utils.isArray,                                                // @type {function} Shortcut for isArray function
        jsonToString = utils.jsonToString,                                      // @type {function} Shortcut for jsonToString function
        Queue = helpers.queue,                                                  // @type {function} Shortcut for queuing functions
        cacheInterface,                                                         // @type {function} Interface function
        cacheControllers = [];                                                  // @type {array} Storage for cache controller instances


    /**
     * cache controller interface
     *
     * @constructor
     */
    function CacheControllerInterface(parameters) {

        var self = this;

        self.controller = null;
        self.storage = null;
        self.params = parameters;
        self.queue = new Queue();
        self.calls = 0;
    }


    /**
     * get cache controller interface
     *
     * check for already initialized cache controller (due to parameters) and
     * return it or new standard cache controller interface.
     *
     * @params {object} parameters The cache controller parameters
     */
    function getCacheControllerInterface(parameters) {

        // init local vars
        var result = null,
            length = cacheControllers.length,
            i;

        // check parameters
        if (!parameters) {
            parameters = {};
        }

        // toggle through already initialized cache controller interfaces
        for (i = 0; i < length; i = i + 1) {

            /**
             * convert objects to strings for easier comparison
             *
             * check if this parameter config object is already
             * stored in the interface cacheControllers array
             */
            if (jsonToString(cacheControllers[i].params) === jsonToString(parameters)) {
                result = cacheControllers[i];
            }

        }

        // init new interface if not already done
        if (!result) {
            result = new CacheControllerInterface(parameters);
            cacheControllers.push(result);
        }

        // return interface
        return result;
    }


    /**
     * cache controller interface
     *
     * @param {array} resources
     * @param {function} callback
     * @param {object} parameters
     */
    cacheInterface = function (resources, callback, parameters) {

        // get cache controller interface
        var controllerInterface = getCacheControllerInterface(parameters),

            /**
             * callback if cache controller interface is initialized
             *
             * @params see cacheInterface()
             */
            controllerInterfaceLoaded = function (queueResources, queueCallback, queueParameters) {

                var storage;

                if (isArray(queueResources)) {

                    // handle resource loading from cache
                    controllerInterface.controller.load(queueResources, queueCallback);

                } else if (queueResources === 'applicationCache') {

                    storage = controllerInterface.storage;

                    // handle application cache loading
                    if (storage && storage.appCacheAdapter) {
                        storage.appCacheAdapter.open(queueCallback, parameters);
                    } else {
                        queueCallback();
                    }

                }
            };


        // check if already initialized
        if (!controllerInterface.storage) {

            // add load function to queue
            controllerInterface.queue.add(function () {
                controllerInterfaceLoaded(resources, callback, parameters);
            });

            // increase the calls with the current parameters
            controllerInterface.calls = controllerInterface.calls + 1;

            // init controller just once
            if (controllerInterface.calls === 1) {

                // initialize new cache controller instance
                controllerInterface.controller = new Controller(function (storageResult) {

                    controllerInterface.storage = storageResult;

                    // if controller storage is loaded, start queue
                    if (!!controllerInterface.controller) {
                        controllerInterface.queue.flush(this);
                    } else {

                        // wait for cacheController.controller if the cache is disabled
                        controllerInterface.interval = window.setInterval(function () {
                            
                            if (!!controllerInterface.controller) {
                                window.clearInterval(controllerInterface.interval);
                                controllerInterface.queue.flush(this);
                            }

                        }, 25);

                    }

                }, parameters);

            }

        } else {

            // storage already initialized
            controllerInterfaceLoaded(resources, callback, parameters);

        }

        // return this for chaining
        return this;

    };


    /**
     * global export
     *
     * @export
     */
    ns.namespace('cache.load', cacheInterface);


}(window, window.getNs()));
