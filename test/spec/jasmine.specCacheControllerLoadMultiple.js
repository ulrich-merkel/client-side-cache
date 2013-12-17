/*global describe, it, waitsFor, runs, expect, app*/
/*jslint unparam: true */

describe('Cache Controller Load Multiple', function () {

    'use strict';

    afterEach(function () {
    
        var ready = false;
    
        runs(function () {
            app.helpers.dom._destroy();
            $('#test-node-script').empty();
            $('#test-node-style').empty();
            $('#test-node-img').removeAttr('src');
            $('#test-node-html').empty();
            $("script.lazyloaded").remove();
            $("style.lazyloaded").remove();
            if (!$("script.lazyloaded").length && !$("style.lazyloaded").length) {
                ready = true;
            }
        });
    
        waitsFor(function(){
            return !!ready;
        }, 'reset cache and objects', 1000);
    
    });


    it('Call load with css (url, type), js (url, type), img (url, type), html (url, type) - check load callback function', function () {
    
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
                {url: "../srccss/app.css", type: "css"},
                {url: "../src/js/lib.js", type: "js"},
                {url: "../src/assets/img/content/410x144/test-1.jpg", type: "img"},
                {url: "../src/ajax.html", type: "html"}
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

    it('Call load with js (url, type) - check group loading order', function () {
    
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
				{url: "../src/js/_lib/vendor/jquery-1.8.3.js", type: "js"},
				{url: "../src/js/_lib/utils/jquery.reveal.js", type: "js", group: 1}
            ], function () {
                loadCallback = 'success';
            });
        });

        waitsFor(function () {
            return loadCallback !== undefined;
        }, 'cache.storage initialized', 1000);
        
        runs(function () {
            var jquery = !!window.jQuery;
            expect(jquery).toEqual(true);
        });
    });

    it('Call load with js (url, type) - check gaps in group loading order', function () {
    
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
				{url: "../src/js/_lib/vendor/jquery-1.8.3.js", type: "js"},
				{url: "../src/js/_lib/utils/jquery.reveal.js", type: "js", group: 15},
                {url: "../src/js/_lib/polyfill/matchmedia.js", type: "js", group: 40}
            ], function () {
                loadCallback = 'success';
            });
        });

        waitsFor(function () {
            return loadCallback !== undefined;
        }, 'cache.storage initialized', 1000);
        
        runs(function () {
            var jquery = !!window.matchMedia;
            expect(jquery).toEqual(true);
        });
    });

});
