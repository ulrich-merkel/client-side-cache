/*global window*/
/*global document*/

/**
 * jQuery plugin tooltip
 * @description set mouseover tooltip
 * @author hello@ulrichmerkel.com (Ulrich Merkel)
 * @version 0.4.6
 * 
 * @requires
 * - jQuery 1.7.1
 * - jQuery app.client functions
 * 
 * @changelog
 * - 0.4.6 refactoring, check if tooltip position is not null
 * - 0.4.5 new config sel
 * - 0.4.4 new hideTooltip function
 * - 0.4.3 refactoring, stay in viewport added
 * - 0.4.2 changed global client to app
 * - 0.4.1 bug fixes if no attribute is available
 * - 0.4 bug fixes
 * - 0.3 removed coding overhead
 * - 0.2 bug fixes
 * - 0.1 basic functions and plugin structur
 *
 * @bugs
 * -
 * 
 **/

(function (window, document, $, app) {
    'use strict';

    $.fn.tooltip = function (arg, callback) {

        /**
         * init defaults
         */
        $.fn.tooltip.defaults = {
            sel: {
                elem: '.tooltip',
                tooltipId: '#tooltip',
                attrSelector: 'title'
            },
            fadeTime: 300,
            delay: 500,
            boxOffsetX: -60,
            boxOffsetY: 20,
            replaceString: 'Lebenswelt Schule - '
        };


        /**
         * extend options with defaults, global vars for mouseEvent Listener
         */
        var options = $.extend(true, $.fn.tooltip.defaults, arg, {callback: callback}),
            newEventX = 0,
            newEventY = 0,
            timeout;


        /**
         * check and call callback function
         *
         * @param {function} callback The function to check
         */
        function callFn(callback) {
            if ($.isFunction(callback)) {
                callback.call();
            }
        }


        /**
         * grab attribute and save it to data
         *
         * @param {object} obj The jquery object
         */
        function grabAttr(obj) {
            obj.each(function () {
                var $this = $(this),
                    attr = options.sel.attrSelector,
                    titleString =  $this.attr(attr),
                    data = null;

                // check for title attribute
                if (!titleString) {
                    titleString = $this.data(attr);
                }
                if (titleString) {
                    data = $.data(this, attr, titleString.replace(options.replaceString, ''));
                    $this.removeAttr(attr);
                }
            });
        }


        /**
         * get position to stay in viewport
         *
         * @param {object} tooltip The jquery tooltip layer
         *
         * @returns {object} Returns new left and top position
         */
        function getPosition(tooltip) {
            var $document = $(document),
                docWidth = $document.width(),
                docHeight = $document.height(),
                left = 0,
                top = 0;

            // check horizontal
            if (newEventX + tooltip.width + options.boxOffsetX > docWidth) {
                left = docWidth - tooltip.width;
            } else if (newEventX + options.boxOffsetX < 0) {
                left = 0;
            } else {
                left = newEventX + options.boxOffsetX;
            }

            // check vertical
            if (newEventY + tooltip.height + options.boxOffsetY > docHeight) {
                top = newEventY - tooltip.height - 10;
            } else if (newEventY + options.boxOffsetY < 0) {
                top = 0;
            } else {
                top = newEventY + options.boxOffsetY;
            }

            return {
                left: left,
                top: top
            };
        }


        /**
         * show tooltip function
         *
         * @param {string} content The string to display
         */
        function showTooltip(content) {
            var $tooltip,
                tooltip = {},
                sel = options.sel.tooltipId,
                position;

            $tooltip = $('<div>', {
                id: sel.substr(1),
                css: {
                    position: 'absolute',
                    width: options.boxWidth,
                    height: options.boxHeight,
                    display: 'none'
                },
                html: content
            }).appendTo('body');

            tooltip = {
                width: $tooltip.outerWidth(true),
                height: $tooltip.outerHeight(true)
            };

            // fix for older browsers when they don't init mouseposition after window load correctly
            position = getPosition(tooltip);
            if (position.left === 0 && position.right === 0) {
                return;
            }

            $tooltip.css(position).fadeIn(options.fadeTime);
        }


        /**
         * hide tooltip function
         */
        function hideTooltip() {
            $(options.sel.tooltipId).fadeOut(
                options.fadeTime,
                function () {
                    $(this).remove();
                }
            );
            window.clearTimeout(timeout);
        }


        /**
         * bind mouseenter mouseleave mousemove events
         *
         * @param {object} obj The jquery tooltip item object
         */
        function bindEventHandlers(obj) {
            var sel = options.sel,
                tooltipId = sel.tooltipId,
                attr = sel.attrSelector,
                tooltip = {},
                data;

            // item hover events
            obj.each(function () {
                $(this).bind({
                    'mouseenter.tooltip': function (evt) {
                        // check data string
                        data = $.data(this, attr);
                        if (!data) {
                            grabAttr(this);
                        }

                        // remove old tooltip if visible
                        if ($(tooltipId).css("opacity") !== 0) {
                            $(tooltipId).stop().remove();
                        }

                        // show tooltip after delay
                        newEventX = evt.pageX;
                        newEventY = evt.pageY;
                        timeout = window.setTimeout(function () { showTooltip(data); }, options.delay);
                    },
                    'mouseleave.tooltip': function () {
                        hideTooltip();
                    },
                    'mousemove.tooltip': function (evt) {
                        // set new position
                        tooltip = {
                            width: $(tooltipId).outerWidth(true),
                            height: $(tooltipId).outerHeight(true)
                        };
                        newEventX = evt.pageX;
                        newEventY = evt.pageY;
                        $(tooltipId).css(getPosition(tooltip));
                    }
                });
            });
            // hide tooltip while scrolling
            $(window).bind({
                'scrolling': function () {
                    hideTooltip();
                }
            });
        }


        /**
         * main function, init plugin
         *
         * @param {object} opts The plugin options
         * @param {object} obj The plugin selector object
         */
        function initialize(opts, obj) {
            if (!obj.length || (app.client && app.client.isMobile())) {
                return;
            }

            // check init state
            var data = obj.data('tooltip');
            if (!data) {

                // setup functions
                grabAttr(obj);
                bindEventHandlers(obj);
                obj.data('tooltip', 'initialized');

            }

            // check callback
            callFn(opts.callback);
        }


        /**
         * return this for chaining and run
         * initialize function
         */
        return this.each(function () {
            initialize(options, $(this));
        });

    };


}(window, document, window.jQuery, window.app || {}));
/*global window*/
/*global document*/

