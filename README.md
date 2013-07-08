# Client side caching via javascript


## Introduction

This javascript functions are demonstrating the possibility of client side caching via javascript and html5 storage apis. Page resources like images, javascript files, stylesheets and html content could be saved locally in the users browser. On subsequent page views these resources will be taken from cache and won't be won't loaded via network. 

The given resources will be appended to the dom automatically in case of javascript and stylesheet files. You are also able to append data to a specific element on the page, to load e.g. images from cache.

### In detail

The logic will check your browser capabilities for storing data locally and look for an according storage type to use. If one of these adapters is available in your browser the given resources will be cached locally in your browser. On each revisite of the html page, these resources will be loaded from cache to reduce the network bandwidth. If there is no support for storing the data locally in your browser, the resources will be loaded via xhr and in case of css, js, img and html files appended to the dom. The idea for this work is based on the javascript caching component from the toolkit wink and some articles about javascript caching practices from google and other major companies.

There are five storage adapters available. These are **File System**, **Indexed Database**, **WebSql Database**, **Web Storage** (or Local Storage) and **Application Cache**. The check will start with File System (offering 50 MB space out of the box, but is only available in chrome at the time of this writing) and going further to Indexed Database (giving you 5 - 50 MB depending on the device and browser). If these tests failed, the javascript will look for WebSql Database support and if it's not available for Web Storage support. Both adapters gave you round about 5 MB of local disc space, but this can vary on the device and browser. Web Storage is widely supported, even internet explorer 8 is supporting this javascript api (but doesn't support the session lifetime).

The offline application cache differs from the usage of the other four. Due to it's different javascript api and idea of how to store data, you are just able to listen to the events this kind of storage fires.

## Usage
### Demo
If you just want to see the demo, open the generated index.html */export/index.html* file in your browser. You need to run a webserver for the test page or run the middleman server to make shure the ajax calls are working. The test page is generated with middleman app - if you want to edit the source files you need to install this ruby application or you combine the needed files javascript with any other tool or manually.

### Sample html code
There is a minified and combined version of the functions you need included in the js directory named __cache.min.js__. Append the _cache.min.js_ file just before the closing body tag. The application cache needs the manifest attribute on the html element and expects a valid path to the manifest file, if you want to use this storage adapter.

	<!doctype html>
	<html manifest="cache.manifest">
    <head>
        <meta charset="utf-8">
        <title>Client side caching</title>
    </head>
  
    <body>
		...
		
		<script src="js/cache.min.js" type="text/javascript"></script>
		<script>
			// initialize resources to be cached
		</script>
    </body>
	</html>



### Cache initializing

An interface to load resources is given via the __app.cacheLoad(resources, callback)__ function. It expects as the first parameter the resources array and the second parameter is the optional callback function after they've been loaded.

#### Basic example:
Be sure that you initialize the cache after the window and it's objects are loaded. When the window is ready you can make calls for the _app.cacheLoad(resources, callback)_ function to get data.

    (function (window, app, undefined) {
        'use strict';
   
        // load additional resources on window load
        window.addEventListener('load', function () {
    
            app.cacheLoad([
            	{url: "css/app.css", type: "css"},
            	{url: "js/lib.js", type: "js"},
            	{url: "js/plugin.js", type: "js", group: 1}
        	], function () {
            	// resources loaded
        	});
    
        });
    
    }(window, window.app || {}));

#### Basic html example code with cache initializing:
This is a combined example how you can initialize local caching in your html file:

        <!doctype html>
		<html manifest="cache.manifest">
    	<head>
       		<meta charset="utf-8">
        	<title>Client side caching</title>
    	</head>
  
   	 	<body>
			...
		
			<script src="js/cache.min.js" type="text/javascript"></script>
			<script>
				// load additional resources on window load
        		window.addEventListener('load', function () {
            		app.cacheLoad([
            			{url: "css/app.css", type: "css"},
            			{url: "js/lib.js", type: "js"},
            			{url: "js/plugin.js", type: "js", group: 1}
        			]);
        		});
			</script>
    	</body>
		</html>
