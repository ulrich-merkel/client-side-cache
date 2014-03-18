/*global beforeEach, window, describe, it, waitsFor, runs, expect, app, afterEach, $, window*/
/*jslint unparam: true */

describe('Cache Controller Load Single Html', function () {

    'use strict';

    var path = '';
    if (window.__karma__ !== undefined) {
        path += 'base/';
    }

    beforeEach(function(){
        if (!$('#test-node-html').length) {
            $('<div id="test-node-html"></div>').appendTo('body');
        }
    });

    afterEach(function () {

        var ready = false;

        runs(function () {
            app.helpers.dom.nuke();
            $('#test-node-html').empty();
            ready = true;
        });

        waitsFor(function () {
            return !!ready;
        }, 'reset cache and objects', 1000);

    });

    it('Call load with one html resource argument (url, type) - check load callback function', function () {

        var instance,
            cache = new app.cache.controller(function (callbackObject) {
                instance = callbackObject;
            }),
            loadCallback;

        waitsFor(function () {
            return instance !== undefined;
        }, 'cache.storage initialized', 1000);

        runs(function () {
            cache.load([
                {url:  path + 'ajax.html', type: 'html'}
            ], function () {
                loadCallback = 'success';
            });
        });

        waitsFor(function () {
            return loadCallback !== undefined;
        }, 'cache.storage initialized', 1000);

        runs(function () {
            expect(loadCallback).toEqual('success');
        });
    });

    it('Call load with one html resource argument (url, type, loaded) - check resource loaded callback', function () {

        var instance,
            cache = new app.cache.controller(function (callbackObject) {
                instance = callbackObject;
            }),
            loadCallback;

        waitsFor(function () {
            return instance !== undefined;
        }, 'cache.storage initialized', 1000);

        runs(function () {
            cache.load([
                {url:  path + 'ajax.html', type: 'html', loaded: function () {
                    loadCallback = true;
                }}
            ]);
        });

        waitsFor(function () {
            return loadCallback !== undefined;
        }, 'cache.storage initialized', 1000);

        runs(function () {
            expect(loadCallback).toEqual(true);
        });
    });

    it('Call load with one html resource argument (url, type, loaded) - check resource loaded callback data', function () {

        var instance,
            cache = new app.cache.controller(function (callbackObject) {
                instance = callbackObject;
            }),
            loadCallback;

        waitsFor(function () {
            return instance !== undefined;
        }, 'cache.storage initialized', 1000);

        runs(function () {
            cache.load([
                {url:  path + 'ajax.html', type: 'html', loaded: function (data) {
                    loadCallback = !!data;
                }}
            ]);
        });

        waitsFor(function () {
            return loadCallback !== undefined;
        }, 'cache.storage initialized', 1000);

        runs(function () {
            expect(loadCallback).toEqual(true);
        });
    });

    it('Call load with one html resource argument (url, type, node) - check node id append', function () {

        var instance,
            cache = new app.cache.controller(function (callbackObject) {
                instance = callbackObject;
            }),
            loadCallback;

        waitsFor(function () {
            return instance !== undefined;
        }, 'cache.storage initialized', 1000);

        runs(function () {
            cache.load([
                {url:  path + 'ajax.html', type: 'html', node: {id: 'test-node-html'}}
            ], function () {
                loadCallback = true;
            });
        });

        waitsFor(function () {
            return loadCallback !== undefined;
        }, 'cache.storage initialized', 1000);

        runs(function () {
            expect($('#test-node-html')).not.toBeEmpty();
        });
    });

    it('Call load with one html resource argument (url, type, node) - check node dom append', function () {

        var instance,
            cache = new app.cache.controller(function (callbackObject) {
                instance = callbackObject;
            }),
            loadCallback;

        waitsFor(function () {
            return instance !== undefined;
        }, 'cache.storage initialized', 1000);

        runs(function () {
            cache.load([
                {url:  path + 'ajax.html', type: 'html', node: {dom: $('#test-node-html')[0]}}
            ], function () {
                loadCallback = true;
            });
        });

        waitsFor(function () {
            return loadCallback !== undefined;
        }, 'cache.storage initialized', 1000);

        runs(function () {
            expect($('#test-node-html')).not.toBeEmpty();
        });
    });

    it('Call load with one html resource argument (url, type) - check callback with wrong path', function () {

        var instance,
            cache = new app.cache.controller(function (callbackObject) {
                instance = callbackObject;
            }),
            loadCallback;

        waitsFor(function () {
            return instance !== undefined;
        }, 'cache.storage initialized', 1000);

        runs(function () {
            cache.load([
                {url:  path + 'ajax123.html', type: 'html'}
            ], function () {
                loadCallback = true;
            });
        });

        waitsFor(function () {
            return loadCallback !== undefined;
        }, 'cache.storage initialized', 1000);

        runs(function () {
            expect(loadCallback).toBe(true);
        });
    });

    it('Call load with one html resource argument (url, type, node) - check callback with wrong node', function () {

        var instance,
            cache = new app.cache.controller(function (callbackObject) {
                instance = callbackObject;
            }),
            loadCallback;

        waitsFor(function () {
            return instance !== undefined;
        }, 'cache.storage initialized', 1000);

        runs(function () {
            cache.load([
                {url:  path + 'ajax.html', type: 'html', node: {id: 'test-node-html123'}}
            ], function () {
                loadCallback = true;
            });
        });

        waitsFor(function () {
            return loadCallback !== undefined;
        }, 'cache.storage initialized', 1000);

        runs(function () {
            expect(loadCallback).toBe(true);
        });
    });

    it('Call load with one html resource argument (url, type) - check callback with wrong type', function () {

        var instance,
            cache = new app.cache.controller(function (callbackObject) {
                instance = callbackObject;
            }),
            loadCallback;

        waitsFor(function () {
            return instance !== undefined;
        }, 'cache.storage initialized', 1000);

        runs(function () {
            cache.load([
                {url:  path + 'ajax.html', type: 'htm'}
            ], function () {
                loadCallback = true;
            });
        });

        waitsFor(function () {
            return loadCallback !== undefined;
        }, 'cache.storage initialized', 1000);

        runs(function () {
            expect(loadCallback).toBe(true);
        });
    });

    it('Call load with one html resource argument (url) - check loading with guessed type', function () {

        var instance,
            cache = new app.cache.controller(function (callbackObject) {
                instance = callbackObject;
            }),
            loadCallback;

        waitsFor(function () {
            return instance !== undefined;
        }, 'cache.storage initialized', 1000);

        runs(function () {
            cache.load([
                {url:  path + 'ajax.html', node: {id: 'test-node-html'}}
            ], function () {
                loadCallback = true;
            });
        });

        waitsFor(function () {
            return loadCallback !== undefined;
        }, 'cache.storage initialized', 1000);

        runs(function () {
            expect($('#test-node-html')).not.toBeEmpty();
        });
    });

});