/**
 * jQuery plugin fullscreen
 * 
 * @description
 * - toggle fullscreen mode if available
 * 
 * @author hello@ulrichmerkel.com (Ulrich Merkel)
 * @version 0.1.1
 * 
 * @requires
 * - jQuery 1.8.2
 * 
 * @changelog
 * - 0.1.1 refactoring
 * - 0.1 basic functions
 *
 * @bugs
 * - 
 * 
 */

(function (document, $, app) {
    'use strict';

    $.fn.fullscreen = function (args, cb) {

        /**
         * init defaults
         */
        $.fn.fullscreen.defaults = {
            sel: {
                elem: '.btn-fullscreen'
            }
        };


        /**
         * extend options with defaults, global vars 
         */
        var opts = $.extend(true, {}, $.fn.fullscreen.defaults, args, {cb: cb}),
            docElm = document.documentElement,
            boolIsSupported = null;


        /**
         * check support
         *
         * @param {boolean} Whether fullscreen is supported or not
         */
        function isSupported() {
            if (null === boolIsSupported) {
                boolIsSupported = (!!docElm.requestFullscreen || !!docElm.mozRequestFullScreen || !!docElm.webkitRequestFullScreen) && !app.client.isChrome() && !app.client.isSeamonkey();
            }
            return boolIsSupported;
        }


        /**
         * check is fullscreen active
         *
         * @param {boolean} Whether fullscreen is active or not
         */
        function isFullscreenActive() {
            return !!document.fullScreen || !!document.mozFullScreen || !!document.webkitIsFullScreen;
        }


        /**
         * enter fullscreen mode
         */
        function enter() {
            // check vendor prefixes
            if (docElm.requestFullscreen) {
                docElm.requestFullscreen();
            } else if (docElm.mozRequestFullScreen) {
                docElm.mozRequestFullScreen();
            } else if (docElm.webkitRequestFullScreen) {
                docElm.webkitRequestFullScreen();
            }
        }


        /**
         * exit fullscreen mode
         */
        function exit() {
            // check vendor prefixes
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            }
        }


        /**
         * custom change event handler
         */
        function change() {
        }


        /**
         * bind events
         *
         * @param {object} $obj The jQuery object
         */
        function bindEventHandlers($obj) {

            // fullscreen events
            var $doc = $(document);
            $doc.bind('fullscreenchange', change);
            $doc.bind('mozfullscreenchange', change);
            $doc.bind('webkitfullscreenchange', change);

            // btn click
            $obj.bind({
                'click.fullscreen': function (e) {
                    e.preventDefault();
                    if (isFullscreenActive()) {
                        exit();
                    } else {
                        enter();
                    }
                }
            });

        }


        /**
         * main function, init plugin
         *
         * @param {object} opts The plugin options
         * @param {object} obj The plugin selector object
         */
        function initialize(opts, $obj) {
            if (!$obj.length) {
                return;
            }

            // check for support
            if (isSupported()) {

                $obj.show();

                // check init state
                var data = $obj.data('fullscreen');
                if (!data) {

                    // setup functions
                    bindEventHandlers($obj);
                    $obj.data('fullscreen', 'initialized');

                }
            } else {
                $obj.hide();
            }

            // check for callback function
            if ($.isFunction(opts.cb)) {
                opts.cb.call();
            }
        }


        /**
         * return this for chaining and run
         * initialize function, allow multiple items via each
         */
        return this.each(function () {
            initialize(opts, $(this));
        });

    };

}(document, window.jQuery, window.app || {}));
/*global window*/
/*global jQuery*/

