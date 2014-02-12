/*global window, undefined */

/**
 * ns.cache.storage.adapter.webSqlDatabase
 *
 * @description
 * - provide a storage api for web sql database
 * - support:
 *      - Safari 3.1 +
 *      - Google Crome 4.0 +
 *      - Opera 10.5 +
 *      - Maxthon 4.0.5 +
 *      - iOs 6.1 + (3.2)
 *      - Android 2.1 +
 *
 * @version 0.1.8
 * @author Ulrich Merkel (hello@ulrichmerkel.com), 2014
 * 
 * @namespace ns
 *
 * @changelog
 * - 0.1.8 bug fix opening database first time
 * - 0.1.7 read bug fix with non-existing resource
 * - 0.1.6 example doc added
 * - 0.1.5 improved namespacing
 * - 0.1.4 improved namespacing
 * - 0.1.3 refactoring, js lint
 * - 0.1.2 several version change bug fixes
 * - 0.1.1 refactoring, js lint
 * - 0.1 basic functions and structur
 *
 * @see
 * - http://www.w3.org/TR/webdatabase/
 * - http://developer.apple.com/library/safari/#documentation/iphone/conceptual/safarijsdatabaseguide/UsingtheJavascriptDatabase/UsingtheJavascriptDatabase.html
 * - http://html5doctor.com/introducing-web-sql-databases/
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
 *      var storage = new app.cache.storage.adapter.webSqlDatabase(optionalParametersObject);
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
    var storageType = 'webSqlDatabase',                             // @type {string} The storage type string
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

    /**
     * execute sql statement
     *
     * @param {object} adapter The required current storage object interface
     * @param {string} sqlStatement The required sql statement
     * @param {array} parameters The required statement parameters
     * @param {function} successCallback The required callback function on success
     * @param {function} errorCallback The required callback function on error
     * @param {function} transaction The optional transaction if available
     */
    function executeSql(adapter, sqlStatement, parameters, successCallback, errorCallback, transaction) {

        // execute sql
        if (!transaction && adapter) {
            adapter.transaction(function (transaction) {
                transaction.executeSql(
                    sqlStatement,
                    parameters,
                    successCallback,
                    errorCallback
                );
            });
        } else if (transaction) {
            transaction.executeSql(
                sqlStatement,
                parameters,
                successCallback,
                errorCallback
            );
        } else {
            errorCallback(null, {
                code: 0,
                message: storageType + ' isn\'t available'
            });
        }

    }


    /**
     * handle storage events
     *
     * @param {object} e The event object
     */
    function handleStorageEvents(e) {

        /* start-dev-block */

        // init local vars
        var msg = 'Errorcode: ' + (e.code || 'Code not present') + ', Message: ' + (e.message || 'Message not present');

        if (e.info) {
            msg = msg + ' - ' + e.info;
        }

        // log message string
        moduleLog(msg);
        /* end-dev-block */

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
        self.dbName = 'cache';

        /**
         * be careful with switching the database number
         * there are known bugs with the changeVersion method.
         */
        self.dbVersion = '1.0';
        self.dbDescription = 'resource cache';
        self.dbTable = 'websql';

        /**
         * only Safari prompts the user if you try to create a database over the size of the default database size (5MB).
         * for ios we define less, due to meta data it prompts for databases greater than 4MB.
         */
        self.dbSize = 4 * 1024 * 1024;

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
                boolIsSupported = !!window.openDatabase;

                /* start-dev-block */
                if (!boolIsSupported) {
                    moduleLog(storageType + ' is not supported');
                }
                /* end-dev-block */

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

            // check params
            callback = checkCallback(callback);
            if (!key || !boolIsSupported) {
                callback(false);
                return;
            }

            // init vars and create success callback
            var self = this,
                sqlSuccess = function () {
                    callback(true);
                },
                sqlError = function (transaction, e) {
                    handleStorageEvents(e);
                    callback(false, e, {transaction: transaction});
                };

            // execute sql
            executeSql(
                self.adapter,
                'INSERT INTO ' + self.dbTable + ' (key, content) VALUES (?,?);',
                [
                    key,
                    content
                ],
                sqlSuccess,
                sqlError
            );
        },


        /**
         * read storage item
         *
         * @param {string} key The required resource key
         * @param {function} callback The required function called on success
         */
        read: function (key, callback) {

            // check params
            callback = checkCallback(callback);
            if (!key || !boolIsSupported) {
                callback(false);
                return;
            }

            // init vars and read success callback
            var self = this,
                sqlSuccess = function (transaction, data) {

                    // parse item data
                    var content = false;
                    if (data && data.rows && (data.rows.length === 1)) {
                        content = data.rows.item(0).content;
                    }
                    callback(content, null, {transaction: transaction});

                },
                sqlError = function (transaction, e) {
                    handleStorageEvents(e);
                    callback(false, e, {transaction: transaction});
                };

            // execute sql
            executeSql(
                self.adapter,
                'SELECT content FROM ' + self.dbTable + ' WHERE key=?;',
                [key],
                sqlSuccess,
                sqlError
            );

        },


        /**
         * update a resource in storage
         * 
         * @param {string} key The required resource key
         * @param {string} content The required content string
         * @param {function} callback The optional function called on success
         */
        update: function (key, content, callback) {

            // check params
            callback = checkCallback(callback);
            if (!key || !boolIsSupported) {
                callback(false);
                return;
            }

            // init vars and update success callback
            var self = this,
                sqlSuccess = function () {
                    callback(true);
                },
                sqlError = function (transaction, e) {
                    handleStorageEvents(e);
                    callback(false, e, {transaction: transaction});
                };

            // execute sql
            executeSql(
                self.adapter,
                'UPDATE ' + self.dbTable + ' SET content = ?  WHERE key=?;',
                [content, key],
                sqlSuccess,
                sqlError
            );

        },


        /**
         * delete a resource from storage
         * 
         * @param {string} key The required resource key
         * @param {function} callback The optional function called on success
         */
        remove: function (key, callback) {

            // check params
            callback = checkCallback(callback);
            if (!key || !boolIsSupported) {
                callback(false);
                return;
            }

            // init vars and delete success callback
            var self = this,
                sqlSuccess = function () {
                    callback(true);
                },
                sqlError = function (transaction, e) {
                    handleStorageEvents(e);
                    callback(false, e, {transaction: transaction});
                };

            // execute sql
            executeSql(
                self.adapter,
                'DELETE FROM ' + self.dbTable + ' WHERE key = ?;',
                [key],
                sqlSuccess,
                sqlError
            );

        },


        /**
         * open and initialize storage if not already done
         * 
         * @param {function} callback The optional function called on success
         */
        open: function (callback) {

            // check params
            callback = checkCallback(callback);
            if (!boolIsSupported) {
                callback(false);
                return;
            }

            // init local function vars
            var self = this,
                adapter = self.adapter,
                deleteTestItem,


                /**
                 * try to create test resource
                 *
                 * @param {object} currentAdapter The current self.adapter via callback argument
                 */
                createTestResource = function (currentAdapter) {

                    if (!currentAdapter) {
                        callback(false);
                    }

                    /* start-dev-block */
                    moduleLog('Try to create test resource');
                    /* end-dev-block */

                    // delete item after create/update
                    deleteTestItem = function (success) {
                        if (!!success) {
                            self.remove('test-item', function () {

                                /* start-dev-block */
                                moduleLog('Test resource created and successfully deleted');
                                /* end-dev-block */

                                callback(currentAdapter);
                                return;
                            });
                        } else {
                            callback(false);
                        }
                    };

                    // create test item, check if item is already in storage
                    self.read('test-item', function (data) {
                        if (!!data) {
                            self.update('test-item', '{test: "test-content"}', deleteTestItem);
                        } else {
                            self.create('test-item', '{test: "test-content"}', deleteTestItem);
                        }
                    });
                },

                /**
                 * sql helper function to create table if not exists
                 *
                 * @param {object} currentAdapter The currently initialized adapter
                 * @param {object} transaction The optinional transaction object
                 */
                createTableIfNotExists = function (currentAdapter, transaction) {

                    /* start-dev-block */
                    moduleLog('Checking database table: name ' + self.dbTable);
                    /* end-dev-block */

                    executeSql(
                        currentAdapter,
                        'CREATE TABLE IF NOT EXISTS ' + self.dbTable + '(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, key TEXT NOT NULL UNIQUE, content TEXT NOT NULL);',
                        [],
                        function () {
                            createTestResource(self.adapter);
                        },
                        function (e) {
                            handleStorageEvents(e);
                            createTestResource(false);
                        },
                        transaction
                    );
                },

                /**
                 * function to be executed on version change
                 *
                 * @param {object} transaction The transaction object
                 */
                changeVersionTransaction = function (transaction) {
                    createTableIfNotExists(null, transaction);
                },

                /**
                 * function to be executed on version change error
                 *
                 * @param {object} e The error information object
                 */
                changeVersionError = function (e) {

                    /* start-dev-block */

                    // add more information and display error
                    e.info = 'Can\'t migrate to new database version. This may be caused by non-standard implementation of the changeVersion method. Please switch back your database version to use webSql on this device.';
                    handleStorageEvents(e);

                    /* end-dev-block */

                    callback(false);
                };

            // try to open database
            try {

                if (null === adapter && self.isSupported()) {

                    /* start-dev-block */
                    moduleLog('Initializing database');
                    /* end-dev-block */

                    /**
                     * obtaining the current database version, calling openDatabase without version parameter
                     * 
                     * if you specify an empty string for the version, the database is opened regardless of the database version.
                     * but then safari always indicates version 1.0.
                     * 
                     * hack: safari (6.0.4) doesn't fire the success callback parameter on openDatabase(), so we just can
                     * pass in name, the empty version number, the table description and size. changeVersion, the method
                     * to change the database version, is not fully supported in Webkit. it works in Chrome and Opera,
                     * but not in Safari or Webkit.
                     */
                    self.adapter = adapter = window.openDatabase(self.dbName, '', self.dbDescription, self.dbSize);

                    // check for new version
                    if (String(adapter.version) !== String(self.dbVersion) && !!adapter.changeVersion && typeof adapter.changeVersion === 'function') {

                        /* start-dev-block */
                        moduleLog('Try to update version: new version ' + adapter.version + ', old version ' + self.dbVersion);
                        /* end-dev-block */

                        try {
                            adapter.changeVersion(
                                adapter.version,
                                self.dbVersion,
                                changeVersionTransaction,
                                changeVersionError
                            );
                        } catch (e) {
                            handleStorageEvents(e);
                            callback(false);
                        }
                    } else {

                        /* start-dev-block */
                        moduleLog('Open database with version number: ' + self.dbVersion);
                        /* end-dev-block */

                        // reopen database with the correct version number to avoid errors
                        adapter = window.openDatabase(self.dbName, self.dbVersion, self.dbDescription, self.dbSize);
                        createTableIfNotExists(adapter);

                    }

                } else if (self.isSupported()) {

                    /* start-dev-block */
                    moduleLog('database already initialized');
                    /* end-dev-block */

                    // db already initialized
                    createTestResource(adapter);

                }
            } catch (e) {

                // no connection possible
                handleStorageEvents(e);
                callback(false);

            }

        },


        /**
         * init storage
         *
         * @param {object} parameters The optional instance parameters
         * @param {string} [parameters.description] Set db description
         * @param {string} [parameters.name] Set db name
         * @param {string} [parameters.size] Set db size
         * @param {string} [parameters.table] Set db table
         * @param {string} [parameters.version] Set db version
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
                    if (parameters.description) {
                        self.dbDescription = parameters.description;
                    }
                    if (parameters.name) {
                        self.dbName = parameters.name;
                    }
                    if (parameters.size) {
                        self.dbSize = parameters.size;
                    }
                    if (parameters.table) {
                        self.dbTable = parameters.table;
                    }
                    if (parameters.version) {
                        self.dbVersion = String(parameters.version);
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
     * make the storage constructor available for ns.cache.storage.adapter.webSqlDatabase()
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
