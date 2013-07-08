/*jslint unparam: true */

/*global window*/
/*global document*/

/**
 * app.cache.bootstrap
 * 
 * @description
 * - initialize cache functions and resources
 * 
 * @author Ulrich Merkel (hello@ulrichmerkel.com)
 * @version 0.1
 *
 * @namespace app
 *
 * @changelog
 * - 0.1 basic functions and plugin structur
 *
 * @see
 * -
 * 
 * @bugs
 * - 
 *
 **/
(function (window, document, app, undefined) {
    'use strict';

    /**
     * undefined is used here as the undefined global
     * variable in ECMAScript 3 and is mutable (i.e. it can
     * be changed by someone else). undefined isn't really
     * being passed in so we can ensure that its value is
     * truly undefined. In ES5, undefined can no longer be
     * modified.
     * 
     * document and app are passed through as local
     * variables rather than as globals, because this (slightly)
     * quickens the resolution process and can be more
     * efficiently minified (especially when both are
     * regularly referenced in this module).
     */

    // module vars
    var utils = app.helpers.utils,                                  // @type {object} Shortcut for utils functions
        logTimerStart = utils.logTimerStart,                        // @type {function} Shortcut for utils.logTimerStart functions
        logTimerEnd = utils.logTimerEnd,                            // @type {function} Shortcut for utils.logTimerEnd functions
        on = utils.on;                                              // @type {function} Shortcut for utilsl.on helper


    /**
     * load additional resources on window load
     *
     */
    on(window, 'load', function () {

        // start timers to profile loading time
        logTimerStart('Page css and js files loaded');
        logTimerStart('Page images loaded');
        logTimerStart('Html loaded');
        logTimerStart('Application Cache loaded');

        // init base vars and loaded callback
        var baseUrl = window.baseurl || utils.url(window.location.pathname).folder,
            loaded = 0,
            loadedCallback = function () {
                loaded = loaded + 1;
                if (loaded === 2) {
                    document.getElementById('layer-loading').style.display = 'none';
                }
            };


        // load css and js
        app.cache.load([
            {url: baseUrl + "css/app.css", type: "css"},
            {url: baseUrl + "js/lib.js", type: "js"},
            {url: baseUrl + "js/app.js", type: "js", group: 1}
        ], function () {
            logTimerEnd('Page css and js files loaded');
            loadedCallback();
        });


        // load css and js
        app.cache.load([
            {url: baseUrl + "css/test.css", type: "css", data: "html p{color:#1f357d;}", ajax: false}
        ], function () {
            console.log("test loaded");
        });


        // load images
        app.cache.load([
            {url: baseUrl + "img/410x144/test-1.jpg", type: "img", node: {id: "image-1"}},
            {url: baseUrl + "img/410x144/test-2.jpg", type: "img", node: {id: "image-2"}},
            {url: baseUrl + "img/410x144/test-3.jpg", type: "img", node: {id: "image-3"}}
        ], function () {
            logTimerEnd('Page images loaded');
        });


        // load html
        app.cache.load([
            {url: baseUrl + "ajax.html", type: "html", node: {id: "ajax"}}
        ], function () {
            logTimerEnd('Html loaded');
        });


        // load application cache
        app.cache.load('applicationCache', function () {
            logTimerEnd('Application Cache loaded');
            loadedCallback();
        });


    });

}(window, document, window.app || {}));