/**
 * jQuery
 * 
 * @description
 * -
 * 
 * @author
 * @version 0.1
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

(function (window, app, $) {
    'use strict';

    var helpers = {

    }

    app.models.helpers = helpers;

}(window, window.app || {}, window.jQuery));
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

(function (app, $, undefined) {
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
    var helpers = app.helpers,                                  // helpers {object} Shortcut for helper functions
        utils = helpers.utils,                                  // utils {object} Shortcut for utils functions
        checkCallback = utils.callback,                         // checkCallback {function} Shortcut for utils.callback function
        json = utils.getJson(),                                 // json {function} Global window.Json object if available
        defaultRecord = {                                       // defaultRecord {object} The default record object
            id: null,
            content: null
        };


    /**
     * find single record
     *
     * @param {integer|string} id The id from the record to find
     * @param {object} records The records to search for the single record
     *
     * @return {object|null} Whether there is a record or not
     */
    function findRecord(id, records) {

        // init local vars
        var i,
            length = records.length;

        // toggle through records
        for (i = 0; i < length; i = i + 1) {
            if (records[i] && records[i].id === id) {
                return records[i];
            }
        }

        // nothing found
        return null;

    }


    /**
     * model constructor
     *
     * @param {array} records The optional records parameters to be created on init
     * @param {function} callback The optional callback function
     */
    function Model(records, callback) {

        this.records = [];
        this.init(records, callback);

    }


    /**
     * public instance methods
     *
     * Model.fn is just a shortcut for Model.prototype
     */
    Model.prototype = Model.fn = {

        /**
         * create resource in storage
         *
         * @param {integer|string} id The record id
         * @param {object} content The record content object
         * @param {function} callback The callback function
         */
        create: function (id, content, callback) {

            // init local vars
            var self = this,
                record = null;

            // check callback function
            callback = checkCallback(callback);

            // set new content
            if (id && content && !findRecord(id, self.records)) {

                record = {};
                record.id = id;
                record.content = {};

                $.extend(true, record.content, content);
                self.records.push(record);

            }

            // return record
            callback(record);
            return record;
        },


        /**
         * read resource from storage
         *
         * @param {integer|string} id The record id
         * @param {function} callback The callback function
         */
        read: function (id, callback) {

            var self = this,
                record = null;

            // check callback function
            callback = checkCallback(callback);

            // check for entry
            if (id) {
                record = findRecord(id, self.records);
            }

            // return record
            callback(record);
            return record;

        },


        /**
         * update resource from storage
         *
         * @param {integer|string} id The record id
         * @param {object} content The record content object
         * @param {function} callback The callback function
         */
        update: function (id, content, callback) {

            // init local vars
            var self = this,
                record = null;

            // check callback function
            callback = checkCallback(callback);

            // set new content
            if (id && content) {
                record = findRecord(id, self.records);

                if (record) {
                    $.extend(true, record.content, content);
                }
            }

            // return record
            callback(record);
            return record;
        },


        /**
         * remove resource from storage
         *
         * @param {integer|string} id The record id
         * @param {function} callback The callback function
         */
        remove: function (id, callback) {

            // init local vars
            var self = this,
                record = null,
                i,
                length = self.records.length;

            // check callback function
            callback = checkCallback(callback);

            // set new content
            if (id) {
                record = findRecord(id, self.records);

                if (record) {
                    for (i = 0; i < length; i = i + 1) {
                        if (self.records[i] && self.records[i].id === id) {
                            self.records.splice(i, 1);
                            callback(record);
                            return record;
                        }
                    }
                }

            }

            // return record
            callback(null);
            return null;

        },


        /**
         * destroy all records
         *
         * @param {function} callback The callback function
         */
        destroy: function (callback) {

            // set records empty
            this.records = [];

            // check callback function
            callback = checkCallback(callback);

            // return result
            callback(true);
            return true;

        },


        /**
         * init model and records
         *
         * @param {function} callback The callback function
         * @param {object} parameters The optional storage parameters
         */
        init: function (records, callback) {

            // init local vars
            var self = this,
                i;

            // check callback function
            callback = checkCallback(callback);

            // check for records to create
            if (records) {
                for (i = 0; i < records.length; i = i + 1) {
                    if (records[i] && records[i].id) {
                        self.create(records[i].id, records[i].content || {});
                    }
                }
            }

            // return instance
            callback(self);
            return self;

        }

    };


    /**
     * make model globally available under app namespace
     */
    app.models.model = Model;


}(window.app || {}, window.jQuery));
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
/*global window*/
/*global jQuery*/

