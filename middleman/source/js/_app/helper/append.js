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
 * @version: 0.1.6
 * @author: Ulrich Merkel, 2013
 * 
 * @namespace: app
 * 
 * @changelog
 * - 0.1.6 new createDomNode function
 * - 0.1.5 bug fixes for appending images, when there is no data
 * - 0.1.4 bug fixes script loading ie < 8, 
 * - 0.1.3 elemId paramter added
 * - 0.1.2 refactoring
 * - 0.1.1 bug fixes css onload, js onload
 * - 0.1 basic functions and structur
 *
 * @see
 * - http://www.jspatterns.com/the-ridiculous-case-of-adding-a-script-element/
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
     * create dom node element
     *
     * @param {string} name The node element name type
     * @param {object} attributes Name/value mapping of the element attributes
     *
     * @return {object} The created html object
     */
    function createDomNode(name, attributes) {

        var node = document.createElement(name),
            attribute;

        if (attributes) {
            for (attribute in attributes) {

                if (attributes.hasOwnProperty(attribute)) {
                    node.setAttribute(attribute, attributes[attribute]);
                }

            }
        }

        return node;

    }


    /**
     * check node parameters
     *
     * @param {object|null} element The node element
     * @param {object} node Object to test for parameters
     *
     * @return {object} The converted element
     */
    function checkNodeParameters(element, node) {

        if (node) {
            if (node.dom) {
                element = node.dom;
            } else if (node.id) {
                element = document.getElementById(node.id);
            }
        }

        return element;
    }


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

                    // check for node parameter
                    link = checkNodeParameters(link, node);

                    // if there is data 
                    if (null !== data) {

                        // create style element and set attributes
                        if (!link) {
                            link = createDomNode('style', {'type': 'text/css'});
                        }

                        /**
                         * ie lt9 doesn't allow the appendChild() method on a
                         * link element, so we have to check this here
                         */
                        if (!link.styleSheet) {
                            textNode = document.createTextNode(data);
                            link.appendChild(textNode);
                        } else {
                            link.styleSheet.cssText = data;
                        }
                        callback();

                    // if there is no data but the url parameter
                    } else if (url !== null) {

                        // create link element and set attributes
                        if (!link) {
                            link = createDomNode('link', {'rel': 'stylesheet', 'type': 'text/css'});
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

                    // init dom and local vars
                    var script = createDomNode('script'),
                        firstScript = document.getElementsByTagName('script')[0],
                        loaded = false;

                    // check for node parameter
                    script = checkNodeParameters(script, node);

                    // set sript attributes
                    script.type = 'text/javascript';
                    script.async = true;

                    // add script event listeners
                    script.onreadystatechange = script.onload = function () {
                        if (!loaded && (!this.readyState || this.readyState === 'complete' || this.readyState === 'loaded')) {

                            this.onreadystatechange = script.onload = null;
                            loaded = true;

                            callback();
                        }
                    };

                    // try to handle script errors
                    if (script.onerror) {
                        script.onerror = function () {
                            this.onload = this.onreadystatechange = this.onerror = null;
                            callback();
                        };
                    }

                    // if there is data 
                    if (!!data && !loaded) {

                        /**
                         * try to add data string to script element
                         *
                         * due to different browser capabilities we have to test
                         * for sundry dom methods (e.g. old ie's need script.text)
                         */
                        if (script.textContent) {
                            script.textContent = data;
                        } else if (script.nodeValue) {
                            script.nodeValue = data;
                        } else {
                            script.text = data;
                        }

                        // mark script as loaded
                        loaded = true;

                    } else if (null !== url) {
                        script.src = data;
                    }

                    // append script to according dom node
                    if (firstScript) {
                        firstScript.parentNode.insertBefore(script, firstScript);
                    } else {
                        headNode.appendChild(script);
                    }

                    // check loaded state if file is ready on load
                    if (loaded) {
                        callback();
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

                // init local vars
                var image = null;

                // check for node parameter
                image = checkNodeParameters(image, node);

                if (!image) {
                    callback();
                    return;
                }

                // add loaded event listener
                image.onload = callback;

                if (data) {
                    // if there is data 
                    image.src = data;
                } else if (url) {
                    // if there is no data but the url parameter
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