/*global window, localStorage, describe, it, waitsFor, runs, expect, app, afterEach, $, window, console*/
/*jslint unparam: true */

describe('Cache Storage Adapter Web Storage', function () {

    'use strict';

    var storageAdapter = app.cache.storage.adapter.webStorage,
        isSupported = storageAdapter().isSupported(),
        path = '';

    if (window.__karma__ !== undefined) {
        path += 'base/';
    }

    afterEach(function () {

        var ready = false;

        runs(function () {
            app.helpers.dom.nuke();
            $('#test-node-script').empty();
            $('#test-node-script').removeAttr('asnyc type class');
            $('script.lazyloaded').remove();
            if (!$('script.lazyloaded').length) {
                ready = true;
            }
        });

        waitsFor(function () {
            return !!ready;
        }, 'reset cache and objects', 1000);

    });


    it('Initialize storage adapter', function () {

        var instance,
            adapter = storageAdapter();

        runs(function () {
            adapter.open(function (callback) {
                instance = callback;
            });
        });

        waitsFor(function () {
            return instance !== undefined;
        }, 'cache.storage.adapter callback', 1000);

        runs(function () {
            expect(instance).not.toEqual(undefined);
        });
    });

    it('Initialize storage adapter - check without open callback', function () {

        var adapter = storageAdapter();

        runs(function () {
            adapter.open();
        });

        waitsFor(function () {
            return adapter.adapter !== undefined;
        }, 'cache.storage.adapter callback', 1000);

        runs(function () {
            expect(adapter.adapter).not.toEqual(undefined);
        });
    });

    it('Call create - asynchronous way', function () {

        var instance,
            adapter = storageAdapter(),
            interfaceCallback;

        runs(function () {
            adapter.open(function (callback) {
                instance = callback;
            });
        });

        waitsFor(function () {
            return instance !== undefined;
        }, 'cache.storage.adapter callback', 1000);

        runs(function () {
            adapter.create('jasmine-test', '{test: "test-content"}', function (success) {
                interfaceCallback = success;
            });
        });

        waitsFor(function () {
            return interfaceCallback !== undefined;
        }, 'adapter.create callback', 1000);

        runs(function () {
            expect(interfaceCallback).not.toEqual(undefined);
        });
    });

    it('Call create - asynchronous without callback argument', function () {

        var instance,
            adapter = storageAdapter(),
            interfaceCallback;

        runs(function () {
            adapter.open(function (callback) {
                instance = callback;
            });
        });

        waitsFor(function () {
            return instance !== undefined;
        }, 'cache.storage.adapter callback', 1000);

        runs(function () {
            adapter.create('jasmine-test', '{test: "test-content"}');
            adapter.read('jasmine-test', function (data) {
                interfaceCallback = data;
            });
        });

        waitsFor(function () {
            return interfaceCallback !== undefined;
        }, 'adapter.create callback', 1000);

        runs(function () {
            expect(interfaceCallback).not.toEqual(undefined);
        });
    });

    it('Call create - synchronous way', function () {

        var instance,
            adapter = new storageAdapter({
                asynch: false
            }),
            interfaceCallback,
            data;

        adapter.open();
        interfaceCallback = adapter.create('jasmine-test', '{test: "test-content"}');

        expect(interfaceCallback).not.toEqual(undefined);
        data = localStorage.getItem('jasmine-test');
        expect(data).toEqual('{test: "test-content"}');
        
    });

    it('Call read - asynchronous way', function () {

        var instance,
            adapter = storageAdapter(),
            interfaceCallback;

        runs(function () {
            adapter.open(function (callback) {
                instance = callback;
            });
        });

        waitsFor(function () {
            return instance !== undefined;
        }, 'cache.storage.adapter callback', 1000);

        runs(function () {
            adapter.read('jasmine-test', function (data) {
                interfaceCallback = data;
            });
        });

        waitsFor(function () {
            return interfaceCallback !== undefined;
        }, 'adapter.create callback', 1000);

        runs(function () {
            expect(interfaceCallback).toEqual('{test: "test-content"}');
        });
    });

    it('Call read - asynchronous without callback argument', function () {

        var instance,
            adapter = storageAdapter(),
            interfaceCallback;

        runs(function () {
            adapter.open(function (callback) {
                instance = callback;
            });
        });

        waitsFor(function () {
            return instance !== undefined;
        }, 'cache.storage.adapter callback', 1000);

        runs(function () {
            adapter.read('jasmine-test');
        });

        runs(function () {
            expect(interfaceCallback).toEqual(undefined);
        });
    });

    it('Call read - check false result whit non-existing resource', function () {

        var instance,
            adapter = storageAdapter(),
            interfaceCallback;

        runs(function () {
            adapter.open(function (callback) {
                instance = callback;
            });
        });

        waitsFor(function () {
            return instance !== undefined;
        }, 'cache.storage.adapter callback', 1000);

        runs(function () {
            adapter.read('jasmine-testxyz', function (data) {
                interfaceCallback = data;
            });
        });

        waitsFor(function () {
            return interfaceCallback !== undefined;
        }, 'adapter.create callback', 1000);

        runs(function () {
            expect(interfaceCallback).toEqual(false);
        });
    });

    it('Call read - synchronous way', function () {

        var instance,
            adapter = new storageAdapter({
                asynch: false
            }),
            interfaceCallback,
            data;

        adapter.open();
        interfaceCallback = adapter.create('jasmine-test', '{test: "test-content"}');
        interfaceCallback = adapter.read('jasmine-test');

        expect(interfaceCallback).not.toEqual(undefined);
        data = localStorage.getItem('jasmine-test');
        expect(data).toEqual('{test: "test-content"}');

    });

    it('Call update - asynchronous way', function () {

        var instance,
            adapter = storageAdapter(),
            interfaceCallback,
            interfaceCallback2;

        runs(function () {
            adapter.open(function (callback) {
                instance = callback;
            });
        });

        waitsFor(function () {
            return instance !== undefined;
        }, 'cache.storage.adapter callback', 1000);

        runs(function () {
            adapter.update('jasmine-test', '{test: "test-content2"}', function (data) {
                interfaceCallback = data;
            });
        });

        waitsFor(function () {
            return interfaceCallback !== undefined;
        }, 'adapter.create callback', 1000);

        runs(function () {
            adapter.read('jasmine-test', function (data) {
                interfaceCallback2 = data;
            });
        });

        waitsFor(function () {
            return interfaceCallback2 !== undefined;
        }, 'adapter.create callback', 1000);

        runs(function () {
            expect(interfaceCallback2).toEqual('{test: "test-content2"}');
        });
    });

    it('Call update - asynchronous without callback argument', function () {

        var instance,
            adapter = storageAdapter(),
            interfaceCallback,
            interfaceCallback2;

        runs(function () {
            adapter.open(function (callback) {
                instance = callback;
            });
        });

        waitsFor(function () {
            return instance !== undefined;
        }, 'cache.storage.adapter callback', 1000);

        runs(function () {
            adapter.update('jasmine-test', '{test: "test-content2"}');
            adapter.read('jasmine-test', function (data) {
                interfaceCallback2 = data;
            });
        });

        waitsFor(function () {
            return interfaceCallback2 !== undefined;
        }, 'adapter.create callback', 1000);

        runs(function () {
            expect(interfaceCallback2).toEqual('{test: "test-content2"}');
        });
    });

    it('Call update - synchronous way', function () {

        var instance,
            adapter = new storageAdapter({
                asynch: false
            }),
            interfaceCallback,
            data;

        adapter.open();
        interfaceCallback = adapter.update('jasmine-test', '{test: "test-content2"}');

        expect(interfaceCallback).not.toEqual(undefined);
        data = localStorage.getItem('jasmine-test');
        expect(data).toEqual('{test: "test-content2"}');
    });

    it('Call remove - asynchronous way', function () {

        var instance,
            adapter = storageAdapter(),
            interfaceCallback,
            interfaceCallback2;

        runs(function () {
            adapter.open(function (callback) {
                instance = callback;
            });
        });

        waitsFor(function () {
            return instance !== undefined;
        }, 'cache.storage.adapter callback', 1000);

        runs(function () {
            adapter.remove('jasmine-test', function (data) {
                interfaceCallback = data;
            });
        });

        waitsFor(function () {
            return interfaceCallback !== undefined;
        }, 'adapter.create callback', 1000);

        runs(function () {
            adapter.read('jasmine-test', function (data) {
                interfaceCallback2 = data;
            });
        });

        waitsFor(function () {
            return interfaceCallback2 !== undefined;
        }, 'adapter.create callback', 1000);

        runs(function () {
            expect(interfaceCallback2).toEqual(false);
        });
    });

    it('Call remove - asynchronous without callback argument', function () {

        var instance,
            adapter = storageAdapter(),
            interfaceCallback,
            interfaceCallback2;

        runs(function () {
            adapter.open(function (callback) {
                instance = callback;
            });
        });

        waitsFor(function () {
            return instance !== undefined;
        }, 'cache.storage.adapter callback', 1000);

        runs(function () {
            adapter.remove('jasmine-test');
            adapter.read('jasmine-test', function (data) {
                interfaceCallback2 = data;
            });
        });

        waitsFor(function () {
            return interfaceCallback2 !== undefined;
        }, 'adapter.create callback', 1000);

        runs(function () {
            expect(interfaceCallback2).toEqual(false);
        });
    });

    it('Call remove - synchronous way', function () {

        var instance,
            adapter = new storageAdapter({
                asynch: false
            }),
            interfaceCallback,
            data;

        adapter.open();
        interfaceCallback = adapter.create('jasmine-test', '{test: "test-content2"}');
        interfaceCallback = adapter.remove('jasmine-test');

        expect(interfaceCallback).not.toEqual(undefined);
        data = !!localStorage.getItem('jasmine-test');
        expect(data).toEqual(false);
    });

});