/**
 * jQuery
 * 
 * @description
 * -
 * 
 * @author
 * @version 0.1
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

(function (window, app, $) {
    'use strict';

    var helpers = {
        
    }

    app.views.helpers = helpers;

}(window, window.app || {}, window.jQuery));
/*global window*/
/*global jQuery*/

/**
 * jQuery
 * 
 * @description
 * -
 * 
 * @author
 * @version 0.1
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

(function (window, app, $) {
    'use strict';

    var scripts = {

        index: {
            sel: '#body',
            name: 'index',
            ns: 'index',
            elems: {
                },

            events: {

            },

            init: function () {

            },

            reset: function () {
            }

        }
    };

    app.views.scripts = scripts;

}(window, window.app || {}, window.jQuery));
/*global window*/
/*global jQuery*/

/**
 * jQuery
 * 
 * @description
 * -
 * 
 * @author
 * @version 0.1
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

(function (window, app, $, undefined) {
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
     * regularly referenced in this closure).
     *
     */


    /**
     * helper functions
     *
     * following the singleton design pattern
     *
     */
    var helpers = {


        /**
         * enable recieving events for objects
         * placeholder to be extended to object.fn
         */
        events: {

            // bind events to objects
            bind: function () {
                if (!this.o) {
                    this.o = $({});
                }
                this.o.bind.apply(this.o, arguments);
            },

            // trigger events to objects
            trigger: function () {
                if (!this.o) {
                    this.o = $({});
                }
                this.o.trigger.apply(this.o, arguments);
            }

        },


        /**
         * keeps track over the different view states and
         * make shure that there is only one main view object
         * at the same time
         *
         */
        stateMachine: function () {

            // init local vars
            var StateMachine = function () {};

            // shortcut for prototype and append bind and trigger events to statemachine object
            StateMachine.fn = StateMachine.prototype;
            $.extend(StateMachine.fn, helpers.events);

            /**
             * add state to statemachine and listen for changes
             *
             * @param {object} state The state object
             */
            StateMachine.fn.add = function (state) {

                if (!state) {
                    return;
                }

                this.bind('change', function (e, current) {
                    e.preventDefault();
                    if (state === current) {
                        state.activate();
                    } else {
                        state.deactivate();
                    }
                });

                state.setActive = $.proxy(function () {
                    this.trigger('change', state);
                }, this);

            };

            // return created statemachine
            return StateMachine.fn;

        }

    };


    /**
     * make helpers globally available under app namespace
     */
    app.controllers.helpers = helpers;


}(window, window.app || {}, window.jQuery));
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
/*global window*/
/*global jQuery*/

