/*global describe, it, waitsFor, runs, expect, app, afterEach, $, window, console*/
/*jslint unparam: true */

describe('Cache Controller Load Advanced', function () {

    'use strict';

    afterEach(function () {

        var ready = false;

        runs(function () {
            app.helpers.dom.nuke();
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

        waitsFor(function () {
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
                {url: "css/app.css", type: "css"},
                {url: "js/lib.js", type: "js"},
                {url: "assets/img/content/410x144/test-1.jpg", type: "img"},
                {url: "ajax.html", type: "html"}
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
                {url: "js/_lib/vendor/jquery-1.8.3.js", type: "js"},
                {url: "js/_lib/utils/jquery.reveal.js", type: "js", group: 1}
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
                {url: "js/_lib/vendor/jquery-1.8.3.js", type: "js"},
                {url: "js/_lib/utils/jquery.reveal.js", type: "js", group: 15},
                {url: "js/_lib/polyfill/matchmedia.js", type: "js", group: 40}
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

    it('Call load with js (url, type) - check lifetime 0', function () {

        var instance,
            cache = new app.cache.controller(function (callbackObject) {
                instance = callbackObject;
            }),
            compare = new Date().getTime(),
            resourceExpires,
            loadCallback;

        waitsFor(function () {
            return instance !== undefined;
        }, 'cache.storage initialized', 1000);

        runs(function () {
            cache.load([
                {url: "js/_lib/utils/jquery.imagesLoaded.js", lifetime: 0, type: "js", loaded: function (resource) {
                    resourceExpires = resource.expires;
                }}
            ], function () {
                loadCallback = 'success';
            });
        });

        waitsFor(function () {
            return loadCallback !== undefined;
        }, 'cache.storage initialized', 1000);

        runs(function () {
            var check = !!instance.isEnabled ? compare < resourceExpires : true;
            expect(check).toEqual(true);
        });

    });

    it('Call load with js (url, type) - check lifetime -1', function () {

        var instance,
            cache = new app.cache.controller(function (callbackObject) {
                instance = callbackObject;
            }),
            resourceIsValid,
            loadCallback;

        waitsFor(function () {
            return instance !== undefined;
        }, 'cache.storage initialized', 1000);

        // make sure item is in cache
        runs(function () {
            cache.load([
                {url: "js/_lib/utils/jquery.pubsub.js", lifetime: -1, type: "js"}
            ], function () {
                loadCallback = 'success';
            });
        });

        waitsFor(function () {
            return loadCallback === "success";
        }, 'cache.storage initialized', 1000);

        // check validation
        runs(function () {
            cache.load([
                {url: "js/_lib/utils/jquery.pubsub.js", lifetime: -1, type: "js", loaded: function (resource) {
                    resourceIsValid = !!instance.isEnabled ? !!resource.isValid : true;
                }}
            ], function () {
                loadCallback = 'success1';
            });
        });

        waitsFor(function () {
            return loadCallback === "success1";
        }, 'cache.storage initialized', 1000);

        runs(function () {
            expect(resourceIsValid).toEqual(true);
        });

    });

    it('Call load with js (url, type) - check version change', function () {

        var instance,
            cache = new app.cache.controller(function (callbackObject) {
                instance = callbackObject;
            }),
            resourceVersion1,
            resourceVersion2,
            resourceExpires1,
            resourceExpires2,
            loadCallback;

        waitsFor(function () {
            return instance !== undefined;
        }, 'cache.storage initialized', 1000);

        runs(function () {
            cache.remove([
                {url: "js/_lib/mobile/fastclick.js", type: "js"}
            ], function () {
                loadCallback = 'deleted';
            });
        });

        waitsFor(function () {
            return loadCallback === 'deleted';
        }, 'cache.storage initialized', 1000);

        runs(function () {
            cache.load([
                {url: "js/_lib/mobile/fastclick.js", type: "js", loaded: function (resource) {
                    resourceVersion1 = !!instance.isEnabled ? resource.version : true;
                    resourceExpires1 = !!instance.isEnabled ? resource.expires : true;
                }}
            ], function () {
                loadCallback = 'success1';
            });
        });

        waitsFor(function () {
            return loadCallback === 'success1';
        }, 'cache.storage initialized', 1000);

        runs(function () {
            window.setTimeout(function () {
                cache.load([
                    {url: "js/_lib/mobile/fastclick.js", type: "js", version: '1.1', loaded: function (resource) {
                        resourceVersion2 = !!instance.isEnabled ? resource.version : true;
                        resourceExpires2 = !!instance.isEnabled ? resource.expires : true;
                    }}
                ], function () {
                    loadCallback = 'success2';
                });
            }, 200);
        });

        waitsFor(function () {
            return loadCallback === 'success2';
        }, 'cache.storage initialized', 1000);

        runs(function () {
            var check =
                (!!instance.isEnabled ? parseFloat(resourceVersion1) < parseFloat(resourceVersion2) : true) &&
                (!!instance.isEnabled ? resourceExpires1 < resourceExpires2 : true);
            expect(check).toEqual(true);
        });

    });

    it('Call load with js (url, type) - check lastmod change', function () {

        var instance,
            cache = new app.cache.controller(function (callbackObject) {
                instance = callbackObject;
            }),
            resourceLastmod1,
            resourceLastmod2,
            loadCallback;

        waitsFor(function () {
            return instance !== undefined;
        }, 'cache.storage initialized', 1000);

        runs(function () {
            cache.remove([
                {url: "js/_lib/mobile/fastclick.js", type: "js"}
            ], function () {
                loadCallback = 'deleted';
            });
        });

        waitsFor(function () {
            return loadCallback === 'deleted';
        }, 'cache.storage initialized', 1000);

        runs(function () {
            cache.load([
                {url: "js/_lib/mobile/fastclick.js", type: "js", lastmod: 1387414672021, loaded: function (resource) {
                    resourceLastmod1 = resource.lastmod;
                }}
            ], function () {
                loadCallback = 'success1';
            });
        });

        waitsFor(function () {
            return loadCallback === 'success1';
        }, 'cache.storage initialized', 1000);

        runs(function () {
            window.setTimeout(function () {
                cache.load([
                    {url: "js/_lib/mobile/fastclick.js", type: "js", lastmod: new Date().getTime(), loaded: function (resource) {
                        resourceLastmod2 = resource.lastmod;
                    }}
                ], function () {
                    loadCallback = 'success2';
                });
            }, 200);
        });

        waitsFor(function () {
            return loadCallback === 'success2';
        }, 'cache.storage initialized', 1000);

        runs(function () {
            var check = resourceLastmod1 < resourceLastmod2;
            expect(check).toEqual(true);
        });

    });
});