#### Offline application cache initializing:
The offline application cache differs from the usage of the other storage adapter. Due to it's different javascript api and idea of how to store data locally, you are just able to listen to the events this kind of storage fires. You can use this adapter to e.g. display a loading bar or listen for updates.

        ...
        app.cacheLoad('applicationCache', function () {
            // do something when application cache is loaded
        });
        ...
   
You will need to define the resources you want to be offline cached in a separate manifest file. Make sure you reference the manifest attribute on the html dom node to a valid __cache.manifest__ file. The callback function will be fired on _cached_, _updateready_, _obsolete_ and _idle_ events. So you know when the application cache is ready.

Below you will find a sample cache manifest file:


        CACHE MANIFEST

		# Our cached resources
		# version 1

		CACHE:

		# js files
		./js/cache.js

		# css files
		./css/base.css

		# images
		./img/test-1.jpg
		./img/test-2.jpg
		./img/test-3.jpg


		NETWORK:
		*


		FALLBACK:
   
#### Append resource data to dom:
You can append to resource data to a dom element on the page. This can be used for example to load images and html files and append the result to a given element to display the data.

		// load images
        app.cacheLoad([
        	{url: "img/410x144/test-1.jpg", type: "img", node: {id: "image-1"}},
       	    {url: "img/410x144/test-2.jpg", type: "img", node: {id: "image-2"}},
            {url: "img/410x144/test-3.jpg", type: "img", node: {id: "image-3"}}
        ]);

        // load html
        app.cacheLoad([
            {url: "ajax.html", type: "html", node: {id: "ajax"}}
        ]);
      
#### Chaining:
Due to the cache interface api you are allowed to call the app cache initializing functions via chaining: 

		// load resources via chaining
   	    app.cacheLoad([
            {url: "img/410x144/test-1.jpg", type: "img", node: {id: "image-1"}},
            {url: "img/410x144/test-2.jpg", type: "img", node: {id: "image-2"}},
            {url: "img/410x144/test-3.jpg", type: "img", node: {id: "image-3"}}
        ], function () {
           	// images 1 loaded
        }).cacheLoad([
            {url: "img/954x600/test-1.jpg", type: "img", node: {id: "image-4"}},
            {url: "img/954x600/test-2.jpg", type: "img", node: {id: "image-5"}},
       	    {url: "img/954x600/test-3.jpg", type: "img", node: {id: "image-6"}}
        ]).cacheLoad([
            {url: "img/1280x220/test-1.jpg", type: "img", node: {id: "image-7"}},
            {url: "img/1280x220/test-2.jpg", type: "img", node: {id: "image-8"}},
            {url: "img/1280x220/test-3.jpg", type: "img", node: {id: "image-9"}}
        ], function () {
       		// images 3 loaded
        });
     
#### Resource options:
There are several options you can use to specify a resource. This can be useful to handle lifetimes, appending data to dom or the loading order.

        {
        	/**
        	 * @type {string} url The required url of the resource
        	 */
        	url: 'resource.css',
       
        	/**
        	 * @type {string} type The required content type 
        	 * of the resource (css, js, img, html)
        	 */
        	type: 'css',
        	
        	/**
        	 * @type {string|integer} group The optional loading 
        	 * group of the resource, this is used for handling dependencies,
        	 * a following group begins to start loading when the previous has finished,
        	 * default value is 0
        	 */
        	group: 0,
        
        	/**
        	 * @type {string|integer} version The optional version 
        	 * number of the resource, used to mark a resource to be updated
        	 */
        	version: 1.0,
        	
        	/**
        	 * @type {string|integer} lastmod The optional lastmod 
        	 * timestamp of the resource, used to mark a resource to be updated       
        	 * if not given the current timestamp via new Date().getTime() is used
        	 * the first time a resource is created
        	 */
       		lastmod: '',
        	
        	/**
        	 * @type {string|integer} lifetime The optional lifetime 
        	 * time in milliseconds of the resource, used to mark a resource 
        	 * to be updated after a given period if time, if set to -1 the 
        	 * resource will not expires via lastmod
        	 */
        	lifetime: 10000,
      
      		/**
      		 * @type {object} node Container for additional dom node informations
      		 */
      		node: {
      			/**
      			 * @type {string} node.id The id from the dom element to append 
      			 * the data to
      			 */
      			id: '',
      			
      			/**
      			 * @type {string} node.dom The current dom element to append the 
      			 * data to
      			 */
      			dom: null
      		}
        }
 