/**
 * jQuery
 * 
 * @description
 * -
 * 
 * @author
 * @version 0.1
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

(function (window, app, $) {
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
     * regularly referenced in this closure).
     *
     */

    var states,
        stateMachine,
        controllers = app.controllers;

    /**
     * helper functions
     *
     * following the singleton design pattern
     *
     */
    states = {

        index: {
            activate: function () {
                var view = app.views.scripts.index;
                if (view && !view.initialized) {
                    controllers.controller.initView(view);
                }
                //console.log("activate index");
            },
            deactivate: function () {
                var view = app.views.scripts.index;
                if (view && !!view.initialized) {
                    controllers.controller.destroyView(view);
                }
                //console.log("deactivate index");
            }
        },

        page1: {
            activate: function () {
                var view = app.views.scripts.page1;
                if (view && !view.initialized) {
                    controllers.controller.initView(view);
                }
                //console.log("activate page1");
            },
            deactivate: function () {
                var view = app.views.scripts.page1;
                if (view && !!view.initialized) {
                    controllers.controller.destroyView(view);
                }
                //console.log("deactivate page1");
            }
        },

        page2: {
            activate: function () {
                var view = app.views.scripts.page2;
                if (view && !view.initialized) {
                    controllers.controller.initView(view);
                }
                //console.log("activate page2");
            },
            deactivate: function () {
                var view = app.views.scripts.page2;
                if (view && !!view.initialized) {
                    controllers.controller.destroyView(view);
                }
                //console.log("deactivate page2");
            }
        },

        defaults: {
            activate: function () {
                var view = app.views.scripts.defaults;
                if (view && !view.initialized) {
                    controllers.controller.initView(view);
                }
                //console.log("activate defaults");
            },
            deactivate: function () {
                var view = app.views.scripts.defaults;
                if (view && !!view.initialized) {
                    controllers.controller.destroyView(view);
                }
                //console.log("deactivate defaults");
            }
        }

    };


    // add controller states to state machine if available
    if (!!app.controllers.helpers && !!app.controllers.helpers.stateMachine) {
        stateMachine = new app.controllers.helpers.stateMachine();

        stateMachine.add(states.index);
        stateMachine.add(states.page1);
        stateMachine.add(states.page2);
        stateMachine.add(states.defaults);

    }


    /**
     * make helpers globally available under app namespace
     */
    app.controllers.states = states;


}(window, window.app || {}, window.jQuery));
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

