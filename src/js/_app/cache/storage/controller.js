/*jslint browser: true, devel: true, regexp: true */
/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:false, curly:true, browser:true, indent:4, maxerr:50 */
/*global document, undefined*/


/**
 * ns.cache.storage.controller
 *
 * @description
 * - connect to different storage types if available
 * - provide consistent api for different storage types
 * - store and read via storage adapter
 * - convert resource data, encode data into storable formats and decode data form storage
 * - implementing the strategy pattern for storage adapters
 * 
 * @version 0.1.6
 * @author Ulrich Merkel, 2013
 * 
 * @namespace ns
 *
 * @changelog
 * - 0.1.6 logging improved
 * - 0.1.5 improved namespacing
 * - 0.1.4 timeout for xhr connections added
 * - 0.1.3 bug fix when checking adapter support - additionally checking with adapter.open and not just isSupported, modified getStorageAdapter function
 * - 0.1.2 refactoring, js lint
 * - 0.1.1 bug fix init when cache storage is disabled
 * - 0.1 basic functions and structur
 *
 * @see
 * - http://www.html5rocks.com/en/tutorials/offline/storage/
 * - http://www.html5rocks.com/de/features/storage
 *
 * @bugs
 * - 
 * 
 */
(function (window, document, undefined) {

    'use strict';

    /**
     * undefined is used here as the undefined global
     * variable in ECMAScript 3 and is mutable (i.e. it can
     * be changed by someone else). undefined isn't really
     * being passed in so we can ensure that its value is
     * truly undefined. In ES5, undefined can no longer be
     * modified.
     * 
     * window and document are passed through as local
     * variables rather than as globals, because this (slightly)
     * quickens the resolution process and can be more
     * efficiently minified (especially when both are
     * regularly referenced in this module).
     */

    // module vars
    var controllerType = 'storage',                                 // @type {string} The controller type string
        ns = (window.getNs && window.getNs()) || window,            // @type {object} The current javascript namespace object
        helpers = ns.helpers,                                       // @type {object} Shortcut for helper functions
        client = helpers.client,                                    // @type {object} Shortcut for client functions
        utils = helpers.utils,                                      // @type {object} Shortcut for utils functions
        log = utils.log,                                            // @type {function} Shortcut for utils.log function
        checkCallback = utils.callback,                             // @type {function} Shortcut for utils.callback function
        json = utils.getJson(),                                     // @type {function} Global window.Json object if available
        xhr = utils.xhr,                                            // @type {function} Shortcut for utils.xhr function
        appCacheStorageAdapter = ns.cache.storage.adapter,          // @type {object} Shortcut for ns.cache.storage.adapter namespace
        hasCanvasSupport = client.hasCanvas(),                      // @type {boolean} Whether there is canvas support or not

        /**
         * @type {array} Config array with objects for different storage types
         * 
         * this is the place to configure the defaults values which types of
         * adapters will be checked in which order and which resource types 
         * are stored in which adapter type.
         */
        adapters = [
            {type: 'fileSystem', css: true, js: true, html: true, img: true },
            {type: 'indexedDatabase', css: true, js: true, html: true, img: true },
            {type: 'webSqlDatabase', css: true, js: true, html: true, img: true },
            {type: 'webStorage', css: true, js: true, html: true, img: true }
        ],


        /**
         * @type {object} The default option to initialize the adapter
         *
         * this is the default config for strorage adapters and could be
         * overridden by the passed in parameters.
         */
        adapterDefaults = {
            name: 'localcache',                                 // @type {string} [adapterDefaults.name=localcache] Default db name
            table: 'cache',                                     // @type {string} [adapterDefaults.table=cache] Default db table name
            description: 'local resource cache',                // @type {string} [adapterDefaults.description] Default db description
            size: 4 * 1024 * 1024,                              // @type {integer} [adapterDefaults.size=4194304] Default db size 4 MB (prevents popup on old ios versions)
            version: '1.0',                                     // @type {string} [adapterDefaults.version=1.0] Default db version, needs to be string for web sql database and should be 1.0
            key: 'key',                                         // @type {string} [adapterDefaults.key=key] Default db primary key
            lifetime: 'local',                                  // @type {string} [adapterDefaults.lifetime=local] Default lifetime for webstorage
            offline: true                                       // @type {boolean} [adapterDefaults.offline=true] Default switch for using application cache event handling
        },

        adapterAvailable = null,                                // @type {string} The name of the best available adapter after testing
        adapterAvailableConfig = null,                          // @type {object} The adapter config for the available type (see adapters object)


        /**
         * @type {object} The defaults for a single resource
         *
         * this config could be overridden by the passed in resource parameters
         */
        resourceDefaults = {
            ajax: true,                                         // @type {boolean} [resourceDefaults.ajax=true] Default value for loading a resource via xhr or not
            lifetime: 20000,                                    // @type {integer} [resourceDefaults.lifetime=20000] Default lifetime time in milliseconds (10000 = 10sec)
            group: 0,                                           // @type {integer} [resourceDefaults.group=0] Default resource group
            lastmod: new Date().getTime(),                      // @type {integer} [resourceDefaults.lastmod] Default last modification timestamp
            type: 'css',                                        // @type {string} [resourceDefaults.type=css] Default resource type
            version: 1.0                                        // @type {float} [resourceDefaults.version=1.0] Default resource version
        };


    /**
     * -------------------------------------------
     * general helper functions
     * -------------------------------------------
     */

    /**
     * console log helper
     *
     * @param {string} message The message to log
     */
    function moduleLog(message) {
        log('[' + controllerType + ' controller] ' + message);
    }


    /**
     * helper function for ajax requests
     *
     * set timeout for network functions, useful if connection is lost
     *
     * @param {string} url The url from the resource to load
     * @param {function} callback The callback function to be called after load or failure
     * @param {object} resource The resource object
     */
    function handleXhrRequests(url, callback, resource) {

        // set timeout if network get lost
        resource.timeout = window.setTimeout(function () {
            callback(false);
        }, 5000);

        // make xhr call and check data
        xhr(url, function (data) {
            window.clearTimeout(resource.timeout);
            delete resource.timeout;
            if (data) {
                callback(data);
            } else {
                callback(false);
            }
        });
    }


    /**
     * -------------------------------------------
     * helper functions for converting data
     * -------------------------------------------
     */


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

        /**
         * avoid javaScript errors if the resource loading parameters changed
         * 
         * hack: there is a strange behaviour in some browsers if the resource parameters 
         * changed while calling load and the resource is stored in cache, so we 
         * have to use try/catch here.
         */
        try {
            result = utils.jsonToObject(string);
        } catch (e) {
            moduleLog('Couldn\'t convert json string to object.' + e);
        }

        // return result
        return result;
    }


    /**
     * convert image url to base64 string
     * 
     * @param {string} url The image url
     * @param {function} callback The callback function after success
     * @param {string} imageType The optional image type (jpeg, png), standard is jpeg
     *
     * @returns {string} Returns converted data as callback parameter or false
     *
     * @todo: check loaded, see imagesLoaded Remy Sharp
     */
    function convertImageToBase64(url, callback, imageType) {

        // check for canvas support
        if (hasCanvasSupport) {

            // init local function vars
            var canvas = document.createElement('canvas'),
                context,
                image = new Image(),
                result = null,
                height = 0,
                width = 0;

            // check imageType parameter
            if (!imageType) {
                imageType = 'jpeg';
            }

            // catch loading errors
            image.onerror = function () {

                // avoid memory leaks
                image.onload = image.onerror = null;

                callback();

            };

            // asynch event handler when image is loaded
            image.onload = function () {

                // avoid memory leaks
                image.onload = image.onerror = null;

                // set canvas dimensions
                height = canvas.height = image.height;
                width = canvas.width = image.width;

                // get 2d context
                context = canvas.getContext('2d');

                // set background color (for jpeg images out of transparent png files)
                context.fillStyle = 'rgba(50, 50, 50, 0)';

                // draw background, start on top/left and set fullwith/height
                context.fillRect(0, 0, width, height);

                // draw image in canvas on top/left
                context.drawImage(image, 0, 0);

                // get base64 data string and return result
                result = canvas.toDataURL('image/' + imageType);
                callback(result);

            };

            // set image source after the event handler is attached
            image.src = url;

            /**
             * check if image is cached, trigger load manually
             *
             * @see
             * - http://github.com/desandro/imagesloaded
             * - http://www.html5rocks.com/en/tutorials/es6/promises/?redirect_from_locale=de
             */
            if (!!image.complete && image.naturalWidth !== undefined) {
                image.onload();
            }

        } else {

            /**
             * just do a false callback and don't get the data via xhr to
             * avoid the parsing of binary data via response text.
             */
            callback(false);

        }
    }


    /**
     * replace relative with absolute urls 
     *
     * used whithin css resource string  data (e.g css background urls),
     * this needs to be done because the css string a put directly into the
     * html structur and therefor all relative url pathes needs to change
     *
     * @param {object} resource The resource object item
     *
     * @returns {object} Returns the resource with converted or source data
     */
    function convertRelativeToAbsoluteUrls(resource) {

        var data = resource.data,
            url = resource.url,
            type = resource.type,
            urlParts,
            result,
            folder;

        // just do it for css files
        if (type === 'css') {

            urlParts = utils.url(url);
            folder = urlParts.folder;

            /**
             * search for different css code styles for embeding urls
             * in css rules (this is important for some css minifiers
             * and different coding styles)
             */
            result = data.replace(/url\(\../g, 'url(' + folder + '..');
            result = result.replace(/url\(\'../g, 'url(\'' + folder + '..');
            result = result.replace(/url\(\"../g, 'url("' + folder + '..');

            resource.data = result;
            return resource;

        }

        return resource;
    }


    /**
     * copy resource object for the use in storage
     * 
     * remove url from resource data string to avoid duplicate data in storage.
     * we also set the new expires timestamp here, because this function will
     * only be called from create/update to get a copy from the resource content.
     *
     * node parameters won't be saved to append one resource to multiple elements.
     * 
     * @param {object} resource The resource object item
     * 
     * @returns {object} Returns the copied resource data
     */
    function copyStorageContent(resource) {

        // set new data for storage content
        return {
            ajax: resource.ajax,
            data: resource.data,
            expires: new Date().getTime() + (resource.lifetime || resourceDefaults.lifetime),
            group: (resource.group !== undefined ? resource.group : resourceDefaults.group),
            lastmod: resource.lastmod || resourceDefaults.lastmod,
            lifetime: (resource.lifetime !== undefined ? resource.lifetime : resourceDefaults.lifetime),
            type: resource.type || resourceDefaults.type,
            version: resource.version || resourceDefaults.version
        };
    }


    /**
     * -------------------------------------------
     * helper functions for storage adapters
     * -------------------------------------------
     */


    /**
     * check if resource is cachable due to adapter config
     *
     * @param {string} resourceType The resource type (css, js, html, ...)
     * 
     * @returns {boolean} Returns true or false depending on resource type
     */
    function isRessourceStorable(resourceType) {

        // check if type is available in adapter config and return boolean
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
        moduleLog('Testing for storage adapter type: ' + storageType);

        // check for storage adapter
        if (!!appCacheStorageAdapter[storageType]) {
            // get new storage adapter instance
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

                    moduleLog('Used storage adapter type: ' + adapterAvailable);
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
                moduleLog('Testing for storage adapter type: ' + storageType);
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

                            // get adapter config from supported type
                            for (i = 0; i < length; i = i + 1) {
                                if (adapters[i].type === storageType) {
                                    adapterAvailableConfig = adapters[i];
                                }
                            }
                            if (adapterAvailableConfig) {
                                moduleLog('Used storage type: ' + adapterAvailable);
                                callback(adapter);
                                return;
                            }

                            // if there is no config, test the next adapter type
                            moduleLog('Storage config not found: ' + adapterAvailable);
                            getStorageAdapter(callback);

                        } else {

                            // recursiv call
                            getStorageAdapter(callback);

                        }
                    });
                } else {
                    // javascript api is not supported, recursiv call
                    getStorageAdapter(callback);
                }
            } catch (e) {
                // javascript api is not (or mayby in a different standard way implemented and) supported, recursiv call
                moduleLog('Storage adapter could not be initialized: type ' + storageType, e);
                getStorageAdapter(callback);
            }

        } else {
            // automatic init with global adapters array
            getAvailableStorageAdapter(adapters, callback);
        }
    }


    /**
     * -------------------------------------------
     * storage controller
     * -------------------------------------------
     */


    /**
     * storage controller constructor
     *
     * @constructor
     * @param {function} callback The callback function
     * @param {object} parameters The optional parameters for the init function
     */
    function Storage(callback, parameters) {

        var self = this;

        // ensure Storage was called as a constructor
        if (!(self instanceof Storage)) {
            return new Storage(callback, parameters);
        }

        /**
         * @type {boolean} Enable or disable client side storage
         *
         * load resources just via xhr if
         * this option is set to false.
         */
        self.isEnabled = true;


        /**
         * @type {object} The instance of the best (or given) available storage adapter
         */
        self.adapter = null;


        /**
         * @type {object} Make the adapter types and defaults available to instance calls
         */
        self.adapters = {
            types: adapters,
            defaults: adapterDefaults
        };


        /**
         * @type {object} The instance of the application cache storage adapter
         */
        self.appCacheAdapter = null;


        /**
         * @type {object} Make the resource defaults available to instance calls
         */
        self.resourceDefaults = resourceDefaults;


        // run init function
        self.init(callback, parameters);

    }


    /**
     * storage controller methods
     *
     * @interface
     */
    Storage.prototype = Storage.fn = {

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

                    if (!data) {
                        moduleLog('Couldn\'t get data via network');
                        callback(resource);
                        return;
                    }

                    // append data to resource object and check for css urls
                    resource.data = data;
                    resource = convertRelativeToAbsoluteUrls(resource);

                    if (null !== self.adapter && isRessourceStorable(type)) {

                       // create storage content
                        var key = convertObjectToString(url),
                            storageContent = copyStorageContent(resource),
                            content = convertObjectToString(storageContent);

                        // update meta data, mainly for test suites
                        resource.expires = storageContent.expires;
                        resource.version = storageContent.version;

                        /**
                        * there is a bug in older browser versions (seamonkey)
                        * when trying to read or write from db (due to non-standard implementation),
                        * so we have to use try catch here.
                        */
                        try {
                            // create storage entry
                            self.adapter.create(key, content, function (success) {
                                if (success) {
                                    moduleLog('Create new resource in storage adapter: type ' + type + ', url ' + url);
                                    callback(resource);
                                } else {
                                    moduleLog('Create new resource in storage adapter failed');
                                    callback(false);
                                }
                            });
                        } catch (e) {
                            // just give back the resource to get the data
                            callback(resource);
                        }

                    } else {
                        moduleLog('Trying to create new resource, but resource type is not cachable or storage adapter is not available: type ' + type + ', url ' + url);
                        callback(resource);
                    }

                };

            // check callback function
            callback = checkCallback(callback);

            // get resource data based on type
            if (!!resource.ajax) {
                if (type === 'img') {
                    convertImageToBase64(url, createCallback);
                } else {
                    handleXhrRequests(url, createCallback, resource);
                }
            } else if (!!resource.data) {
                createCallback(resource.data);
            } else {
                callback(false);
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

                moduleLog('Trying to read resource from storage: type ' + type + ', url ' + url);

                /**
                 * there is a bug in older browser versions (seamonkey)
                 * when trying to read from db (due to non-standard implementation),
                 * so we have to use try catch here and fallback to xhr to get the data.
                 * 
                 */
                try {
                    self.adapter.read(convertObjectToString(url), function (data) {
                        if (data) {

                            resource = convertStringToObject(data);

                            /**
                             * check if the convertStringToObject function succeeded.
                             * could fail if resource isn't saved properly or resource parameters changed,
                             * so we remove the old resource from storage instead to create a new one.
                             */
                            if (!resource) {
                                self.remove({url: url, type: type}, function () {
                                    callback(false);
                                });
                                return;
                            }

                            resource.url = url;
                            moduleLog('Successfully read resource from storage: type ' + type + ', url ' + url);
                            callback(resource, true);
                        } else {
                            moduleLog('There is no data coming back from storage while reading: type ' + type + ', url ' + url);
                            callback(false);
                        }
                    });
                } catch (e) {
                    handleXhrRequests(url, function (data) {
                        resource.data = data;
                        moduleLog('Try to read resource from storage, but storage adapter is not available: type ' + type + ', url ' + url);
                        callback(resource, true);
                    }, resource);
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
                updateCallback = function (data) {

                    // try to use stored data if resource couldn't be updated via network
                    if (!data) {
                        moduleLog('Couldn\'t get data via network, trying to used stored version');
                        self.read(resource, function (item) {
                            if (item && item.data) {
                                resource.data = item.data;
                                callback(resource);
                            } else {
                                callback(false);
                            }
                        });

                        return;
                    }

                    // append data to resource object and check for css urls
                    resource.data = data;
                    resource = convertRelativeToAbsoluteUrls(resource);

                    if (null !== self.adapter && isRessourceStorable(type)) {

                        // create storage content
                        var key = convertObjectToString(url),
                            storageContent = copyStorageContent(resource),
                            content = convertObjectToString(storageContent);

                        // update meta data, mainly for test suites
                        resource.expires = storageContent.expires;
                        resource.version = storageContent.version;

                        /**
                        * there is a bug in older browser versions (seamonkey)
                        * when trying to read or write from db (due to non-standard implementation),
                        * so we have to use try catch here.
                        */
                        try {
                            // create storage entry
                            self.adapter.update(key, content, function (success) {
                                if (!!success) {
                                    moduleLog('Update existing resource in storage adapter: type ' + type + ', url ' + url);
                                    callback(resource);
                                } else {
                                    moduleLog('Updating resource in storage failed.');
                                    callback(false);
                                }
                            });
                        } catch (e) {
                            // just give back the resource to get the data
                            callback(resource);
                        }

                    } else {
                        moduleLog('Resource type is not cachable or storage adapter is not available: type ' + type + ', url ' + url);
                        callback(resource);
                    }
                };

            // check callback function
            callback = checkCallback(callback);

            // get resource data based on type
            if (!!resource.ajax) {
                if (type === 'img') {
                    convertImageToBase64(url, updateCallback);
                } else {
                    handleXhrRequests(url, updateCallback, resource);
                }
            } else if (!!resource.data) {
                updateCallback(resource.data);
            } else {
                callback(false);
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
                // TODO: convertObjectToString(url) for key value?
                self.adapter.remove(convertObjectToString(url), function (success) {

                    if (!success) {
                        moduleLog('Deleting resource form storage failed: type ' + type + ', url ' + url);
                        callback(false);
                        return;
                    }

                    moduleLog('Delete resource form storage: type ' + type + ', url ' + url);
                    callback(resource);
                });
            } else {
                moduleLog('Delete resource from storage failed, resource type is not cachable or there is no storage adapter: type ' + type + ', url ' + url);
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

            // check basic params
            callback = checkCallback(callback);
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
                    if (parameters.offline) {
                        adapterDefaults.offline = Boolean(parameters.offline);
                    }
                    if (parameters.version) {
                        adapterDefaults.version = String(parameters.version);
                    }
                }

                if (adapterDefaults.offline && appCacheStorageAdapter.applicationCache) {
                    self.appCacheAdapter = new appCacheStorageAdapter.applicationCache(adapterDefaults);
                }


                /**
                 * storage checking and initializing takes some time
                 * (especially for db's), so we return the current storage
                 * instance via callbacks, after the adapter get's
                 * successfully initialized.
                 *
                 * the returned adapter will already be opened and checked
                 * for support.
                 */

                getStorageAdapter(function (adapter) {
                    self.adapter = adapter;
                    callback(self);
                }, storageType);

            } else {

                /**
                 * just return the instance to get the ressource
                 * via xhr if storage is disabled or json is not
                 * available.
                 */

                if (!json) {
                    moduleLog('There is no json support');
                }
                if (!self.isEnabled) {
                    moduleLog('Caching data is disabled');
                }

                callback(self);
            }
        }

    };


    /**
     * make the storage controller constructor available for ns.cache.storage.controller()
     * calls under the ns.cache namespace, alternativly save it to window object
     * 
     * @export
     */
    if (utils.isFunction(ns.namespace)) {
        ns.namespace('cache.' + controllerType + '.controller', Storage);
    } else {
        ns[controllerType] = Storage;
    }


}(window, document)); // immediatly invoke function
