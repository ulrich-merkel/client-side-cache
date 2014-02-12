/*jslint browser: true, devel: true, ass: true */
/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:false, curly:true, browser:true, indent:4, maxerr:50, devel:true, wsh:false */
/*global window, undefined */


/**
 * ns.cache.storage.adapter.webStorage
 *
 * @description
 * - provide a storage api for web storage
 * - enable sychronous and asynchronous interface calls
 * - support:
 *      - Internet Explorer 8.0 +
 *      - Firefox 3.5 +
 *      - Safari 4.0 +
 *      - Google Crome 4.0 +
 *      - Opera 10.5 +
 *      - Opera Mobile 11.5 +
 *      - Maxthon 4.0.5 +
 *      - iOs 2.0 (3.2) +
 *      - Android 2.0 (2.1) +
 *      - Camino 2.1.2 +
 *      - Fake 1.8 +
 *      - Omni Web 5.11 +
 *      - Stainless 0.8 +
 *      - Seamonkey 2.15 +
 *      - Sunrise 2.2 +
 *
 * @author Ulrich Merkel (hello@ulrichmerkel.com), 2014
 * @version 0.1.8
 * 
 * @namespace ns
 * 
 * @changelog
 * - 0.1.8 improved synchronous interface, refactoring
 * - 0.1.7 example doc added, synchronous interface added
 * - 0.1.6 improved namespacing
 * - 0.1.5 improved namespacing
 * - 0.1.4 polyfill moved to separate function
 * - 0.1.3 polyfill for globalStorage and ie userdata added
 * - 0.1.2 bug fixes for non-standard browsers, trying to read item added to open function
 * - 0.1.1 refactoring, js lint
 * - 0.1 basic functions and structur
 *
 * @see
 * - http://www.w3.org/TR/webstorage/
 * - http://diveintohtml5.info/storage.html
 * - https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Storage
 *
 * @requires
 * - ns.helpers.utils
 * 
 * @bugs
 * -
 * 
 * @example
 * 
 *      // init storage adapter asynchronous
 *      var storage = new app.cache.storage.adapter.webStorage(optionalParametersObject);
 *      storage.open(function (success) {
 *          if (!!success) {
 *              // instance is ready to use via e.g. storage.read()
 *          } else {
 *              // storage adapter is not supported or data couldn't be written
 *          }
 *      });
 *
 *      // init storage adapter synchronous
 *      var storage = new app.cache.storage.adapter.webStorage(optionalParametersObject);
 *      var success = storage.open();
 *
 *      
 *      // read data from storage (similar to storage.remove)
 *      // there is a asynchronous and synchronous interface
 *      // available
 *
 *      // asynchronous way
 *      storage.read('key', function (data) {
 *          if (!!data) {
 *              // data successfully read
 *              var jsonObject = JSON.parse(data);
 *          } else {
 *              // data could not be read
 *          }
 *      });
 *      
 *      // synchronous way
 *      var data = storage.read('key'),
 *          jsonObject;
 *          
 *      if (!!data) {
 *          // data successfully read
 *          jsonObject = JSON.parse(data);
 *      } else {
 *          // data could not be read
 *      }
 *
 *      // create data in storage (similar to storage.update)
 *      // there is a asynchronous and synchronous interface
 *      // available
 *
 *      // asynchronous way
 *      var data = {
 *              custom: data
 *          },
 *          jsonString = JSON.stringify(data);
 *     
 *      storage.create('key', jsonString, function (success) {
 *          if (!!success) {
 *              // data successfully created
 *          } else {
 *              // data could not be created
 *          }
 *      });
 *
 *      // synchronous way
 *      var data = {
 *              custom: data
 *          },
 *          jsonString = JSON.stringify(data),
 *          success;
 *     
 *      success = storage.create('key', jsonString);
 *      if (!!success) {
 *          // data successfully created
 *      } else {
 *          // data could not be created
 *      }
 *      
 */
