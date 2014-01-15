/*global window */

/**
 * ns.cache.controller
 * 
 * @description
 * - main functions/controller for handling client-side cache
 * - connect to storage controller and read/write data
 * - handle logic to check for outdated data
 * 
 * @author Ulrich Merkel (hello@ulrichmerkel.com)
 * @version 0.2.0
 *
 * @namespace ns
 *
 * @changelog
 * - 0.2.0 guessResourceType added
 * - 0.1.9 example added, refactoring
 * - 0.1.8 improved logging
 * - 0.1.7 bug fix isResourceValid, remove interface added, improvements for testing
 * - 0.1.6 improved namespacing
 * - 0.1.5 separated check for outdated data in new isResourceValid function, resource loaded callback param added
 * - 0.1.4 refactoring
 * - 0.1.3 bug fix check for outdated data
 * - 0.1.2 resource attrib check on loadResource function added
 * - 0.1.1 bug fix load resource (item.lifetime is set check added)
 * - 0.1 basic functions and plugin structur
 *
 * @see
 * - http://www.winktoolkit.org/
 * - http://www.winktoolkit.org/documentation/symbols/wink.cache.html
 *
 * @requires
 * - ns.helpers.namespace
 * - ns.helpers.utils
 * - ns.helpers.dom
 * - ns.helpers.client
 * 
 * @bugs
 * - 
 *
 * @example
 *
 *      // init cache controller, this is also
 *      // possible without the new operator
 *      var cache = new app.cache.controller(function () 
 *          // cache is ready to use        
 *      });
 *
 *      // load resources
 *      cache.load(
 *          [
 *              {url: "css/app.css", type: "css"},
 *              {url: "js/lib.js", type: "js"},
 *              {url: "js/plugin.js", type: "js", group: 1}
 *          ],
 *          function () {
 *              // all resources loaded
 *          }
 *      );
 *
 *      // remove resources
 *      cache.remove(
 *          [
 *              {url: "css/app.css", type: "css"},
 *              {url: "js/lib.js", type: "js"}
 *          ],
 *          function () {
 *              // all resources removed
 *          }
 *      );
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
     * window and ns is passed through as local variable
     * rather than as global, because this (slightly)
     * quickens the resolution process and can be more
     * efficiently minified (especially when both are
     * regularly referenced in this module).
     */

    // module vars
    var controllerType = 'cache',                                   // @type {string} The controller type string
        helpers = ns.helpers,                                       // @type {object} Shortcut for ns.helper functions
        dom = helpers.dom,                                          // @type {object} Shortcut for dom functions
        utils = helpers.utils,                                      // @type {object} Shortcut for utils functions
        client = helpers.client,                                    // @type {object} Shortcut for client functions
        log = utils.log,                                            // @type {function} Shortcut for utils.log function
        isArray = utils.isArray,                                    // @type {function} Shortcut for utils.isArray function
        checkCallback = utils.callback;                             // @type {function} Shortcut for utils.callback function


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
    function moduleLog(message) {
        log('[' + controllerType + ' controller] ' + message);
    }

    /* end-dev-block */

    /**
     * try to guess file extension
     *
     * @param {string} url The resource url
     *
     * @return {string} The parsed resource type
     */
    function guessResourceType(url) {

        var extension = utils.url(url).extension;

        switch (extension) {
        case 'js':
            extension = 'js';
            break;
        case 'css':
            extension = 'css';
            break;
        case 'html':
            extension = 'html';
            break;
        case 'jpg':
        case 'jpeg':
        case 'png':
            extension = 'img';
            break;
        default:
            extension = 'custom';
            break;
        }

        return extension;

    }

    /**
     * -------------------------------------------
     * cache controller
     * -------------------------------------------
     */

    /**
     * cache controller constructor
     *
     * @constructor
     * @param {function} callback The callback function
     * @param {object} parameters The optional parameters for the init function
     */
    function Controller(callback, parameters) {

        var self = this;

        // ensure Controller was called as a constructor
        if (!(self instanceof Controller)) {
            return new Controller(callback, parameters);
        }

        /**
         * @type {object} The storage controller instance
         */
        self.storage = null;


        // run prototype init function
        self.init(callback, parameters);

    }


    /**
     * cache controller methods
     *
     * @interface
     */
    Controller.prototype = Controller.fn = {

        /**
         * load multiple resources
         *
         * @param {array} resources The array with resource objects
         * @param {function} mainCallback The callback after all resources are loaded
         */
        load: function (resources, mainCallback) {

            // declare load vars and functions
            var self = this,
                now = new Date().getTime(),


                /**
                 * load functions are also saved in local vars rather than
                 * saving them as controller instance functions (via this) for
                 * faster access and better compression results.
                 */


                /**
                 * managing loading queues
                 * 
                 * queue manager for loading all groups of resources after each other.
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
                         * mark resource as loaded - if all group resources have been loaded, invoke group callback
                         */
                        loaded: function () {
                            queueLoaded = queueLoaded + 1;
                            if (queueLoaded === queueSize) {
                                queueCallback();
                            }
                        }
                    };

                }()), // immediatly invoke function to make init() and loaded() accessable via loadResourceGroupQueue


                /**
                 * append file to dom
                 * 
                 * helper function to switch append function according to file type.
                 *
                 * @param {object} resource The resource
                 * @param {string} data The resource data string
                 * @param {boolean} update Indicates if the resource data needs to be updated (if already appended to dom)
                 */
                appendFile = function (resource, data, update) {

                    // init local vars
                    var url = resource.url,
                        resourceLoaded = checkCallback(resource.loaded),
                        callback = function () {
                            loadResourceGroupQueue.loaded();
                            resourceLoaded(resource);
                        },
                        node = resource.node || null;

                    // check update parameter
                    update = !!update;

                    // load file according to type
                    switch (resource.type) {
                    case 'js':
                        dom.appendJs(url, data, callback, node, update);
                        break;
                    case 'css':
                        dom.appendCss(url, data, callback, node, update);
                        break;
                    case 'img':
                        dom.appendImg(url, data, callback, node, update);
                        break;
                    case 'html':
                        dom.appendHtml(url, data, callback, node, update);
                        break;
                    default:
                        // didn't match any type
                        callback();
                        break;
                    }

                },


                /**
                 * check if cached item is still valid
                 *
                 * @param {object} resource The resource object
                 * @param {object} item The cached resource object for comparison
                 *
                 * @return {object} resource The resource object with isValid and lastmod properties
                 */
                isResourceValid = function (resource, item) {

                    // init local vars
                    var resourceDefaults = self.storage.resourceDefaults,
                        itemLifetime = parseInt(item.lifetime, 10),
                        itemVersion = item.version,
                        itemLastmod = !!item.lastmod ? item.lastmod : 0,
                        itemResourceVersionAndLastmodCheck = false,
                        resourceVersion,
                        resourceLastmod = !!resource.lastmod ? resource.lastmod : 0,
                        lastmodCheck = true,
                        isValid = false;

                    // check optional resource attributes and set defaults
                    resource.version = resourceVersion = resource.version !== undefined ? parseFloat(resource.version) : resourceDefaults.version;
                    resource.group = resource.group !== undefined ? parseFloat(resource.group) : resourceDefaults.group;

                    // check resource lastmod
                    if (resourceLastmod && itemLastmod) {

                        /**
                         * lastmod is set for resource and item, so compare it
                         * and save the result in lastmodCheck var
                         */
                        resource.lastmod = parseInt(resourceLastmod, 10);
                        lastmodCheck = (itemLastmod === resource.lastmod);

                    } else if (!resourceLastmod && itemLastmod) {

                        /**
                         * lastmod isn't set for resource load request, but the cache
                         * item got one so we use the stored items lastmod value
                         */
                        resourceLastmod = itemLastmod;

                    } else if (!resourceLastmod) {

                        /**
                         * there is no lastmod option set for the resouce request
                         * so use the defaults
                         */
                        resourceLastmod = resourceDefaults.lastmod;

                    }

                    // shortcut for version and lastmod check for better compression results
                    itemResourceVersionAndLastmodCheck = (lastmodCheck && resourceVersion === itemVersion);

                    /**
                     * check for outdated data
                     *
                     * if item.lifetime is set to '-1' the resource will never expires (if lastmod and version stay the same).
                     * if item.lifetime is set to '0' the resource will always expires.
                     * 
                     * if item.lifetime isn't set to '-1' the item.lastmod and cached resource.lastmod (and item.version/resource.version)
                     * needs to be the same and finally there is a check if the item is expired using the current timestamp.
                     */
                    isValid = (itemLifetime !== 0) && (
                        (itemLifetime !== -1 && itemResourceVersionAndLastmodCheck && item.expires > now) ||
                        (itemLifetime === -1 && itemResourceVersionAndLastmodCheck)
                    );

                    // update meta data, mainly for test suites
                    resource.lastmod = resourceLastmod;
                    resource.isValid = isValid;

                    // return result
                    return resource;

                },


                /**
                 * load data from cache
                 * 
                 * this function loads a single resource from cache.
                 *
                 * @param {object} resource The resource object
                 */
                loadResource = function (resource) {

                    // init local vars
                    var data = resource.data || null,
                        callback = function (cbResource, update) {
                            if (cbResource && cbResource.data) {
                                appendFile(cbResource, cbResource.data, update);
                            } else {
                                appendFile(cbResource, null, update);
                            }
                        },
                        storage = self.storage,
                        resourceDefaults = storage.resourceDefaults;

                    // check optional resource attributes and set defaults
                    resource.ajax = resource.ajax !== undefined ? !!resource.ajax : resourceDefaults.ajax;

                    // read resource via storage controller
                    storage.read(resource, function (item) {

                        /**
                         * if there is no item create it
                         *
                         * this is also the point where data get's loaded via
                         * xhr when the storage is disabled, the resource isn't
                         * created then - it just returns the data via xhr.
                         */
                        if (!item || !item.data) {
                            /* start-dev-block */
                            moduleLog('Resource or resource data is not available in storage adapter: type ' + resource.type + ', url ' + resource.url);
                            /* end-dev-block */
                            storage.create(resource, callback);
                            return;
                        }

                        // check for outdated data and network connection
                        resource = isResourceValid(resource, item);
                        if (resource.isValid || !client.isOnline()) {
                            /* start-dev-block */
                            moduleLog('Resource is up to date: type ' + resource.type + ', url ' + resource.url);
                            /* end-dev-block */
                            data = item.data;
                        } else {
                            /* start-dev-block */
                            moduleLog('Resource is outdated and needs update: type ' + resource.type + ', url ' + resource.url);
                            /* end-dev-block */
                            storage.update(resource, callback);
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
                            // guess resource type if not set
                            if (!resource.type) {
                                resource.type = guessResourceType(resource.url);
                            }
                            loadResource(resource);
                        }

                    }
                },


                /**
                 * group resources
                 * 
                 * sort given resources according to group parameter because
                 * this will allow us to load resources in a certain order to
                 * keep all the dependencies save.
                 * 
                 * @param {array} resources The resources to sort
                 *
                 * @returns {array} Sorted array with resource objects
                 */
                groupResources = function (resources) {

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

                        // if resource group isn't set in resource parameters, set it the zero
                        if (!resourceGroup) {
                            resourceGroup = 0;
                        }

                        // check if group exists in result, otherwise create it
                        if (result[resourceGroup]) {
                            // select according group
                            group = result[resourceGroup];
                        } else {
                            // create new group and content to new array
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

                    /**
                     * get current index value in resources array, this is a
                     * workaround if there are gaps in group indexes (e.g. there
                     * is group 1 and 3, but no group 2).
                     */
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

                },


                /**
                 * init loading, check parameters
                 *
                 * @param {array} resources All the given resources
                 * @param {function} callback The main callback function
                 */
                main = function (resources, callback) {

                    // vars mainly for logging used
                    var resourcesLength,
                        resourcesGroupLength;

                    // check load parameters
                    if (!resources || !isArray(resources)) {
                        resources = [];
                    }
                    resourcesLength = resources.length;
                    resources = groupResources(resources);
                    callback = checkCallback(mainCallback);
                    resourcesGroupLength = resources.length;

                    // call main load function to start the process
                    /* start-dev-block */
                    moduleLog('Load resource function called: ' + resourcesLength + ' resources, ' + resourcesGroupLength + ' groups');
                    /* end-dev-block */
                    load(resources, callback);

                };


            // start routine
            main(resources, mainCallback);


        },


        /**
         * remove multiple resources
         *
         * @param {array} resources The array with resource objects
         * @param {function} mainCallback The callback after all resources are removed
         */
        remove: function (resources, mainCallback) {

            // declare remove vars and functions
            var self = this,
                storage = self.storage,

                 /**
                 * remove functions are also saved in local vars rather than
                 * saving them as controller instance functions (via this) for
                 * faster access and better compression results.
                 */

                /**
                 * main remove function
                 *
                 * @param {array} resources All the grouped resources
                 * @param {function} callback The main callback function
                 */
                remove = function (resources, callback) {

                    var length = resources.length,
                        i,
                        resource,
                        resourceRemovedCallback = function (current, url) {
                            /* start-dev-block */
                            moduleLog('Successfully removed resource: url ' + url);
                            /* end-dev-block */
                            if (current === length - 1) {
                                callback();
                            }
                        };

                    if (!length) {
                        callback();
                        return;
                    }

                    // toggle through resources
                    for (i = 0; i < length; i = i + 1) {

                        // remove each resource if it is a valid array entry
                        resource = resources[i];
                        if (resource && resource.url) {
                            // guess resource type if not set
                            if (!resource.type) {
                                resource.type = guessResourceType(resource.url);
                            }
                            storage.remove(resource, resourceRemovedCallback(i, resource.url));
                        }

                    }

                },


                /**
                 * init remove, check parameters
                 *
                 * @param {array} resources All the given resources
                 * @param {function} callback The main callback function
                 */
                main = function (resources, callback) {

                    // check function parameters
                    if (!resources || !isArray(resources)) {
                        resources = [];
                    }
                    callback = checkCallback(mainCallback);

                    // call main load function to start the process
                    /* start-dev-block */
                    moduleLog('Remove resource function called: resources count ' + resources.length);
                    /* end-dev-block */
                    remove(resources, callback);

                };


            // start routine
            main(resources, mainCallback);


        },


        /**
         * init cache controller
         *
         * @param {function} callback The callback function after initializing
         * @param {object} parameters The optional storage parameters
         */
        init: function (callback, parameters) {

            // init local vars
            var self = this;

            // check callback function
            callback = checkCallback(callback);

            // init storage
            /* start-dev-block */
            moduleLog('Cache initializing and checking for storage adapters');
            /* end-dev-block */
            ns.cache.storage.controller(function (storage) {

                self.storage = storage;
                callback(storage);

            }, parameters);

        }
    };


    /**
     * make the storage constructor available for ns.cache.storage.adapter.webStorage()
     * calls under the ns.cache namespace, alternativly save it to window object
     * 
     * @export
     */
    if (utils.isFunction(ns.namespace)) {
        ns.namespace(controllerType + '.controller', Controller);
    } else {
        ns[controllerType] = Controller;
    }


}(window, window.getNs())); // immediatly invoke function
