/*global describe, it, waitsFor, runs, expect, app*/
/*jslint unparam: true */

describe('Cache Storage Adapter Web Storage', function () {

    'use strict';

    afterEach(function () {
    
        var ready = false;
    
        runs(function () {
            app.helpers.dom._destroy();
            $('#test-node-script').empty();
            $('#test-node-script').removeAttr('asnyc type class');
            $("script.lazyloaded").remove();
            if (!$("script.lazyloaded").length) {
                ready = true;
            }
        });
    
        waitsFor(function(){
            return !!ready;
        }, 'reset cache and objects', 1000);
    
    });

    
    it('Initialize storage adapter', function () {
    
        var instance,
            adapter = new app.cache.storage.adapter.webStorage();

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
    
        var instance,
            adapter = new app.cache.storage.adapter.webStorage();

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
            adapter = new app.cache.storage.adapter.webStorage(),
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
            adapter = new app.cache.storage.adapter.webStorage(),
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
            adapter = new app.cache.storage.adapter.webStorage(),
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
            interfaceCallback = adapter.create('jasmine-test', '{test: "test-content"}');
        });

        waitsFor(function () {
            return interfaceCallback !== undefined;
        }, 'adapter.create callback', 1000);

        runs(function () {
            expect(interfaceCallback).not.toEqual(undefined);
        });
    });

    it('Call read - asynchronous way', function () {
    
        var instance,
            adapter = new app.cache.storage.adapter.webStorage(),
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
            adapter.read('jasmine-test',function (data) {
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
            adapter = new app.cache.storage.adapter.webStorage(),
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

    it('Call read - synchronous way', function () {
    
        var instance,
            adapter = new app.cache.storage.adapter.webStorage(),
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
            interfaceCallback = adapter.read('jasmine-test');
        });

        waitsFor(function () {
            return interfaceCallback !== undefined;
        }, 'cache.storage.adapter callback', 1000);

        runs(function () {
            expect(interfaceCallback).toEqual('{test: "test-content"}');
        });
    });

    it('Call update - asynchronous way', function () {
    
        var instance,
            adapter = new app.cache.storage.adapter.webStorage(),
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
            adapter = new app.cache.storage.adapter.webStorage(),
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
            adapter = new app.cache.storage.adapter.webStorage(),
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
            interfaceCallback = adapter.update('jasmine-test', '{test: "test-content2"}');
        });

        waitsFor(function () {
            return interfaceCallback !== undefined;
        }, 'adapter.create callback', 1000);

        runs(function () {

            expect(interfaceCallback).toEqual(true);
        });
    });

    it('Call remove - asynchronous way', function () {
    
        var instance,
            adapter = new app.cache.storage.adapter.webStorage(),
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
            adapter = new app.cache.storage.adapter.webStorage(),
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
            adapter = new app.cache.storage.adapter.webStorage(),
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
            interfaceCallback = adapter.remove('jasmine-test');
        });

        waitsFor(function () {
            return interfaceCallback !== undefined;
        }, 'adapter.create callback', 1000);

        runs(function () {
            expect(interfaceCallback).not.toEqual(undefined);
        });
    });

});
