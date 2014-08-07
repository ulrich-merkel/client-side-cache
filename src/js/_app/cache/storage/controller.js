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
 * @version 0.1.7
 * @author Ulrich Merkel (hello@ulrichmerkel.com), 2014
 * 
 * @namespace ns
 *
 * @changelog
 * - 0.1.7 bug fixes for outdated browsers and options passed ins
 * - 0.1.6 logging improved
 * - 0.1.5 improved namespacing
 * - 0.1.4 timeout for xhr connections added
 * - 0.1.3 bug fix when checking adapter support - additionally checking with adapter.open and not just isSupported, modified getStorageAdapter function
 * - 0.1.2 refactoring, js lint
 * - 0.1.1 bug fix init when cache storage is disabled
 * - 0.1 basic functions and structure
 *
 * @see
 * - http://www.html5rocks.com/en/tutorials/offline/storage/
 * - http://www.html5rocks.com/de/features/storage
 *
 * @requires
 * - ns.helpers.namespace
 * - ns.helpers.utils
 * - ns.helpers.client
 * 
 * @bugs
 * - 
 * 
 */
(function (window, document, ns, undefined) {

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
     * efficiently minified (especially regularly
     * referenced in this module).
     */

    // module vars
    var controllerType = 'storage',                                 // @type {string} The controller type string
        helpers = ns.helpers,                                       // @type {object} Shortcut for helper functions
        client = helpers.client,                                    // @type {object} Shortcut for client functions
        utils = helpers.utils,                                      // @type {object} Shortcut for utils functions
        jsonHelper = helpers.json,                                  // @type {object} Shortcut for json functions
        ajax = helpers.ajax,                                        // @type {object} Shortcut for ajax functions
        isArray = utils.isArray,                                    // @type {function} Shortcut for utils.isArray function
        log = helpers.console.log,                                  // @type {function} Shortcut for console.log function
        checkCallback = utils.callback,                             // @type {function} Shortcut for utils.callback function
        json = jsonHelper.getJson(),                                // @type {object} Global window.Json object if available
        xhr = ajax.xhr,                                             // @type {function} Shortcut for utils.xhr function
        trim = utils.trim,                                          // @type {function} Shortcut for utils.trim function
        appCacheStorageAdapter = ns.cache.storage.adapter,          // @type {object} Shortcut for ns.cache.storage.adapter namespace
        isWebkit = client.isWebkit(),                               // @type {boolean} Whether the client is webkit based or not
        hasCanvasSupport = client.hasCanvas(),                      // @type {boolean} Whether there is canvas support or not

        /**
         * Config array with objects for different storage types
         * 
         * this is the place to configure the defaults values which types of
         * adapters will be checked in which order and which resource types 
         * are stored in which adapter type.
         *
         * @type {array}
         */
        adapterTypes = [
            {type: 'fileSystem', css: true, js: true, html: true, img: true },
            {type: 'indexedDatabase', css: true, js: true, html: true, img: true },
            {type: 'webSqlDatabase', css: true, js: true, html: true, img: true },
            {type: 'webStorage', css: true, js: true, html: true, img: true }
        ],


        /**
         * The default options for initializing the storage adapter
         *
         * this is the default config for storage adapters and could be
         * overridden by the passed in parameters.
         *
         * @type {object}
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


        /**
         * some internal vars to keep track globally of the current adapter state
         * 
         */
        adapterAvailable = null,                                // @type {string} The name of the best available adapter after testing
        adapterAvailableConfig = null,                          // @type {object} The adapter config for the available type (see adapters object)


        /**
         * The defaults for a single resource
         *
         * this config could be overridden by the passed in resource parameters.
         *
         * @type {object}
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

    /* start-dev-block */

    /**
     * console log helper
     *
     * @param {string} message The message to log
     */
    function moduleLog(message) {
        log('[' + controllerType + ' controller] ' + message);
    }


    /**
     * handle storage error events
     *
     * @param {object} e The javascript error event
     */
    function handleStorageEvents(e) {

        // init message string
        var msg = '';

        // check for object
        if (e) {
            msg = 'Error Event: Description ' + (e.description || 'no description available');
        }

        // log error
        moduleLog(msg);

    }

    /* end-dev-block */


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
        resource.timeoutXhr = window.setTimeout(function () {
            callback(false);
        }, 4000);

        // make xhr call and check data
        xhr(url, function (data) {

            window.clearTimeout(resource.timeoutXhr);
            delete resource.timeoutXhr;

            if (!!data) {
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
        return jsonHelper.jsonToString(object);
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
            result = jsonHelper.jsonToObject(string);
        } catch (e) {

            /* start-dev-block */
            handleStorageEvents(e);
            moduleLog('Couldn\'t convert json string to object.');
            /* end-dev-block */

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

            // async event handler when image is loaded
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

                // draw background, start on top/left and set full width/height
                context.fillRect(0, 0, width, height);

                // draw image in canvas on top/left
                context.drawImage(image, 0, 0);

                // get base64 data string and return result
                result = canvas.toDataURL('image/' + imageType);
                callback(result);

            };

            /**
             * for webkit browsers, the following line ensures load event fires if
             * image src is the same as last image src. This is done by setting
             * the src to an empty string initially.
             *
             * @see
             * - Supercharged JavaScript Graphics (O'Reilly, page 83)
             */
            if (isWebkit) {
                image.src = '';
            }


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
     * used within css resource string  data (e.g css background urls),
     * this needs to be done because the css string a put directly into the
     * html structure and therefor all relative url paths needs to change
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
             * search for different css code styles for embedding urls
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
     * remove url from resource data string to avoid duplicate data in storage (url will be saved as key).
     * we also set the new expires timestamp here, because this function will
     * only be called from create/update to get a copy from the resource content.
     *
     * node parameters won't be saved to append one resource to multiple elements.
     * 
     * @param {object} resource The resource object item
     * @param {object} selfResourcesDefaults The resource defaults
     * 
     * @returns {object} Returns the copied resource data
     */
    function copyStorageContent(resource, selfResourcesDefaults) {

        // set new data for storage content
        return {
            ajax: resource.ajax,
            data: resource.data,
            expires: new Date().getTime() + (resource.lifetime || selfResourcesDefaults.lifetime),
            group: (resource.group !== undefined ? resource.group : selfResourcesDefaults.group),
            lastmod: resource.lastmod || selfResourcesDefaults.lastmod,
            lifetime: (resource.lifetime !== undefined ? resource.lifetime : selfResourcesDefaults.lifetime),
            type: resource.type || selfResourcesDefaults.type,
            version: resource.version || selfResourcesDefaults.version
        };
    }


    /**
     * check for image parsing and custom data
     *
     * @param
     * @param
     * @param
     */
    function chooseLoading(resource, createCallback, callback) {

        // init local vars
        var type = resource.type,
            url = resource.url,
            data = resource.data;

        if (!!resource.ajax) {
            // if updated via network flag is set, check for parsing images
            if (type === 'img') {
                convertImageToBase64(url, createCallback);
            } else {
                handleXhrRequests(url, createCallback, resource);
            }
        } else if (!!data) {
            // data is set in request, handling custom data
            createCallback(data);
        } else {
            // error callback
            callback(false);
        }
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
     * get available storage adapter recursively
     * automatically try to init each storage adapter until a supported adapter is found
     *
     * @param {array} storageAdapters The storage types
     * @param {function} callback The callback function 
     */
    function getAvailableStorageAdapter(storageAdapters, callback) {

        // init local vars
        var adapter = null,
            storageType,
            storageAdaptersSliced;

        // end of recursive loop reached, no adapter available
        if (!storageAdapters || !storageAdapters.length) {
            callback(false);
            return;
        }

        // init storage, check support and save vars for better compression
        storageType = storageAdapters[0].type;
        storageAdaptersSliced = storageAdapters.slice(1);

        /* start-dev-block */
        moduleLog('Testing for storage adapter type: ' + storageType);
        /* end-dev-block */

        // check for storage adapter
        if (!!appCacheStorageAdapter[storageType]) {
            // get new storage adapter instance
            adapter = new appCacheStorageAdapter[storageType](adapterDefaults);
        } else {
            // recursive call
            getAvailableStorageAdapter(storageAdaptersSliced, callback);
        }

        // check for general javascript api support
        if (adapter && adapter.isSupported()) {

            // storage api is available, try to open storage
            adapter.open(function (success) {

                if (!!success) {

                    adapterAvailable = storageType;
                    adapterAvailableConfig = storageAdapters[0];

                    /* start-dev-block */
                    moduleLog('Used storage adapter type: ' + adapterAvailable);
                    /* end-dev-block */

                    callback(adapter);

                } else {

                    // recursive call
                    getAvailableStorageAdapter(storageAdaptersSliced, callback);

                }
            });

        } else {

            // recursive call
            getAvailableStorageAdapter(storageAdaptersSliced, callback);
        }
    }


    /**
     * get storage adapter
     *
     * @param {function} callback The required callback function
     * @param {array} storageAdapters The required storage adapter config
     * @param {string} preferredStorageType The optional preferred storage type
     */
    function getStorageAdapter(callback, storageAdapters, preferredStorageType) {

        // init local vars
        var adapter = null,
            i = 0,
            length;

        // if storage type is set, try to initialize it
        if (preferredStorageType) {

            try {

                /* start-dev-block */
                moduleLog('Testing for preferred storage adapter type: ' + preferredStorageType);
                /* end-dev-block */

                // init storage and check support
                if (appCacheStorageAdapter[preferredStorageType]) {
                    adapter = new appCacheStorageAdapter[preferredStorageType](adapterDefaults);
                } else {
                    getStorageAdapter(callback, storageAdapters);
                    return;
                }

                if (adapter && adapter.isSupported()) {

                    // storage api is available, try to open storage
                    adapter.open(function (success) {
                        if (!!success) {

                            adapterAvailable = preferredStorageType;
                            length = storageAdapters.length;

                            // get adapter config from supported type
                            for (i = 0; i < length; i = i + 1) {
                                if (storageAdapters[i].type === preferredStorageType) {
                                    adapterAvailableConfig = storageAdapters[i];
                                }
                            }

                            if (adapterAvailableConfig) {

                                /* start-dev-block */
                                moduleLog('Used storage type: ' + adapterAvailable);
                                /* end-dev-block */

                                callback(adapter);
                                return;
                            }

                            /* start-dev-block */
                            moduleLog('Storage config not found: ' + adapterAvailable);
                            /* end-dev-block */

                            // if there is no config, test the next adapter type
                            getStorageAdapter(callback, storageAdapters);

                        } else {

                            // recursive call
                            getStorageAdapter(callback, storageAdapters);

                        }
                    });
                } else {
                    // javascript api is not supported, recursiv call
                    getStorageAdapter(callback, storageAdapters);
                }
            } catch (e) {

                /* start-dev-block */
                handleStorageEvents(e);
                moduleLog('Storage adapter could not be initialized: type ' + preferredStorageType);
                /* end-dev-block */

                // javascript api is not (or mayby in a different standard way implemented and) supported, recursiv call
                getStorageAdapter(callback, storageAdapters);
            }

        } else {
            // automatic init with global adapters array
            getAvailableStorageAdapter(storageAdapters, callback);
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
         * Enable or disable client side storage
         *
         * load resources just via xhr if
         * this option is set to false.
         *
         * @type {boolean}
         */
        self.isEnabled = true;

        /**
         * The instance of the best (or given) available storage adapter
         *
         * @type {object}
         */
        self.adapter = null;

        /**
         * The instance of the application cache storage adapter
         *
         * @type {object}
         */
        self.appCacheAdapter = null;

        /**
         * Make the adapter types and defaults available to instance calls
         *
         * @type {object}
         */
        self.adapters = {
            types: adapterTypes,
            defaults: adapterDefaults
        };

        /**
         * Make the resource defaults available to instance calls
         *
         * @type {object}
         */
        self.resources = {
            defaults: resourceDefaults
        };

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

            // check params
            callback = checkCallback(callback);
            if (!resource || !resource.url) {
                callback(false);
                return;
            }

            // init local vars
            var self = this,
                url = resource.url,
                type = resource.type,
                createCallback = function (data) {

                    if (!data) {

                        /* start-dev-block */
                        moduleLog('Couldn\'t get data via network');
                        /* end-dev-block */

                        callback(resource);
                        return;
                    }

                    // append data to resource object and check for css urls
                    resource.data = data;
                    resource = convertRelativeToAbsoluteUrls(resource);

                    if (null !== self.adapter && isRessourceStorable(type)) {

                       // create storage content
                        var key = convertObjectToString(url),
                            storageContent = copyStorageContent(resource, self.resources.defaults),
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

                                    /* start-dev-block */
                                    moduleLog('Create new resource in storage adapter: type ' + type + ', url ' + url);
                                    /* end-dev-block */

                                    callback(resource);
                                } else {

                                    /* start-dev-block */
                                    moduleLog('Create new resource in storage adapter failed');
                                    /* end-dev-block */

                                    callback(false);
                                }
                            });
                        } catch (e) {

                            /* start-dev-block */
                            handleStorageEvents(e);
                            moduleLog('Create new resource in storage adapter failed');
                            /* end-dev-block */

                            // just give back the resource to get the data
                            callback(resource);
                        }

                    } else {

                        /* start-dev-block */
                        moduleLog('Trying to create new resource, but resource type is not cachable or storage adapter is not available: type ' + type + ', url ' + url);
                        /* end-dev-block */

                        callback(resource);
                    }

                };

            // get resource data based on type
            chooseLoading(resource, createCallback, callback);

        },


        /**
         * read resource from storage
         *
         * @param {object} resource The resource object
         * @param {function} callback The callback function
         */
        read: function (resource, callback) {

            // check params
            callback = checkCallback(callback);
            if (!resource || !resource.url) {
                callback(false);
                return;
            }

            // init local vars
            var self = this,
                url = resource.url,
                type = resource.type;

            // try to read from storage
            if (null !== this.adapter && isRessourceStorable(type)) {

                /* start-dev-block */
                moduleLog('Trying to read resource from storage: type ' + type + ', url ' + url);
                /* end-dev-block */

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

                            /* start-dev-block */
                            moduleLog('Successfully read resource from storage: type ' + type + ', url ' + url);
                            /* end-dev-block */

                            callback(resource, true);
                        } else {

                            /* start-dev-block */
                            moduleLog('There is no data coming back from storage while reading: type ' + type + ', url ' + url);
                            /* end-dev-block */

                            callback(false);
                        }
                    });
                } catch (e) {

                    /* start-dev-block */
                    handleStorageEvents(e);
                    moduleLog('Try to read resource from storage, but storage adapter is not available: type ' + type + ', url ' + url);
                    /* end-dev-block */

                    handleXhrRequests(url, function (data) {

                        /* start-dev-block */
                        moduleLog('Data loaded via ajax: type ' + type + ', url ' + url + ', data status ' + !!data);
                        /* end-dev-block */

                        resource.data = data;
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

            // check params
            callback = checkCallback(callback);
            if (!resource || !resource.url) {
                callback(false);
                return;
            }

            // init local vars
            var self = this,
                url = resource.url,
                type = resource.type,
                updateCallback = function (data) {

                    // try to use stored data if resource couldn't be updated via network
                    if (!data) {

                        /* start-dev-block */
                        moduleLog('Couldn\'t get data via network, trying to used stored version');
                        /* end-dev-block */

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
                            storageContent = copyStorageContent(resource, self.resources.defaults),
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

                                    /* start-dev-block */
                                    moduleLog('Updated existing resource in storage adapter: type ' + type + ', url ' + url);
                                    /* end-dev-block */

                                    callback(resource);
                                } else {

                                    /* start-dev-block */
                                    moduleLog('Updating resource in storage failed.');
                                    /* end-dev-block */

                                    callback(false);
                                }
                            });
                        } catch (e) {

                            /* start-dev-block */
                            handleStorageEvents(e);
                            moduleLog('Updating resource in storage failed.');
                            /* end-dev-block */

                            // just give back the resource to get the data
                            callback(resource);
                        }

                    } else {

                        /* start-dev-block */
                        moduleLog('Resource type is not cachable or storage adapter is not available: type ' + type + ', url ' + url);
                        /* end-dev-block */

                        callback(resource);
                    }
                };

            // get resource data based on type
            chooseLoading(resource, updateCallback, callback);

        },


        /**
         * remove resource from storage
         *
         * @param {object} resource The resource object
         * @param {function} callback The callback function
         */
        remove: function (resource, callback) {

            // check params
            callback = checkCallback(callback);
            if (!resource || !resource.url) {
                callback(false);
                return;
            }

            // init local vars
            var self = this,
                url = resource.url,
                type = resource.type;

            // try to remove resource from storage
            if (null !== self.adapter && isRessourceStorable(type)) {
                self.adapter.remove(convertObjectToString(url), function (success) {

                    if (!success) {

                        /* start-dev-block */
                        moduleLog('Deleting resource form storage failed: type ' + type + ', url ' + url);
                        /* end-dev-block */

                        callback(false);
                        return;
                    }

                    /* start-dev-block */
                    moduleLog('Delete resource form storage: type ' + type + ', url ' + url);
                    /* end-dev-block */

                    callback(resource);
                });
            } else {

                /* start-dev-block */
                moduleLog('Delete resource from storage failed, resource type is not cachable or there is no storage adapter: type ' + type + ', url ' + url);
                /* end-dev-block */

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
                preferredAdapterType = false,
                parametersAdapters,
                parametersAdapterTypes,
                parametersAdapterTypesLength,
                parametersAdapterDefaults,
                parametersResources,
                parametersResourceDefaults,
                selfAdapterDefaults,
                selfResourceDefaults,
                i;

            // check basic params
            callback = checkCallback(callback);
            if (parameters && parameters.isEnabled !== undefined) {
                self.isEnabled = !!parameters.isEnabled;
            }

            // init storage and adapters
            if (self.isEnabled && json) {

                // set parameters
                if (parameters) {

                    // check adapter params
                    if (parameters.adapters) {

                        parametersAdapters = parameters.adapters;

                        // check adapter type params
                        if (parametersAdapters.types && isArray(parametersAdapters.types)) {

                            parametersAdapterTypes = parametersAdapters.types;
                            parametersAdapterTypesLength = parametersAdapterTypes.length;

                            // set resource cachable options to defaults if not set
                            for (i = 0; i < parametersAdapterTypesLength; i = i + 1) {
                                if (parametersAdapterTypes[i].css === undefined) {
                                    parametersAdapterTypes[i].css = true;
                                }
                                if (parametersAdapterTypes[i].js === undefined) {
                                    parametersAdapterTypes[i].js = true;
                                }
                                if (parametersAdapterTypes[i].img === undefined) {
                                    parametersAdapterTypes[i].img = true;
                                }
                                if (parametersAdapterTypes[i].html === undefined) {
                                    parametersAdapterTypes[i].html = true;
                                }
                            }

                            self.adapters.types = parametersAdapterTypes;

                        }

                        // check adapter defaults params
                        if (parametersAdapters.defaults) {

                            parametersAdapterDefaults = parametersAdapters.defaults;
                            selfAdapterDefaults = self.adapters.defaults;

                            // set adapter defaults
                            if (parametersAdapterDefaults.name) {
                                selfAdapterDefaults.name = trim(String(parametersAdapterDefaults.name));
                            }
                            if (parametersAdapterDefaults.table) {
                                selfAdapterDefaults.table = trim(String(parametersAdapterDefaults.table));
                            }
                            if (parametersAdapterDefaults.description) {
                                selfAdapterDefaults.description = trim(String(parametersAdapterDefaults.description));
                            }
                            if (parametersAdapterDefaults.size) {
                                selfAdapterDefaults.size = parseInt(parametersAdapterDefaults.size, 10);
                            }
                            if (parametersAdapterDefaults.version) {
                                selfAdapterDefaults.version = trim(String(parametersAdapterDefaults.version));
                            }
                            if (parametersAdapterDefaults.key) {
                                selfAdapterDefaults.key = trim(String(parametersAdapterDefaults.key));
                            }
                            if (parametersAdapterDefaults.lifetime) {
                                selfAdapterDefaults.lifetime = trim(String(parametersAdapterDefaults.lifetime));
                            }
                            if (parametersAdapterDefaults.offline !== undefined) {
                                selfAdapterDefaults.offline = !!(parametersAdapterDefaults.offline);
                            }

                        }

                        if (parametersAdapters.preferredType) {
                            preferredAdapterType = trim(String(parametersAdapters.preferredType));
                        }

                    }

                    // check resource params
                    if (parameters.resources) {

                        parametersResources = parameters.resources;

                        if (parametersResources.defaults) {

                            parametersResourceDefaults = parametersResources.defaults;
                            selfResourceDefaults = self.resources.defaults;

                            // set resources defaults
                            if (parametersResourceDefaults.ajax !== undefined) {
                                selfResourceDefaults.ajax = !!parametersResourceDefaults.ajax;
                            }
                            if (parametersResourceDefaults.lifetime !== undefined) {
                                selfResourceDefaults.lifetime = parseInt(parametersResourceDefaults.lifetime, 10);
                            }
                            if (parametersResourceDefaults.group !== undefined) {
                                selfResourceDefaults.group = parseInt(parametersResourceDefaults.group, 10);
                            }
                            if (parametersResourceDefaults.lastmod !== undefined) {
                                selfResourceDefaults.lastmod = parseInt(parametersResourceDefaults.lastmod, 10);
                            }
                            if (parametersResourceDefaults.type) {
                                selfResourceDefaults.type = trim(String(parametersResourceDefaults.type));
                            }
                            if (parametersResourceDefaults.group !== undefined) {
                                selfResourceDefaults.version = parseFloat(parametersResourceDefaults.version);
                            }
                            if (parametersResourceDefaults.loaded) {
                                selfResourceDefaults.loaded = checkCallback(parametersResourceDefaults.loaded);
                            }
                        }
                    }
                }


                /**
                 * storage checking and initializing takes some time
                 * (especially for db's), so we return the current storage
                 * instance via callbacks, after the adapter is
                 * successfully initialized.
                 *
                 * the returned adapter will already be opened and checked
                 * for support.
                 */

                getStorageAdapter(function (adapter) {

                    // set isEnabled to false, if there is no adapter available
                    if (!adapter) {
                        self.isEnabled = false;
                    }

                    self.adapter = adapter;
                    callback(self);
                }, self.adapters.types, preferredAdapterType);

                if (self.adapters.defaults.offline && appCacheStorageAdapter.applicationCache && !self.appCacheAdapter) {
                    self.appCacheAdapter = new appCacheStorageAdapter.applicationCache(adapterDefaults);
                }

            } else {

                /**
                 * just return the instance to get the resource
                 * via xhr if storage is disabled or json is not
                 * available.
                 */

                /* start-dev-block */
                if (!json) {
                    moduleLog('There is no json support');
                }
                if (!self.isEnabled) {
                    moduleLog('Caching data is disabled');
                }
                /* end-dev-block */

                callback(self);
            }
        }

    };


    /**
     * make the storage controller constructor available for ns.cache.storage.controller()
     * calls under the ns.cache namespace, alternatively save it to window object
     * 
     * @export
     */
    ns.ns('cache.' + controllerType + '.controller', Storage);


}(window, document, window.getNs())); // immediately invoke function
