/*global describe, it, waitsFor, runs, expect, app*/
/*jslint unparam: true */

describe('Cache Controller Load Single Img', function () {

    'use strict';

    afterEach(function () {
    
        var ready = false;
    
        runs(function () {
            app.helpers.dom._destroy();
            $('#test-node-img').removeAttr('src');
            ready = true;
        });
    
        waitsFor(function(){
            return !!ready;
        }, 'reset cache and objects', 1000);
    
    });

    
    it('Call load with one img resource argument (url, type) - check load callback function', function () {
    
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
                {url:  "../src/assets/img/content/410x144/test-1.jpg", type: "img"},
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
    
    it('Call load with one img resource argument (url, type, loaded) - check resource loaded callback', function () {
    
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
                {url:  "../src/assets/img/content/410x144/test-1.jpg", type: "img", loaded: function () {
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
    
    it('Call load with one img resource argument (url, type, loaded) - check resource loaded callback data', function () {
    
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
                {url:  "../src/assets/img/content/410x144/test-1.jpg", type: "img", loaded: function (data) {
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
    
    it('Call load with one img resource argument (url, type, node) - check node id append', function () {
    
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
                {url:  "../src/assets/img/content/410x144/test-1.jpg", type: "img", node: {id: 'test-node-img'}}
            ], function () {
                loadCallback = true;
            });
        });
        
        waitsFor(function () {
            return loadCallback !== undefined;
        }, 'cache.storage initialized', 1000);
        
        runs(function () {
            var src = $('#test-node-img').attr('src');
            src = !!src;
            expect(src).toBe(true);
        });
    });
    
    it('Call load with one img resource argument (url, type, node) - check node dom append', function () {
    
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
                {url:  "../src/assets/img/content/410x144/test-1.jpg", type: "img", node: {dom: $('#test-node-img')[0]}}
            ], function () {
                loadCallback = true;
            });
        });
        
        waitsFor(function () {
            return loadCallback !== undefined;
        }, 'cache.storage initialized', 1000);
        
        runs(function () {
            var src = $('#test-node-img').attr('src');
            src = !!src;
            expect(src).toBe(true);
        });
    });
    
    it('Call load with one img resource argument (url, type) - check callback with wrong path', function () {
    
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
                {url:  "../src123/assets/img/content/410x144/test-1.jpg", type: "img"}
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
    
    it('Call load with one img resource argument (url, type, node) - check callback with wrong node', function () {
    
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
                {url:  "../src/assets/img/content/410x144/test-1.jpg", type: "img", node: {id: 'test-node-img123'}}
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
    
    it('Call load with one img resource argument (url, type) - check callback with wrong type', function () {
    
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
                {url:  "../src/assets/img/content/410x144/test-1.jpg", type: "im"}
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

});
