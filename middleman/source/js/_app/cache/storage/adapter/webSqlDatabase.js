/*global window */

/**
 * app.cache.webSqlDatabase
 *
 * @description
 * - provide a storage api for web sql database
 *
 * @version 0.1.2
 * @author Ulrich Merkel, 2013
 * 
 * @namespace app
 *
 * @changelog
 * - 0.1.2 several version change bug fixes
 * - 0.1.1 refactoring, js lint
 * - 0.1 basic functions and structur
 *
 * @see
 * - http://www.w3.org/TR/webdatabase/
 * - http://developer.apple.com/library/safari/#documentation/iphone/conceptual/safarijsdatabaseguide/UsingtheJavascriptDatabase/UsingtheJavascriptDatabase.html
 * - http://html5doctor.com/introducing-web-sql-databases/
 *
 *@bugs
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
     * window, document and app are passed through as local
     * variables rather than as globals, because this (slightly)
     * quickens the resolution process and can be more
     * efficiently minified (especially when both are
     * regularly referenced in this module).
     */


    // create the global vars once
    var storageType = 'webSqlDatabase',                         // storageType {string} The storage type string
        utils = app.helper.utils,                               // utils {object} Shortcut for utils functions
        log = utils.log,                                        // log {function} Shortcut for utils.log function
        boolIsSupported = null;                                 // boolIsSupported {boolean} Bool if this type of storage is supported or not


    /**
     * execute sql statement
     *
     * @param {object} adapter The current storage object interface
     * @param {string} sqlStatement The sql statement
     * @param {array} parameters The statement parameters
     * @param {function} callback The callback function on success
     * @param {function} transaction The optinional transaction if available
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
                message: 'The storage adapter isn\'t available'
            });
        }

    }


    /**
     * handle storage events
     *
     * @param {object} e The event object
     */
    function handleStorageEvents(e) {

        // init local vars
        var msg = '[' + storageType + ' Adapter] Errorcode: ' + e.code + ', Message: ' + e.message;

        if (e.info) {
            msg = msg + ' - ' + e.info;
        }

        // log message string
        log(msg);

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
        self.dbName = 'merkel';

        /**
         * Be careful with switch the database number
         * there are known bugs with the changeVersion method
         */
        self.dbVersion = '1.0';
        self.dbDescription = 'resource cache';
        self.dbTable = 'cache';

        /**
         * only Safari prompts the user if you try to create a database over the size of the default database size, 5MB
         * on ios less due to meta data it prompts greater than 4MB
         */
        self.dbSize = 4 * 1024 * 1024;

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
                boolIsSupported = !!window.openDatabase;
                if (!boolIsSupported) {
                    log('[' + storageType + ' Adapter] ' + storageType + ' is not supported');
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

            // init vars and create success callback
            var self = this,
                sqlSuccess = function () {
                    //resource.data = data;
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
         * @param {object} resource The resource object
         * @param {function} callback Function called on success
         */
        read: function (key, callback) {

            // init vars and create success callback
            var self = this,
                sqlSuccess = function (transaction, data) {

                    // parse item data
                    var content = null;
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
         * @param {object} resource The resource object
         * @param {string} data The content string
         * @param {function} callback Function called on success
         */
        update: function (key, content, callback) {

            // init vars and update success callback
            var self = this,
                sqlSuccess = function () {
                    //resource.data = data;
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
         * @param {object} resource The resource object
         * @param {function} callback Function called on success
         */
        remove: function (key, callback) {

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
         * @param {function} callback The function called on success
         */
        open: function (callback) {

            // init local function vars
            var self = this,
                adapter = self.adapter,


                /**
                 * sql helper function to create table if not exists
                 *
                 * @param {object} currentAdapter The currently initialized adapter
                 * @param {object} transaction The optinional transaction object
                 */
                createTableIfNotExists = function (currentAdapter, transaction) {
                    executeSql(
                        currentAdapter,
                        'CREATE TABLE IF NOT EXISTS ' + self.dbTable + '(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, key TEXT NOT NULL UNIQUE, content TEXT NOT NULL);',
                        [],
                        function () {
                            callback(currentAdapter);
                        },
                        function (e) {
                            handleStorageEvents(e);
                            callback(false);
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

                    // add more information and display error
                    e.info = 'Can\'t migrate to new database version and using localStorage instead. This may be caused by non-standard implementation of the changeVersion method. Please switch back your database version to use webSql on this device.';
                    handleStorageEvents(e);

                    callback(false);
                };

            // try to open database
            try {

                if (null === adapter && self.isSupported()) {

                    /**
                     * obtaining the current database version, calling openDatabase without version parameter
                     * 
                     * if you specify an empty string for the version, the database is opened regardless of the database version.
                     * but then safari always indicates version 1.0
                     * 
                     * safari (6.0.4) doesn't fire the success callback parameter on openDatabase(), so we just can
                     * pass in name, the empty version number, the table description and size
                     *
                     * also, changeVersion, the method to change the database version, is not fully supported in Webkit.
                     * it works in Chrome and Opera, but not in Safari or Webkit. 
                     */
                    self.adapter = window.openDatabase(self.dbName, '', self.dbDescription, self.dbSize);

                    // check for new version
                    if (String(self.adapter.version) !== String(self.dbVersion) && !!self.adapter.changeVersion && typeof self.adapter.changeVersion === 'function') {
                        try {
                            self.adapter.changeVersion(
                                self.adapter.version,
                                self.dbVersion,
                                changeVersionTransaction,
                                changeVersionError
                            );
                        } catch (e) {
                            handleStorageEvents(e);
                            callback(false);
                        }
                    } else {

                        // reopen database with the correct version number to avoid errors
                        self.adapter = window.openDatabase(self.dbName, self.dbVersion, self.dbDescription, self.dbSize);
                        createTableIfNotExists(self.adapter);

                    }

                } else if (self.isSupported()) {

                    // db already initialized
                    callback(adapter);

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
         * @param {object} parameters The instance parameters
         * @param {string} [parameters.dbName=merkel] Set dbName
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
     * make the storage constructor available for
     * app.cache.webSqlDatabase() calls under the
     * app.cache namespace
     */
    app.cache.storage.adapter[storageType] = Adapter;


}(window, window.app || {})); // immediatly invoke function