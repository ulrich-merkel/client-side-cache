client-side-cache
=================

# Client side caching via javascript

## Introduction

This javascript functions demonstrating the possibility of client side caching via javascript and html5 browser apis.

The javascript logic will check your browser capabilities for storing data locally and look for an according storage api to use. If one of these adapters is available in your browser the given resources will be cached locally in your browser.
On each revisite of the html page, these resources will be loaded from cache to reduce the network bandwidth. If there is no support for storing data locally in your browser, the resources will be loaded via xhr and in case of css/js/img files
appended to the dom. The idea for this work was inspired by the caching component from the javascript toolkit wink and some articles about javascript caching practices from google and other major companies.

There are four storage adapters available for the browsers tests. These are File System, Indexed Database, WebSql Database and Web Storage (or Local Storage). The check will start with File System (offering 50 MB space out of the box, but is only
available in chrome at the time of this writing) and going further to Indexed Database (giving you 5 - 50 MB depending on the device and browser). If these tests failed, the javascript will look for WebSql Database support and if it's not available
for Web Storage support. Both adapters gave you round about 5 MB, but this can vary on the device and browser. Web Storage is widely supported storage, even internet explorer 8 support this api (but doesn't support the session lifetime).

## Usage

If you just want to see the demo, open the generated index.html (/export/index.html) file. You need to run a webserver for the test page or run the middleman server to make shure the ajax calls are working. The test page is generated with middleman app - if you want to edit the source files you need to install this ruby application or you combine the needed files javascript with any other tool or manually. 
The javascript logic is split into several functions under the global app namespace. The files you will need to use caching are listed in /middleman/source/js/_app/cache and  /middleman/source/js/_app/helpers:

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

If you don't need one or some of the storage adapters (_app/cache/storage/adapter/...js), you can just delete these files to reduce the file size. The helper files provide some useful functions and information that will be needed
to manage the caching mechanism. The storage controller (app/cache/storage/controller.js) is responsible for checking the different storage adapters. He also provides an consistent interface to store and retrieve the data from cache.
The main logic for handling the cache is listed in the cache controller (_app/cache/controller.js). This file will take care of checking and loading the data you are requesting.
It is recommended that you combine all the single files into one and minimize the combined file.

To initialize and use the javascript caching, you need to take care of some steps. Because some storage apis work async, you need to initialize the caching in this way. First of all you need to call the "app.cache.controller.init(callback)" function to open and check the database.
After the callback invokes, you are able to call the "app.cache.controller.load(resources, callback)" function where you can specify the resource you want to be cached. You will find a sample initialisation in the bootstrap file (_app/cache/bootstrap.js)
or in the examples below. You can edit (and embed) the given cache bootstrap file to load the resources you want to.

The offline application cache differs from the usage of the other four. Due to it's different javascript api and idea of how to store data, you are just able to listen to the events this kind of storage fires. You can use this adapter to e.g. display a loading
bar or screen.


### Examples
#### Cache initializing:

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
                 * {string|float} version The optional version number of the resource, used to mark a resource to be updated
                 * {string|integer} lastmod The optional lastmod timestamp of the resource, used to mark a resource to be updated
                 * {string|integer} lifetime The optional lifetime time in milliseconds of the resource, used to mark a resource to be updated after a given period if time, if set to -1 the resource will always be loaded from network
                 * {object} node Container for additional dom node informations
                 * {string} node.id The id from the dom element to append the data to
                 * {object} node.dom The current dom element to append the data to
                 *
                 */
    
                // load page css and js files
                controller.load([
                    {url: baseUrl + "css/app.css", type: "css"},
                    {url: baseUrl + "js/lib.js", type: "js"},
                    {url: baseUrl + "js/app.js", type: "js", group: 1}
                ], function () {
                    // do something when css and js files are loaded
                });
    
                // load page images
                controller.load([
                    {url: baseUrl + "img/410x144/test-1.jpg", type: "img", node: {id: "image-1"}},
                    {url: baseUrl + "img/410x144/test-2.jpg", type: "img", node: {id: "image-2"}},
                    {url: baseUrl + "img/410x144/test-3.jpg", type: "img", node: {id: "image-3"}}
                ], function () {
                    // do something when images are loaded
                });
    
    
            });
    
        });
    
    }(window, window.app || {}));

#### Offline application cache initializing:
        ...
        controller.init(function (storage) {

            // initialize application cache and wait for loaded
            storage.appCacheAdapter.open(function () {
                // do something when offline cache is loaded
            });

        });
        ...

### Tested and supported browsers for the different storage apis:

#### Web Storage:
 - Internet Explorer 8.0 +
 - Firefox 3.5 +
 - Safari 4.0 +
 - Google Crome 4.0 +
 - Opera 10.5 +
 - iOs 2.0 +
 - Android 2.0 +
 - Camino 2.1.2 +
 - Fake 1.8 +
 - Omni Web 5.11 +
 - Stainless 0.8 +
 - Seamonkey 2.15 +
 - Sunrise 2.2 +
 
#### WebSql Database:
 - Safari 3.1 +
 - Google Crome 4.0 +
 - Opera 10.5 +
 - Maxthon 4.0.5 +
 - iOs 3.2 +
 - Android 2.1 +
 - Stainless 0.8 +
 
#### Indexed Database
 - Internet Explorer 10.0 +
 - Firefox 20.0 +
 - Google Crome 17.0 +
 - Opera 12.5 +
 - Maxthon 4.0.5 +
 - Seamonkey 2.15 +
 
#### File System
 - Google Crome 26.0 +
 - Maxthon 4.0.5 +