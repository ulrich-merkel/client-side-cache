/*jslint unparam: false, browser: true, devel: true */
/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:false, curly:true, browser:true, indent:4, maxerr:50, devel:true, wsh:false */

/*global document */
/*global undefined */
/*gloabl QUOTA_EXCEEDED_ERR */


/**
 * app.cache.webStorage
 *
 * @description
 * - provide a storage api for web storage
 * 
 * @version 0.1.1
 * @author Ulrich Merkel, 2013
 * 
 * @namespace app
 *
 * @changelog
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
    var storageType = 'webStorage',                             // storageType {string} The storage type string
        utils = app.helper.utils,                               // utils {object} Shortcut for utils functions
        log = utils.log,                                        // log {function} Shortcut for utils.log function
        boolIsSupported = null;                                 // boolIsSupported {boolean} Bool if this type of storage is supported or not


    /**
     * handle web storage events
     *
     * @param {object} e The event object
     */
    function handleStorageEvents(e) {

        // handle Internet Explorer storage event
        if (!e) {
            e = window.event;
        }

        // init local vars
        var msg = '[' + storageType + ' Adapter] Event - key: ' + e.key + ', url: ' + e.url + ', oldValue: ' + e.oldValue + ', newValue: ' + e.newValue;

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

        // init local vars
        var result = false;

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
     * directly called after new Storage()
     * 
     * @param {object} parameters The instance parameters
     */
    function Adapter(parameters) {

        // init local vars
        var self = this;

        self.adapter = null;
        self.type = storageType;
        self.lifetime = 'local';     // session or local

        // run init function
        self.init(parameters);

    }


    /**
     * instance methods
     */
    Adapter.prototype = {

        /**
         * test if the browser supports this type of caching
         * 
         * @returns {boolean} Whether this type of storage is supported or not
         */
        isSupported: function () {

            // check for global var
            if (null === boolIsSupported) {
                try {
                    boolIsSupported = !!window.localStorage.getItem && !!window.sessionStorage.getItem;
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
         * @param {object} resource The resource object
         * @param {string} data The content string
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
         * @param {object} resource The resource object
         * @param {function} callback Function called on success
         */
        read: function (key, callback) {

            try {
                // try to load data
                var data = this.adapter.getItem(key);

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
         * @param {object} resource The resource object
         * @param {string} data The content string
         * @param {function} callback Function called on success
         */
        update: function (key, content, callback) {

            this.create(key, content, callback);

        },


        /**
         * delete a resource from storage
         * 
         * @param {object} resource The resource object
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
                adapter = self.adapter = window[type];
                utils.bind(window, 'storage', handleStorageEvents);
            }
            callback(adapter);

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
     * app.cache.webStorage() calls under the
     * app.cache namespace
     */
    app.cache.storage.adapter[storageType] = Adapter;


}(window, window.app || {})); // immediatly invoke function
