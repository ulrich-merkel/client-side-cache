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
