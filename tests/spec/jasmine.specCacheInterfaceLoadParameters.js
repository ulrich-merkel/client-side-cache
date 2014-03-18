/*global describe, it, waitsFor, runs, expect, app, afterEach, $, window, console*/
/*jslint unparam: true */

describe('Cache Interface Load Parameters', function () {

    'use strict';

    var path = '';
    if (window.__karma__ !== undefined) {
        path += 'base/';
    }

    afterEach(function () {

        var ready = false;

        runs(function () {
            app.helpers.dom.nuke();
            $('#test-node-script').empty();
            $('#test-node-style').empty();
            $('#test-node-img').removeAttr('src');
            $('#test-node-html').empty();
            $('script.lazyloaded').remove();
            $('style.lazyloaded').remove();
            if (!$('script.lazyloaded').length && !$('style.lazyloaded').length) {
                ready = true;
            }
        });

        waitsFor(function () {
            return !!ready;
        }, 'reset cache and objects', 1000);

    });


    it('Call load with isEnabled param - check setting isEnabled true', function () {
    
        var instance,
            loadCallback;
    
        runs(function () {
            app.cache.load([
                {url: path + 'js/lib.js', type: 'js'}
            ], function (storage) {
                instance = storage;
                loadCallback = 'success';
            }, {
                isEnabled: true
            });
        });
    
        waitsFor(function () {
            return loadCallback === 'success';
        }, 'cache.storage initialized', 1000);
    
        runs(function () {
            expect(instance.storage.isEnabled).toEqual(true);
        });
    
    });
    
    it('Call load with isEnabled param - check setting isEnabled false', function () {
    
        var instance,
            loadCallback;
    
        runs(function () {
            app.cache.load([
                {url: path + 'js/lib.js', type: 'js'}
            ], function (storage) {
                instance = storage;
                loadCallback = 'success';
                
            }, {
                isEnabled: false
            });
        });
    
        waitsFor(function () {
            return loadCallback === 'success';
        }, 'cache.storage initialized', 1000);
    
        runs(function () {
            expect(instance.storage.isEnabled).toEqual(false);
        });
    
    });

    it('Call load with adapters param - check setting types', function () {

        var instance,
            loadCallback,
            isSupportedFs = new app.cache.storage.adapter.fileSystem().isSupported(),
            isSupportedId = new app.cache.storage.adapter.indexedDatabase().isSupported(),
            isSupported = isSupportedFs && isSupportedId;

        runs(function () {
            app.cache.load([
                {url: path + 'js/lib.js', type: 'js'}
            ], function (storage) {
                instance = storage;
                loadCallback = 'success';
            }, {
                adapters: {
                    types: [
                        {type: 'fileSystem', css: true, js: true, html: true, img: true},
                        {type: 'indexedDatabase', css: true, js: true, html: true, img: true }
                    ]
                }
            });
        });

        waitsFor(function () {
            if (isSupported) {
                return loadCallback === 'success';
            } else {
                return true;
            }
        }, 'cache.storage initialized', 1000);

        runs(function () {
            if (isSupported) {
                var length = instance.storage.adapters.types.length;
                expect(length).toEqual(2);
            } else {
                expect(true).toEqual(true);
            }
        });

    });

    it('Call load with adapters param - check setting types defaults', function () {

        var instance,
            loadCallback,
            isSupported = new app.cache.storage.adapter.webStorage().isSupported();

        runs(function () {
            app.cache.load([
                {url: path + 'js/lib.js', type: 'js'}
            ], function (storage) {
                instance = storage;
                loadCallback = 'success';
            }, {
                adapters: {
                    types: [
                        {type: 'webStorage'}
                    ]
                }
            });
        });

        waitsFor(function () {
            return loadCallback === 'success';
        }, 'cache.storage initialized', 1000);

        runs(function () {
            var length = instance.storage.adapters.types.length;
            expect(length).toEqual(1);
            if (isSupported) {
                expect(instance.storage.adapter.type).toEqual('webStorage');
                expect(instance.storage.adapters.types[0].css).toEqual(true);
                expect(instance.storage.adapters.types[0].js).toEqual(true);
                expect(instance.storage.adapters.types[0].html).toEqual(true);
                expect(instance.storage.adapters.types[0].img).toEqual(true);
            }
            
        });

    });

    it('Call load with adapters param - check setting types arguments', function () {

        var instance,
            loadCallback,
            isSupported = new app.cache.storage.adapter.fileSystem().isSupported();

        runs(function () {
            app.cache.load([
                {url: path + 'js/lib.js', type: 'js'}
            ], function (storage) {
                instance = storage;
                loadCallback = 'success';
            }, {
                adapters: {
                    types: [
                        {type: 'fileSystem', css: false, js: false, html: false, img: false}
                    ]
                }
            });
        });

        waitsFor(function () {
            return loadCallback === 'success';
        }, 'cache.storage initialized', 2000);

        runs(function () {
            var length = instance.storage.adapters.types.length;
            expect(length).toEqual(1);
            if (isSupported) {
                expect(instance.storage.adapter.type).toEqual('fileSystem');
                expect(instance.storage.adapters.types[0].css).toEqual(false);
                expect(instance.storage.adapters.types[0].js).toEqual(false);
                expect(instance.storage.adapters.types[0].html).toEqual(false);
                expect(instance.storage.adapters.types[0].img).toEqual(false);
            }
        });

    });

    it('Call load with adapters param - check setting preferred type', function () {

        var instance,
            loadCallback,
            checkAdapter,
            checkAdapterOpen,
            isSupported = new app.cache.storage.adapter.webSqlDatabase().isSupported();

        runs(function () {
            checkAdapter = new app.cache.storage.adapter.webSqlDatabase();
            checkAdapter.open(function (success) {
                checkAdapterOpen = success;
            });
        });

        waitsFor(function () {
            return checkAdapterOpen !== undefined;
        }, 'check adapter initialized', 1000);

        runs(function () {
            app.cache.load([
                {url: path + 'js/lib.js', type: 'js'}
            ], function (storage) {
                instance = storage;
                loadCallback = 'success';
            }, {
                adapters: {
                    types: [
                        {type: 'fileSystem', css: true, js: true, html: true, img: true},
                        {type: 'indexedDatabase', css: true, js: true, html: true, img: true },
                        {type: 'webSqlDatabase', css: true, js: true, html: true, img: true }
                    ],
                    preferredType: 'webSqlDatabase'
                }
            });
        });

        waitsFor(function () {
            return loadCallback === 'success';
        }, 'cache.storage initialized', 1000);

        runs(function () {
            var length = instance.storage.adapters.types.length;
            expect(length).toEqual(3);
            if (isSupported && checkAdapterOpen) {
                expect(instance.storage.adapter.type).toEqual('webSqlDatabase');
            }
        });

    });

    it('Call load with adapters param - check setting preferred type with types length 1', function () {

        var instance,
            loadCallback,
            isSupported = new app.cache.storage.adapter.webStorage().isSupported();

        runs(function () {
            app.cache.load([
                {url: path + 'js/lib.js', type: 'js'}
            ], function (storage) {
                instance = storage;
                loadCallback = 'success';
            }, {
                adapters: {
                    types: [
                        {type: 'webStorage', css: true, js: true, html: true, img: true }
                    ],
                    preferredType: 'webStorage'
                }
            });
        });

        waitsFor(function () {
            return loadCallback === 'success';
        }, 'cache.storage initialized', 1000);

        runs(function () {
            var length = instance.storage.adapters.types.length;
            expect(length).toEqual(1);
            if (isSupported) {
                expect(instance.storage.adapter.type).toEqual('webStorage');
            } else {
                expect(true).toEqual(true);
            }
            
        });

    });

    it('Call load with adapters param - check setting wrong preferred type', function () {

        var instance,
            loadCallback,
            isSupported = new app.cache.storage.adapter.webStorage().isSupported();

        runs(function () {
            app.cache.load([
                {url: path + 'js/lib.js', type: 'js'}
            ], function (storage) {
                instance = storage;
                loadCallback = 'success';
            }, {
                adapters: {
                    types: [
                        {type: 'webStorage', css: true, js: true, html: true, img: true }
                    ],
                    preferredType: 'webStorage123'
                }
            });
        });

        waitsFor(function () {
            return loadCallback === 'success';
        }, 'cache.storage initialized', 1000);

        runs(function () {
            if (isSupported) {
                var length = instance.storage.adapters.types.length;
                expect(length).toEqual(1);
                expect(instance.storage.adapter.type).not.toEqual('webStorage123');
                expect(instance.storage.adapter.type).toEqual('webStorage');
            } else {
                expect(true).toEqual(true);
            }
        });

    });

    it('Call load with adapters param - check setting file system defaults', function () {

        var instance,
            loadCallback,
            isSupported = new app.cache.storage.adapter.fileSystem().isSupported();

        runs(function () {
            app.cache.load([
                {url: path + 'js/lib.js', type: 'js'}
            ], function (storage) {
                instance = storage;
                loadCallback = 'success';
            }, {
                adapters: {
                    preferredType: 'fileSystem',
                    defaults: {
                        size: 1 * 1024 * 1024
                    }
                }
            });
        });

        waitsFor(function () {
            return loadCallback === 'success';
        }, 'cache.storage initialized', 1000);

        runs(function () {
            if (isSupported) {
                var adapter = instance.storage.adapter.type;
                expect(instance.storage.adapter.type).toEqual('fileSystem');
                expect(instance.storage.adapter.size).toEqual(1 * 1024 * 1024);
            } else {
                expect(true).toEqual(true);
            }
        });

    });

    it('Call load with adapters param - check setting indexed database defaults', function () {

        var instance,
            loadCallback,
            isSupported = new app.cache.storage.adapter.indexedDatabase().isSupported();

        runs(function () {
            app.cache.load([
                {url: path + 'js/lib.js', type: 'js'}
            ], function (storage) {
                instance = storage;
                loadCallback = 'success';
            }, {
                adapters: {
                    preferredType: 'indexedDatabase',
                    defaults: {
                        name: 'testname',
                        //table: 'testcache', -> buggy?
                        version: '2.1',
                        //key: 'testkey', readonly

                    }
                }
            });
        });

        waitsFor(function () {
            return loadCallback === 'success';
        }, 'cache.storage initialized', 1000);

        runs(function () {
            if (isSupported) {
                var adapter = instance.storage.adapter.type;
                expect(instance.storage.adapter.type).toEqual('indexedDatabase');
                expect(instance.storage.adapter.adapter.name).toEqual('testname');
            } else {
                expect(true).toEqual(true);
            }
        });

    });

    it('Call load with adapters param - check setting web sql database defaults', function () {

        var instance,
            loadCallback,
            checkAdapter,
            checkAdapterOpen,
            isSupported = new app.cache.storage.adapter.webSqlDatabase().isSupported();

        runs(function () {
            checkAdapter = new app.cache.storage.adapter.webSqlDatabase();
            checkAdapter.open(function (success) {
                checkAdapterOpen = success;
            });
        });

        waitsFor(function () {
            return checkAdapterOpen !== undefined;
        }, 'check adapter initialized', 1000);

        runs(function () {
            app.cache.load([
                {url: path + 'js/lib.js', type: 'js'}
            ], function (storage) {
                instance = storage;
                loadCallback = 'success';
            }, {
                adapters: {
                    preferredType: 'webSqlDatabase',
                    defaults: {
                        version: '2.1'
                    }
                }
            });
        });

        waitsFor(function () {
            return loadCallback === 'success';
        }, 'cache.storage initialized', 1000);

        runs(function () {
            if (isSupported && checkAdapterOpen) {
                var adapter = instance.storage.adapter.type;
                expect(instance.storage.adapter.type).toEqual('webSqlDatabase');
                expect(instance.storage.adapter.adapter.version).toEqual('2.1');
            } else {
                expect(true).toEqual(true);
            }
        });

    });

    it('Call load with adapters param - check setting web storage defaults', function () {

        var instance,
            loadCallback,
            isSupported = new app.cache.storage.adapter.webStorage({lifetime: 'session'}).isSupported();

        runs(function () {
            app.cache.load([
                {url: path + 'js/lib.js', type: 'js'}
            ], function (storage) {
                instance = storage;
                loadCallback = 'success';
            }, {
                adapters: {
                    preferredType: 'webStorage',
                    defaults: {
                        lifetime: 'session'
                    }
                }
            });
        });

        waitsFor(function () {
            return loadCallback === 'success';
        }, 'cache.storage initialized', 1000);

        runs(function () {
            if (isSupported && !window.__karma__) {
                var data = !!window.sessionStorage.getItem(JSON.stringify('js/lib.js'));
                expect(instance.storage.adapter.type).toEqual('webStorage');
                expect(data).toEqual(true);
            } else {
                expect(true).toEqual(true);
            }
        });

    });
});
