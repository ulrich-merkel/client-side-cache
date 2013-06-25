/*jslint unparam: true */

/*global window*/
/*global document*/

/**
 * app.cache.controller
 * 
 * @description
 * - main functions/controller for handling client-side cache
 * - connect to storage controller and read/write data or get data via xhr
 * - handle logic to check for outdated data
 *
 * - tested and supported browsers for storing data client-side:
 * - Internet explorer 8.0 +
 * - Firefox 19.0 +
 * - Google Crome 21.0 +
 * - Safari 6.0 +
 * - Opera 12.5 +
 * - Camino 2.1.2 +
 * - Fake 1.8 +
 * - Maxthon 4.0.5 +
 * - Omni Web 5.11 +
 * - Seamonkey 2.15 +
 * - Stainless 0.8 +
 * - Sunrise 2.2 +
 *
 * 
 * @author Ulrich Merkel (hello@ulrichmerkel.com)
 * @version 0.1.3
 *
 * @namespace app
 *
 * @changelog
 * - 0.1.3 bug fix check for outdated data
 * - 0.1.2 resource attrib check on loadResource function added
 * - 0.1.1 bug fix load resource (item.lifetime is set check added)
 * - 0.1 basic functions and plugin structur
 *
 * @see
 * - http://www.winktoolkit.org/, http://www.winktoolkit.org/documentation/symbols/wink.cache.html
 *
 * 
 * 
 * @bugs
 * - 
 *
 **/
