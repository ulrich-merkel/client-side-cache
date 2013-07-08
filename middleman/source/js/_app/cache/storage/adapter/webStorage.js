/*jslint unparam: false, browser: true, devel: true, ass: true, plusplus: true, regexp: true */
/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:false, curly:true, browser:true, indent:4, maxerr:50, devel:true, wsh:false */

/*global undefined */


/**
 * app.cache.storage.adapter.webStorage
 *
 * @description
 * - provide a storage api for web storage
 * 
 * @version 0.1.4
 * @author Ulrich Merkel, 2013
 * 
 * @namespace app
 *
 * @changelog
 * - 0.1.4 polyfill moved to separate function
 * - 0.1.3 polyfill for globalStorage and ie userdata added
 * - 0.1.2 bug fixes for non-standard browsers, added trying to read item to open function
 * - 0.1.1 refactoring, js lint
 * - 0.1 basic functions and structur
 *
 * @see
 * - http://www.w3.org/TR/webstorage/
 *
 *
 * @bugs
 * -
 * 
 */
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
     * window and app are passed through as local
     * variables rather than as globals, because this (slightly)
     * quickens the resolution process and can be more
     * efficiently minified (especially when both are
     * regularly referenced in this module).
     */

    // create the global vars once
    var storageType = 'webStorage',                             // @type {string} The storage type string
        utils = app.helpers.utils,                              // @type {object} Shortcut for utils functions
        on = utils.on,                                          // @type {function} Shortcut for utils.on function
        log = utils.log,                                        // @type {function} Shortcut for utils.log function
        boolIsSupported = null;                                 // @type {boolean} Bool if this type of storage is supported or not


    /**
     * handle web storage events
     *
     * the event only fires on other windows – it won’t fire on the window that did the storing.
     * the event won’t fire if the data doesn’t change, i.e. if you store .name = 'test' and set it to 'test'
     * again it won’t fire the storage event (obviously, since nothing was stored).
     * 
     * @see http://html5doctor.com/storing-data-the-simple-html5-way-and-a-few-tricks-you-might-not-have-known/
     *
     * @param {object} e The event object
     */
    function handleStorageEvents(e) {

        // handle Internet Explorer storage event
        if (!e && window.event) {
            e = window.event;
        }

        // init local vars
        var msg = '[' + storageType + ' Adapter] Event - key: ' + (e.key || 'no e.key event') + ', url: ' + (e.url || 'no e.url event');

        // log event
        log(msg);
    }


    /**
     * get storage type
     * 
     * @param {string} type Local or session
     *
     * @return {string} The storage type string
     */
    function getStorageType(type) {

        // init default
        var result = 'localStorage';

        // get type string
        switch (type) {
        case 'local':
            result = 'localStorage';
            break;
        case 'session':
            result = 'sessionStorage';
            break;
        default:
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
     * @param {object} parameters The instance parameters
     */
    function Adapter(parameters) {

        // init local vars
        var self = this;

        // adapter vars
        self.adapter = null;
        self.type = storageType;

        // default lifetime (session or local)
        self.lifetime = 'local';

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
                    boolIsSupported = !!window[type] && !!window[type].getItem;
                } catch (e) {
                    log('[' + storageType + ' Adapter] ' + storageType + ' is not supported');
                    boolIsSupported = false;
                }
            }

            // return bool
            return boolIsSupported;

        },


        /**
         * create a new resource in storage
         * 
         * @param {object} key The resource object
         * @param {string} content The content string
         * @param {function} callback Function called on success
         */
        create: function (key, content, callback) {

            try {
                // save data and call callback
                this.adapter.setItem(key, content);
                callback(true);

            } catch (e) {
                // handle errors
                handleStorageEvents(e);
                callback(false, e);

            }

        },


        /**
         * read storage item
         *
         * @param {object} key The resource object
         * @param {function} callback Function called on success
         */
        read: function (key, callback) {

            var self = this,
                data;

            try {
                // try to load data
                data = self.adapter.getItem(key);

                // return data
                if (data) {
                    callback(data);
                } else {
                    callback(false);
                }

            } catch (e) {

                // handle errors
                handleStorageEvents(e);
                callback(false, e);

            }


        },


        /**
         * update a resource in storage
         * 
         * @param {object} key The resource object
         * @param {string} content The content string
         * @param {function} callback Function called on success
         */
        update: function (key, content, callback) {

            // same logic as this.create
            this.create(key, content, callback);

        },


        /**
         * delete a resource from storage
         * 
         * @param {object} key The resource object
         * @param {function} callback Function called on success
         */
        remove: function (key, callback) {

            try {
                // delete data and call callback
                this.adapter.removeItem(key);
                callback(key);

            } catch (e) {
                // handle errors
                handleStorageEvents(e);
                callback(false, e);

            }

        },


        /**
         * open and initialize storage if not already done
         * 
         * @param {function} callback The function called on success
         */
        open: function (callback) {

            // init local function vars
            var self = this,
                adapter = self.adapter,
                type = getStorageType(self.lifetime);

            // check for database
            if (null === adapter) {
                try {

                    // init global object
                    adapter = self.adapter = window[type];
                    on(window, 'storage', handleStorageEvents);

                    // create test item
                    log('[' + storageType + ' Adapter] Try to create test resource');
                    self.create('test-item', '{test: "test-content"}', function (success) {
                        if (!!success) {
                            self.remove('test-item', function () {
                                log('[' + storageType + ' Adapter] Test resource created and successfully deleted');
                                callback(adapter);
                                return;
                            });
                        } else {

                            callback(false);
                        }

                    });

                } catch (e) {
                    callback(false);
                    return;
                }
            } else if (self.isSupported()) {

                // adapter already initialized
                callback(adapter);
            }

        },


        /**
         * init storage
         *
         * @param {object} parameters The instance parameters
         * @param {string} [parameters.type=localStorage] Set storage type to localStorage or sessionStorage
         *
         * @return {this} The instance if supported or false
         */
        init: function (parameters) {

            // init local vars
            var self = this;

            // check for support
            if (self.isSupported()) {

                // set parameters
                if (parameters) {
                    if (parameters.lifetime) {
                        self.lifetime = parameters.lifetime;
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
     * make the storage constructor available for
     * app.cache.storage.adapter.webStorage() calls under the
     * app.cache namespace
     *
     * @export
     */
    app.namespace('cache.storage.adapter.' + storageType, Adapter);


}(window, window.app || {})); // immediatly invoke function