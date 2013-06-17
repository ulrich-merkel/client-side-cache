/*jslint browser: true, devel: true */
/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:true, curly:true, browser:true, indent:4, maxerr:50 */
/*global window*/
/*global document*/
/*global console*/
/*global XMLHttpRequest*/
/*global ActiveXObject*/

/**
 * app.utils
 *
 * @description
 * - provide utility functions
 * 
 * @version: 0.1.3
 * @author: Ulrich Merkel, 2013
 * 
 * @namespace: app
 * 
 * @changelog
 * - 0.1.3 elemId paramter added
 * - 0.1.2 refactoring
 * - 0.1.1 bug fixes css onload, js onload
 * - 0.1 basic functions and structur
 *
 */
(function (document, app, undefined) {
    'use strict';

    /**
     * undefined is used here as the undefined global
     * variable in ECMAScript 3 and is mutable (i.e. it can
     * be changed by someone else). undefined isn't really
     * being passed in so we can ensure that its value is
     * truly undefined. In ES5, undefined can no longer be
     * modified.
     *
     * window and document are passed through as local
     * variables rather than as globals, because this (slightly)
     * quickens the resolution process and can be more
     * efficiently minified (especially when both are
     * regularly referenced in your plugin).
     *
     */


    /**
     * utility functions
     *
     * following the singleton design pattern
     *
     */
    var append = (function () {

        // init global vars
        var helper = app.helper,
            utils = helper.utils,
            client = helper.client,
            privateAppendedCss = [],
            privateAppendedJs = [],
            privateAppendedImg = [],
            headNode = document.getElementsByTagName('head')[0];

        return {

            /**
             * append cascading stylesheet to dom
             * 
             * @param {string} url The css url path
             * @param {string} data The css data string
             * @param {function} callback The success function
             * @param {object} node The optional dom node element information object to append the data to
             */
            appendCss: function (url, data, callback, node) {

                // check if css is already appended
                if (utils.inArray(url, privateAppendedCss) === -1) {

                    // init local vars
                    var link = null,
                        textNode;

                    // check for element id parameter
                    if (node && node.id !== undefined) {
                        link = document.getElementById(node.id);
                    }

                    // if there is data 
                    if (null !== data) {

                        // create style element and set attributes
                        if (!link) {
                            link = document.createElement('style');
                            link.setAttribute('type', 'text/css');
                        }
                        textNode = document.createTextNode(data);
                        link.appendChild(textNode);
                        callback();

                    // if there is no data but the url parameter
                    } else if (url !== null) {

                        // create link element and set attributes
                        if (!link) {
                            link = document.createElement('link');
                            link.rel = 'stylesheet';
                            link.type = 'text/css';
                        }

                        /**
                         * link doesn't support onload function
                         *
                         * only internet explorer and opera support the onload
                         * event handler
                         */
                        if (client.isMsie || client.isOpera) {
                            link.onload = callback;
                        } else {
                            callback();
                        }

                        link.href = url;

                    }

                    if (!node) {
                        headNode.appendChild(link);
                    }
                    privateAppendedCss.push(url);

                } else {
                    // css is already appended to dom
                    callback();
                }

            },


            /**
             * append javascipt to dom
             * 
             * @param {string} url The js url path
             * @param {string} data The js data string
             * @param {function} callback The success function
             * @param {object} node The optional dom node element information object to append the data to
             */
            appendJs: function (url, data, callback, node) {

                // check if script is already appended
                if (utils.inArray(url, privateAppendedJs) === -1) {

                    // dynamic script tag insertion
                    var script = null;

                    // check for element id parameter
                    if (!node) {
                        script = document.createElement('script');
                        script.type = 'text/javascript';
                    } else if (node && node.id !== undefined) {
                        script = document.getElementById(node.id);
                    }

                    if (!script) {
                        callback();
                    }

                    // if there is data 
                    if (null !== data) {

                        // set script content and append it to head dom
                        script.textContent = data;
                        if (!node) {
                            headNode.appendChild(script);
                        }
                        privateAppendedJs.push(url);
                        callback();

                    // if there is no data but the url parameter
                    } else if (url !== null) {

                        /**
                         * setup and unbind event handlers when
                         * called to avoid callback get's called twice
                         */

                        if (script.readyState) { // internet explorer
                            script.onreadystatechange = function () {
                                if (script.readyState === 'loaded' || script.readyState === 'complete') {
                                    script.onreadystatechange = null;
                                    callback();
                                }
                            };
                        } else { // other browsers
                            if (script.onload) {
                                script.onload = function () {
                                    script.onload = script.onerror = null;
                                    callback();
                                };  
                            }
                            if (script.onerror) {
                                script.onerror = function () {
                                    script.onload = script.onerror = null;
                                    callback();
                                };
                            }
                        }

                        // load script and append it to head dom
                        script.src = url;
                        if (!node) {
                            headNode.appendChild(script);
                        }
                        privateAppendedJs.push(url);

                    }

                } else {
                    // script is already appended to dom
                    callback();
                }
            },


            /**
             * append cascading stylesheet to dom
             * 
             * @param {string} url The css url path
             * @param {string} data The css data string
             * @param {function} callback The success function
             * @param {object} node The optional dom node element information object to append the data to
             */
            appendImg: function (url, data, callback, node) {

                var image = null;

                // check for element id parameter
                if (node && node.id !== undefined) {
                    image = document.getElementById(node.id);
                }

                if (!image) {
                    callback();
                    return;
                }

                image.onload = callback;

                // if there is data 
                if (null !== data) {
                    image.src = data;
                // if there is no data but the url parameter
                } else if (url !== null) {
                    image.src = url;
                }

                privateAppendedImg.push(url);

            }


        };

    }());


    /**
     * global export
     */
    app.helper.append = append;


}(document, window.app || {})); // immediatly invoke function