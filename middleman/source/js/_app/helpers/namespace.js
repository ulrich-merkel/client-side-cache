/*global window*/

/**
 * app.helpers.namespace
 *
 * @description
 * - init global app namespaces
 * 
 * @version: 0.1
 * @author: Ulrich Merkel, 2013
 * 
 * @namespace: app
 * 
 * @changelog
 * - 0.1 basic functions and structur
 *
 */

var app = window.app || {};

app.helpers = {};
app.cache = {};
app.cache.storage = {};
app.cache.storage.adapter = {};
app.controllers = {};
app.models = {};
app.views = {};


