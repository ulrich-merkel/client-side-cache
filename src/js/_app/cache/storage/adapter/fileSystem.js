/*jslint browser: true, devel: true */
/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, curly:true, browser:true, indent:4, maxerr:50, devel:true, wsh:false */
/*global undefined, FileError, FileReader, Blob, BlobBuilder */


/**
 * ns.cache.storage.adapter.fileSystem
 *
 * @description
 * - provide a storage api for file system
 * - support:
 *      - Google Crome 26.0 +
 *      - Opera 19.0 +
 *      - Maxthon 4.0.5 +
 *      - Yandex 13.0 +
 *      - Torch 23.0 +
 *
 * @version 0.1.5
 * @author Ulrich Merkel (hello@ulrichmerkel.com), 2014
 *
 * @namespace ns
 *
 * @changelog
 * - 0.1.6 refactoring, added BlobBuilder support
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
 * - http://www.w3.org/TR/file-upload/
 * - http://www.html5rocks.com/de/tutorials/file/filesystem/
 * - http://www.html5rocks.com/de/tutorials/file/dndfiles/
 * - http://updates.html5rocks.com/2011/08/Debugging-the-Filesystem-API
 * - https://github.com/brianleroux/lawnchair/blob/master/src/adapters/html5-filesystem.js
 * - https://developer.mozilla.org/en-US/docs/WebGuide/API/File_System/Introduction
 * - https://developer.mozilla.org/en-US/docs/Web/API/LocalFileSystem
 *
 * @requires
 * - ns.helpers.namespace
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
(function (window, ns, undefined) {

    'use strict';

    /**
     * undefined is used here as the undefined global
     * variable in ECMAScript 3 and is mutable (i.e. it can
     * be changed by someone else). undefined isn't really
     * being passed in so we can ensure that its value is
     * truly undefined. In ES5, undefined can no longer be
     * modified.
     *
     * window and ns are passed through as local
     * variables rather than as globals, because this (slightly)
     * quickens the resolution process and can be more
     * efficiently minified (especially when both are
     * regularly referenced in this module).
     */

    // create the global vars once
    var storageType = 'fileSystem',                                 // @type {string} The storage type string
        helpers = ns.helpers,                                       // @type {object} Shortcut for ns.helpers
        utils = helpers.utils,                                      // @type {object} Shortcut for utils functions
        jsonHelper = helpers.json,                                  // @type {object} Shortcut for json functions
        log = helpers.console.log,                                  // @type {function} Shortcut for console.log function
        checkCallback = utils.callback,                             // @type {function} Shortcut for utils.callback function
        boolIsSupported = null,                                     // @type {boolean} Bool if this type of storage is supported or not

        // get global javascript interface as shortcut
        // note: the file system has been prefixed as of google chrome 12
        globalInterface = window.requestFileSystem || window.webkitRequestFileSystem || window.moz_requestFileSystem;


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
     * handle storage events
     *
     * @param {object} e The event object
     */
    function handleStorageEvents(e) {

        /* start-dev-block */

        // check for corrent event object
        if (!e) {
            return;
        }

        // init local vars
        var code = e.name || e.code,
            msg = e.message || e.description || '',
            result = msg;

        /**
         * @see https://developer.mozilla.org/en-US/docs/Web/API/FileError
         * string errors added for newest crome  31.0.1650.57
         */
        if (FileError) {
            switch (code) {
            case FileError.ENCODING_ERR:
            case 'EncodingError':
                result = 'Error Event: ENCODING_ERR ' + msg;
                break;
            case FileError.INVALID_MODIFICATION_ERR:
            case 'InvalidModificationError':
                result = 'Error Event: INVALID_MODIFICATION_ERR';
                break;
            case FileError.INVALID_STATE_ERR:
            case 'InvalidStateError':
                result = 'Error Event: INVALID_STATE_ERR ' + msg;
                break;
            case FileError.NO_MODIFICATION_ALLOWED_ERR:
            case 'NoModificationAllowedError':
                result = 'Error Event: NO_MODIFICATION_ALLOWED_ERR ' + msg;
                break;
            case FileError.NOT_FOUND_ERR:
            case 'NotFoundError':
                result = 'Error Event: NOT_FOUND_ERR ' + msg;
                break;
            case FileError.NOT_READABLE_ERR:
            case 'NotReadableError':
                result = 'Error Event: NOT_READABLE_ERR ' + msg;
                break;
            case FileError.PATH_EXISTS_ERR:
            case 'PathExistsError':
                result = 'Error Event: PATH_EXISTS_ERR ' + msg;
                break;
            case FileError.QUOTA_EXCEEDED_ERR:
            case 'QuotaExceededError':
                result = 'Error Event: QUOTA_EXCEEDED_ERR ' + msg;
                break;
            case FileError.SECURITY_ERR:
            case 'SecurityError':
                result = 'Error Event: SECURITY_ERR ' + msg;
                break;
            case FileError.TYPE_MISMATCH_ERR:
            case 'TypeMismatchError':
                result = 'Error Event: TYPE_MISMATCH_ERR ' + msg;
                break;
            default:
                result = 'Error Event: Unknown Error ' + msg;
                break;
            }
        } else {
            result = 'Error Event: Unknown Error, no FileError available';
        }

        // log message string
        moduleLog(result, e);

        /* end-dev-block */

    }


    /**
     * create directory recursiv
     *
     * @param {object} root The required storage root
     * @param {array} folders The required value string from database
     * @param {function} callback The callback required after success
     */
    function createDirectory(root, folders, callback) {

        var errorHandler = function (e) {

            /* start-dev-block */
            handleStorageEvents(e);
            /* end-dev-block */

            callback(false);
        };

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
                    callback(true);
                }

            }, errorHandler);

        } else {
            callback(true);
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
            callback(true);
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
                boolIsSupported = !!globalInterface && (!!window.Blob || !!window.BlobBuilder) && window.FileReader;

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
         * open and initialize storage if not already done
         * 
         * @param {function} callback The optional function called on success
         */
        open: function (callback) {

            // init local function vars
            var self = this,
                adapter = self.adapter,
                errorHandler = function (e) {

                    /* start-dev-block */
                    handleStorageEvents(e);
                    /* end-dev-block */

                    callback(false);
                };

            // check params
            callback = checkCallback(callback);
            if (!boolIsSupported) {
                callback(false);
                return;
            }

            // check for database
            if (null === adapter) {

                // override global with browser specific version
                window.requestFileSystem = globalInterface;

                // open filesystem
                window.requestFileSystem(window.TEMPORARY, self.size, function (filesystem) {

                    adapter = self.adapter = filesystem;

                    /* start-dev-block */
                    moduleLog('Try to create test resource');
                    /* end-dev-block */

                    /* create test item */
                    try {
                        self.create('test-item', jsonHelper.jsonToString({test: 'test-content'}), function (success) {
                            if (!!success) {
                                self.remove('test-item', function () {

                                    /* start-dev-block */
                                    moduleLog('Test resource created and successfully deleted');
                                    /* end-dev-block */

                                    callback(adapter);
                                });
                            } else {
                                errorHandler();
                            }
                        });
                    } catch (e) {
                        errorHandler(e);
                    }

                }, errorHandler);

            } else {

                /* start-dev-block */
                moduleLog('Adapter already opened');
                /* end-dev-block */

                callback(adapter);
            }

        },


        /**
         * create a new resource in storage
         * 
         * @param {object} key The required resource object
         * @param {string} content The required json content string
         * @param {function} callback The optional function called on success
         */
        create: function (key, content, callback) {

            // check params
            callback = checkCallback(callback);
            if (!key || !boolIsSupported) {
                callback(false);
                return;
            }

            // init local function vars
            var adapter = this.adapter,
                errorHandler = function (e) {

                    /* start-dev-block */
                    handleStorageEvents(e);
                    /* end-dev-block */

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

                            /* start-dev-block */
                            moduleLog('File successfully written: url ' + key);
                            /* end-dev-block */

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

            // check params
            callback = checkCallback(callback);
            if (!key || !boolIsSupported) {
                callback(false);
                return;
            }

            // init local function vars
            var adapter = this.adapter,
                errorHandler = function (e) {

                    /* start-dev-block */
                    handleStorageEvents(e);
                    /* end-dev-block */

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

                        // read content with file api
                        var reader = new FileReader();

                        // success callback, get resource object
                        reader.onloadend = function () {
                            callback(this.result);
                        };

                        // handle errors
                        reader.onerror = errorHandler;
                        reader.onabort = errorHandler;

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
         * @param {string} content The required content json string
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

            // check params
            callback = checkCallback(callback);
            if (!key || !boolIsSupported) {
                callback(false);
                return;
            }

            // init local function vars
            var adapter = this.adapter,
                errorHandler = function (e) {

                    /* start-dev-block */
                    handleStorageEvents(e);
                    /* end-dev-block */

                    callback(false, e);
                };

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
     * calls under the ns.cache namespace
     * 
     * @export
     */
    ns.ns('cache.storage.adapter.' + storageType, Adapter);


}(window, window.getNs())); // immediatly invoke function