(function (window, undefined) {

    'use strict';

    /**
     * undefined is used here as the undefined global
     * variable in ECMAScript 3 and is mutable (i.e. it can
     * be changed by someone else). undefined isn't really
     * being passed in so we can ensure that its value is
     * truly undefined. In ES5, undefined can no longer be
     * modified.
     * 
     * window is passed through as local variable rather
     * than as global, because this (slightly)
     * quickens the resolution process and can be more
     * efficiently minified (especially when both are
     * regularly referenced in this module).
     */

    // create the global vars once
    var storageType = 'webStorage',                                 // @type {string} The storage type string
        ns = (window.getNs && window.getNs()) || window,            // @type {object} The current javascript namespace object
        utils = ns.helpers.utils,                                   // @type {object} Shortcut for utils functions
        on = utils.on,                                              // @type {function} Shortcut for utils.on function
        log = utils.log,                                            // @type {function} Shortcut for utils.log function
        trim = utils.trim,                                          // @type {function} Shortcut for utils.trim function
        checkCallback = utils.callback,                             // @type {function} Shortcut for utils.callback function
        boolIsSupported = null;                                     // @type {boolean} Bool if this type of storage is supported or not


    /**
     * -------------------------------------------
     * general helper functions
     * -------------------------------------------
     */

    /* start-dev-block */

    /**
     * console log helper
     *
     * @param {string} message The required message to log
     */
    function moduleLog(message) {
        log('[' + storageType + ' Adapter] ' + message);
    }

    /* end-dev-block */


    /**
     * -------------------------------------------
     * storage adapter
     * -------------------------------------------
     */

    /* start-dev-block */

    /**
     * handle web storage events
     *
     * the event only fires on other windows – it won’t fire on the window that did the storing.
     * the event won’t fire if the data doesn’t change, i.e. if you store .name = 'test' and set it to 'test'
     * again it won’t fire the storage event (obviously, since nothing was stored).
     * 
     * @see
     * - http://html5doctor.com/storing-data-the-simple-html5-way-and-a-few-tricks-you-might-not-have-known/
     *
     * @param {object} e The storage event object
     */
    function handleStorageEvents(e) {

        // handle Internet Explorer storage event
        if (!e && window.event) {
            e = window.event;
        }

        // log event
        moduleLog('Event - key: ' + (e.key || 'no e.key event') + ', url: ' + (e.url || 'no e.url event'));

    }

    /* end-dev-block */


    /**
     * get storage type
     * 
     * @param {string} type Local or session
     *
     * @return {string} The storage type string
     */
    function getStorageType(type) {

        // init local vars
        var result;

        // check params
        type = trim(type);
        // get type string
        switch (type) {
        case 'local':
            result = 'localStorage';
            break;
        case 'session':
            result = 'sessionStorage';
            break;
        default:
            result = 'localStorage';
            break;
        }

        // return result
        return result;
    }


    /**
     * the actual instance constructor
     * directly called after new Adapter()
     *
     * @constructor
     * @param {object} parameters The optional instance parameters
     */
    function Adapter(parameters) {

        // init local vars
        var self = this;

        // ensure Adapter was called as a constructor
        if (!(self instanceof Adapter)) {
            return new Adapter(parameters);
        }

        // adapter vars
        self.adapter = null;
        self.type = storageType;

        // default lifetime (session or local)
        self.lifetime = 'local';

        // false = 'synchonous', true = 'asynchonous'
        self.asynch = true;

        // run init function
        self.init(parameters);

    }


    /**
     * public instance methods
     *
     * Adapter.fn is just a shortcut for Adapter.prototype
     *
     * @interface
     */
    Adapter.prototype = Adapter.fn = {

        /**
         * test if the browser supports this type of caching
         * 
         * @returns {boolean} Whether this type of storage is supported or not
         */
        isSupported: function () {

            var self = this,
                type = getStorageType(self.lifetime);

            // check for global var
            if (null === boolIsSupported) {
                try {
                    // additionally test for getItem method
                    boolIsSupported = !!window[type] && !!window[type].getItem;
                } catch (e) {

                    /* start-dev-block */
                    moduleLog(storageType + ' is not supported', e);
                    /* end-dev-block */

                    boolIsSupported = false;
                }
            }

            // return bool
            return boolIsSupported;

        },


        /**
         * create a new resource in storage
         * 
         * @param {string} key The required resource object
         * @param {string} content The required content string
         * @param {function} callback The optional function called on success
         *
         * @returns {boolean} The functions success state
         */
        create: function (key, content, callback) {

            // init local vars
            var self = this,
                result = true,
                checkAsynch = function (data) {
                    if (self.asynch) {
                        callback(data);
                    } else {
                        return data;
                    }
                };

            // check params
            callback = checkCallback(callback);
            if (!key) {
                return checkAsynch(false);
            }

            try {

                // save data and call callback
                self.adapter.setItem(key, content);

            } catch (e) {

                // handle errors
                result = !result;

                /* start-dev-block */
                handleStorageEvents(e);
                /* end-dev-block */

            }

            // return asynch or synchron result
            return checkAsynch(result);

        },


        /**
         * read storage item
         *
         * @param {string} key The required resource object
         * @param {function} callback The optional function called on success
         *
         * @returns {(boolean|string)} The resource data string if found
         */
        read: function (key, callback) {

            var self = this,
                data,
                result = true,
                checkAsynch = function (data) {
                    if (self.asynch) {
                        callback(data);
                    } else {
                        return data;
                    }
                };

            // check params
            callback = checkCallback(callback);
            if (!key) {
                return checkAsynch(false);
            }

            try {
                // try to load data
                data = self.adapter.getItem(key);

                // return data
                if (!!data) {
                    result = data;
                } else {
                    result = false;
                }

            } catch (e) {

                // handle errors
                result = !result;

                /* start-dev-block */
                handleStorageEvents(e);
                /* end-dev-block */

            }

            // return asynch or synchron result
            return checkAsynch(result);

        },


        /**
         * update a resource in storage
         * 
         * @param {string} key The required resource object
         * @param {string} content The required content string
         * @param {function} callback The optional function called on success
         *
         * @returns {boolean} The functions success state
         */
        update: function (key, content, callback) {

            // init local vars
            var self = this;

            // return asynch or synchron result
            // same logic as this.create
            if (self.asynch) {
                self.create(key, content, callback);
            } else {
                return self.create(key, content, callback);
            }

        },


        /**
         * delete a resource from storage
         * 
         * @param {string} key The required resource object
         * @param {function} callback The optional function called on success
         *
         * @returns {boolean} The functions success state
         */
        remove: function (key, callback) {

            // init local vars
            var self = this,
                result = true,
                checkAsynch = function (data) {
                    if (self.asynch) {
                        callback(data);
                    } else {
                        return data;
                    }
                };

            // check params
            callback = checkCallback(callback);
            if (!key) {
                return checkAsynch(false);
            }

            try {

                // delete data and call callback
                self.adapter.removeItem(key);

            } catch (e) {

                // handle errors
                result = !result;

                /* start-dev-block */
                handleStorageEvents(e);
                /* end-dev-block */

            }

            // return asynch or synchron result
            return checkAsynch(result);
        },


        /**
         * open and initialize storage if not already done
         * 
         * @param {function} callback The optional function called on success
         */
        open: function (callback) {

            // init local function vars
            var self = this,
                adapter = self.adapter,
                type = getStorageType(self.lifetime),
                testItemCreated,
                testItemDeleted,
                testItemKey = 'test-item',
                testItemContent = '{test: "test-content"}',
                checkAsynch = function (data) {
                    if (self.asynch) {
                        callback(data);
                    } else {
                        return data;
                    }
                };

            callback = checkCallback(callback);

            // check for adapter already initiliazed
            if (null === adapter) {
                try {

                    // init global object
                    adapter = self.adapter = window[type];

                    /* start-dev-block */
                    on(window, 'storage', handleStorageEvents);
                    moduleLog('Lifetime used: ' + type);
                    /* end-dev-block */

                    /* start-dev-block */
                    moduleLog('Try to create test resource');
                    /* end-dev-block */

                    // create test item
                    if (self.asynch) {
                        self.create(testItemKey, testItemContent, function (success) {
                            if (!!success) {
                                self.remove(testItemKey, function () {

                                    /* start-dev-block */
                                    moduleLog('Test resource created and successfully deleted');
                                    /* end-dev-block */

                                    // return result
                                    callback(adapter);

                                });
                            } else {
                                // return result
                                callback(false);
                            }
                        });
                    } else {
                        testItemCreated = self.create(testItemKey, testItemContent);
                        if (!!testItemCreated) {

                            testItemDeleted = self.remove(testItemKey);
                            if (testItemDeleted) {

                                /* start-dev-block */
                                moduleLog('Test resource created and successfully deleted');
                                /* end-dev-block */

                                // return result
                                return adapter;
                            }

                        }

                        // return result
                        return false;
                    }

                } catch (e) {

                    /* start-dev-block */
                    handleStorageEvents(e);
                    /* end-dev-block */

                    // return asynch or synchron result
                    return checkAsynch(false);
                }
            } else if (self.isSupported()) {

                // return asynch or synchron result
                return checkAsynch(adapter);
            }

        },


        /**
         * init storage
         *
         * @param {object} parameters The optional instance parameters
         * @param {string} [parameters.lifetime=localStorage] Set storage type to localStorage or sessionStorage
         *
         * @return {(this|false)} The instance if supported or false
         */
        init: function (parameters) {

            // init local vars
            var self = this;

            // check for support
            if (self.isSupported()) {

                // set parameters
                if (parameters) {
                    if (parameters.lifetime) {
                        self.lifetime = trim(String(parameters.lifetime));
                    }
                    if (parameters.asynch !== undefined) {
                        self.asynch = !!parameters.asynch;
                    }
                }

                // return instance
                return self;
            }

            // return false if there is no support
            return false;
        }

    };


    /**
     * make the storage constructor available for ns.cache.storage.adapter.webStorage()
     * calls under the ns.cache namespace, alternativly save it to window object
     * 
     * @export
     */
    if (utils.isFunction(ns.ns)) {
        ns.ns('cache.storage.adapter.' + storageType, Adapter);
    } else {
        ns[storageType] = Adapter;
    }


}(window)); // immediatly invoke function
