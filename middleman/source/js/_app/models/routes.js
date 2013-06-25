/*global window*/
/*global jQuery*/

/**
 * app.models.model
 * 
 * @description
 * - base model with public functions
 * - provide consistent api for models
 * 
 * @author Ulrich Merkel (hello@ulrichmerkel.com)
 * @version 0.1
 *
 * @namespace app
 * 
 * @requires
 * - 
 * 
 * @changelog
 * - 0.1 basic functions
 *
 * @bugs
 * - 
 * 
 */
(function (app, undefined) {
    'use strict';

    /**
     * undefined is used here as the undefined global
     * variable in ECMAScript 3 and is mutable (i.e. it can
     * be changed by someone else). undefined isn't really
     * being passed in so we can ensure that its value is
     * truly undefined. In ES5, undefined can no longer be
     * modified.
     * 
     * window, app and jquery are passed through as local
     * variables rather than as globals, because this (slightly)
     * quickens the resolution process and can be more
     * efficiently minified (especially when both are
     * regularly referenced in this module).
     */

    // module vars
    var routes = new app.models.model([
        {
            id: 1,
            content: {
                url: '/index.html',
                view: 'index',
                state: 'index',
                params: [],
                index: true
            }
        },
        {
            id: 2,
            content: {
                url: '/page1.html',
                view: 'page1',
                state: 'page1',
                params: []
            }
        },
        {
            id: 3,
            content: {
                url: '/page2.html',
                view: 'page2',
                state: 'page2',
                params: []
            }
        }
    ]);

    app.models.routes = routes;


}(window.app || {}));