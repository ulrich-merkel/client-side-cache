/*jslint unparam: false, browser: true, devel: true */
/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:false, curly:true, browser:true, indent:4, maxerr:50, devel:true, wsh:false */

/*global undefined */
/*global FileError*/
/*global FileReader*/
/*global Blob*/


/**
 * app.cache.storage.adapter.fileSystem
 *
 * @description
 * - provide a storage api for file system
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
 * - http://www.w3.org/TR/file-system-api/
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
    var storageType = 'fileSystem',                             // storageType {string} The storage type string
        utils = app.helpers.utils,                              // utils {object} Shortcut for utils functions
        log = utils.log,                                        // log {function} Shortcut for utils.log function
        checkCallback = utils.callback,                         // shortcut for utils.callback function
        boolIsSupported = null;                                 // boolIsSupported {boolean} Bool if this type of storage is supported or not


    /**
     * handle storage events
     *
     * @param {object} e The event object
     */
    function handleStorageEvents(e) {

        // init local vars
        var msg = '';

        switch (e.code) {
        case FileError.QUOTA_EXCEEDED_ERR:
            msg = '[' + storageType + ' Adapter] File System Event: QUOTA_EXCEEDED_ERR';
            break;
        case FileError.NOT_FOUND_ERR:
            msg = '[' + storageType + ' Adapter] File System Event: NOT_FOUND_ERR, file does not exist';
            break;
        case FileError.SECURITY_ERR:
            msg = '[' + storageType + ' Adapter] File System Event: SECURITY_ERR';
            break;
        case FileError.INVALID_MODIFICATION_ERR:
            msg = '[' + storageType + ' Adapter] File System Event: INVALID_MODIFICATION_ERR';
            break;
        case FileError.INVALID_STATE_ERR:
            msg = '[' + storageType + ' Adapter] File System Event: INVALID_STATE_ERR';
            break;
        default:
            msg = '[' + storageType + ' Adapter] File System Event: Unknown Error';
            break;
        }

        // log message string
        log(msg);

    }


    /**
     * create directory recursiv
     *
     * @param {object} storageRoot The storage root
     * @param {array} folders The value string from database
     */
    function createDirectory(root, folders, callback) {

        // throw out './' or '/' and move on to prevent something like '/foo/.//bar'
        if (folders[0] === '.' || folders[0] === '') {
            folders = folders.slice(1);
        }

        if (folders[0]) {

            // create directory if not exist
            root.getDirectory(folders[0], {create: true}, function (dirEntry) {

                // recursively add the new subfolder (if we still have another to create)
                if (folders.length) {
                    createDirectory(dirEntry, folders.slice(1), callback);
                } else {
                    callback();
                }

            }, handleStorageEvents);

        } else {
            callback();
        }

    }


    /**
     * check directory path
     *
     * @param {object} storage The storage object
     * @param {srting} url The url string to check
     */
    function checkDirectory(fileSystem, url, callback) {

        // init local vars
        var folders = url.split('/'),
            length = folders.length,
            result = '',
            i = 0;

        // check callback
        callback = checkCallback(callback);

        if (length) {
            // get path without filename
            for (i = 0; i < length - 1; i = i + 1) {
                result = result + folders[i] + '/';
            }

            // create dir if not exist
            createDirectory(fileSystem.root, result.split('/'), callback);
        } else {
            callback();
        }

    }




    /**
     * the actual instance constructor
     * directly called after new Adapter()
     * 
     * @param {object} parameters The instance parameters
     */
    function Adapter(parameters) {

        // init local vars
        var self = this;

        // adapter vars
        self.adapter = null;
        self.type = storageType;

        // default filesystem size
        self.size = 1024 * 1024;

        // run init function
        self.init(parameters);

    }


    /**
     * public instance methods
     *
     * Adapter.fn is just a shortcut for Adapter.prototype
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
                boolIsSupported = (!!window.requestFileSystem || !!window.webkitRequestFileSystem) && !!window.Blob;
                if (!boolIsSupported) {
                    log('[' + storageType + ' Adapter] ' + storageType + ' is not supported');
                }
            }

            // return bool
            return boolIsSupported;

        },


        /**
         * open and initialize storage if not already done
         * 
         * @param {function} callback The function called on success
         */
        open: function (callback) {

            // init local function vars
            var self = this,
                adapter = self.adapter;

            // check for database
            if (null === adapter) {

                // note: the file system has been prefixed as of google chrome 12:
                window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

                // open filesystem
                window.requestFileSystem(window.TEMPORARY, self.size, function (filesystem) {
                    adapter = self.adapter = filesystem;
                    callback(adapter);
                }, handleStorageEvents);

            } else {
                callback(adapter);
            }

        },


        /**
         * create a new resource in storage
         * 
         * @param {object} resource The resource object
         * @param {string} data The content string
         * @param {function} callback Function called on success
         */
        create: function (key, content, callback) {

            // init local function vars
            var adapter = this.adapter,
                errorHandler = function (e) {
                    handleStorageEvents(e);
                    callback(false, e);
                };

            // check directory exists
            checkDirectory(adapter, key, function () {

                // try to read file, if there is no one it will be created
                adapter.root.getFile(key, {create: true}, function (fileEntry) {

                    // create a fileWriter object for our fileEntry
                    fileEntry.createWriter(function (fileWriter) {

                        // success callback
                        fileWriter.onwriteend = function () {
                            callback(true);
                        };

                        // error callback
                        fileWriter.onerror = errorHandler;

                        var blob = new Blob([content], {type: 'text/plain'});

                        // write data
                        fileWriter.write(blob);

                    }, errorHandler);

                }, errorHandler);

            });

        },


        /**
         * read storage item
         *
         * @param {object} resource The resource object
         * @param {function} callback Function called on success
         */
        read: function (key, callback) {

            // init local function vars
            var adapter = this.adapter,
                errorHandler = function (e) {
                    handleStorageEvents(e);
                    callback(false, e);
                };

            // check directory exists
            checkDirectory(adapter, key, function () {

                // try to read file
                adapter.root.getFile(key, {create: false}, function (fileEntry) {

                    /**
                     * get a file object representing the file and
                     * then use FileReader to read its contents
                     */
                    fileEntry.file(function (file) {
                        var reader = new FileReader();

                        // success callback, get resource object
                        reader.onloadend = function () {
                            callback(this.result);
                        };

                        // read file
                        reader.readAsText(file);

                    }, errorHandler);

                }, errorHandler);

            });

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

            // init local function vars
            var adapter = this.adapter,
                errorHandler = function (e) {
                    handleStorageEvents(e);
                    callback(key, e);
                };

            // check directory exists
            checkDirectory(adapter, key, function () {

                // try to read file
                adapter.root.getFile(key, {create: false}, function (fileEntry) {

                    // remove file
                    fileEntry.remove(function () {
                        callback();
                    }, errorHandler);

                }, errorHandler);

            }, errorHandler);

        },


        /**
         * init storage
         *
         * @param {object} parameters The instance parameters
         * @param {string} [parameters.size=1024*1024] Set storage size
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
                    if (parameters.size) {
                        self.size = parameters.size;
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