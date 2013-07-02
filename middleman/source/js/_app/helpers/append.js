/*jslint browser: true, devel: true */
/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:true, curly:true, browser:true, indent:4, maxerr:50 */
/*global window*/
/*global document*/
/*global console*/
/*global XMLHttpRequest*/
/*global ActiveXObject*/

/**
 * app.helpers.append
 *
 * @description
 * - provide interface to append css, js and images to dom
 *
 * @author Ulrich Merkel, 2013
 * @version 0.1.6
 * 
 * @namespace app
 * 
 * @changelog
 * - 0.1.6 new checkNodeParameters function
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
        var helpers = app.helpers,                                  // helpers {object} Shortcut for helper functions
            utils = helpers.utils,                                  // utils {object} Shortcut for utils functions
            createDomNode = utils.createDomNode,                    // createDomNode {function} Shortcut for createDomNode function
            client = helpers.client,                                // client {object} Shortcut for client functions
            privateAppendedCss = [],                                // privateAppendedCss {array} Storage for appended css files
            privateAppendedJs = [],                                 // privateAppendedJs {array} Storage for appended js files
            privateAppendedImg = [],                                // privateAppendedImg {array} Storage for appended img files
            privateAppendedHtml = [],                               // privateAppendedHtml {array} Storage for appended html files
            headNode = document.getElementsByTagName('head')[0];    // headNode {object} The html dom head object


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
                         *
                         * these ie's also need that the link element is appended
                         * before the css data could be set/parsed in browser
                         */
                        if (!node) {
                            headNode.appendChild(link);
                        }

                        try {
                            textNode = document.createTextNode(data);
                            link.appendChild(textNode);
                        } catch (e) {
                            link.styleSheet.cssText = data;
                        } finally {
                            callback();
                        }

                    // if there is no data but the url parameter
                    } else if (url !== null) {

                        // create link element and set attributes
                        if (!link) {
                            link = createDomNode('link', {'rel': 'stylesheet', 'type': 'text/css'});
                        }

                        if (!node) {
                            headNode.appendChild(link);
                        }

                        /**
                         * link element doesn't support onload function
                         *
                         * only internet explorer and opera support the onload
                         * event handler for link elements
                         */

                        if (client.isMsie || client.isOpera) {
                            link.onload = callback;
                        } else {
                            callback();
                        }

                        link.href = url;

                    }

                    privateAppendedCss.push(url);

                } else {
                    // css is already appended to dom
                    callback();
                }

            },


            /**
             * append javascript to dom
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

                    // check for dom node parameter
                    script = checkNodeParameters(script, node);

                    // set sript attributes
                    script.type = 'text/javascript';
                    script.async = true;

                    // add script event listeners when loaded
                    script.onreadystatechange = script.onload = function () {
                        if (!loaded && (!this.readyState || this.readyState === 'complete' || this.readyState === 'loaded')) {

                            // avoid memory leaks in ie
                            this.onreadystatechange = this.onload = null;
                            loaded = true;
                            privateAppendedJs.push(url);

                            callback();
                        }
                    };

                    // try to handle script errors
                    if (script.onerror) { // ????? really needed condition?
                        script.onerror = function () {

                            // avoid memory leaks in ie
                            this.onload = this.onreadystatechange = this.onerror = null;
                            callback();

                        };
                    }

                    // append script to according dom node
                    if (!node) {
                        if (firstScript) {
                            firstScript.parentNode.insertBefore(script, firstScript);
                        } else {
                            headNode.appendChild(script);
                        }   
                    }

                    // if there is data 
                    if (!!data && !loaded) {

                        /**
                         * try to add data string to script element
                         *
                         * due to different browser capabilities we have to test
                         * for sundry dom methods (e.g. old ie's (lt 8) need script.text)
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
                        script.src = url;
                    }

                    // check loaded state if file is already loaded
                    if (loaded) {
                        privateAppendedJs.push(url);
                        callback();
                    }

                } else {

                    // script is already appended to dom
                    callback();

                }
            },


            /**
             * append image files to dom
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

                // create empty image object if there is no node param
                if (!image) {
                    image = new Image();
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

            },


            /**
             * append image files to dom
             * 
             * @param {string} url The css url path
             * @param {string} data The css data string
             * @param {function} callback The success function
             * @param {object} node The optional dom node element information object to append the data to
             */
            appendHtml: function (url, data, callback, node) {

                // init local vars
                var html = null,
                    textNode;

                // check for node parameter
                html = checkNodeParameters(html, node);

                if (!html) {
                    callback();
                    return;
                }

                // if there is data 
                if (data) {
                    /**
                     * innerHTML is not possible for table elements (table, thead, tbody, tfoot and tr) in internet explorer
                     *
                     * in IE8, html.innerHTML will do nothing if the HTML coming in isn't perfectly formatted (against the DTD
                     * being used) - it doesn't tolerate any mistakes unlike when it's parsing normally.
                     *
                     * @see
                     * - http://blog.rakeshpai.me/2007/02/ies-unknown-runtime-error-when-using.html
                     * - http://msdn.microsoft.com/en-us/library/ms533897%28VS.85%29.aspx
                     * - http://domscripting.com/blog/display.php/99
                     */
                    try {
                        html.innerHTML = data;
                        if (node.id) {
                            // force ie 8 to render (or update) the html content
                            document.styleSheets[0].addRule("#" + node.id + ":after", "content: ' ';");
                        }   
                    } catch (e) {
                        html.innerText = data;
                    }

                }

                callback();
                privateAppendedHtml.push(url);

            }


        };

    }());


    /**
     * global export
     */
    app.helpers.append = append;


}(document, window.app || {})); // immediatly invoke function