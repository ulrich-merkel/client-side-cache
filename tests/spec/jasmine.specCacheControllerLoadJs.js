/*global beforeEach, window, describe, it, waitsFor, runs, expect, app, afterEach, $, window, console*/
/*jslint unparam: true */

describe('Cache Controller Load Single Js', function () {

    'use strict';

    var path = '';
    if (window.__karma__ !== undefined) {
        path += 'base/';
    }

    beforeEach(function(){
        if (!$('#test-node-script').length) {
            $('<script id="test-node-script"></script>').appendTo('body');
        }
    });

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


    it('Call load with one js resource argument (url, type) - check load callback function', function () {

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
                {url: path + 'js/lib.js', type: 'js'}
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

    it('Call load with one js resource argument (url, type, loaded) - check resource loaded callback', function () {

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
                {url: path + 'js/lib.js', type: 'js', loaded: function () {
                    loadCallback = 'success';
                }}
            ]);
        });

        waitsFor(function () {
            return loadCallback !== undefined;
        }, 'cache.storage initialized', 1000);

        runs(function () {
            expect(loadCallback).toEqual('success');
        });
    });

    it('Call load with one js resource argument (url, type, loaded) - check resource loaded callback data', function () {

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
                {url: path + 'js/lib.js', type: 'js', loaded: function (data) {
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

    it('Call load with one js resource argument (url, type) - check dom append', function () {

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
                {url: path + 'js/lib.js', type: 'js'}
            ], function () {
                loadCallback = true;
            });
        });

        waitsFor(function () {
            return loadCallback !== undefined;
        }, 'cache loaded callback', 1000);

        runs(function () {
            var $script = $('script').filter(function () {
                    return $(this).hasClass('lazyloaded');
                }),
                length = $script.length;
            expect(length).toBe(1);
        });
    });

    it('Call load with one js resource argument (url, type) - check dom append and lazyload class added', function () {

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
                {url: path + 'js/lib.js', type: 'js'}
            ], function () {
                loadCallback = true;
            });
        });

        waitsFor(function () {
            return loadCallback !== undefined;
        }, 'cache.storage initialized', 1000);

        runs(function () {
            var $script = $('script').filter(function () {
                    return $(this).hasClass('lazyloaded');
                }),
                length = $script.length;
            expect(length).toBe(1);
        });
    });

    it('Call load with one js resource argument (url, type, node) - check node id append', function () {

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
                {url: path + 'js/lib.js', type: 'js', node: {id: 'test-node-script'}}
            ], function () {
                loadCallback = true;
            });
        });

        waitsFor(function () {
            return loadCallback !== undefined;
        }, 'cache.storage initialized', 1000);

        runs(function () {
            expect($('#test-node-script')).not.toBeEmpty();
        });
    });

    it('Call load with one js resource argument (url, type, node) - check node dom append', function () {

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
                {url: path + 'js/lib.js', type: 'js', node: {dom: $('#test-node-script')[0]}}
            ], function () {
                loadCallback = true;
            });
        });

        waitsFor(function () {
            return loadCallback !== undefined;
        }, 'cache.storage initialized', 1000);

        runs(function () {
            expect($('#test-node-script')).not.toBeEmpty();
        });
    });

    it('Call load with one js resource argument (url, type) - check callback with wrong path', function () {

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
                {url: path + 'js123/lib.js', type: 'js'}
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

    it('Call load with one js resource argument (url, type, node) - check callback with wrong node', function () {

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
                {url: path + 'js/lib.js', type: 'js', node: {id: 'test-node-script123'}}
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

    it('Call load with one js resource argument (url, type) - check callback with wrong type', function () {

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
                {url: path + 'js/lib.js', type: 'cs'}
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

    it('Call load with one js resource argument (url) - check loading with guessed type', function () {

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
                {url: path + 'js/lib.js', node: {dom: $('#test-node-script')[0]}}
            ], function () {
                loadCallback = true;
            });
        });

        waitsFor(function () {
            return loadCallback !== undefined;
        }, 'cache.storage initialized', 1000);

        runs(function () {
            expect($('#test-node-script')).not.toBeEmpty();
        });
    });

});