### Javascript source files
There is no external library neccessary for the code to work. The logic is split into several functions and files under the global namespace _app_. If you want to modify the source code, the files you will need are listed in */middleman/source/js/_app/cache* and  */middleman/source/js/_app/helpers*. You are free to rename and reorganize the given folder structur, as long as you include the needed files in the correct order (make sure you include the helpers first).

##### Helpers
- _app/helpers/namespace.js
- _app/helpers/utils.js
- _app/helpers/queue.js
- _app/helpers/client.js
- _app/helpers/append.js

The helper files are used to get some utility functions. They provide some useful functions and information that will be needed to manage the caching mechanism and get some browser workarounds. The most important helper files are namespace.js and utils.js. The namespace.js will take cake of the correct javascript namespacing for the cache files and the utils.js is a kind if library for different browser functions and workarounds (e.g. event bindings).

##### Caching
- _app/cache/storage/controller.js
- _app/cache/storage/adapter/fileSystem.js
- _app/cache/storage/adapter/indexedDatabase.js
- _app/cache/storage/adapter/webSqlDatabase.js
- _app/cache/storage/adapter/webStorage.js
- _app/cache/storage/adapter/applicationCache.js
- _app/cache/controller.js
- _app/cache/interface.js

The storage controller _/cache/storage/controller.js_ is responsible for checking the different storage adapters. He also provides an consistent interface to store and retrieve the data from cache. The main logic for handling the cache is listed in the cache controller _/cache/controller.js_. This file will take care of checking for outdated data in cache and loading the data you are requesting.

If you don't need one or some of the storage adapters _/cache/storage/adapter/...js_, you can just delete these files to reduce the overall file size. If you want for example just use the webStorage adapter to save data locally, the javascript cache files you will need to include are:

- _app/cache/storage/controller.js
- _app/cache/storage/adapter/webStorage.js
- _app/cache/controller.js
- _app/cache/interface.js

It is recommended that you combine all the single files into one and minimize the combined file. I've included lot's of comments in the source files to make the code better readable which will be removed while minification. There is already a minified and combined version named __cache.min.js__ in the _js/_ directory included. This file includes all storage adapters and cache files (excluding the cache initializing) you will need to use the caching functions.

##### Polyfills
I'm providing some polyfills for different storage adapters. If you want to support older or non-standard browsers, include the given polyfill files listed in _/cache/storage/adapter_. Be sure you include the polyfill before you try to access the wanted storage adapter. Because webStorage is the mostly supported storage adapter, nearly all advanced polyfills fall back to this storage type. So if you want to support a wide range if browsers, make suke you included the webStoragePolyfill.js.

- _app/cache/storage/adapter/webStoragePolyfill.js
- _app/cache/storage/adapter/webStorage.js

### Tested and supported browsers for the different storage apis:

#### Web Storage:
 - Internet Explorer 8.0 +
 - Firefox 3.5 +
 - Safari 4.0 +
 - Google Crome 4.0 +
 - Opera 10.5 +
 - Maxthon 4.0.5 +
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
 - iOs 6.1 + (3.2)
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
 
#### Application Cache
 - Internet Explorer 10.0 +
 - Firefox 20.0 +
 - Safari 5.1 +
 - Google Crome 17.0 +
 - Opera 12.5 +
 - Maxthon 4.0.5 +
 - iOs 3.2 +
 - Android 2.1 +