/*global describe, it, waitsFor, runs, expect, app, afterEach, $, window, console*/
/*jslint unparam: true */

describe('Cache Interface', function () {

    'use strict';

    afterEach(function () {

        var ready = false;

        runs(function () {
            app.helpers.dom.nuke();
            app.cache.setup({});
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


    it('Call load - check callback', function () {

        var instance,
            loadCallback;

        runs(function () {
            app.cache.load([
                {url: "js/lib.js", type: "js"}
            ], function (storage) {
                instance = storage;
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

    it('Call load - check callback with empty resource arguments', function () {

        var instance,
            loadCallback;

        runs(function () {
            app.cache.load([
            ], function (storage) {
                instance = storage;
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

    it('Call load - check without arguments', function () {

        var instance,
            loadCallback;

        runs(function () {
            app.cache.load();
            loadCallback = 'success';
        });

        waitsFor(function () {
            return loadCallback !== undefined;
        }, 'cache.storage initialized', 1000);

        runs(function () {
            expect(loadCallback).toEqual('success');
        });

    });

    it('Call load - check group loading order with automatic adapter selection', function () {

        var instance,
            loadCallback,
            loadedCallback1,
            loadedCallback2;

        runs(function () {
            app.cache.load([
                {url: "js/lib.js", type: "js", loaded: function () {
                    loadedCallback1 = new Date().getTime();
                }},
                {url: "js/app.js", type: "js", group: 1, loaded: function () {
                    loadedCallback2 = new Date().getTime();
                }}
            ], function (storage) {
                instance = storage;
                loadCallback = 'success';
            });
        });

        waitsFor(function () {
            return loadCallback === 'success';
        }, 'cache.storage initialized', 1000);

        runs(function () {
            var test = !!(loadedCallback1 < loadedCallback2);
            expect(test).toEqual(true);
        });

    });

    it('Call load - check group loading order with fileSystem', function () {

        var instance,
            loadCallback,
            loadedCallback1,
            loadedCallback2;

        runs(function () {
            app.cache.load([
                {url: "js/lib.js", type: "js", loaded: function () {
                    loadedCallback1 = new Date().getTime();
                }},
                {url: "js/app.js", type: "js", group: 1, loaded: function () {
                    loadedCallback2 = new Date().getTime();
                }}
            ], function (storage) {
                instance = storage;
                loadCallback = 'success';
            }, {
                adapters: {
                    preferredType: 'fileSystem'
                }
            });
        });

        waitsFor(function () {
            return loadCallback === 'success';
        }, 'cache.storage initialized', 1000);

        runs(function () {
            var test = !!(loadedCallback1 < loadedCallback2);
            expect(test).toEqual(true);
        });

    });

    it('Call load - check group loading order with indexedDatabase', function () {

        var instance,
            loadCallback,
            loadedCallback1,
            loadedCallback2;

        runs(function () {
            app.cache.load([
                {url: "js/lib.js", type: "js", loaded: function () {
                    loadedCallback1 = new Date().getTime();
                }},
                {url: "js/app.js", type: "js", group: 1, loaded: function () {
                    loadedCallback2 = new Date().getTime();
                }}
            ], function (storage) {
                instance = storage;
                loadCallback = 'success';
            }, {
                adapters: {
                    preferredType: 'indexedDatabase'
                }
            });
        });

        waitsFor(function () {
            return loadCallback === 'success';
        }, 'cache.storage initialized', 1000);

        runs(function () {
            var test = !!(loadedCallback1 < loadedCallback2);
            expect(test).toEqual(true);
        });

    });

    it('Call load - check group loading order with webSqlDatabase', function () {

        var instance,
            loadCallback,
            loadedCallback1,
            loadedCallback2;

        runs(function () {
            app.cache.load([
                {url: "js/lib.js", type: "js", loaded: function () {
                    loadedCallback1 = new Date().getTime();
                }},
                {url: "js/app.js", type: "js", group: 1, loaded: function () {
                    loadedCallback2 = new Date().getTime();
                }}
            ], function (storage) {
                instance = storage;
                loadCallback = 'success';
            }, {
                adapters: {
                    preferredType: 'webSqlDatabase'
                }
            });
        });

        waitsFor(function () {
            return loadCallback === 'success';
        }, 'cache.storage initialized', 1000);

        runs(function () {
            var test = !!(loadedCallback1 < loadedCallback2);
            expect(test).toEqual(true);
        });

    });

    it('Call load - check group loading order with webStorage', function () {

        var instance,
            loadCallback,
            loadedCallback1,
            loadedCallback2;

        runs(function () {
            app.cache.load([
                {url: "js/lib.js", type: "js", loaded: function () {
                    loadedCallback1 = new Date().getTime();
                }},
                {url: "js/app.js", type: "js", group: 1, loaded: function () {
                    loadedCallback2 = new Date().getTime();
                }}
            ], function (storage) {
                instance = storage;
                loadCallback = 'success';
            }, {
                adapters: {
                    preferredType: 'webStorage'
                }
            });
        });

        waitsFor(function () {
            return loadCallback === 'success';
        }, 'cache.storage initialized', 1000);

        runs(function () {
            var test = !!(loadedCallback1 < loadedCallback2);
            expect(test).toEqual(true);
        });

    });

    it('Call remove - check callback', function () {

        var instance,
            loadCallback;

        runs(function () {
            app.cache.remove([
                {url: "js/lib.js", type: "js"}
            ], function (storage) {
                instance = storage;
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

    it('Call remove - check callback with empty resource arguments', function () {

        var instance,
            loadCallback;

        runs(function () {
            app.cache.remove([
            ], function (storage) {
                instance = storage;
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

    it('Call remove - check without arguments', function () {

        var instance,
            loadCallback;

        runs(function () {
            app.cache.remove();
            loadCallback = 'success';
        });

        waitsFor(function () {
            return loadCallback !== undefined;
        }, 'cache.storage initialized', 1000);

        runs(function () {
            expect(loadCallback).toEqual('success');
        });

    });

    it('Call remove - check for removing single resource', function () {

        var instance,
            loadCallback,
            loadCallback1,
            loadData;

        runs(function () {
            app.cache.load([
                {url: "js/lib.js", type: "js"}
            ], function (storage) {
                loadCallback = 'success';
            }, {
                adapters: {
                    preferredType: 'webStorage'
                }
            });
        });

        waitsFor(function () {
            var data = window.localStorage.getItem(JSON.stringify("js/lib.js"));
            return loadCallback === 'success' && !!data === true;
        }, 'save resource', 1000);

        runs(function () {
            app.cache.remove([
                {url: "js/lib.js", type: "js"}
            ], function () {
                loadCallback1 = 'success';
            }, {
                adapters: {
                    preferredType: 'webStorage'
                }
            });
        });

        waitsFor(function () {
            return loadCallback1 === 'success';
        }, 'delete resource', 1000);

        runs(function () {
            var data = !!window.localStorage.getItem(JSON.stringify("js/lib.js"));
            expect(data).not.toEqual(true);
        });

    });

    it('Call remove - check for removing multiple resources', function () {

        var instance,
            loadCallback,
            loadCallback1,
            loadData;

        runs(function () {
            app.cache.load([
                {url: "js/lib.js", type: "js"},
                {url: "js/app.js", type: "js"}
            ], function () {
                loadCallback = 'success';
            }, {
                adapters: {
                    preferredType: 'webStorage'
                }
            });
        });

        waitsFor(function () {
            var data1 = window.localStorage.getItem(JSON.stringify("js/lib.js")),
                data2 = window.localStorage.getItem(JSON.stringify("js/app.js"));
            return loadCallback === 'success' && !!data1 === true && !!data2 === true;
        }, 'cache.storage initialized', 1000);

        runs(function () {
            app.cache.remove([
                {url: "js/lib.js", type: "js"},
                {url: "js/app.js", type: "js"}
            ], function () {
                loadCallback1 = 'success';
            }, {
                adapters: {
                    preferredType: 'webStorage'
                }
            });
        });

        waitsFor(function () {
            return loadCallback1 === 'success';
        }, 'cache.storage initialized', 1000);

        runs(function () {
            var data1 = !!window.localStorage.getItem(JSON.stringify("js/lib.js")),
                data2 = !!window.localStorage.getItem(JSON.stringify("js/lib.js"));
            expect(data1).not.toEqual(true);
            expect(data2).not.toEqual(true);
        });

    });

    it('Call setup', function () {

        var loadCallback,
            loadedCallback1,
            loadedCallback2;

        runs(function () {
            app.cache.setup({
                adapters: {
                    preferredType: 'webStorage'
                }
            });
        });
        runs(function () {
            app.cache.load([
                {url: "js/lib.js", type: "js"}
            ], function (storage) {
                loadedCallback1 = storage;
            });
        });

        waitsFor(function () {
            return loadedCallback1 !== undefined;
        }, 'cache.storage initialized', 1000);

        runs(function () {
            console.log(loadedCallback1);
            expect(loadedCallback1.storage.adapter.type).toEqual('webStorage');
        });

    });

    it('Check chaining', function () {

        var loadCallback,
            loadedCallback1,
            loadedCallback2;

        runs(function () {
            app.cache.load([
                {url: "js/lib.js", type: "js"}
            ], function (storage) {
                loadedCallback1 = 'success';
            }).remove([
                {url: "js/lib.js", type: "js"}
            ], function () {
                loadedCallback2 = 'success';
            });
        });

        waitsFor(function () {
            return loadedCallback1 === 'success';
        }, 'cache.storage initialized', 1000);

        runs(function () {
            var test = !!(loadedCallback1 === 'success' && loadedCallback2 === 'success');
            expect(test).toEqual(true);
        });

    });

});
