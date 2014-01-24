/*global describe, it, waitsFor, runs, expect, app*/
/*jslint unparam: true */

describe('Cache Controller', function () {

    'use strict';

    it('Initialize cache controller', function () {

        var cache = new app.cache.controller(),
            storage = new app.cache.storage.controller();

        waitsFor(function () {
            return cache.storage !== null && (!!storage.isEnabled ? storage.adapter !== null : true);
        }, 'cache.storage initialized', 1000);

        runs(function () {
            expect(cache.storage).toEqual(storage);
        });

    });

    it('Get storage instance via callback function', function () {

        var storageInstance,
            cache = new app.cache.controller(function (callbackObject) {
                storageInstance = callbackObject;
            }),
            storage = new app.cache.storage.controller();

        waitsFor(function () {
            return cache.storage !== null && (!!storage.isEnabled ? storage.adapter !== null : true);
        }, 'cache.storage initialized', 1000);

        runs(function () {
            expect(storage).toEqual(storageInstance);
        });

    });
    
    it('Call load without arguments', function () {
    
        var instance,
            cache = new app.cache.controller(function (callbackObject) {
                instance = callbackObject;
            });
    
        cache.load();
    
        waitsFor(function () {
            return instance !== undefined;
        }, 'cache.storage initialized', 1000);
    
        runs(function () {
            expect(1).toEqual(1);
        });
    
    });
    
    it('Call load with empty resource arguments', function () {
    
        var instance,
            cache = new app.cache.controller(function (callbackObject) {
                instance = callbackObject;
            });
    
        cache.load([]);
    
        waitsFor(function () {
            return instance !== undefined;
        }, 'cache.storage initialized', 1000);
    
        runs(function () {
            expect(1).toEqual(1);
        });
    
    });
    
    it('Call remove without arguments', function () {
    
        var instance,
            cache = new app.cache.controller(function (callbackObject) {
                instance = callbackObject;
            });
    
        cache.remove();
    
        waitsFor(function () {
            return instance !== undefined;
        }, 'cache.storage initialized', 1000);
    
        runs(function () {
            expect(1).toEqual(1);
        });
    
    });
    
    it('Call remove with empty resource arguments', function () {
    
        var instance,
            cache = new app.cache.controller(function (callbackObject) {
                instance = callbackObject;
            });
    
        cache.remove([]);
    
        waitsFor(function () {
            return instance !== undefined;
        }, 'cache.storage initialized', 1000);
    
        runs(function () {
            expect(1).toEqual(1);
        });
    
    });
});

