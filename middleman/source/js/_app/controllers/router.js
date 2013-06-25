/*global window*/
/*global jQuery*/

/**
 * jQuery controller
 * 
 * @description
 * - main page controller
 * 
 * @author
 * @version 0.2.1
 * 
 * @requires
 * - jQuery 1.8.2
 * 
 * @changelog
 * - 0.2.1 refactoring
 * - 0.2 new controller structur
 * - 0.1 basic functions and structur
 *
 * @bugs
 * - 
 * 
 */
(function (window, app, $) {
    'use strict';

    // init global vars
    var helpers = app.helpers,
        utils = helpers.utils,
        defaultRoute = {
            url: null,
            view: null,
            state: null,
            params: {}
        };


    /**
     *
     */
    function Router(routes, parameters) {

        this.location = window.location;
        this.routes = null;

        this.init(routes, parameters);
    }


    /**
     *
     */
    Router.prototype = Router.fn = {


        /**
         *
         */
        setRoutes: function (routes) {

            if (routes) {
                this.routes = routes;
            }

        },


        /**
         *
         */
        setRoute: function () {

        },


        /**
         * get route object from route array
         *
         * @param {string} routeUrl The url to search for
         *
         * @return {object|null} The founded route or null
         */
        getRoute: function (routeUrl) {

            // init local vars
            var self = this,
                url = routeUrl || self.location.pathname,
                route = null,
                records;

            if (!self.routes || !self.routes.records) {
                return route;
            }

            records = self.routes.records;
            if (url === '' || url === '/') {
                $.each(records, function (i, item) {
                    if (!!item.content.index) {
                        route = records[i];
                    }
                });
            } else {
                $.each(records, function (i, item) {
                    if (!!item.content.url && item.content.url === url) {
                        route = records[i];
                    }
                });
            }

            return route;
        },


        /**
         *
         */
        navigate: function (hash) {

            this.location.hash = hash;

        },


        /**
         *
         */
        init: function (routes, callback) {

            var self = this;

            // check callback function
            callback = utils.callback(callback);

            if (routes) {
                self.setRoutes(routes);
            }

            callback(self);
            return self;
        }

    };


    app.controllers.router = Router;


}(window, window.app || {}, window.jQuery));