(function (window, document, app, undefined) {
    'use strict';

    /**
     * undefined is used here as the undefined global
     * variable in ECMAScript 3 and is mutable (i.e. it can
     * be changed by someone else). undefined isn't really
     * being passed in so we can ensure that its value is
     * truly undefined. In ES5, undefined can no longer be
     * modified.
     * 
     * document and app are passed through as local
     * variables rather than as globals, because this (slightly)
     * quickens the resolution process and can be more
     * efficiently minified (especially when both are
     * regularly referenced in this module).
     */

    // module vars
    var controllerType = 'cache',                               // controllerType {string} The controller type string
        helpers = app.helpers,                                  // helpers {object} Shortcut for helper functions
        append = helpers.append,                                // append {function} Shortcut for append helper
        utils = helpers.utils,                                  // utils {object} Shortcut for utils functions
        log = utils.log,                                        // log {function} Shortcut for utils.log function
        checkCallback = utils.callback,                         // checkCallback {function} Shortcut for utils.callback function
        controller = {};                                        // controller {object} Cache controller public functions and vars


    /**
     * cache controller
     *
     * implements the singleton design pattern
     *
     */
    controller = {

        /**
         * {object} The storage controller instance
         */
        storage: null,


        /**
         * load multiple resources
         *
         * @param {array} resources The array with resource objects
         * @param {function} mainCallback The callback after all resources are loaded
         */
        load: function (resources, mainCallback) {

            // declare vars and functions
            var self = this,
                now = new Date().getTime(),


                /**
                 * functions are also saved in local vars rather than
                 * saving them as instance functions (via this) for
                 * faster access and better compression results
                 */

                /**
                 * queue manager for loading all groups of resources after each other
                 *
                 * @return {object} Helper functions to handle callbacks after load
                 */
                loadResourceGroupQueue = (function () {

                    // init local vars
                    var queueSize = 0,
                        queueLoaded = 0,
                        queueCallback = null;

                    return {

                        /**
                         * init group to queue
                         * 
                         * @param {integer} size The length of the group
                         * @param {function} callback The callback after the group is loaded
                         */
                        init: function (size, callback) {
                            queueCallback = callback;
                            queueSize = size;
                            queueLoaded = 0;
                        },

                        /**
                         * mark resource as loaded
                         * if all group resources have been loaded, invoke callback
                         */
                        loaded: function () {
                            queueLoaded = queueLoaded + 1;
                            if (queueLoaded === queueSize) {
                                queueCallback();
                            }
                        }
                    };

                }()), // immediatly invoke function to make init and loaded accessable


                /**
                 * append file to dom
                 * helper function to switch append function according to file type
                 *
                 * @param {object} resource The resource
                 * @param {string} data The resource data string
                 */
                appendFile = function (resource, data) {

                    // init local vars
                    var url = resource.url,
                        callback = function () {
                            loadResourceGroupQueue.loaded();
                        },
                        node = resource.node || null;

                    // load file according to type
                    switch (resource.type) {
                    case 'js':
                        append.appendJs(url, data, callback, node);
                        break;
                    case 'css':
                        append.appendCss(url, data, callback, node);
                        break;
                    case 'img':
                        append.appendImg(url, data, callback, node);
                        break;
                    default:
                        break;
                    }

                },


                /**
                 * load data from cache
                 * this function loads a single resource from cache
                 *
                 * @param {object} resource The resource
                 */
                loadResource = function (resource) {

                    var data = null,
                        callback = function (cbResource) {
                            if (cbResource && cbResource.data) {
                                appendFile(cbResource, cbResource.data);
                            } else {
                                appendFile(cbResource);
                            }
                        },
                        resourceDefaults = self.storage.resourceDefaults,
                        lastmodCheck = true;


                    // check optional resource attributes and set defaults
                    resource.version = resource.version ? parseFloat(resource.version) : resourceDefaults.version;
                    resource.group = resource.group ? parseFloat(resource.group) : resourceDefaults.group;

                    // read resource via storage controller
                    self.storage.read(resource, function (item) {

                        // check resource lastmod for handling outdated data
                        if (resource.lastmod && item && item.lastmod) {
                            resource.lastmod = parseInt(resource.lastmod, 10);
                            lastmodCheck = (item.lastmod === resource.lastmod);
                        } else if (!resource.lastmod && item && item.lastmod) {
                            resource.lastmod = item.lastmod;
                        } else {
                            resource.lastmod = resourceDefaults.lastmod;
                        }


                        /**
                         * if there is no item create it
                         *
                         * this is also the point where data get's loaded via
                         * xhr when the storage is disabled, the resource isn't then
                         * created - it just returns the data via xhr
                         */
                        if (!item || !item.data) {
                            log('[' + controllerType + ' controller] Resource or resource data is not available in storage adapter: type ' + resource.type + ', url ' + resource.url);
                            self.storage.create(resource, callback);
                            return;
                        }


                        /**
                         * check for outdated data
                         *
                         * if item.lifetime is set to '-1' the resource will always be loaded from network
                         * also the item.lastmod and cached resource.lastmod (and item.version/resource.version) needs to be the same
                         * finally there is a check if the item is expired using the current timestamp
                         */
                        if (parseInt(item.lifetime, 10) !== -1 && lastmodCheck && resource.version === item.version && item.expires > now) {
                            log('[' + controllerType + ' controller] Resource is up to date: type ' + resource.type + ', url ' + resource.url);
                            data = item.data;
                        } else {
                            log('[' + controllerType + ' controller] Resource is outdated and needs update: type ' + resource.type + ', url ' + resource.url);
                            self.storage.update(resource, callback);
                            return;
                        }

                        // append file if data is valid
                        if (data) {
                            appendFile(resource, data);
                        }

                    });

                },


                /**
                 * load resource group
                 *
                 * @param {array} group The resources group
                 * @param {function} callback The callback function
                 */
                loadResourceGroup = function (group, callback) {

                    // init local vars
                    var i = 0,
                        length = group.length,
                        resource = null;

                    // init queue manager for this group to invoke a callback when group finished loading
                    loadResourceGroupQueue.init(length, callback);

                    // toggle through group
                    for (i = 0; i < length; i = i + 1) {

                        // check resource and load it
                        resource = group[i];
                        if (resource && resource.url) {
                            loadResource(resource);
                        }

                    }
                },


                /**
                 * sort given resources according to group parameter
                 * this will allow us to load resources in a certain order to
                 * keep all the dependencies save
                 * 
                 * @param {array} resources The resources to sort
                 *
                 * @returns {array} Sorted array with resource objects
                 */
                groupResources = function(resources) {

                    // init local vars
                    var result = [],
                        group,
                        i = 0,
                        resource,
                        resourceGroup,
                        length = resources.length;

                    // toggle through resources
                    for (i = 0; i < length; i = i + 1) {

                        // get resource information
                        resource = resources[i];
                        resourceGroup = resource.group;

                        // if resource group isn't set, set it the zero
                        if (!resourceGroup) {
                            resourceGroup = 0;
                        }

                        // check if group exists in result, otherwise create it
                        if (result[resourceGroup]) {
                            // select according group
                            group = result[resourceGroup];
                        } else {
                            // set new group and content to new array
                            group = result[resourceGroup] = [];
                        }

                        // push resource into group
                        group.push(resource);
                    }

                    // return group sorted array
                    return result;

                },


                /**
                 * main load function, chain resource group loading
                 *
                 * @param {array} resources All the grouped resources
                 * @param {function} callback The main callback function
                 * @param {integer} index The optional group index
                 */
                load = function (resources, callback, index) {

                    // init local vars
                    var length = resources.length,
                        group;

                    /**
                     * check for corrent index value
                     * on first load index is undefined/optional, so we set
                     * it to zero to run the loop correctly
                     */
                    if (!index) {
                        index = 0;
                    }

                    while (!resources[index] && index < length) {
                        index = index + 1;
                    }

                    // end of resources array reached
                    if (index >= length) {
                        callback();
                        return;
                    }

                    // load resources, increase group index recursiv
                    group = resources[index];
                    loadResourceGroup(group, function () {
                        load(resources, callback, index + 1);
                    });

                };

            // call main function
            log('[' + controllerType + ' controller] Load resource function called: resources count ' + resources.length);
            load(groupResources(resources), checkCallback(mainCallback));

        },


        /**
         * init cache controller
         *
         * @param {function} callback The callback function after initializing
         * @param {object} parameters The optional storage parameters
         */
        init: function (callback, parameters) {

            // init local vars
            var self = this,
                storage;

            // check callback function
            callback = checkCallback(callback);

            // init storage
            log('[' + controllerType + ' controller] Cache initializing and checking for storage adapters');
            storage = new app.cache.storage.controller(function (storage) {

                self.storage = storage;
                callback(storage);

            }, parameters);

        }
    };


    /**
     * make cache controller globally available under app namespace
     */
    app.cache.controller = controller;


}(window, document, window.app || {})); // immediatly invoke function