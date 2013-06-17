client-side-cache
=================

client side caching via javascript

This javascript functions demonstrating the possibility of client side caching via javascript and html5 browser apis.

The cache controller will check your browser capabilities and look for a storage api to use. The available storage adapters are File System, Indexed Database, WebSql Database and Web Storage (or Local Storage).
If one of these adapters is available in your browser (while starting the test with File System, then Indexed Database, then WebSql and finally Web Storage) the given resources will be cached locally in your browser.
On each revisite of the index.html page, these resources will be loaded from cache to reduce the network bandwidth. You need to run a webserver for the index.html page to make shure the ajax calls are working.
