/*global module, require*/

/**
 * node js export
 * 
 */
module.exports = function (grunt) {

    'use strict';

    // init local vars
    var javascriptSrc,
        app,
        lib,
        cache;


    /**
     * load all tasks automatically using the matchdep dependency
     * all dependencies are declared in the package.json
     */
    require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);


    /**
     * read javascript source files
     */
    function getSourceFiles(src, middlemanSrc) {

        var sourceFile = grunt.file.read(src, {
                encoding: "utf-8"
            }),
            requires = sourceFile.split(/= require/i).filter(function (str) {
                return str.match(/"/);
            }).map(function (str) {

                var filepath = middlemanSrc + str.split("\"")[1] + (str.indexOf('.js') === -1 ? '.js' : ''),
                    exists = grunt.file.exists(filepath);

                grunt.log.writeln("parsed file: \"" + filepath + "\"");
                if (!exists) {
                    grunt.fail.warn("\"" + filepath + "\" doesn't exists!");
                }
                return filepath;
            });

        grunt.log.ok();

        return requires;
    }

    // javascript concat vars
    javascriptSrc = "src/js/";
    cache = getSourceFiles('src/js/cache.src.js', javascriptSrc);
    app = getSourceFiles('src/js/app.src.js', javascriptSrc);
    lib = getSourceFiles('src/js/lib.src.js', javascriptSrc);


    // Project configuration.
    grunt.initConfig({

        // load package.json
        pkg: grunt.file.readJSON('package.json'),

        // copy source files to build
        copy: {
            html: {
                files: [
                    { expand: true, flatten: true, src: ["src/index.html"], dest: "build/" },
                    { expand: true, flatten: true, src: ["src/js-templates.html"], dest: "build/" }
                ]
            },
            css: {
                files: [
                    { expand: true, flatten: true, src: ["src/css/base.css"], dest: "build/css/" },
                    { expand: true, flatten: true, src: ["src/css/app.css"], dest: "build/css/" }
                ]
            },
            js: {
                files: [
                    { expand: true, flatten: true, src: ["src/js/cache.js"], dest: "build/js/" },
                    { expand: true, flatten: true, src: ["src/js/lib.js"], dest: "build/js/" },
                    { expand: true, flatten: true, src: ["src/js/app.js"], dest: "build/js/" }
                ]
            },
            assets: {
                files: [
                    { expand: true, cwd: 'src/',  src: ["assets/**/*"], dest: "build/" }
                ]
            },
            serverFiles: {
                files: [
                    { expand: true, flatten: true, src: ["src/.htaccess"], dest: "build/" },
                    { expand: true, flatten: true, src: ["src/cache.manifest"], dest: "build/" }
                ]
            }
        },

        // optimize images
        imageoptim: {
            build: {
                options: {
                    jpegMini: false,
                    imageAlpha: true,
                    quitAfter: true
                },
                src: ['build/assets/img/', 'build/assets/img/']
            }
        },

        // hint html files
        htmlhint: {
            build: {
                options: {
                    'tag-pair': true,
                    'tagname-lowercase': true,
                    'attr-lowercase': true,
                    'attr-value-double-quotes': true,
                    'doctype-first': true,
                    'spec-char-escape': true,
                    'id-unique': true,
                    'head-script-disabled': false
                },
                src: ['build/**/*index.html']
            },
            src: {
                options: {
                    'tag-pair': true,
                    'tagname-lowercase': true,
                    'attr-lowercase': true,
                    'attr-value-double-quotes': true,
                    'doctype-first': true,
                    'spec-char-escape': true,
                    'id-unique': true,
                    'head-script-disabled': false
                },
                src: ['src/**/*index.html']
            }
        },

        // uglify js files
        uglify: {
            //jsCache: {
            //    files: {
            //        'build/js/lib.js': ['build/js/cache.js']
            //    }
            //},
            jsLib: {
                files: {
                    'build/js/lib.js': ['build/js/lib.js']
                }
            },
            jsApp: {
                files: {
                    'build/js/app.js': ['build/js/app.js']
                }
            }
        },

        // combine javascript source files
        concat: {
            cache: {
                src: cache,
                dest: 'src/js/cache.js'
            },
            app: {
                src: app,
                dest: 'src/js/app.js'
            },
            lib: {
                src: lib,
                dest: 'src/js/lib.js'
            }
        },

        // combine css rules together, ensuring that the generated css has minimal repetition
        cssc: {
            build: {
                options: {
                    consolidateViaDeclarations: true,
                    consolidateViaSelectors:    true,
                    consolidateMediaQueries:    true
                },
                files: {
                    'build/css/base.css': 'build/css/base.css',
                    'build/css/app.css': 'build/css/app.css'
                }
            }
        },

        // minify builded css files
        cssmin: {
            base: {
                src: 'build/css/base.css',
                dest: 'build/css/base.css'
            },
            app: {
                src: 'build/css/app.css',
                dest: 'build/css/app.css'
            }
        },

        // compile sass files to css
        compass: {
            src: {
                options: {
                    sassDir: 'src/sass/',
                    cssDir: 'src/css/'
                }
            }
        },

        // watch file changes to run tasks
        watch: {
            html: {
                files: ['src/**/*/index.html'],
                tasks: ['htmlhint:src']
            },
            jsApp: {
                files: ['src/js/_app/**/*.js'],
                tasks: ['concat:app', 'concat:cache']
            },
            jsLib: {
                files: ['src/js/_lib/**/*.js'],
                tasks: ['concat:lib']
            },
            sass: {
                files: ['src/sass/**/*.scss'],
                tasks: ['compass:src']
            }
        }

    });

    grunt.registerTask('default', ['watch']);
    grunt.registerTask('js', ['concat']);
    grunt.registerTask('build',  ['copy', 'cssmin', 'uglify', 'htmlhint:build', 'imageoptim']);

};