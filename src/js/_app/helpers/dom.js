/*jslint browser: true, devel: true, continue: true, regexp: true, nomen: true  */
/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:true, curly:true, browser:true, indent:4, maxerr:50 */
/*global window, document*/

/**
 * ns.helpers.dom
 *
 * @description
 * - provide utility functions for dom elements
 *
 * @author Ulrich Merkel, 2014
 * @version 0.1.7
 * 
 * @namespace ns
 * 
 * @changelog
 * - 0.1.7 removed unused functions for client-side-cache optimization, complete dom helper moved to separate git
 * - 0.1.6 hasClass improved
 * - 0.1.5 setAttribute added, improved namespacing
 * - 0.1.4 refactoring xhr function
 * - 0.1.3 createDomNode added
 * - 0.1.2 refactoring
 * - 0.1.1 bug fix xhr when trying to read binary data on ie
 * - 0.1 basic functions and structure
 *
 * @see
 * -
 * 
 * @requires
 * - ns.helpers.utils
 * - ns.helpers.client
 * 
 * @bugs:
 * - append dynamic updated data when resource is already appended
 * - set media all for css, adjust createDomNode function for arguments
 *
 */
(function (document, ns, undefined) {

    'use strict';

    /**
     * undefined is used here as the undefined global
     * variable in ECMAScript 3 and is mutable (i.e. it can
     * be changed by someone else). undefined isn't really
     * being passed in so we can ensure that its value is
     * truly undefined. In ES5, undefined can no longer be
     * modified.
     *
     * document and ns are passed through as local
     * variables rather than as globals, because this (slightly)
     * quickens the resolution process and can be more
     * efficiently minified (especially when both are
     * regularly referenced in your module).
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
    var dom = (function () {

        // init global vars
        var helpers = ns.helpers,                                   // @type {object} Shortcut for helper functions
            utils = helpers.utils,                                  // @type {object} Shortcut for utils functions
            client = helpers.client,                                // @type {object} Shortcut for client functions
            privateAppendedCss = [],                                // @type {array} Storage for appended css files
            privateAppendedJs = [],                                 // @type {array} Storage for appended js files
            privateAppendedImg = [],                                // @type {array} Storage for appended img files
            privateAppendedHtml = [],                               // @type {array} Storage for appended html files
            headNode = document.getElementsByTagName('head')[0],    // @type {object} The html dom head object
            classLoaded = 'lazyloaded';                             // @type {string} The css class for appended elements

        /**
         * public functions
         *
         * @interface
         */
        return {

            /**
             * reset some private vars
             * mainly used for testing purposes
             *
             */
            nuke: function () {
                privateAppendedCss = [];
                privateAppendedJs = [];
                privateAppendedImg = [];
                privateAppendedHtml = [];
            },


            /**
             * create dom node element
             *
             * @param {string} name The node element name type
             * @param {object} attributes Name/value mapping of the element attributes
             *
             * @return {object} The created html object
             */
            createDomNode: function (name, attributes) {

                // init local vars and create node
                var node = document.createElement(name),
                    attribute;

                // check for attributes to set
                if (attributes) {
                    for (attribute in attributes) {

                        if (attributes.hasOwnProperty(attribute)) {
                            node.setAttribute(attribute, attributes[attribute]);
                        }

                    }
                }

                // return created node
                return node;
            },


            /**
             * get attribute from element
             * 
             * @param {object} elem The html object
             * @param {string} attribute The attribute name
             *
             * @returns {string}
             */
            getAttribute: function (elem, attribute) {
                return elem.getAttribute(attribute);
            },


            /**
             * set attribute from element
             * 
             * @param {object} elem The html object
             * @param {string} attribute The attribute name
             * @param {string} value The attribute value
             *
             */
            setAttribute: function (elem, attribute, value) {
                elem.setAttribute(attribute, value);
            },


            /**
             * append cascading stylesheet to dom
             *
             * @see http://pieisgood.org/test/script-link-events/
             *
             * @param {string} url The css url path
             * @param {string} data The css data string
             * @param {function} callback The success function
             * @param {object} node The optional dom node element information object to append the data to
             * @param {boolean} update Indicates if the resource data needs to be updated (if already appended)
             */
            appendCss: function (url, data, callback, node, update) {

                // check if css is already appended
                if (utils.inArray(url, privateAppendedCss) === -1 || !!update) {

                    // init local vars
                    var link = null,
                        handled = false,
                        textNode,
                        timer;

                    // check for node parameter
                    link = checkNodeParameters(link, node);

                    // if there is data 
                    if (null !== data) {

                        // create style element and set attributes
                        if (!link) {
                            link = dom.createDomNode('style', {'type': 'text/css'});
                            link.className = classLoaded;
                        }

                        // handle errors
                        link.onerror = function () {
                            callback(false);
                        };

                        /**
                         * hack: ie lt9 doesn't allow the appendChild() method on a
                         * link element, so we have to check this with try catch here
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

                            callback(true);
                        }

                    // if there is no data but the url parameter
                    } else if (url !== null) {

                        // create link element and set attributes
                        if (!link) {
                            link = dom.createDomNode('link', {'rel': 'stylesheet', 'type': 'text/css'});
                            link.className = classLoaded;
                        }

                        // handle errors
                        link.onerror = link.error = function () {

                            // avoid memory leaks
                            link.onload = link.load = null;

                            handled = true;
                            window.clearTimeout(timer);

                            callback(false);

                        };

                        // check if link needs to be appended to dom
                        if (!node) {
                            headNode.appendChild(link);
                        }

                        /**
                         * link element doesn't support onload function
                         *
                         * only internet explorer and opera support the onload
                         * event handler for link elements
                         */

                        if (client.isMsie() || client.isOpera()) {
                            link.onload = link.load = function () {

                                // avoid memory leaks
                                link.onerror = link.error = null;

                                handled = true;
                                window.clearTimeout(timer);

                                callback(true);

                            };
                        } else {
                            callback(true);
                        }

                        // start loading
                        link.href = url;

                        /**
                         * set timeout for checking errors
                         *
                         * hack: this is important because not all browsers (e.g. opera)
                         * support the onerror/error event for link elements, could appear
                         * if data couldn't be loaded due to wrong url parameter
                         */
                        timer = window.setTimeout(function () {
                            if (!handled) {
                                callback(false);
                            }
                        }, 4000);
                    }

                    privateAppendedCss.push(url);

                } else {
                    // css is already appended to dom
                    callback(true);
                }

            },


            /**
             * append javascript to dom
             *
             * @see http://pieisgood.org/test/script-link-events/
             *
             * @param {string} url The js url path
             * @param {string} data The js data string
             * @param {function} callback The success function
             * @param {object} node The optional dom node element information object to append the data to
             * @param {boolean} update Indicates if the resource data needs to be updated (if already appended)
             */
            appendJs: function (url, data, callback, node, update) {

                // check if script is already appended
                if (utils.inArray(url, privateAppendedJs) === -1 || !!update) {

                    // init dom and local vars
                    var script = dom.createDomNode('script'),
                        firstScript = document.getElementsByTagName('script')[0],
                        handled = false,
                        loaded = false,
                        timer;

                    // check for dom node parameter
                    script = checkNodeParameters(script, node);

                    /**
                     * check for valid script element
                     * 
                     * can occur when node with non-existing
                     * id is passed
                     */
                    if (!script) {
                        callback(false);
                        return;
                    }

                    // set sript attributes
                    script.type = 'text/javascript';
                    script.className = classLoaded;

                    /**
                     * scripts that are dynamically created and added to the document are async by default,
                     * they don’t block rendering and execute as soon as they download.
                     * 
                     * we set this value here just to be sure it's async, but it's normally not neccesary
                     */
                    script.async = true;

                    // add script event listeners when loaded
                    script.onreadystatechange = script.onload = function () {
                        if (!loaded && (!this.readyState || this.readyState === 'complete' || this.readyState === 'loaded')) {

                            // avoid memory leaks in ie
                            this.onreadystatechange = this.onload = null;
                            loaded = true;
                            handled = true;
                            window.clearTimeout(timer);
                            privateAppendedJs.push(url);

                            callback(true);
                        }
                    };

                    // try to handle script errors
                    script.onerror = function () {

                        // avoid memory leaks in ie
                        this.onload = this.onreadystatechange = this.onerror = null;
                        window.clearTimeout(timer);
                        handled = true;
                        callback(false);

                    };

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
                        handled = true;

                    } else if (null !== url) {
                        script.src = url;
                    }

                    // check state if file is already loaded
                    if (loaded) {
                        privateAppendedJs.push(url);
                        handled = true;
                        callback(true);
                    }

                    /**
                     * set timeout for checking errors
                     *
                     * hack: this is important because not all browsers (e.g. opera)
                     * support the onerror/error event for link elements, could appear if
                     * data couldn't be loaded due to  wrong url parameter
                     */
                    if (!handled) {
                        timer = window.setTimeout(function () {
                            if (!loaded) {
                                callback(false);
                            }
                        }, 5000);
                    }

                } else {

                    // script is already appended to dom
                    callback(true);

                }
            },


            /**
             * append image files to dom
             * 
             * @param {string} url The image url path
             * @param {string} data The image data string (base64 encoded)
             * @param {function} callback The success function
             * @param {object} node The optional dom node element information object to append the data to
             */
            appendImg: function (url, data, callback, node) {

                // init local vars
                var image = null;

                // check for node parameter
                image = checkNodeParameters(image, node);

                // create empty image placeholder if there is no node param
                if (!image) {
                    image = new Image();
                }

                // catch errors
                image.onerror = function () {

                    // avoid memory leaks
                    image.onload = image.onerror = null;
                    callback(false);

                };

                // add loaded event listener
                image.onload = function () {

                    // avoid memory leaks
                    image.onload = image.onerror = null;
                    callback(true);

                };

                // set image source
                if (data) {
                    // if there is data 
                    image.src = data;
                } else if (url) {
                    // if there is no data but the url parameter
                    image.src = url;
                }

                /**
                 * check if image is cached, trigger load manually
                 *
                 * @see http://github.com/desandro/imagesloaded
                 */
                if (!!image.complete && image.naturalWidth !== undefined) {
                    image.onload();
                }

                privateAppendedImg.push(url);

            },


            /**
             * append html files to dom
             * 
             * @param {string} url The html url path
             * @param {string} data The html data string
             * @param {function} callback The success function
             * @param {object} node The optional dom node element information object to append the data to
             */
            appendHtml: function (url, data, callback, node) {

                // check for node parameter
                var html = checkNodeParameters(null, node);

                // no dom node to append found
                if (!html) {
                    callback(false);
                    return;
                }

                // if there is data 
                if (data) {

                    /**
                     * innerHTML is not possible for table elements (table, thead, tbody, tfoot and tr) in internet explorer
                     *
                     * in IE8, html.innerHTML will do nothing or throw errors if the HTML coming in isn't perfectly formatted (against the DTD
                     * being used) - it doesn't tolerate any mistakes unlike when it's parsing HTML normally.
                     *
                     * @see
                     * - http://blog.rakeshpai.me/2007/02/ies-unknown-runtime-error-when-using.html
                     * - http://msdn.microsoft.com/en-us/library/ms533897%28VS.85%29.aspx
                     * - http://domscripting.com/blog/display.php/99
                     */
                    try {
                        html.innerHTML = data;
                        if (node.id && client.isMsie()) {

                            // force ie 8 to render (or update) the html content
                            document.styleSheets[0].addRule('#' + node.id + ':after', 'content: " ";');

                        }
                    } catch (e) {
                        html.innerText = data;
                    }

                }

                callback(true);
                privateAppendedHtml.push(url);

            }

        };

    }());


    /**
     * global export
     *
     * @export
     */
    ns.ns('helpers.dom', dom);


}(document, window.getNs())); // immediatly invoke function
