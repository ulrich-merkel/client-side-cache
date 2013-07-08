/*jslint unparam: false, browser: true, devel: true, ass: true, plusplus: true, regexp: true */
/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:false, curly:true, browser:true, indent:4, maxerr:50, devel:true, wsh:false */

/*global undefined */


/**
 * app.cache.storage.adapter.webStoragePolyfill
 *
 * @description
 * - polyfill for web storage to support non-standard browsers
 * 
 * @version 0.1.1
 * @author Ulrich Merkel, 2013
 * 
 * @namespace app
 *
 * @changelog
 * - 0.1.2 bug fixes for ie if disc space is full
 * - 0.1 basic functions and structur
 *
 * @see
 * - http://www.w3.org/TR/webstorage/
 *
 *
 * @bugs
 * -
 * 
 */
(function (window, app, undefined) {
    'use strict';

    /**
     * undefined is used here as the undefined global
     * variable in ECMAScript 3 and is mutable (i.e. it can
     * be changed by someone else). undefined isn't really
     * being passed in so we can ensure that its value is
     * truly undefined. In ES5, undefined can no longer be
     * modified.
     * 
     * window and app are passed through as local
     * variables rather than as globals, because this (slightly)
     * quickens the resolution process and can be more
     * efficiently minified (especially when both are
     * regularly referenced in this module).
     */

    // create the global vars once
    var storageType = 'webStoragePolyfill',                     // @type {string} The storage type string
        utils = app.helpers.utils,                              // @type {object} Shortcut for utils functions
        log = utils.log,                                        // @type {function} Shortcut for utils.log function
        div,                                                    // @type {object} Placeholder for polyfill
        attrKey,                                                // @type {string} Placeholder for polyfill
        localStorage,                                           // @type {object} Placeholder for polyfill
        cleanKey,                                               // @type {function} Placeholder for polyfill
        attr;                                                   // @type {object} Placeholder for polyfill


    /**
     * polyfill for localstorage
     * 
     * check to see if we have non-standard support for localStorage and
     * implement that behaviour.
     *
     * try catch here if ie tries to access database and the disc 
     * space is full (tested with ie10).
     *
     * @see
     * - https://github.com/wojodesign/local-storage-js/blob/master/storage.js
     */
    try {

        if (!window.localStorage) {

            /**
             * globalStorage, non-standard: Firefox 2+
             * 
             * @see
             * - https://developer.mozilla.org/en/dom/storage#globalStorage
             */
            if (!!window.globalStorage) {

                // try/catch for file protocol in Firefox
                try {
                    window.localStorage = window.globalStorage;
                } catch (e) {
                    log('[' + storageType + ' Adapter] Try to init globalStorage failed');
                }

            }


            /**
             * ie userData, non-standard: IE 5+
             *
             * @see
             * - http://msdn.microsoft.com/en-us/library/ms531424(v=vs.85).aspx
             */
            if (!window.localStorage) {

                // create dom element to store the data
                div = document.createElement('div');
                attrKey = 'localStorage';

                div.style.display = 'none';
                document.getElementsByTagName('head')[0].appendChild(div);

                if (div.addBehavior) {
                    div.addBehavior('#default#userdata');
                    //div.style.behavior = "url('#default#userData')";

                    /**
                     * convert invalid characters to dashes
                     * simplified to assume the starting character is valid.
                     *
                     * @see http://www.w3.org/TR/REC-xml/#NT-Name
                     */
                    cleanKey = function (key) {
                        return key.replace(/[^\-._0-9A-Za-z\xb7\xc0-\xd6\xd8-\xf6\xf8-\u037d\u37f-\u1fff\u200c-\u200d\u203f\u2040\u2070-\u218f]/g, '-');
                    };


                    // set polfyfill api
                    localStorage = window[attrKey] = {

                        length: 0,

                        setItem: function (key, value) {
                            div.load(attrKey);
                            key = cleanKey(key);

                            if (!div.getAttribute(key)) {
                                this.length = this.length + 1;
                            }
                            div.setAttribute(key, value);

                            div.save(attrKey);
                        },

                        getItem: function (key) {
                            div.load(attrKey);
                            key = cleanKey(key);
                            return div.getAttribute(key);

                        },

                        removeItem: function (key) {
                            div.load(attrKey);
                            key = cleanKey(key);
                            div.removeAttribute(key);

                            div.save(attrKey);
                            this.length = this.length - 1;
                            if (this.length < 0) {
                                this.length = 0;
                            }
                        },

                        clear: function () {
                            div.load(attrKey);
                            var i = 0;
                            while (attr = div.XMLDocument.documentElement.attributes[i++]) {
                                div.removeAttribute(attr.name);
                            }
                            div.save(attrKey);
                            this.length = 0;
                        },

                        key: function (key) {
                            div.load(attrKey);
                            return div.XMLDocument.documentElement.attributes[key];
                        }

                    };


                    div.load(attrKey);
                    localStorage.length = div.XMLDocument.documentElement.attributes.length;

                }
            }
        }
    } catch (e) {

        log(e);

    }


}(window, window.app || {})); // immediatly invoke function