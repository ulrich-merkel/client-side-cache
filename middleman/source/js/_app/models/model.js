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