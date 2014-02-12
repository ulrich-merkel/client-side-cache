/*global describe, it, waitsFor, runs, expect, app*/
/*jslint unparam: true */

describe('Cache Storage Controller', function () {

    'use strict';

    var path = '';
    if (window.__karma__ !== undefined) {
        path += 'base/';
    }

    it('Initialize storage controller', function () {

        var storage = new app.cache.storage.controller();

        waitsFor(function () {
            return !!storage.isEnabled ? storage.adapter !== null : true;
        }, 'cache.storage initialized', 1000);

        runs(function () {
            expect(storage).not.toEqual(undefined);
        });

    });

    it('Get storage controller instance via callback function', function () {

        var instance,
            storage = new app.cache.storage.controller(function (self) {
                instance = self;
            });

        waitsFor(function () {
            return instance !== undefined;
        }, 'cache.storage initialized', 1000);

        runs(function () {
            expect(instance).toEqual(storage);
        });

    });

    it('Check choosing available storage adapter automatically', function () {

        var instance,
            storage = new app.cache.storage.controller(function (self) {
                instance = self;
            });

        waitsFor(function () {
            return instance !== undefined;
        }, 'cache.storage initialized', 1000);

        runs(function () {
            expect(instance.adapter).not.toEqual(null);
        });

    });

    it('Call create - check callback', function () {

        var instance,
            callback,
            storage = new app.cache.storage.controller(function (self) {
                instance = self;
                instance.create({url: path + 'js/lib.js', type: 'js'}, function () {
                    callback = 'success';
                });
            });

        waitsFor(function () {
            return instance !== undefined;
        }, 'cache.storage initialized', 1000);

        runs(function () {
            expect(callback).toEqual('success');
        });

    });

    it('Call create without resource arguments - check callback', function () {

        var instance,
            callback,
            storage = new app.cache.storage.controller(function (self) {
                instance = self;
                instance.create(null, function () {
                    callback = 'success';
                });
            });

        waitsFor(function () {
            return instance !== undefined;
        }, 'cache.storage initialized', 1000);

        runs(function () {
            expect(callback).toEqual('success');
        });

    });

    it('Call create without arguments', function () {

        var instance,
            callback,
            storage = new app.cache.storage.controller(function (self) {
                instance = self;
                instance.create();
            });

        waitsFor(function () {
            return instance !== undefined;
        }, 'cache.storage initialized', 1000);

        runs(function () {
            expect(instance).toEqual(storage);
        });

    });

    it('Call read - check callback', function () {

        var instance,
            callback,
            storage = new app.cache.storage.controller(function (self) {
                instance = self;
                instance.read({url: path + 'js/lib.js', type: 'js'}, function () {
                    callback = 'success';
                });
            });

        waitsFor(function () {
            return callback !== undefined;
        }, 'cache.storage initialized', 1000);

        runs(function () {
            expect(callback).toEqual('success');
        });

    });

    it('Call read without resource arguments - check callback', function () {

        var instance,
            callback,
            storage = new app.cache.storage.controller(function (self) {
                instance = self;
                instance.read(null, function () {
                    callback = 'success';
                });
            });

        waitsFor(function () {
            return instance !== undefined;
        }, 'cache.storage initialized', 1000);

        runs(function () {
            expect(callback).toEqual('success');
        });

    });

    it('Call read without arguments', function () {

        var instance,
            callback,
            storage = new app.cache.storage.controller(function (self) {
                instance = self;
                instance.read();
            });

        waitsFor(function () {
            return instance !== undefined;
        }, 'cache.storage initialized', 1000);

        runs(function () {
            expect(instance).toEqual(storage);
        });

    });

    it('Call update - check callback', function () {

        var instance,
            callback,
            storage = new app.cache.storage.controller(function (self) {
                instance = self;
                instance.update({url: path + 'js/lib.js', type: 'js'}, function () {
                    callback = 'success';
                });
            });

        waitsFor(function () {
            return instance !== undefined;
        }, 'cache.storage initialized', 1000);

        runs(function () {
            expect(callback).toEqual('success');
        });

    });

    it('Call update without resource arguments - check callback', function () {

        var instance,
            callback,
            storage = new app.cache.storage.controller(function (self) {
                instance = self;
                instance.update(null, function () {
                    callback = 'success';
                });
            });

        waitsFor(function () {
            return instance !== undefined;
        }, 'cache.storage initialized', 1000);

        runs(function () {
            expect(callback).toEqual('success');
        });

    });

    it('Call update without arguments', function () {

        var instance,
            callback,
            storage = new app.cache.storage.controller(function (self) {
                instance = self;
                instance.update();
            });

        waitsFor(function () {
            return instance !== undefined;
        }, 'cache.storage initialized', 1000);

        runs(function () {
            expect(instance).toEqual(storage);
        });

    });

    it('Call remove - check callback', function () {

        var instance,
            callback,
            storage = new app.cache.storage.controller(function (self) {
                instance = self;
                instance.remove({url: path + 'js/lib.js', type: 'js'}, function () {
                    callback = 'success';
                });
            });

        waitsFor(function () {
            return callback !== undefined;
        }, 'cache.storage initialized', 1000);

        runs(function () {
            expect(callback).toEqual('success');
        });

    });

    it('Call remove without resource arguments - check callback', function () {

        var instance,
            callback,
            storage = new app.cache.storage.controller(function (self) {
                instance = self;
                instance.remove(null, function () {
                    callback = 'success';
                });
            });

        waitsFor(function () {
            return instance !== undefined;
        }, 'cache.storage initialized', 1000);

        runs(function () {
            expect(callback).toEqual('success');
        });

    });

    it('Call remove without arguments', function () {

        var instance,
            callback,
            storage = new app.cache.storage.controller(function (self) {
                instance = self;
                instance.remove();
            });

        waitsFor(function () {
            return instance !== undefined;
        }, 'cache.storage initialized', 1000);

        runs(function () {
            expect(instance).toEqual(storage);
        });

    });
});

