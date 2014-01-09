/*jslint unparam: false, browser: true, devel: true */
/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:false, curly:true, browser:true, indent:4, maxerr:50, devel:true, wsh:false */
/*global undefined, FileError, FileReader, Blob */


/**
 * ns.cache.storage.adapter.fileSystem
 *
 * @description
 * - provide a storage api for file system
 * - support:
 *      - Google Crome 26.0 +
 *      - Maxthon 4.0.5 +
 *
 * @version 0.1.5
 * @author Ulrich Merkel, 2013
 *
 * @namespace ns
 *
 * @changelog
 * - 0.1.5 example doc added
 * - 0.1.4 improved logging
 * - 0.1.3 improved namespacing, handleStorageEvents adjusted to for current browser updates (event object error)
 * - 0.1.2 creating test item while open added, bug fixes for chrome 17
 * - 0.1.1 refactoring, js lint
 * - 0.1 basic functions and structur
 *
 * @see
 * - http://www.w3.org/TR/file-system-api/
 * - http://www.w3.org/TR/FileAPI/
 * - http://www.html5rocks.com/de/tutorials/file/filesystem/
 * - http://updates.html5rocks.com/2011/08/Debugging-the-Filesystem-API
 * - https://github.com/brianleroux/lawnchair/blob/master/src/adapters/html5-filesystem.js
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
 *      var storage = new app.cache.storage.adapter.fileSystem(optionalParametersObject);
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
    var storageType = 'fileSystem',                                 // @type {string} The storage type string
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
     * handle storage events
     *
     * @param {object} e The event object
     */
    function handleStorageEvents(e) {

        // check for corrent event object
        if (!e) {
            return;
        }

        // init local vars
        var msg = '',
            code = e.name || e.message || e.code;

        switch (code) {
        case FileError.QUOTA_EXCEEDED_ERR:
            msg = 'Event: QUOTA_EXCEEDED_ERR';
            break;
        case FileError.NOT_FOUND_ERR:
            msg = 'Event: NOT_FOUND_ERR, file does not exist';
            break;
        case FileError.SECURITY_ERR:
            msg = 'Event: SECURITY_ERR';
            break;
        case FileError.INVALID_MODIFICATION_ERR:
            msg = 'Event: INVALID_MODIFICATION_ERR';
            break;
        case FileError.INVALID_STATE_ERR:
            msg = 'Event: INVALID_STATE_ERR';
            break;
        default:
            msg = 'Event: Unknown Error';
            break;
        }

        // log message string
        moduleLog(msg, e);

    }


    /**
     * create directory recursiv
     *
     * @param {object} root The required storage root
     * @param {array} folders The required value string from database
     * @param {function} callback The callback required after success
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
     * @param {object} fileSystem The required fileSystem to check
     * @param {srting} url The required url string to check
     * @param {function} callback The optional callback after success
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
     * @constructor
     * @param {object} parameters The instance parameters
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

        // default filesystem size 50 MB
        self.size = 50 * 1024 * 1024;

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
                boolIsSupported = (!!window.requestFileSystem || !!window.webkitRequestFileSystem || !!window.moz_requestFileSystem) && (!!window.Blob || !!window.BlobBuilder);
                if (!boolIsSupported) {
                    moduleLog(storageType + ' is not supported');
                }
            }

            // return bool
            return boolIsSupported;

        },


        /**
         * open and initialize storage if not already done
         * 
         * @param {function} callback The optional function called on success
         */
        open: function (callback) {

            // init local function vars
            var self = this,
                adapter = self.adapter;

            // check params
            callback = checkCallback(callback);

            // check for database
            if (null === adapter) {

                // note: the file system has been prefixed as of google chrome 12
                window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem || window.moz_requestFileSystem;

                // open filesystem
                window.requestFileSystem(window.TEMPORARY, self.size, function (filesystem) {
                    adapter = self.adapter = filesystem;

                    /* create test item */
                    moduleLog('Try to create test resource');
                    try {
                        self.create('test-item', utils.jsonToString({test: "test-content"}), function (success) {
                            if (!!success) {
                                self.remove('test-item', function () {
                                    moduleLog('Test resource created and successfully deleted');
                                    callback(adapter);
                                    //return;
                                });
                            } else {
                                callback(false);
                            }
                        });
                    } catch (e) {
                        handleStorageEvents(e);
                        callback(false);
                    }
                    //callback(adapter);
                }, handleStorageEvents);

            } else {
                callback(adapter);
            }

        },


        /**
         * create a new resource in storage
         * 
         * @param {object} key The required resource object
         * @param {string} content The required content string
         * @param {function} callback The optional function called on success
         */
        create: function (key, content, callback) {

            // check params
            callback = checkCallback(callback);

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

                        var blob;

                        // success callback
                        fileWriter.onwriteend = function () {
                            callback(true);
                        };

                        // error callback
                        fileWriter.onerror = errorHandler;

                        /**
                         * try catch added for chrome 17, complains "illegal constructor"
                         * while creating new blob
                         */
                        try {

                            /**
                             * create transparent binary file copy via blobs and write data
                             *
                             * @see https://developer.mozilla.org/de/docs/Web/API/Blob
                             */

                            if (Blob) {

                                // new blob binaries
                                blob = new Blob([content], {type: 'text/plain'});
                                fileWriter.write(blob);

                            } else if (BlobBuilder) {
    
                                // old and depricated blobs
                                blob = new BlobBuilder();
                                blob.append(content);
                                fileWriter.write(blob.getBlob('application/json'));

                            }

                        } catch (e) {
                            errorHandler(e);
                        }

                    }, errorHandler);

                }, errorHandler);

            });

        },


        /**
         * read storage item
         *
         * @param {object} key The required resource object
         * @param {function} callback The required function called on success
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
         * @param {object} key The required resource object
         * @param {string} content The required content string
         * @param {function} callback The optional function called on success
         */
        update: function (key, content, callback) {

            // same logic as this.create()
            this.create(key, content, callback);

        },


        /**
         * delete a resource from storage
         * 
         * @param {object} key The required resource object
         * @param {function} callback The optional function called on success
         */
        remove: function (key, callback) {

            // init local function vars
            var adapter = this.adapter,
                errorHandler = function (e) {
                    handleStorageEvents(e);
                    callback(false, e);
                };

            // check params
            callback = checkCallback(callback);

            // check directory exists
            checkDirectory(adapter, key, function () {

                // try to read file
                adapter.root.getFile(key, {create: false}, function (fileEntry) {

                    // remove file
                    fileEntry.remove(function () {
                        callback(true);
                    }, errorHandler);

                }, errorHandler);

            });

        },


        /**
         * init storage
         *
         * @param {object} parameters The optional instance parameters
         * @param {integer} [parameters.size] Set storage size
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
     * make the storage constructor available for ns.cache.storage.adapter.fileSystem()
     * calls under the ns.cache namespace, alternativly save it to window object
     * 
     * @export
     */
    if (!!ns.namespace && typeof ns.namespace === 'function') {
        ns.namespace('cache.storage.adapter.' + storageType, Adapter);
    } else {
        ns[storageType] = Adapter;
    }


}(window)); // immediatly invoke function
