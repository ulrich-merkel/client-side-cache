/*jslint browser: true, devel: true, regexp: true */
/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:false, curly:true, browser:true, indent:4, maxerr:50 */

/*global document*/
/*global undefined*/


/**
 * app.cache.storage.controller
 *
 * @description
 * - connect to different storage types if available
 * - provide consistent api for different storage types
 * - store and read via storage adapter
 * 
 * @version 0.1.3
 * @author Ulrich Merkel, 2013
 * 
 * @namespace app
 *
 * @changelog
 * - 0.1.3 bug fix when checking adapter support - additionally checking with adapter.open and not just isSupported, modified getStorageAdapter function
 * - 0.1.2 refactoring, js lint
 * - 0.1.1 bug fix init when cache storage is disabled
 * - 0.1 basic functions and structur
 *
 * @bugs
 * -
 * 
 */
(function (document, app, undefined) {
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
    var controllerType = 'storage',                             // controllerType {string} The controller type string
        helpers = app.helpers,                                  // helper {object} Shortcut for helper functions
        client = helpers.client,                                // client {object} Shortcut for client functions
        utils = helpers.utils,                                  // utils {object} Shortcut for utils functions
        log = utils.log,                                        // log {function} Shortcut for utils.log function
        checkCallback = utils.callback,                         // checkCallback {function} Shortcut for utils.callback function
        json = utils.getJson(),                                 // json {function} Global window.Json object if available
        xhr = utils.xhr,                                        // xhr {function} Shortcut for utils.xhr function
        appCacheStorageAdapter = app.cache.storage.adapter,     // appCacheStorageAdapter {object} Shortcut for app.cache.storage.adapter namespace


        /**
         * adapters {array} Config array with objects for different storage types
         * 
         * this is the place to configure which types of adapters will be checked
         * and which resource types are stored in which adapter type
         */
        adapters = [
            {type: 'fileSystem', css: true, js: true, html: true, img: true },
            {type: 'indexedDatabase', css: true, js: true, html: true, img: true },
            {type: 'webSqlDatabase', css: 1, js: 1, html: 1, img: 0 },
            {type: 'webStorage', css: true, js: true, html: false, img: false }
        ],


        /**
         * adapterDefaults {object} The default option to initialize the adapter
         *
         * this config could be overridden by the passed in parameters
         */
        adapterDefaults = {
            name: 'merkel',                                     // adapterDefaults.name {string} Default db name
            table: 'cache',                                     // adapterDefaults.table {string} Default db table name
            description: 'resource cache',                      // adapterDefaults.description {string} Default db description
            size: 4 * 1024 * 1024,                              // adapterDefaults.size {integer} Default db size 4 MB
            version: '1.0',                                     // adapterDefaults.version {string} Default db version, needs to be string for web sql database and should be 1.0
            key: 'key',                                         // adapterDefaults.key {string} Default db primary key
            lifetime: 'local',                                  // adapterDefaults.lifetime {string} Default lifetime for webstorage
            offline: true                                       // adapterDefaults.offline {boolean||string} Default switch for using application cache
        },

        adapterAvailable = null,                                // adapterAvailable {string} The name of the best available adapter
        adapterAvailableConfig = null,                          // adapterAvailableConfig {object} The adapter config for the available type (see adapters)


        /**
         * resourceDefaults {object} The defaults for a single resource
         *
         */
        resourceDefaults = {
            lifetime: 10000,                                    // resourceDefaults.lifetime {integer} Default lifetime time in milliseconds (10000 ca 10sec)
            group: 0,                                           // resourceDefaults.group {integer} Default resource group
            lastmod: new Date().getTime(),                      // resourceDefaults.lastmod {integer} Default last modification timestamp
            type: 'css',                                        // resourceDefaults.type {string} Default resource type
            version: 1.0                                        // resourceDefaults.version {float} Default resource version
        };


    /**
     * helper function to convert a json object to string
     *
     * @param {object} object The json object to convert
     *
     * @return {string} The converted json string
     */
    function convertObjectToString(object) {
        return utils.jsonToString(object);
    }


    /**
     * helper function to convert a json string to object
     *
     * @param {string} string The json string to convert
     *
     * @return {string} The converted json object
     */
    function convertStringToObject(string) {

        // init local vars
        var result = null;

        // avoid console errors if the resource loading parameters changed
        try {
            result = utils.jsonToObject(string);
        } catch (e) {
            log('[' + controllerType + ' controller] Couldn\'t convert json string to object.');
        }

        // return result
        return result;
    }


    /**
     * convert image url to base64 string
     * 
     * @param {string} url The image url
     * @param {function} callback The callback function after success
     * @param {string} imageType The image type (jpeg, png)
     *
     * @returns {string} Returns converted data as callback parameter or false
     */
    function convertImageToBase64(url, callback, imageType) {

        // check for canvas support
        if (client.hasCanvas()) {

            // init local function vars
            var canvas = document.createElement('canvas'),
                context,
                image = new Image(),
                result = null,
                height = 0,
                width = 0;

            // check imageType parameter
            if (!imageType) {
                imageType = "jpeg";
            }

            // asynch event handler when image is loaded
            image.onload = function () {

                // set canvas dimensions
                height = canvas.height = image.height;
                width = canvas.width = image.width;

                // get 2d context
                context = canvas.getContext("2d");

                // set background color (for jpeg images out of transparent png files)
                context.fillStyle = "rgba(50, 50, 50, 0)";

                // draw background, start on top/left and set fullwith/height
                context.fillRect(0, 0, width, height);

                // draw image in canvas on top/left
                context.drawImage(image, 0, 0);

                // get base64 data string and return result
                result = canvas.toDataURL("image/" + imageType);
                callback(result);
            };

            // set image source
            image.src = url;

        } else {

            /**
             * just do a false callback and don't get the data via xhr to
             * avoid the parsing of binary data via response text
             */
            callback(false);
        }
    }


    /**
     * replace relative with absolute urls, used whithin resource string data (e.g css background urls)
     *
     * @param {string} data The data content string
     * @param {object} resource The resource object item
     *
     * @returns {string} Returns converted or source data
     */
    function convertRelativeToAbsoluteUrls(data, resource) {

        // just do it for css files
        if (resource.type === 'css') {

            var urlParts = utils.urlParts(resource.url);

            return data.replace(/url\("../g, 'url("' + urlParts.folder + '..');
        }

        return data;
    }


    /**
     * copy resource object for the use in storage
     * 
     * remove url from resource data string to avoid duplicate data in storage.
     * we also set the new expires timestamp here, because this function will
     * only be called from create/update to get a copy from the resource content.
     * 
     * @param {object} resource The resource object item
     * 
     * @returns {object} Returns the copied resource
     */
    function copyStorageContent(resource) {

        // set new data for storage content
        return {
            data: resource.data,
            lifetime: resource.lifetime || resourceDefaults.lifetime,
            expires: new Date().getTime() + (resource.lifetime || resourceDefaults.lifetime),
            group: resource.group || resourceDefaults.group,
            lastmod: resource.lastmod || resourceDefaults.lastmod,
            type: resource.type || resourceDefaults.type,
            version: resource.version || resourceDefaults.version
        };
    }


    /**
     * check if resource is cachable due to adapter config
     *
     * @param {string} resourceType The resource type (css, js, html, ...)
     * 
     * @returns {boolean} Returns true or false depending on resource type
     */
    function isRessourceStorable(resourceType) {

        // check if type is available in adapter config and return bool
        if (adapterAvailableConfig && adapterAvailableConfig[resourceType]) {
            return !!adapterAvailableConfig[resourceType];
        }
        return false;

    }


    /**
     * get available storage adapter recursivly
     * automatically try to init each storage adapter until a supported adapter is found
     *
     * @param {array} storageAdapters The storage types
     * @param {function} callback The callback function 
     */
    function getAvailableStorageAdapter(storageAdapters, callback) {

        // init local vars
        var adapter = null,
            storageType;

        // end of recursive loop reached, no adapter available
        if (!storageAdapters || !storageAdapters.length) {
            if (!adapterAvailable) {
                callback(false);
            }
            return;
        }

        // init storage and check support
        storageType = storageAdapters[0].type;
        log('[' + controllerType + ' controller] Testing for storage adapter type: ' + storageType);

        if (appCacheStorageAdapter[storageType]) {
            adapter = new appCacheStorageAdapter[storageType](adapterDefaults);
        } else {
            // recursiv call
            getAvailableStorageAdapter(storageAdapters.slice(1), callback);
        }

        // check for general javascript api support
        if (adapter && adapter.isSupported()) {

            // storage api is avaibable, try to open storage
            adapter.open(function (success) {

                if (!!success) {

                    adapterAvailable = storageType;
                    adapterAvailableConfig = storageAdapters[0];

                    log('[' + controllerType + ' controller] Used storage adapter type: ' + adapterAvailable);
                    callback(adapter);

                } else {

                    // recursiv call
                    getAvailableStorageAdapter(storageAdapters.slice(1), callback);

                }
            });

        } else {

            // recursiv call
            getAvailableStorageAdapter(storageAdapters.slice(1), callback);
        }
    }


    /**
     * get storage adapter
     *
     * @param {function} callback The callback function
     * @param {string} type The optional storage type to initialize
     */
    function getStorageAdapter(callback, storageType) {

        // init local vars
        var adapter = null,
            i = 0,
            length;

        // if storage type is set, try to initialize it
        if (storageType) {

            try {
                // init storage and check support
                log('[' + controllerType + ' controller] Testing for storage adapter type: ' + storageType);
                if (appCacheStorageAdapter[storageType]) {
                    adapter = new appCacheStorageAdapter[storageType](adapterDefaults);
                } else {
                    getStorageAdapter(callback);
                }

                if (adapter && adapter.isSupported()) {

                    // storage api is avaibable, try to open storage
                    adapter.open(function (success) {
                        if (!!success) {

                            adapterAvailable = storageType;
                            length = adapters.length;

                            for (i = 0; i < length; i = i + 1) {
                                if (adapters[i].type === storageType) {
                                    adapterAvailableConfig = adapters[i];
                                }
                            }

                            if (adapterAvailableConfig) {
                                log('[' + controllerType + ' controller] Used storage type: ' + adapterAvailable);
                                callback(adapter);
                                return;
                            }

                            log('[' + controllerType + ' controller] Storage config not found: ' + adapterAvailable);
                            getStorageAdapter(callback);

                        } else {

                            getStorageAdapter(callback);

                        }
                    });
                } else {
                    getStorageAdapter(callback);
                }
            } catch (e) {
                log('[' + controllerType + ' controller] Storage adapter could not be initialized: type ' + storageType);
                getStorageAdapter(callback);
            }

        } else {
            // automatic init with global adapters array
            getAvailableStorageAdapter(adapters, callback);
        }
    }


    /**
     * storage constructor
     *
     * @param {function} callback The callback function
     * @param {object} parameters The optional parameters for the init function
     */
    function Storage(callback, parameters) {

        /**
         * this.isEnabled = true {boolean} Enable or disable client side storage
         *
         * enable or disable client side cache or load resources just
         * via xhr if this option/parameter is set to false
         */
        this.isEnabled = true;


        /**
         * this.adapter {object} The instance of the best available storage adapter
         */
        this.adapter = null;


        /**
         * this.appCacheAdapter {object} The instance of the application cache storage adapter
         */
        this.appCacheAdapter = null;


        /**
         * this.resourceDefaults {object} Make the resource defaults available to instance calls
         */
        this.resourceDefaults = resourceDefaults;


        // run init function
        this.init(callback, parameters);
    }


    /**
     * storage methods
     *
     */
    Storage.prototype = {

        /**
         * create resource in storage
         *
         * @param {object} resource The resource object
         * @param {function} callback The callback function
         */
        create: function (resource, callback) {

            // init local vars
            var self = this,
                url = resource.url,
                type = resource.type,
                createCallback = function (data) {

                    // append data to resource object
                    resource.data = data;

                    if (null !== self.adapter && isRessourceStorable(type)) {

                        // create storage content
                        var key = convertObjectToString(url),
                            content = convertObjectToString(copyStorageContent(resource));

                        /**
                        * there is a bug in older browser versions (seamonkey)
                        * when trying to read or write from db (due to non-standard implementation),
                        * so we have to use try catch here
                        */
                        try {
                            // create storage entry
                            self.adapter.create(key, content, function (success) {
                                if (success) {
                                    log('[' + controllerType + ' controller] Create new resource in storage adapter: type ' + type + ', url ' + url);
                                    callback(resource);
                                } else {
                                    log('[' + controllerType + ' controller] Create new resource in storage adapter failed');
                                    callback(false);
                                }
                            });
                        } catch (e) {
                            // just give back the resource to get the data
                            callback(resource);
                        }

                    } else {
                        log('[' + controllerType + ' controller] Trying to create new resource, but resource type is not cachable or storage adapter is not available: type ' + type + ', url ' + url);
                        callback(resource);
                    }
                };

            // check callback function
            callback = checkCallback(callback);

            // get resource data based on type
            if (type === 'img') {
                convertImageToBase64(url, createCallback);
            } else {
                xhr(url, createCallback);
            }

        },


        /**
         * read resource from storage
         *
         * @param {object} resource The resource object
         * @param {function} callback The callback function
         */
        read: function (resource, callback) {

            // init local vars
            var self = this,
                url = resource.url,
                type = resource.type;

            // check callback function
            callback = checkCallback(callback);

            // try to read from storage
            if (null !== this.adapter && isRessourceStorable(type)) {

                log('[' + controllerType + ' controller] Trying to read resource from storage: type ' + type + ', url ' + url);

                /**
                 * there is a bug in older browser versions (seamonkey)
                 * when trying to read from db (due to non-standard implementation),
                 * so we have to use try catch here and fallback to xhr to get the data
                 * 
                 */
                try {
                    self.adapter.read(convertObjectToString(url), function (data) {
                        if (data) {
                            resource = convertStringToObject(data);

                            /**
                             * check if the convertStringToObject function succeeded
                             * could fail if resource is saved properly or resource parameters changed,
                             * so we remove the old resource from storage instead to create
                             * a new one
                             */
                            if (!resource) {
                                self.adapter.remove(convertObjectToString(url), function () {
                                    log('[' + controllerType + ' controller] Resource deleted from storage adapter to create a new one: type ' + type + ', url ' + url);
                                    callback(false);
                                });
                                return;
                            }

                            resource.url = url;
                            log('[' + controllerType + ' controller] Successfully read resource from storage: type ' + type + ', url ' + url);
                            callback(resource);
                        } else {
                            log('[' + controllerType + ' controller] There is no data coming back from storage while reading: type ' + type + ', url ' + url);
                            callback(false);
                        }
                    });
                } catch (e) {
                    xhr(url, function (data) {
                        resource.data = data;
                        log('[' + controllerType + ' controller] Try to read resource from storage, but storage adapter is not available: type ' + type + ', url ' + url);
                        callback(resource);
                    });
                }

            } else {
                callback(resource);
            }
        },


        /**
         * update resource from storage
         *
         * @param {object} resource The resource object
         * @param {function} callback The callback function
         */
        update: function (resource, callback) {

            // init local vars
            var self = this,
                url = resource.url,
                type = resource.type,
                createCallback = function (data) {

                    // append data to resource object
                    resource.data = data;

                    if (null !== self.adapter && isRessourceStorable(type)) {

                        // create storage content
                        var key = convertObjectToString(url),
                            content = convertObjectToString(copyStorageContent(resource));

                        /**
                        * there is a bug in older browser versions (seamonkey)
                        * when trying to read or write from db (due to non-standard implementation),
                        * so we have to use try catch here
                        */
                        try {
                            // create storage entry
                            self.adapter.update(key, content, function (success) {
                                if (success) {
                                    log('[' + controllerType + ' controller] Update existing resource in storage adapter: type ' + type + ', url ' + url);
                                    callback(resource);
                                } else {
                                    log('[' + controllerType + ' controller] Updating resource in storage failed.');
                                    callback(false);
                                }
                            });
                        } catch (e) {
                            // just give back the resource to get the data
                            callback(resource);
                        }

                    } else {
                        log('[' + controllerType + ' controller] Resource type is not cachable or storage adapter is not available: type ' + type + ', url ' + url);
                        callback(resource);
                    }
                };

            // check callback function
            callback = checkCallback(callback);

            // get resource data based on type
            if (resource.type === 'img') {
                convertImageToBase64(url, createCallback);
            } else {
                xhr(url, createCallback);
            }
        },


        /**
         * remove resource from storage
         *
         * @param {object} resource The resource object
         * @param {function} callback The callback function
         */
        remove: function (resource, callback) {

            // init local vars
            var self = this,
                url = resource.url,
                type = resource.type;

            // check callback function
            callback = checkCallback(callback);

            // try to remove resource from storage
            if (null !== self.adapter && isRessourceStorable(type)) {
                self.adapter.remove(convertObjectToString(url), function (data) {
                    resource = convertStringToObject(data);

                    if (!resource) {
                        callback(false);
                        return;
                    }

                    resource.url = url;
                    log('[' + controllerType + ' controller] Delete resource form storage: type ' + type + ', url ' + url);
                    callback(resource);
                });
            } else {
                log('[' + controllerType + ' controller] Delete resource from storage failed, resource type is not cachable or there is no storage adapter: type ' + type + ', url ' + url);
                callback(resource);
            }

        },


        /**
         * init storage
         *
         * @param {function} callback The callback function
         * @param {object} parameters The optional storage parameters
         */
        init: function (callback, parameters) {

            // init local vars
            var self = this,
                storageType = false;

            if (parameters && parameters.isEnabled !== undefined) {
                self.isEnabled = !!parameters.isEnabled;
            }

            if (self.isEnabled && json) {

                // set parameters
                if (parameters) {
                    if (parameters.description) {
                        adapterDefaults.description = String(parameters.description);
                    }
                    if (parameters.key) {
                        adapterDefaults.key = String(parameters.key);
                    }
                    if (parameters.lifetime) {
                        adapterDefaults.lifetime = String(parameters.lifetime);
                    }
                    if (parameters.name) {
                        adapterDefaults.name = String(parameters.name);
                    }
                    if (parameters.size) {
                        adapterDefaults.size = parseInt(parameters.size, 10);
                    }
                    if (parameters.table) {
                        adapterDefaults.table = String(parameters.table);
                    }
                    if (parameters.type) {
                        adapterDefaults.type = storageType = String(parameters.type);
                    }
                    if (parameters.version) {
                        adapterDefaults.version = parameters.version;
                    }
                    if (parameters.offline) {
                        adapterDefaults.offline = parameters.offline;
                    }
                }

                if (adapterDefaults.offline && appCacheStorageAdapter.applicationCache) {
                    self.appCacheAdapter = new appCacheStorageAdapter.applicationCache(adapterDefaults);
                }


                /**
                 * storage checking and initializing takes some time
                 * (especially for db's), so we return the current storage
                 * instance via callbacks, after the adapter get's
                 * successfully initialized
                 *
                 * the returned adapter will already be opened
                 */

                getStorageAdapter(function (adapter) {
                    self.adapter = adapter;
                    callback(self);
                }, storageType);

            } else {

                /**
                 * just return the instance to get the ressource
                 * via xhr if storage is disabled or json is not
                 * available
                 */

                if (!json) {
                    log('[' + controllerType + ' controller] There is no json support');
                }
                if (!self.isEnabled) {
                    log('[' + controllerType + ' controller] Caching data is disabled');
                }

                callback(self);
            }
        }

    };


    /**
     * make storage controller available under app namespace
     */
    app.cache.storage.controller = Storage;


}(document, window.app || {})); // immediatly invoke function