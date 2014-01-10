/*jslint browser: true, devel: true */
/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:false, curly:true, browser:true, indent:4, maxerr:50, devel:true, wsh:false*/
/*global document, undefined */


/**
 * ns.cache.storage.adapter.indexedDatabase
 *
 * @description
 * - provide a storage api for indexed database
 * - support:
 *      - Internet Explorer 10.0 +
 *      - Firefox 20.0 +
 *      - Google Crome 17.0 +
 *      - Opera 12.5 +
 *      - Maxthon 4.0.5 +
 *      - Seamonkey 2.15 +
 * 
 * @version 0.1.4
 * @author Ulrich Merkel, 2013
 * 
 * @namespace ns
 *
 * @changelog
 * - 0.1.4 example doc added
 * - 0.1.3 improved namespacing
 * - 0.1.2 several fixes for indexedDB.open for non-standard browsers
 * - 0.1.1 bug fixes delete, js lint
 * - 0.1 basic functions and structur
 * 
 * @see
 * - http://www.w3.org/TR/IndexedDB/
 * - https://developer.mozilla.org/de/docs/IndexedDB
 * - https://developer.mozilla.org/en-US/docs/IndexedDB/Using_IndexedDB
 * - https://github.com/brianleroux/lawnchair/blob/master/src/adapters/indexed-db.js
 *
 * @requires
 * - ns.helpers.utils
 * 
 * @bugs
 * -
 *
 * @example
 * 
 *      // init storage adapter
 *      var storage = new app.cache.storage.adapter.indexedDatabase(optionalParametersObject);
 *      storage.open(function (success) {
 *          if (!!success) {
 *              // instance is ready to use via e.g. storage.read()
 *          } else {
 *              // storage adapter is not supported or data couldn't be written
 *          }
 *      });
 *
 *      // read data from storage (similar to storage.remove)
 *      storage.read('key', function (data) {
 *          if (!!data) {
 *              // data successfully read
 *              var jsonObject = JSON.parse(data);
 *          } else {
 *              // data could not be read
 *          }
 *      });
 *
 *      // create data in storage (similar to storage.update)
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
    var storageType = 'indexedDatabase',                            // @type {string} The storage type string
        ns = (window.getNs && window.getNs()) || window,            // @type {object} The current javascript namespace object
        utils = ns.helpers.utils,                                   // @type {object} Shortcut for utils functions
        log = utils.log,                                            // @type {function} Shortcut for utils.log function
        checkCallback = utils.callback,                             // @type {function} Shortcut for utils.callback function
        boolIsSupported = null;                                     // @type {boolean} Bool if this type of storage is supported or not


    /**
     * -------------------------------------------
     * general helper functions
     * -------------------------------------------
     */

    /**
     * console log helper
     *
     * @param {string} message The required message to log
     */
    function moduleLog(message) {
        log('[' + storageType + ' Adapter] ' + message);
    }


    /**
     * -------------------------------------------
     * storage adapter
     * -------------------------------------------
     */

    /**
     * the actual instance constructor
     * directly called after new Adapter()
     *
     * @constructor
     * @param {object} parameters The instance parameters
     */
    function Adapter(parameters) {

        // init vars
        var self = this;

        // ensure Adapter was called as a constructor
        if (!(self instanceof Adapter)) {
            return new Adapter(parameters);
        }

        // adapter vars
        self.adapter = null;
        self.type = storageType;

        // defaults
        self.dbName = 'cache';
        self.dbVersion = '1.0';
        self.dbTable = 'offline';
        self.dbDescription = 'Local offline cache';
        self.dbKey = 'key';

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

            // check for global var
            if (null === boolIsSupported) {
                boolIsSupported =  !!window.indexedDB || !!window.webkitIndexedDB || !!window.mozIndexedDB || !!window.OIndexedDB || !!window.msIndexedDB;
                if (!boolIsSupported) {
                    moduleLog(storageType + ' is not supported');
                }
            }

            // return bool
            return boolIsSupported;

        },


        /**
         * create a new resource in storage
         * 
         * @param {string} key The required resource key
         * @param {string} content The required content string
         * @param {function} callback The optional function called on success
         */
        create: function (key, content, callback) {

            // init local vars
            var self = this,
                dbTable = self.dbTable,
                dbName = self.dbName,
                transaction = self.adapter.transaction([dbTable], 'readwrite'),
                request = transaction.objectStore(dbTable).put({
                    key: key,
                    content: content
                });

            // check params
            callback = checkCallback(callback);

            // check for transaction error
            transaction.onerror = function (e) {
                moduleLog('Failed to init transaction while creating/updating database entry ' + dbName + ' ' + e);
                callback(false, e);
            };

            // check for request error
            request.onerror = function (e) {
                moduleLog('Failed to create/update database entry ' + dbName + ' ' + e);
                callback(false, e);
            };

            // return result on success
            request.onsuccess = function () {
                callback(true);
            };

        },


        /**
         * read storage item
         *
         * @param {string} key The required key from the resource to get
         * @param {function} callback The required function called on success
         */
        read: function (key, callback) {

            // init local vars
            var self = this,
                dbTable = self.dbTable,
                dbName = self.dbName,
                transaction = self.adapter.transaction([dbTable], 'readonly'),
                request = transaction.objectStore(dbTable).get(key);

            /**
             * check for valid transaction and request objects
             */
            if (!transaction || !request) {
                callback(false);
                return;
            }

            // check for transaction error
            transaction.onerror = function (e) {
                moduleLog('Failed to init transaction while reading database ' + dbName + ' ' + e);
            };

            // check for request error
            request.onerror = function (e) {
                moduleLog('Failed to read database entry ' + dbName + ' ' + e);
                callback(false, e);
            };

            // return result on success
            request.onsuccess = function (e) {
                if (e.target.result && e.target.result.content) {
                    callback(e.target.result.content);
                } else {
                    callback(false);
                }
            };

        },


        /**
         * update a resource in storage
         * 
         * @param {string} key The required resource key
         * @param {string} content The required content string
         * @param {function} callback Function called on success
         */
        update: function (key, content, callback) {

            // same logic as this.create
            this.create(key, content, callback);

        },


        /**
        * delete a resource from storage
        * 
        * @param {string} key The required key of the resource to delete
        * @param {function} callback The optional function called on success
        */
        remove: function (key, callback) {

            // check params
            callback = checkCallback(callback);

            /**
             * hack: objectStore.delete(url) fails while parsing the js code on older
             * devices due to the reserved word 'delete',
             * so we just set the values empty here to avoid errors.
             */

            // init local vars
            var self = this,
                dbTable = self.dbTable,
                dbName = self.dbName,
                transaction = self.adapter.transaction([dbTable], 'readwrite'),
                objectStore = transaction.objectStore(dbTable),
                request = objectStore(dbTable).put({
                    key: key,
                    content: ''
                });

            // check for transaction error
            transaction.onerror = function (e) {
                moduleLog('Failed to init transaction while deleting database entry ' + dbName + ' ' + e);
                callback(false, e);
            };

            // check for request error
            request.onerror = function (e) {
                moduleLog('Failed to delete database entry ' + dbName + ' ' + e);
                callback(false, e);
            };

            // return result on success
            request.onsuccess = function () {
                callback(true);
            };

        },


        /**
         * open and initialize storage if not already done
         * 
         * @param {function} callback The optional function called on success
         * @param {boolean} setVersion The optional parameter to set the db version on indexeddb.open(), used for recursiv self.open() call if first option failed
         */
        open: function (callback, setVersion) {

            // init local function vars
            var self = this,
                windowObject = null,
                request = null,
                setVersionRequest = null,
                dbName = self.dbName,
                dbTable = self.dbTable,

                onsuccess,
                onupgradeneeded,
                onerror,
                onblocked;

            // check params
            if (!setVersion) {
                setVersion = false;
            }
            callback = checkCallback(callback);

            // check for database
            if (null === self.adapter) {

                // get window indexeddb object according to browser prefixes
                windowObject = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.OIndexedDB || window.msIndexedDB;

                // indexeddb is not supported
                if (!windowObject) {
                    callback(false);
                    return;
                }

                // chrome fix (prior version 17)
                if (window.webkitIndexedDB !== undefined) {
                    window.IDBTransaction = window.webkitIDBTransaction;
                    window.IDBKeyRange = window.webkitIDBKeyRange;
                }

                // get database after it is opened
                onsuccess = function (e) {

                    var db = request.result,
                        dbResult,
                        store;

                    self.adapter = db;

                    /**
                     * chrome till version 23 supports setVersion instead of onupgradeneeded
                     * upgradeneeded event until chrome 17 won't be fired so the objectstore isn't created.
                     *
                     * @see:
                     * - https://code.google.com/p/chromium/issues/detail?id=108223
                     * - https://code.google.com/p/chromium/issues/detail?id=161114
                     * - https://groups.google.com/a/chromium.org/forum/?fromgroups#!topic/chromium-discuss/XZbKEsLQkrY
                     */

                    if ((self.dbVersion !== db.version) && (!!db.setVersion || typeof db.setVersion === 'function')) {

                        // get db type according to bug report
                        setVersionRequest = e.currentTarget.result.setVersion(self.dbVersion);

                        // request failed
                        setVersionRequest.onfailure = function (e) {
                            moduleLog('Failed to open database: ' + dbName + ' ' + e);
                            callback(false);
                        };

                        // set version is successful, create new object store
                        setVersionRequest.onsuccess = function (e) {
                            dbResult = request.result;
                            store = dbResult.createObjectStore(dbTable, {keyPath: self.dbKey});

                            moduleLog('Database needs upgrade: ' + dbName + ' ' + e.oldVersion + ' ' + e.newVersion);

                            // create new database indexes
                            store.createIndex('key',  'key',  { unique: true });
                            store.createIndex('content',  'content',  { unique: false });

                        };

                    } else {
                        callback(db);
                    }
                };

                // database needs upgrade to new version or is not created
                onupgradeneeded = function (e) {

                    var db = request.result,
                        store = db.createObjectStore(dbTable, {keyPath: self.dbKey});

                    moduleLog('Database needs upgrade: ' + dbName + ' ' + e.oldVersion + ' ' + e.newVersion);

                    // create new database indexes
                    store.createIndex('key',  'key',  { unique: true });
                    store.createIndex('content',  'content',  { unique: false });

                };

                // database can't be opened
                onerror = function (e) {

                    moduleLog('Failed to open database: ' + dbName + ' ' + e);
                    if (!setVersion) {
                        self.open(callback, true);
                    }
                    callback(false);

                };

                // database is blocked by another process
                onblocked = function (e) {

                    moduleLog('Opening database request is blocked! ' + dbName + ' ' + e);
                    callback(false);

                };

                /**
                 * open db
                 *
                 * hack: different implementations for windowObject.open(dbName, dbVersion) in some browers,
                 * to keep it working in older versions (e.g. firefox 18.0.1 produces version error due to dbVersion param)
                 * we just set dbName parameter if setVersion param isn't set. ie10 also trigger an error here if they
                 * try to access database and the disc space is full
                 */
                if (setVersion) {

                    try {
                        request = windowObject.open(dbName, self.dbVersion);
                    } catch (e) {
                        moduleLog(e);
                        request = windowObject.open(dbName);
                    }

                } else {
                    request = windowObject.open(dbName);
                }

                // set event handlers
                request.onsuccess = onsuccess;
                request.onupgradeneeded = onupgradeneeded;
                request.onerror = onerror;
                request.onblocked = onblocked;

            } else {
                callback(self.adapter);
            }
        },


        /**
         * init storage
         *
         * @param {object} parameters The optional instance parameters
         * @param {string} [parameters.dbName=merkel] The database name
         * @param {string} [parameters.dbVersion=1.0] The database version
         * @param {string} [parameters.dbTable=offline] The database table name
         * @param {string} [parameters.dbDescription=Local cache] The database description
         * @param {string} [parameters.dbKeyPath=url] The database key
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
                    if (parameters.name) {
                        self.dbName = parameters.name;
                    }
                    if (parameters.version) {
                        self.dbVersion = parameters.version;
                    }
                    if (parameters.table) {
                        self.dbTable = parameters.table;
                    }
                    if (parameters.description) {
                        self.dbDescription = parameters.description;
                    }
                    if (parameters.key) {
                        self.dbKey = parameters.key;
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
     * make the storage constructor available for ns.cache.storage.adapter.indexedDatabase()
     * calls under the ns.cache namespace, alternativly save it to window object
     * 
     * @export
     */
    if (utils.isFunction(ns.namespace)) {
        ns.namespace('cache.storage.adapter.' + storageType, Adapter);
    } else {
        ns[storageType] = Adapter;
    }


}(window)); // immediatly invoke function
