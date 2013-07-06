/*jslint unparam: true */

/*global window*/

/**
 * app.cache.init
 * 
 * @description
 * - initialize cache functions and resources
 * 
 * @author Ulrich Merkel (hello@ulrichmerkel.com)
 * @version 0.1
 *
 * @namespace app
 *
 * @changelog
 * - 0.1 basic functions and plugin structur
 *
 * @see
 * -
 * 
 * @bugs
 * - 
 *
 **/
(function (window, app, undefined) {
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

    // module vars
    var controller = app.cache.controller,                              // @type {object} Shortcut for cache controller public functions and vars
        helpers = app.helpers,                                          // @type {object} Shortcut for app.helpers
        isArray = app.helpers.utils.isArray,                            // @type {function} Shortcut for isArray function
        queue = new app.helpers.queue,                                  // @type {function} Shortcut for queuing functions
        calls = 0,                                                      // @type {integer} Counter for cacheLoad calls
        controllerInterface,                                            // @type {function} Interface function
        storage = null;                                                 // @type {object} Storage instance


    /**
     * cache controller interface
     *
     */
    controllerInterface = function (resources, callback, parameters) {

        var self = this,

            /**
             * call the according load function if the storage
             * is initialized
             */
            loadResources = function (queueResources, queueCallback, queueParameters) {

                if (isArray(queueResources)) {

                    // handle resource loading from cache
                    controller.load(queueResources, queueCallback);

                } else if (queueResources === 'applicationCache') {

                    // handle application cache loading
                    if (storage.appCacheAdapter) {
                        storage.appCacheAdapter.open(queueCallback);
                    } else {
                        queueCallback();
                    }

                }

            };


        // check for storage
        if (!storage) {

            // add load function to queue
            queue.add(function () {
                loadResources(resources, callback, parameters);
            });

            // just init storage once
            calls = calls + 1;
            if (calls === 1) {
                controller.init(function (storageResult) {

                    // if controller storage is loaded, start queue
                    storage = storageResult;
                    queue.flush(this);

                }, parameters); 
            }

        } else {

            // storage already initialized
            loadResources(resources, callback, parameters);

        }


        // return this for chaining
        return this;

    };


    /**
     * make cache controller interface globally available under app namespace
     *
     * @export
     */
    app.namespace('cacheLoad', controllerInterface);


}(window, window.app || {}));