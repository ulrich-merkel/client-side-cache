/*jslint unparam: true */

/*global window*/
/*global document*/

/**
 * app.cache.init
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
    var helpers = app.helpers,                                  // helpers {object} Shortcut for helper functions
        utils = helpers.utils,                                  // utils {object} Shortcut for utils functions
        bind = utils.bind,                                      // bind {function} Shortcut for bind helper
        controller = {};                                        // controller {object} Cache controller public functions and vars



    /**
     * get controller
     */
    controller = app.cache.controller;


    /**
     * load additional resources on window load
     *
     */
    bind(window, 'load', function () {
        utils.logTimerStart('Page css and js files loaded');
        utils.logTimerStart('Page images loaded');
        utils.logTimerStart('Html loaded');


        var baseUrl = window.baseurl || utils.url(window.location.pathname).folder,
            loaded = 0,
            loadedCallback = function () {
                loaded = loaded + 1;
                if (loaded === 2) {
                    document.getElementById('layer-loading').style.display = 'none';
                }
            };

        controller.init(function (storage) {

            /**
             * here we define the resources to be loaded and cached
             *
             * there are muliple async calls for resources via controller.load possible
             * the callback function is just used to hide the loading layer
             *
             * possible options are:
             *
             * {string} url The required url of the resource
             * {string} type The required content type of the resource (css, js, img, html)
             * {string|integer} group The optional loading group of the resource, this is used for handling dependencies, a following group begins to start loading when the previous has finished
             * {string|integer} version The optional version number of the resource, used to mark a resource to be updated
             * {string|integer} lastmod The optional lastmod timestamp of the resource, used to mark a resource to be updated
             * {string|integer} lifetime The optional lifetime time in milliseconds of the resource, used to mark a resource to be updated after a given period if time, if set to -1 the resource will always be loaded from network
             * {object} node Container for additional dom node informations
             * {string} node.id The id from the dom element to append the data to
             * {string} node.dom The current dom element to append the data to
             *
             */

            // load page css and js files
            controller.load([
                {url: baseUrl + "css/app.css", type: "css"},
                {url: baseUrl + "js/lib.js", type: "js"},
                {url: baseUrl + "js/app.js", type: "js", group: 1}
            ], function () {
                utils.logTimerEnd('Page css and js files loaded');
                loadedCallback();
            });

            // load page images
            controller.load([
                {url: baseUrl + "img/410x144/test-1.jpg", type: "img", node: {id: "image-1"}},
                {url: baseUrl + "img/410x144/test-2.jpg", type: "img", node: {id: "image-2"}},
                {url: baseUrl + "img/410x144/test-3.jpg", type: "img", node: {id: "image-3"}}
            ], function () {
                utils.logTimerEnd('Page images loaded');
            });

            // load html
            controller.load([
                {url: baseUrl + "ajax.html", type: "html", node: {id: "ajax"}}
            ], function () {
                utils.logTimerEnd('Html loaded');
            });

            // initialize application cache and wait for loaded
            if (storage && storage.appCacheAdapter) {
                storage.appCacheAdapter.open(function () {
                    loadedCallback();
                });
            } else {
                loadedCallback();
            }


        });

    });

}(window, document, window.app || {}));