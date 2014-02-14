# Client side caching via javascript #


## Introduction ##

This javascript functions are demonstrating the possibility of client side caching via javascript and html5 storage apis. Page resources like **images, javascript files, stylesheets and html content could be saved locally** in the users browser to reduce http requests. On subsequent page views these resources will be taken from cache and won't be loaded via network. This could reduce the number of http request used for page loading and therefore will improve the overall page loading times.

The given resources will be appended to dom automatically in case of javascript and stylesheet files (if not otherwise specified). You are also able to append data to a specific element on the page, e.g. to load images from cache and display them without any http requests. The idea for this project is based on the beautiful [lawnchair](http://brian.io/lawnchair/ "lawnchair")  and [wink](http://www.winktoolkit.org/ "wink")  libraries, but more focussed on official html5 standards and reducing http request.

**Key features**

+ Cache resources (css, js, html, img) locally in the browser to avoid http requests
+ Get best available html5 client side storage api automatically, choosing between:
	+ file system
	+ indexed database
	+ web sql database
	+ web storage (local storage)
+ Control lifetime and state of your resource files
+ Append css and js data automatically to dom, if not otherwise specified
+ Avoid blocking download of javascript files
+ Store image files (via base64) and append them to dom
+ Control the application cache api state 

**Javascript files**

You will find the latest javascript caching functions in the **build/** folder:

+ **build/cache.js**: The complete and uncompressed source code for development
+ **build/cache.dev.js**: The minified source code, but with some logging informations to keep track of the current cache states
+ **build/cache.min.js**: The minified and optimized javascript caching functions for production


### Demo ####

If you just want to see a working demo, open the generated **/example/full-cache/index.html** file in your browser. You need to run this file in a webserver to make shure the ajax calls are working. The other examples are just there to facilitate comparisons between different caching methods against html5 client side caching.

If you are not in the mood to install this project on a webserver, you could also visit the following link to get some demonstrations working. Clear your browser cache and check your browser console/ network panel to see the improvements:


[Full featured html5 cache ](http://www.ulrichmerkel.com/test/client-side-cache/full-cache/ "Ulrich Merkel")


## Usage ##


#### Basic html example code with cache initializing: ####

An interface to load resources is given via the `window.app.cache.load(resourceArray, callbackFunction)` function. This function expects as the first parameter the resources array, the second parameter is the optional callback function after they've been loaded.
There is a minified and combined version of the functions you need included in the build directory (__build/cache.min.js__). Append the __cache.min.js__ file just before the closing body tag.

The usage of the application cache will need the manifest attribute placed the current html element and this expects a valid path to the manifest file. Below you will find a combined example of how you can initialize html5 caching in your html file:

        <!doctype html>
		<html manifest="cache.manifest">
    	<head>
       		<meta charset="utf-8">
        	<title>Client side caching</title>
    	</head>
   	 	<body>
   
			<!-- some html content ... -->

			<script src="js/cache.js" type="text/javascript"></script>
			<script>
				// load additional resources on window load
        		window.addEventListener('load', function () {
        		
            		app.cache.load([
            			{url: "css/app.css", type: "css"},
            			{url: "js/lib.js", type: "js"},
            			{url: "js/plugin.js", type: "js", group: 1}
        			]);
        			
        		});
			</script>
	
    	</body>
		</html>

#### Load resources:  ####
Below you will find a simple examples of loading (or storing) data from your local html5 cache. The second javascript file (js/plugin.js) starts loading after the previous 2 files are loaded completly. This could be achieved with the group parameter (default is 0 and will be set automatically, if not present).

		// load some resources
        app.cache.load([
        	{url: "css/app.css", type: "css", loaded: function () {
        		// css file loaded
        	}},
       	    {url: "js/lib.js", type: "js", lifetime: 900000},
            {url: "js/plugin.js", type: "js", group: 1}
        ], function () {
        	// all resources loaded
        });

For a full list of available resource options, please take a look below (section "Resource options").

#### Append resource data to dom:  ####
You can append data to a given dom element on the page. This can be used for example to load images and html files and append the result to a some elements on the page.

		// load images
        app.cache.load([
        	{url: "img/410x144/test-1.jpg", type: "img", node: {id: "image-1"}},
       	    {url: "img/410x144/test-2.jpg", type: "img", node: {id: "image-2"}},
            {url: "img/410x144/test-3.jpg", type: "img", node: {id: "image-3"}}
        ]);

        // load html
        app.cache.load([
            {url: "ajax.html", type: "html", node: {id: "ajax"}}
        ]);

		// append data to multiple elements
        app.cache.load([
            {url: "ajax.html", type: "html", node: {id: "ajax-1"}},
            {url: "ajax.html", type: "html", node: {id: "ajax-2"}}
        ]);

#### Delete resource data:  ####
You can also remove resources from cache.

		// remove resources from cache
        app.cache.remove([
        	{url: "img/410x144/test-1.jpg"},
       	    {url: "img/410x144/test-2.jpg"},
            {url: "img/410x144/test-3.jpg"}
        ], function () {
       		// all resources removed
       	});


#### Chaining:  ####
Due to the cache interface api you are allowed to call the app cache initializing functions via chaining: 

		// load resources via chaining
   	    app.cache.load([
            {url: "img/410x144/test-1.jpg", type: "img", node: {id: "image-1"}}
        ]).load([
            {url: "img/954x600/test-2.jpg", type: "img", node: {id: "image-2"}},
            {url: "img/954x600/test-3.jpg", type: "img", node: {id: "image-3"}}
        ]).remove([
            {url: "img/1280x220/test-4.jpg"}
        ]);

#### Resource options:  ####
There are several options you can use to specify a resource. This can be useful to handle lifetimes, appending data to dom or control the loading order.

        {
     
     		/**
        	 * @type {integer} The optional loading group
        	 *
        	 * group of the resource, this is used for handling dependencies,
        	 * a following group begins to start loading when the previous has finished,
        	 * default value is 0
        	 */
        	group: 0,
        	
        	/**
        	 * @type {timestamp} The optional lastmod timestamp
        	 *
        	 * timestamp of the resource, used to mark a resource to be updated       
        	 * if not given the current timestamp via new Date().getTime() is used
        	 * the first time a resource is created
        	 */
       		lastmod: new Date().getTime(),
        	
        	/**
        	 * @type {integer} The optional lifetime timestamp
        	 *
        	 * time in milliseconds used to mark a resource 
        	 * to be updated after a given period if time
        	 *
        	 * if set to '-1' the resource will not expires via lastmod
        	 * if set to '0' the resource will not always expires
        	 * 
        	 */
        	lifetime: 10000,
       
       		/**
        	 * @type {function} The optional callback function when loaded 
        	 *
        	 * this is useful to check the loaded state of
        	 * a single resource, you will also have access
        	 * to the loaded data
        	 */
        	loaded: function (data) {
        	
        	},
        
       		/**
      		 * @type {object} Optional container for additional dom node information
      		 */
      		node: {
      		
      			/**
      			 * @type {string} The id from the dom element to append the data to
      			 */
      			id: '',
      			
      			/**
      			 * @type {object} The current dom element to append the the data to
      			 */
      			dom: null
      		}
      	
        	/**
        	 * @type {string} The required content type 
        	 
           	 * type of the resource could be 'css', 'js', 'img', 'html'
        	 */
        	type: 'css',
        	
        	/**
        	 * @type {string} The required url of the resource
        	 * 
        	 * will be used as the key for storing and retrieving data
        	 */
        	url: 'resource.css',
        
        	/**
        	 * @type {float} The optional version 
        	 *
        	 * number of the resource, used to mark a resource to be updated
        	 */
        	version: 1.0
 
        }
        

#### Offline application cache initializing:  ####
The offline application cache differs from the usage of the other html5 storage adapter. Due to it's different javascript api and idea of how to store data locally, you are just able to listen to the events this kind of storage fires. You can use this adapter to e.g. display a loading bar or listen for updates.


        app.cache.load('applicationCache', function () {
            // do something when application cache is loaded
        });
 
   
You will need to define the resources you want to be offline cached in a separate manifest file. Make sure you reference the manifest attribute on the html dom node to a valid __cache.manifest__ file. The callback function will be fired on `cached`, `updateready`, `obsolete` and `idle` events. So you know when the application cache is ready.

Below you will find a sample cache manifest file:


        CACHE MANIFEST

		# Our cached resources
		# version 1

		CACHE:

		# js files
		./js/cache.min.js

		# css files
		./css/base.css

		# images
		./img/test-1.jpg
		./img/test-2.jpg
		./img/test-3.jpg


		NETWORK:
		*


		FALLBACK:
   


***

## Client side caching process ##

The logic will check your browser capabilities for storing data locally and look for an according storage type to use. If one of these adapters is available in your browser the given resources will be cached locally in your browser. On each revisite of the page, these resources will be loaded from cache to reduce the network bandwidth. If there is no support for storing the data locally in your browser, the resources will be loaded via xhr and in case of css, js, img and html files be appended to the dom.

There are five storage adapters available. These are **File System**, **Indexed Database**, **WebSql Database**, **Web Storage** (or Local Storage) and **Application Cache**. The check will start with File System (offering 50 MB space out of the box, but is only available in chrome at the time of this writing) and going further to Indexed Database (giving you 5 - 50 MB depending on the device and browser). If these tests failed, the javascript logic will look for WebSql Database support and if it's not available for Web Storage support. Both adapters gave you round about 5 MB of local disc space, but this can vary on the device and browser. Web Storage is widely supported, even internet explorer 8 supports this javascript api.

The offline application cache differs from the usage of the other four. Due to it's different javascript api and idea of how to store data, you are just able to listen to the events this kind of storage fires.

* * *


## Project Installation ##

This project is based on Grunt.js, a [node.js](http://nodejs.org/ "Node Js") build tool. For more and deeper information please visit the [ofifficial website](http://gruntjs.com/ "Grunt Js") or just do some [googling](http://google.com/?q=grunt "Google"). Some basic terminal commands are listed for your convenience below. Just navigate your command line to your correspondig project folder and paste the following commands.

### Grunt CLI installation ###

	npm install -g grunt-cli	// sudo npm ... could be useful

### Node package installation ###

	npm install					// sudo npm ... could be useful

### Example Usage ###
        
    grunt						// default watch task
    grunt build					// build project, generate files

* * *


## Project structure ##

### General ###




	build/
	examples/
	extras/
	Gruntfile.js
	LICENSE
	node_modules/	
	package.json
	README.md
	scripts/
	src/
	├── js/
	└── template/
	tests/



#### build/ ####
* Contains all generated files for production.    


#### examples/ ####
* Contains several generated html examples.

#### extras/ ####
* Contains all additional scripts (like java files) which are maybe useful during the build process.

#### src/ ####
* Contains all folders and files for development.

#### src/js/ ####
* Folder for javaScript client side caching source files. Here you will find all logic for handling html5 client side caching.

#### src/template/ ####
* This is the source folder for all html examples. All static content is generated via [assemle](http://assemble.io/ "Assemble IO"), to automate this process as much as possible.

#### tests/ ####
* This folder contains some jasmine javacript tests to make sure the interface is working properly.


### Javascript caching source files ####


There is no external library neccessary for the code to work. The logic is split into several functions and files under the global javascript namespace `window.app`. If you want to modify the source code, the files you will need are listed in **src/js/_app/**. The underscore within the _app folder just indicates that this folder won't be generated during the build process. You are free to rename and reorganize the given folder structur, as long as you include the needed files in the correct order (make sure you **include the helpers first**). The correspondig javascript namespace is handled by the namespace.js helper functions.

#### Helpers ####
- src/js/_app/helpers/namespace.js
- src/js/_app/helpers/utils.js
- src/js/_app/helpers/queue.js
- src/js/_app/helpers/client.js
- src/js/_app/helpers/dom.js

The helper files are used to get some utility functions. They provide some useful functions and information which will be needed to manage the caching mechanism and get some browser workarounds. The most important helper files are namespace.js and utils.js. The namespace.js file will take cake of the correct javascript namespacing for the cache files whereas the utils.js is a kind if library for different browser functions and workarounds (e.g. event bindings).

#### Caching ####
- src/js/_app/cache/storage/controller.js
- src/js/_app/cache/storage/adapter/fileSystem.js
- src/js/_app/cache/storage/adapter/indexedDatabase.js
- src/js/_app/cache/storage/adapter/webSqlDatabase.js
- src/js/_app/cache/storage/adapter/webStorage.js
- src/js/_app/cache/storage/adapter/applicationCache.js
- src/js/_app/cache/controller.js
- src/js/_app/cache/interface.js

The cache storage controller (**src/js/\_app/cache/storage/controller.js**) is responsible for checking the different html5 storage adapters. He also provides an consistent interface to store and retrieve the data from cache. The main logic for handling the caching functions is listed in the cache controller (**src/js/\_app/cache/controller.js**). This file will take care of checking outdated data and loading the data you are requesting.

#### Customizing ####
If you don't need one or some of the storage adapters **src/js/\_app/cache/storage/adapter/...js**, you can just delete these files to reduce the overall file size. The easiest way is to modify the **src/js/cache.files** and start the `grunt build` process. If you just want to use e.g. the webStorage adapter to save data locally, the javascript files you will need to include are:

- src/js/_app/helpers/namespace.js
- src/js/_app/helpers/utils.js
- src/js/_app/helpers/queue.js
- src/js/_app/helpers/client.js
- src/js/_app/helpers/dom.js
- src/js/_app/cache/storage/controller.js
- src/js/_app/cache/storage/adapter/webStorage.js
- src/js/_app/cache/controller.js
- src/js/_app/cache/interface.js

It is recommended that you combine all the single files into one and minimize the combined file. There are lot's of comments included in the source files to make the code better readable, which will be removed while minification during the grunt build process.
If you're using Grunt.js to build your customized version, you can edit the `cache.files` file listed in **src/js/** and start the build process via `grunt build`. Your customized version will be saved in the build folder and is already minified and optimized.

If you need to organize your code and the caching functions under if different global javascript namespace rather than `window.app`, you are free to modify it. Just edit the corresponding variable (`namespaceName`) in **src/js/_app/helpers/namespace.js**, combine all necessary javascript files and all the caching functions are available under your custom namespace.

***

## Tests ###

### Tested and supported browsers:  ###

#### Web Storage: ####
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
 - Sleipnir 4.4 +
 - Yandex 13.0 +
 - Torch 23.0 +
 
#### WebSql Database: ####
 - Safari 3.1 +
 - Google Crome 4.0 +
 - Opera 10.5 +
 - Maxthon 4.0.5 +
 - iOs 6.1 + (3.2)
 - Android 2.1 +
 - Stainless 0.8 +
 - iCab 5.1.1 +
 - Sleipnir 4.4 +
 - Yandex 13.0 +
 - Torch 23.0 +
 
#### Indexed Database ####
 - Internet Explorer 10.0 +
 - Firefox 20.0 +
 - Google Crome 17.0 +
 - Opera 12.5 +
 - Maxthon 4.0.5 +
 - Seamonkey 2.15 +
 - Yandex 13.0 +
 
#### File System ####
 - Google Crome 26.0 +
 - Opera 19.0 +
 - Maxthon 4.0.5 +
 - Yandex 13.0 +
 - Torch 23.0 +
 
#### Application Cache ####
 - Internet Explorer 10.0 +
 - Firefox 20.0 +
 - Safari 5.1 +
 - Google Crome 17.0 +
 - Opera 12.5 +
 - Maxthon 4.0.5 +
 - iOs 3.2 +
 - Android 2.1 +
 - Yandex 13.0 +

#### Fallback (no caching, just dynamic xhr loading): ####
- Internet Explorer 7.0
- Internet Explorer 6.0 (no dynamic html loading, just css/js/img)

#### No support ####
- Flock (tested 2.6.2)

