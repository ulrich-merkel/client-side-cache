/*global window, document, confirm*/


/**
 * ns.cache.storage.adapter.applicationCache
 * 
 * @description
 * - handle html5 offline application cache
 * - support:
 *      - Internet Explorer 10.0 +
 *      - Firefox 20.0 +
 *      - Safari 5.1 +
 *      - Google Crome 17.0 +
 *      - Opera 12.5 +
 *      - Maxthon 4.0.5 +
 *      - iOs 3.2 +
 * 
 * @version 0.1.9
 * @author Ulrich Merkel (hello@ulrichmerkel.com), 2014
 *
 * @namespace app
 *
 * @changelog
 * - 0.1.9 delay parameter added, improved minifying
 * - 0.1.8 message parameter for updateReady confirm dialog added
 * - 0.1.7 example doc added
 * - 0.1.6 improved logging
 * - 0.1.5 improved namespacing
 * - 0.1.4 renamed addEventListener to adapterEvent, bug fixes progress event
 * - 0.1.3 improved module structur
 * - 0.1.2 initializing call via images loaded plugin removed (seems to be buggy on edge connections), invoke main callback after 10 sec for slow connections
 * - 0.1.1 update ready event bug fixes
 * - 0.1 basic functions
 *
 * @see
 * - http://www.w3.org/TR/offline-webapps/
 * - http://www.w3.org/TR/progress-events/
 * - http://www.html5rocks.com/de/tutorials/appcache/beginner/
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
 *      var storage = new app.cache.storage.adapter.applicationCache({
 *              // message to be displayed on updateReady event
 *              message: 'A new version is available. Do you want to reload this page?',
 *              // wait for e.g. animations before loaded callback is fired, in milliseconds
 *              delay: '100'
 *          }),
 *          loaded = function () {
 *              // application cache loaded
 *          },
 *          progress = function () {
 *              // single application file is loaded
 *          };
 *
 *      // define event listeners
 *      storage.open(loaded, {
 *          progress: progress
 *      });
 *
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
     * window, document and ns are passed through as local
     * variables rather than as globals, because this (slightly)
     * quickens the resolution process and can be more
     * efficiently minified (especially when both are
     * regularly referenced in this module).
     */


    /**
     * The overall limit for saving files is round abound 5 MB (depending on device).
     *  
     * the application cache can be checked/debugged in chrome with
     * chrome://appcache-internals/ to view and delete cached files 
     * or check the console while the page is loading.
     *
     * firefox on desktop in general prompts a popup
     * when trying to save data with application cache.
     */


    // create the global vars once
    var storageType = 'applicationCache',                           // @type {string} The storage type string
        helpers = ns.helpers,                                       // @type {object} Shortcut for helper functions
        utils = helpers.utils,                                      // @type {object} Shortcut for utils functions
        dom = helpers.dom,                                          // @type {object} Shortcut for dom functions
        on = helpers.events.on,                                     // @type {object} Shortcut for events.on function
        log = helpers.console.log,                                  // @type {function} Shortcut for console.log function
        checkCallback = utils.callback,                             // @type {function} Shortcut for utils.callback function
        boolIsSupported = null,                                     // @type {boolean} Bool if this type of storage is supported or not
        htmlNode = document.getElementsByTagName('html')[0],        // @type {object} The dom html element

        // get global javascript interface as shortcut
        globalInterface = window.applicationCache;

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
        log('[' + storageType + ' Adapter] ' + message);
    }

    /* end-dev-block */

    /**
     * adapter files loaded
     * 
     * invoke a callback function and make sure it's
     * only called once.
     *
     * @param {function} callback The function to be called on loaded
     */
    function loaded(callback, self) {

        if (!self.isLoaded) {

            self.isLoaded = true;

            // set progress to 100% if not already done and wait for optional animation endings
            self.progressCallback(100);
            window.setTimeout(function () {
                callback();

                /* start-dev-block */
                moduleLog('Event loaded');
                /* end-dev-block */

            }, self.delay);
        }

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
     */
    function Adapter(parameters) {

        // init local vars
        var self = this;

        // ensure Adapter was called as a constructor
        if (!(self instanceof Adapter)) {
            return new Adapter(parameters);
        }

        // adapter default vars
        self.adapter = null;
        self.type = storageType;
        self.isLoaded = false;
        self.delay = 0;
        self.opened = true;
        self.message = 'New version available. Update page?';

        // run init function
        self.init(parameters);

    }


    /**
     * instance methods
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
                boolIsSupported = !!globalInterface && !!dom.getAttribute(htmlNode, 'manifest');

                /* start-dev-block */
                if (!boolIsSupported) {
                    moduleLog(storageType + ' is not supported or there is no manifest html attribute');
                }
                /* end-dev-block */

            }

            // return bool
            return boolIsSupported;

        },


        /**
         * open adapter
         * 
         * open and initialize storage if not already done.
         * 
         * @param {function} callback The function called on success
         */
        open: function (callback, parameters) {

            // init local function vars
            var self = this,
                adapter = self.adapter,
                manifestProgressCount = 0,
                progressCallback,
                onUpdateReady;

            self.opened = true;

            // check parameters
            callback = checkCallback(callback);

            if (parameters) {
                if (parameters.progress) {
                    progressCallback = parameters.progress;
                }
            }
            progressCallback = self.progressCallback = checkCallback(progressCallback);

            // check for application cache support
            if (self.isSupported() && null !== adapter) {

                /**
                 * handle updates
                 */
                onUpdateReady = function () {

                    /* start-dev-block */
                    moduleLog('Event updateready');
                    /* end-dev-block */

                    // avoid errors in browsers that are not capable of swapCache
                    try {
                        adapter.swapCache();
                    } catch (e) {

                        /* start-dev-block */
                        moduleLog('Event updateready: swapcache is not available', e);
                        /* end-dev-block */

                    }

                    // ask user for refreshing the page
                    if (confirm(self.message)) {
                        // true indicates, that the current page must be reloaded from the server
                        window.location.reload(true);
                    } else {
                        loaded(callback, self);
                    }

                    return false;
                };


                /* start-dev-block */

                /**
                 * checking event
                 *
                 * if the manifest file has not changed, and the app is already cached,
                 * the noupdate event is fired and the process ends.
                 */
                on(adapter, 'checking', function () {
                    moduleLog('Event checking');

                    return false;
                });

                /* end-dev-block */

                /**
                 * no update event
                 * 
                 * if the manifest file has not changed, and the app is already cached,
                 * the noupdate event is fired and the process ends.
                 */
                on(adapter, 'noupdate', function () {

                    /* start-dev-block */
                    moduleLog('Event noupdate');
                    /* end-dev-block */

                    loaded(callback, self);

                    return false;
                });


                /**
                 * downloading cache files starts
                 * 
                 * if the application is not already cached, or if the manifest has changed,
                 * the browser downloads and caches everything listed in the manifest.
                 * the downloading event signals the start of this download process.
                 */
                on(adapter, 'downloading', function () {

                    /* start-dev-block */
                    moduleLog('Event downloading');
                    /* end-dev-block */

                    manifestProgressCount = 0;

                    return false;
                });


                /**
                 * download progress event
                 * 
                 * progress events are fired periodically during the downloading process,
                 * typically once for each file downloaded.
                 *
                 * @param {object} e The progress event object holding additionally information
                 */
                on(adapter, 'progress', function (e) {

                    /* start-dev-block */
                    moduleLog('Event progress');
                    /* end-dev-block */

                    var progress = 0;

                    // to run the css animation smooth until end
                    self.delay = 500;

                    // manually count progress (fallback for e.lengthComputable)
                    manifestProgressCount = manifestProgressCount + 1;

                    // Progress event: compute percentage
                    if (e && e.lengthComputable !== undefined) {
                        progress = Math.round(100 * e.loaded / e.total);
                    } else {
                        progress = Math.round(100 * manifestProgressCount / 20);
                    }

                    progressCallback(progress);

                    return false;
                });


                /**
                 * files are cached event
                 * 
                 * the first time an application is downloaded into the cache, the browser
                 * fires the cached event when the download is complete.
                 */
                on(adapter, 'cached', function () {

                    /* start-dev-block */
                    moduleLog('Event cached');
                    /* end-dev-block */

                    loaded(callback, self);

                    return false;
                });


                /**
                 * update is available event
                 *
                 * when an already-cached application is updated, and the download is complete
                 * the browser fires "updateready". Note that the user will still be seeing
                 * the old version of the application when this event arrives.
                 */
                on(adapter, 'updateready', function () {
                    onUpdateReady();
                });


                /**
                 * cache is obsolete event
                 *
                 * if a cached application references a manifest file that does not exist (http code 404),
                 * an obsolete event is fired and the application is removed from the cache.
                 * subsequent loads are done from the network rather than from the cache.
                 */
                on(adapter, 'obsolete', function () {

                    /* start-dev-block */
                    moduleLog('Event obsolete');
                    /* end-dev-block */

                    window.location.reload(true);

                    return false;
                });


                /**
                 * cache error event
                 *
                 * if there is an error with the cache file or
                 * ressources can't be loaded.
                 */
                on(adapter, 'error', function () {

                    /* start-dev-block */
                    moduleLog('Event error');
                    /* end-dev-block */

                    loaded(callback, self);

                    return false;
                });


                /**
                 * additionally check for status constants
                 *
                 * since a cache manifest file may have been updated or loaded before a script attaches event
                 * listeners to test for the events, we check additionally for the current manifest status.
                 */
                switch (adapter.status) {
                case adapter.UNCACHED:
                    // UNCACHED == 0, occurs when there is a bug while downloading files
                    loaded(callback, self);
                    break;
                case adapter.IDLE:
                    // IDLE == 1, files are already loaded
                    loaded(callback, self);
                    break;
                case adapter.UPDATEREADY:
                    // UPDATEREADY == 4, update is available
                    onUpdateReady();
                    break;
                case adapter.OBSOLETE:
                    // OBSOLETE == 5, cache isn't valid anymore
                    loaded(callback, self);
                    break;
                default:
                    break;
                }


                /**
                 * check for manifest updates if a online network is available
                 *
                 */
                on(window, 'online', function () {
                    try {
                        adapter.update();
                    } catch (e) {

                        /* start-dev-block */
                        moduleLog('Window event online: update cache is not available', e);
                        /* end-dev-block */

                    }
                });


                /**
                 * call the main callback after certain time for slow
                 * internet connections or uncovered non-standard behaviours
                 * which could throw errors.
                 *
                 * the page is already accessable because all application cache
                 * files will be loaded async in the background.
                 */
                window.setTimeout(function () {
                    if (!self.isLoaded) {
                        loaded(callback, self);
                    }
                }, 12000);


            } else {

                loaded(callback, self);

            }
        },


        /**
         * init storage
         *
         * @param {object} parameters The instance parameters
         * 
         * @return {this} The instance if supported or false
         */
        init: function (parameters) {

            // init local vars
            var self = this;

            // check for support
            if (self.isSupported()) {

                if (null === self.adapter) {
                    self.adapter = globalInterface;
                }

                if (parameters) {
                    if (!!parameters.message) {
                        self.message = String(parameters.message);
                    }
                    if (parameters.delay !== undefined) {
                        self.delay = parseInt(parameters.delay, 10);
                    }
                }
            }

            // return false if there is no support
            return self;
        }

    };


    /**
     * make the storage adapter available under the
     * ns.cache namespace
     *
     * @export
     */
    ns.ns('cache.storage.adapter.' + storageType, Adapter);


}(window, document, window.getNs())); // immediatly invoke function