(function (app, $) {
    'use strict';

    /**
     * undefined is used here as the undefined global
     * variable in ECMAScript 3 and is mutable (i.e. it can
     * be changed by someone else). undefined isn't really
     * being passed in so we can ensure that its value is
     * truly undefined. In ES5, undefined can no longer be
     * modified.
     * 
     * document and jquery are passed through as local
     * variables rather than as globals, because this (slightly)
     * quickens the resolution process and can be more
     * efficiently minified (especially when both are
     * regularly referenced in this module).
     */

    // init global vars
    var helpers = app.helpers,                                      // helpers {object} Shortcut for helper functions
        utils = helpers.utils,                                      // utils {object} Shortcut for utils functions
        eventSplitter = /^(\w+)\s*(.*)$/,                           // eventSplitter {regex} Placeholder regex to check for events
        controller = {};                                            // controller {object} Placeholder for controller api


    /**
     * proxy helper for calling functions to control scope
     *
     * @param {function} func The function to call
     * @return {function} The wrapped function
     */
    function $proxy(func) {
        return $.proxy(func, this);
    }


    /**
     * wrap elements to context
     *
     * @param {string} selector The dom element selector
     * @param {object} controller The current main controller
     * 
     * @return {object} The jquery wrapped dom element
     */
    function getJqueryElement(selector, controller) {
        return $(selector, controller.views[controller.activeView].el);
    }


    /**
     * set view elements
     *
     * @param {object} controller The current main controller
     */
    function setViewElements(controller) {

        // init local vars
        var activeViewName = controller.activeView,
            viewScript = controller.views.scripts[activeViewName],
            target,
            key;

        // toggle through module elements
        for (key in viewScript.elements) {
            if (viewScript.elements.hasOwnProperty(key)) {

                // set view element 
                target = viewScript.elements[key];
                viewScript.elements[target] = getJqueryElement(key, controller);

            }
        }
    }


    /**
     * delegate events to view objects
     *
     * @param {object} controller The current main controller
     */
    function delegateEvents(controller) {

        // init local vars
        var activeViewName = controller.activeView,
            viewScript = controller.views.scripts[activeViewName],
            namespace = '',
            key,
            methodName,
            method,
            match,
            eventName,
            event,
            selector;

        // check event namespace
        if (viewScript.ns) {
            namespace = '.' + viewScript.ns;
        }

        // toggle through event list
        for (key in viewScript.events) {

            if (viewScript.events.hasOwnProperty(key)) {

                // get event information
                methodName = viewScript.events[key];
                method = $proxy(viewScript[methodName]);

                match = key.match(eventSplitter);
                eventName = match[1];
                selector = match[2];
                event = eventName + namespace;

                // decission for bind or delegate
                if (selector === '') {
                    $(viewScript.sel).on(event, method);
                } else {
                    $(viewScript.sel).delegate(selector, event, method);
                }
            }

        }

    }


    /**
     * undelegate events
     *
     * @param {object} controller The current main controller
     */
    function unDelegateEvents(controller) {

        // init local vars
        var activeViewName = controller.activeView,
            viewScript = controller.views.script[activeViewName],
            namespace = '',
            key,
            methodName,
            method,
            match,
            eventName,
            event,
            selector;

        // check event namespace
        if (viewScript.ns) {
            namespace = '.' + viewScript.ns;
        }

        // toggle through event list
        for (key in viewScript.events) {

            if (viewScript.events.hasOwnProperty(key)) {

                // get event information
                methodName = viewScript.events[key];
                method     = $proxy(viewScript[methodName]);
                match      = key.match(eventSplitter);
                eventName  = match[1];
                selector = match[2];
                event = eventName + namespace;

                // decission for bind or delegate
                if (selector === '') {
                    $(viewScript.sel).off(event, method);
                } else {
                    $(viewScript.sel).undelegate(selector, event, method);
                }
            }

        }

    }



    /**
     * controllers controller
     *
     * implements the singleton design pattern
     *
     */
    controller = {

        // controller view vars
        views: null,
        activeView: null,

        // controller router vars
        router: null,
        routes: null,
        activeRoute: null,


        /**
         * init given view script
         *
         * @param {object} setup The setup parameters for the view script
         * @param {function} callback The optional callback function
         */
        initView: function (setup, callback) {

            // init local vars
            var self = this,
                name = setup.name || null,
                view;

            // check callback function
            callback = utils.callback(callback);

            // check if view script is already initialized
            if (name && !self.views.scripts[name].initialized) {

                // init view script and run init function
                self.views[name] = view = setup;
                self.activeView = name;

                if (view.elements) {
                    setViewElements(self);
                }

                if (view.events) {
                    delegateEvents(self);
                }

                if (view.init) {
                    view.init.apply();
                    view.initialized = true;
                }

                // callback result
                callback(view);

            } else if (name && self.views.scripts[name]) {

                // view already initialized
                callback(self.views.scripts[name]);

            } else {

                // there is no view script or name param
                callback();

            }

        },


        /**
         * destroy given view script
         *
         * @param {object} setup The setup parameters for the view script
         * @param {function} callback The optional callback function
         */
        destroyView: function (setup, callback) {

            // init local vars
            var self = this,
                name = setup.name || null,
                view;

            // check callback function
            callback = utils.callback(callback);

            // check if view script is initialized
            if (name && !!self.views.scripts[name].initialized) {

                // destroy view scrip
                view = self.views[name];
                self.activeView = name;

                if (view.elements) {
                    setViewElements(self);
                }

                if (view.events) {
                    unDelegateEvents(self);
                }

                self.activeView = null;
                delete view.initialized;

                // callback result
                callback(view);

            } else if (name && !self.views.scripts[name].initialized) {

                // view not initialized
                callback(self.views.scripts[name]);

            } else {

                // there is no view script or name param
                callback();

            }
        },


        /**
         * destroy given view script
         *
         * @param {object} setup The setup parameters for the view script
         * @param {function} callback The optional callback function
         *
         * @return {object|null} The view object if found
         */
        getView: function (name, callback) {

            // init local vars
            var self = this,
                view = self.views.scripts[name] || null;

            // check callback function
            callback = utils.callback(callback);

            // return result
            callback(view);
            return view;

        },


        /**
         * destroy given view script
         *
         * @param {function} callback The optional callback function
         * @param {object} parameters The setup parameters for the controller
         */
        init: function (callback, parameters) {

            // init local vars
            var self = this,
                states = app.controllers.states || null,
                routes = [],
                router = null,

                /**
                 * check for controller state
                 *
                 * @param {string} routeState The controller state route name
                 */
                checkStateCallback = function (routeState) {

                    // check for controller states
                    if (states) {

                        /**
                         * check for initialized state in statemachine to set given route state
                         * active or set default state active if available
                         */
                        if (routeState && states[routeState] && !!states[routeState].setActive) {
                            states[routeState].setActive();
                        } else if (states.defaults && !!states.defaults.setActive) {
                            states.defaults.setActive();
                        }

                        callback(self);

                    } else {
                        callback(self);
                    }

                },


                /**
                 * check for router
                 *
                 * @param {object} router The controller router object
                 */
                checkRouterCallback = function (router) {

                    var routeState = false;

                    if (router) {
                        self.activeRoute = router.getRoute();

                        if (self.activeRoute) {
                            routeState = self.activeRoute.content.state || 'defaults';
                        }

                        checkStateCallback(routeState);
                    } else {
                        checkStateCallback();
                    }

                };

            // check callback function
            callback = utils.callback(callback);

            // init view objects
            if (!!app.views) {
                self.views = app.views;
            }

            // check for router
            if (null === self.router && !!app.controllers.router) {

                // get routes config
                if (app.models.routes) {
                    routes = app.models.routes;
                }

                // init router
                router = new app.controllers.router(routes, function (result) {
                    self.router = result;
                    checkRouterCallback(result);
                });

            } else {
                checkRouterCallback();
            }

        }

    };


    /**
     * make controllers controller globally available under app namespace
     */
    app.controllers.controller = controller;


}(window.app || {}, window.jQuery));
(function ($, window, document, app) {
	'use strict';

	// local vars
	var $window = $(window),
		$html = $('html'),
		helpers = app.helpers,
		client = helpers.client,
		bind = helpers.utils.bind;



	$(document).ready(function () {

		// client depending init
        $html.removeClass('no-js').addClass('js');
		if (client.isMobile()) {
			$html.addClass('mobile');
			client.hideStatusbar(1000);
			bind(document, 'DOMContentLoaded', hideStatusbar);
			bind(window, 'orientationchange', hideStatusbar);
		} else {
			$html.addClass('desktop');
		}

		// mobile fast clicks
		new FastClick(document.body);

		//app.controllers.controller.init(function () {
            //alert("page controller loaded");
        //});

		//alert("document ready");
	});

}(window.jQuery, window, document, window.app));














