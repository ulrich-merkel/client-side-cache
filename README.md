client-side-cache
=================

# Client side caching via javascript

## Introduction

This javascript functions demonstrating the possibility of client side caching via javascript and html5 browser apis.

The cache controller will check your browser capabilities and look for a storage api to use. The available storage adapters are File System, Indexed Database, WebSql Database and Web Storage (or Local Storage).
If one of these adapters is available in your browser (while starting the test with File System, then Indexed Database, then WebSql and finally Web Storage) the given resources will be cached locally in your browser.
On each revisite of the html page, these resources will be loaded from cache to reduce the network bandwidth. You need to run a webserver for the test page (/export/index.html) or run the middleman server to make shure the ajax calls are working.
If there is no support for storing data locally in your browser, the resources will be loaded via xhr and in case of css/js/img files appended to the dom.

The test page is generated with middleman app - if you want to edit them you need to install this ruby application or you combine the needed files javascript (listed in /middleman/source/js/_app/cache/) with any other tool.

### Tested and supported browsers:

 - Internet explorer 8.0 +
 - Firefox 19.0 +
 - Google Crome 21.0 +
 - Safari 6.0 +
 - Opera 12.5 +
 - Camino 2.1.2 +
 - Fake 1.8 +
 - Maxthon 4.0.5 +
 - Omni Web 5.11 +
 - Seamonkey 2.15 +
 - Stainless 0.8 +
 - Sunrise 2.2 +

## Usage

The files you will need to use caching are listed in /middleman/source/js/_app/cache and  /middleman/source/js/_app/helpers:

- _app/helpers/namespace.js
- _app/helpers/utils.js
- _app/helpers/client.js
- _app/helpers/append.js
- _app/cache/storage/controller.js
- _app/cache/storage/adapter/fileSystem.js
- _app/cache/storage/adapter/indexedDatabase.js
- _app/cache/storage/adapter/webSqlDatabase.js
- _app/cache/storage/adapter/webStorage.js
- _app/cache/storage/adapter/applicationCache.js
- _app/cache/controller.js

- _app/cache/bootstrap.js

It is recommended that you combine all the single files into one and minimize the combined file. In the last bootstrap.js file are you able to edit the
files which you want to cache locally. Below you will find a sample version of the bootstrap file.

### Examples
#### Example cache initializing:

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

        // module vars
        var helpers = app.helpers,                                  // helpers {object} Shortcut for helper functions
            utils = helpers.utils,                                  // utils {object} Shortcut for utils functions
            bind = utils.bind,                                      // bind {function} Shortcut for bind helper
            controller = {};                                        // controller {object} Cache controller public functions and vars
    
    
    
        /**
         * get controller
         */
        controller = app.cache.controller;
    
    
        /**
         * load additional resources on window load
         *
         */
        bind(window, 'load', function () {
    
            var baseUrl = window.baseurl || utils.url(window.location.pathname).folder;
    
    
            controller.init(function (storage) {
    
                /**
                 * here we define the resources to be loaded and cached
                 *
                 * there are muliple async calls for resources via controller.load possible
                 * possible options are:
                 *
                 * {string} url The required url of the resource
                 * {string} type The required content type of the resource (css, js, img, html)
                 * {string|integer} group The optional loading group of the resource, this is used for handling dependencies, a following group begins to start loading when the previous has finished
                 * {string|integer} version The optional version number of the resource, used to mark a resource to be updated
                 * {string|integer} lastmod The optional lastmod timestamp of the resource, used to mark a resource to be updated
                 * {string|integer} lifetime The optional lifetime time in milliseconds of the resource, used to mark a resource to be updated after a given period if time, if set to -1 the resource will always be loaded from network
                 * {object} node Container for additional dom node informations
                 * {string} node.id The id from the dom element to append the data to
                 * {string} node.dom The current dom element to append the data to
                 *
                 */
    
                // load page css and js files
                controller.load([
                    {url: baseUrl + "css/app.css", type: "css"},
                    {url: baseUrl + "js/lib.js", type: "js"},
                    {url: baseUrl + "js/app.js", type: "js", group: 1}
                ], function () {
                    // do somesthing when css and js files are loaded
                });
    
                // load page images
                controller.load([
                    { "url": baseUrl + "img/410x144/test-1.jpg", "type": "img", "node": {"id": "image-1"}},
                    { "url": baseUrl + "img/410x144/test-2.jpg", "type": "img", "node": {"id": "image-2"}},
                    { "url": baseUrl + "img/410x144/test-3.jpg", "type": "img", "node": {"id": "image-3"}}
                ], function () {
                    // do somesthing when images are loaded
                });
    
    
            });
    
        });
    
    }(window, window.app || {}));

#### Example offline application cache initializing:
        ...
        controller.init(function (storage) {

            /**
             * initialize application cache and wait for loaded
             */
            storage.appCacheAdapter.open(function () {
                // do something when offline cache is loaded
            });

        });
        ...