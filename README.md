client-side-cache
=================

client side caching via javascript

This javascript functions demonstrating the possibility of client side caching via javascript and html5 browser apis.

The cache controller will check your browser capabilities and look for a storage api to use. The available storage adapters are File System, Indexed Database, WebSql Database and Web Storage (or Local Storage).
If one of these adapters is available in your browser (while starting the test with File System, then Indexed Database, then WebSql and finally Web Storage) the given resources will be cached locally in your browser.
On each revisite of the index.html page, these resources will be loaded from cache to reduce the network bandwidth. You need to run a webserver for the export/index.html page to make shure the ajax calls are working.

The test page is generated with middleman app - if you want to edit them you need to install this ruby application or you combine the needed files javascript (listed in middleman/source/js/_app/cache/) with any other tool.

Supported and tested browsers:

- Chrome: 27.0.1453.116
- Firefox: 21.0 (without images)
- Safari: 6.0.5
- Opera: 12.15
- Internet Explorer: 9 (native), 8 (combat mode),  7 (combat mode, ajax fallback)
- iOs: 6.1.3
- Camino: 2.1.2
- Seamonkey: 2.15.1 (without images)