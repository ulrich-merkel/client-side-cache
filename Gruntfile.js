/*global module, require*/

/**
 * node js export
 * 
 */
module.exports = function (grunt) {

    'use strict';

    // init local vars


    /**
     * load all tasks automatically using the matchdep dependency
     * all dependencies are declared in the package.json
     */
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
    require('matchdep').filterDev('assemble').forEach(grunt.loadNpmTasks);


    /**
     * read javascript source files
     */
     function getSourceFiles(src, middlemanSrc) {

        var sourceFile = grunt.file.read(src, {
                encoding: 'utf-8'
            }),
            requires = sourceFile.split(/= require/i).filter(function (str) {
                return str.match(/"/);
            }).map(function (str) {

                var filepath = middlemanSrc + str.split('\"')[1] + (str.indexOf('.js') === -1 ? '.js' : ''),
                    exists = grunt.file.exists(filepath);

                grunt.log.writeln('parsed file: \"' + filepath + '\"');
                if (!exists) {
                    grunt.fail.warn('\"' + filepath + '\" doesn\'t exists!');
                }
                return filepath;
            });

        grunt.log.ok();

        return requires;
    }


    // Project configuration.
    grunt.initConfig({

        // load package.json
        pkg: grunt.file.readJSON('package.json'),

        // hint html files
        htmlhint: {
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
            fullCache: {
                src: ['examples/full-cache/index.html']
            },
            fullCacheNoHttpCache: {
                src: ['examples/full-cache-no-http-cache/index.html']
            },
            fiwwCache: {
                src: ['examples/fiww-cache/index.html']
            },
            fiwwCacheNoHttpCache: {
                src: ['examples/fiww-cache-no-http-cache/index.html']
            },
            httpCache: {
                src: ['examples/http-cache/index.html']
            },
            noCache: {
                src: ['examples/no-cache/index.html']
            }
        },

        // combine javascript source files
        concat: {
            cache: {
                src: getSourceFiles('src/js/cache.files', 'src/js/'),
                dest: 'src/js/cache.js'
            },
            app: {
                src: getSourceFiles('src/template/js/app.files', 'src/template/js/'),
                dest: 'src/template/js/app.js'
            },
            lib: {
                src: getSourceFiles('src/template/js/lib.files', 'src/template/js/'),
                dest: 'src/template/js/lib.js'
            }
        },

        // clean folders
        clean: {
            options: {
                force: true // disable blocking deletion of folders outside current working dir
                // 'no-write': true // option for dry run
            },
            fullCache: ['examples/full-cache/**/*'],
            fiwwCache: ['examples/fiww-cache/**/*'],
            fiwwCacheNoHttpCache: ['examples/fiww-cache-no-http-cache/**/*'],
            httpCache: ['examples/http-cache/**/*'],
            noCache: ['examples/no-cache/**/*']
        },

        // copy assemble files
        copy: {
            fullCache: {
                files: [
                    { expand: true, flatten: true, src: ['src/template/cache.manifest'], dest: 'examples/full-cache' },
                    { expand: true, flatten: true, src: ['src/template/htaccess/http-cache/.htaccess'], dest: 'examples/full-cache' },
                    { expand: true, flatten: true, src: ['src/template/css/base.css'], dest: 'examples/full-cache/css' },
                    { expand: true, flatten: true, src: ['src/template/css/app.css'], dest: 'examples/full-cache/css' },
                    { expand: true, flatten: true, src: ['src/template/templates/ajax.html'], dest: 'examples/full-cache/' },
                    { expand: true, flatten: true, src: ['src/template/js/lib.js'], dest: 'examples/full-cache/js' },
                    { expand: true, flatten: true, src: ['src/template/js/app.js'], dest: 'examples/full-cache/js' },
                    { expand: true, flatten: true, src: ['src/js/cache.js'], dest: 'examples/full-cache/js' },
                    { expand: true, cwd: 'src/template/',  src: ['assets/**/*'], dest: 'examples/full-cache/' }
                ]
            },
            fullCacheNoHttpCache: {
                files: [
                    { expand: true, flatten: true, src: ['src/template/cache.manifest'], dest: 'examples/full-cache-no-http-cache' },
                    { expand: true, flatten: true, src: ['src/template/htaccess/no-http-cache/.htaccess'], dest: 'examples/full-cache-no-http-cache' },
                    { expand: true, flatten: true, src: ['src/template/css/base.css'], dest: 'examples/full-cache-no-http-cache/css' },
                    { expand: true, flatten: true, src: ['src/template/css/app.css'], dest: 'examples/full-cache-no-http-cache/css' },
                    { expand: true, flatten: true, src: ['src/template/templates/ajax.html'], dest: 'examples/full-cache-no-http-cache/' },
                    { expand: true, flatten: true, src: ['src/template/js/lib.js'], dest: 'examples/full-cache-no-http-cache/js' },
                    { expand: true, flatten: true, src: ['src/template/js/app.js'], dest: 'examples/full-cache-no-http-cache/js' },
                    { expand: true, flatten: true, src: ['src/js/cache.js'], dest: 'examples/full-cache-no-http-cache/js' },
                    { expand: true, cwd: 'src/template/',  src: ['assets/**/*'], dest: 'examples/full-cache-no-http-cache/' }
                ]
            },
            fiwwCache: {
                files: [
                    { expand: true, flatten: true, src: ['src/template/htaccess/http-cache/.htaccess'], dest: 'examples/fiww-cache' },
                    { expand: true, flatten: true, src: ['src/template/css/base.css'], dest: 'examples/fiww-cache/css' },
                    { expand: true, flatten: true, src: ['src/template/css/app.css'], dest: 'examples/fiww-cache/css' },
                    { expand: true, flatten: true, src: ['src/template/templates/ajax.html'], dest: 'examples/fiww-cache/' },
                    { expand: true, flatten: true, src: ['src/template/js/lib.js'], dest: 'examples/fiww-cache/js' },
                    { expand: true, flatten: true, src: ['src/template/js/app.js'], dest: 'examples/fiww-cache/js' },
                    { expand: true, flatten: true, src: ['src/js/cache.js'], dest: 'examples/fiww-cache/js' },
                    { expand: true, cwd: 'src/template/',  src: ['assets/**/*'], dest: 'examples/fiww-cache/' }
                ]
            },
            fiwwCacheNoHttpCache: {
                files: [
                    { expand: true, flatten: true, src: ['src/template/htaccess/no-http-cache/.htaccess'], dest: 'examples/fiww-cache-no-http-cache' },
                    { expand: true, flatten: true, src: ['src/template/css/base.css'], dest: 'examples/fiww-cache-no-http-cache/css' },
                    { expand: true, flatten: true, src: ['src/template/css/app.css'], dest: 'examples/fiww-cache-no-http-cache/css' },
                    { expand: true, flatten: true, src: ['src/template/templates/ajax.html'], dest: 'examples/fiww-cache-no-http-cache/' },
                    { expand: true, flatten: true, src: ['src/template/js/lib.js'], dest: 'examples/fiww-cache-no-http-cache/js' },
                    { expand: true, flatten: true, src: ['src/template/js/app.js'], dest: 'examples/fiww-cache-no-http-cache/js' },
                    { expand: true, flatten: true, src: ['src/js/cache.js'], dest: 'examples/fiww-cache-no-http-cache/js' },
                    { expand: true, cwd: 'src/template/',  src: ['assets/**/*'], dest: 'examples/fiww-cache-no-http-cache/' }
                ]
            },
            httpCache: {
                files: [
                    { expand: true, flatten: true, src: ['src/template/htaccess/http-cache/.htaccess'], dest: 'examples/http-cache' },
                    { expand: true, flatten: true, src: ['src/template/css/base.css'], dest: 'examples/http-cache/css' },
                    { expand: true, flatten: true, src: ['src/template/css/app.css'], dest: 'examples/http-cache/css' },
                    { expand: true, flatten: true, src: ['src/template/templates/ajax.html'], dest: 'examples/http-cache/' },
                    { expand: true, flatten: true, src: ['src/template/js/lib.js'], dest: 'examples/http-cache/js' },
                    { expand: true, flatten: true, src: ['src/template/js/app.js'], dest: 'examples/http-cache/js' },
                    { expand: true, cwd: 'src/template/',  src: ['assets/**/*'], dest: 'examples/http-cache/' }
                ]
            },
            noCache: {
                files: [
                    { expand: true, flatten: true, src: ['src/template/htaccess/no-http-cache/.htaccess'], dest: 'examples/no-cache' },
                    { expand: true, flatten: true, src: ['src/template/css/base.css'], dest: 'examples/no-cache/css' },
                    { expand: true, flatten: true, src: ['src/template/css/app.css'], dest: 'examples/no-cache/css' },
                    { expand: true, flatten: true, src: ['src/template/templates/ajax.html'], dest: 'examples/no-cache/' },
                    { expand: true, flatten: true, src: ['src/template/js/lib.js'], dest: 'examples/no-cache/js' },
                    { expand: true, flatten: true, src: ['src/template/js/app.js'], dest: 'examples/no-cache/js' },
                    { expand: true, cwd: 'src/template/',  src: ['assets/**/*'], dest: 'examples/no-cache/' }
                ]
            },
            tests: {
                files: [
                    { expand: true, flatten: true, src: ['src/js/cache.js'], dest: 'tests/js/' }
                ]
            },
            testsMin: {
                files: [
                    { expand: true, flatten: true, src: ['build/cache.min.js'], dest: 'tests/js/' }
                ]
            },
            testsComplete: {
                files: [
                    { expand: true, flatten: true, src: ['src/template/css/base.css'], dest: 'tests/css' },
                    { expand: true, flatten: true, src: ['src/template/css/app.css'], dest: 'tests/css' },
                    { expand: true, flatten: true, src: ['src/template/templates/ajax.html'], dest: 'tests/' },
                    { expand: true, flatten: true, src: ['src/template/js/lib.js'], dest: 'tests/js' },
                    { expand: true, flatten: true, src: ['src/template/js/app.js'], dest: 'tests/js' },
                    { expand: true, cwd: 'src/template/',  src: ['assets/**/*'], dest: 'tests/' }
                ]
            },
        },

        // generate html from assemble templates
        assemble: {
            options: {
                assets: 'src/template/assets/',
                layout: 'default.hbs',
                layoutdir: 'src/template/layouts',
                partials: ['src/template/**/*.hbs'],
                data: ['src/template/data/**/*.{json,yml}']
            },
            fullCache: {
                options: {
                    layout: 'application-cache.hbs'
                },
                expand: true,
                src: ['src/template/templates/full-cache.hbs'],
                dest: 'examples/full-cache/',
                flatten: true
            },
            fullCacheNoHttpCache: {
                options: {
                    layout: 'application-cache.hbs'
                },
                expand: true,
                src: ['src/template/templates/full-cache.hbs'],
                dest: 'examples/full-cache-no-http-cache/',
                flatten: true
            },
            fiwwCache: {
                expand: true,
                src: ['src/template/templates/fiww-cache.hbs'],
                dest: 'examples/fiww-cache/',
                flatten: true
            },
            fiwwCacheNoHttpCache: {
                expand: true,
                src: ['src/template/templates/fiww-cache.hbs'],
                dest: 'examples/fiww-cache-no-http-cache/',
                flatten: true
            },
            httpCache: {
                expand: true,
                src: ['src/template/templates/standard.hbs'],
                dest: 'examples/http-cache/',
                flatten: true
            },
            noCache: {
                expand: true,
                src: ['src/template/templates/standard.hbs'],
                dest: 'examples/no-cache/',
                flatten: true
            }
        },

        // rename generated html files
        rename: {
            fullCache: {
                src: 'examples/full-cache/full-cache.html',
                dest: 'examples/full-cache/index.html'
            },
            fullCacheNoHttpCache: {
                src: 'examples/full-cache-no-http-cache/full-cache.html',
                dest: 'examples/full-cache-no-http-cache/index.html'
            },
            fiwwCache: {
                src: 'examples/fiww-cache/fiww-cache.html',
                dest: 'examples/fiww-cache/index.html'
            },
            fiwwCacheNoHttpCache: {
                src: 'examples/fiww-cache-no-http-cache/fiww-cache.html',
                dest: 'examples/fiww-cache-no-http-cache/index.html'
            },
            httpCache: {
                src: 'examples/http-cache/standard.html',
                dest: 'examples/http-cache/index.html'
            },
            noCache: {
                src: 'examples/no-cache/standard.html',
                dest: 'examples/no-cache/index.html'
            },

            buildSrc: {
                src: 'src/js/cache.js',
                dest: 'build/cache.js'
            },
            buildMin: {
                src: 'src/js/cache.dev.min.js',
                dest: 'build/cache.min.js'
            },
            buildDev: {
                src: 'src/js/cache.min.js',
                dest: 'build/cache.dev.js'
            }
        },

        // remove unused html files
        remove: {
            options: {
                trace: true
            },
            fileList: ['full-cache.html', 'fiww-cache.html', 'standard.html', 'cache.dev.js', 'cache.dev.min.js.map', 'cache.min.js.map'],
            dirList: ['examples/full-cache/', 'examples/full-cache-no-http-cache', 'examples/fiww-cache/', 'examples/fiww-cache-no-http-cache/', 'examples/http-cache/', 'examples/no-cache/', 'src/js/']
        },

        // execute shell commands
        shell: {
            min: {
                command: [
                    'cd scripts/closure-compiler/',
                    'java -jar compiler.jar --charset  utf-8  --js ../../src/js/cache.js --js_output_file ../../src/js/cache.min.js  --summary_detail_level 3 --create_source_map ../../src/js/cache.min.js.map --source_map_format=V3 --compilation_level SIMPLE_OPTIMIZATIONS',
                    'cd ../../../'
                ].join('&&'),
                options: {
                    callback: function (error, stdout, stderr, cb) {
                        if (!!error) {
                            grunt.log.error('ERROR:', error, stderr);
                            cb(false);
                        } else {
                            cb(true);
                        }
                    }
                }
            },
            log: {
                command: [
                    'cd scripts/closure-compiler/',
                    'java -jar compiler.jar --charset  utf-8  --js ../../src/js/cache.dev.js --js_output_file ../../src/js/cache.dev.min.js  --summary_detail_level 3 --create_source_map ../../src/js/cache.dev.min.js.map --source_map_format=V3 --compilation_level SIMPLE_OPTIMIZATIONS',
                    'cd ../../../'
                ].join('&&'),
                options: {
                    callback: function (error, stdout, stderr, cb) {
                        if (!!error) {
                            grunt.log.error('ERROR:', error, stderr);
                            cb(false);
                        } else {
                            cb(true);
                        }
                    }
                }
            }
        },

        // strip development code for javascript
        strip_code: {
            options: {
                start_comment: 'start-dev-block',
                end_comment: 'end-dev-block',
            },
            cache: {
                src: 'src/js/cache.js',
                dest: 'src/js/cache.dev.js'
            }
        },

        // jslint javascript sources
        jslint: {
            cache: {
                src: [
                    'src/js/_app/**/*.js'
                ],
                directives: {
                    browser: true,
                    unparam: true,
                    todo: true,
                    predef: [
                        'jQuery'
                    ]
                },
                options: {
                    // only display errors,
                    errorsOnly: true,
                    // defaults to true
                    failOnError: false 
                }
            }
        },

        jshint: {
            // add all files you want to be checked for errors here
            all: [
                'src/js/_app/**/*.js'
            ],
            // change the options to your liking -- see http://www.jshint.com/docs/
            options: {
                bitwise: false,
                camelcase: true,
                curly: true,
                eqeqeq: true,
                forin: true,
                freeze: false,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                noempty: true,
                nonew: true,
                plusplus: false,
                quotmark: 'single',
                undef: true,
                unused: false,
                strict: true,
                trailing: true,
                force: true
            }
        },

        // run web server
        connect: {
            server: {
                options: {
                    port: 9000,
                    hostname: 'localhost',
                    base: ['examples/'],
                    livereload: true,
                    open: true
                }
            }
        },

        // compile sass files to css
        compass: {
            assemble: {
                options: {
                    sassDir: 'src/template/scss/',
                    cssDir: 'src/template/css/'
                }
            }
        },

        // minify builded css files
        cssmin: {
            base: {
                src: 'src/template/base.css',
                dest: 'src/template/base.min.css'
            },
            app: {
                src: 'src/template/app.css',
                dest: 'src/template/app.min.css'
            }
        },

        // watch file changes to run tasks
        watch: {
            cache: {
                files: [
					'src/js/_app/**/*.js'
				],
                tasks: ['concat:cache', 'copy:fiwwCache', 'copy:tests']
            },
            js: {
                files: [
					'src/template/js/**/*.js'
				],
                tasks: ['concat:lib', 'concat:app']
            },
            scss: {
                files: [
					'src/template/scss/**/*.scss'
				],
                tasks: ['compass']
            },
            assemble: {
                files: [
                    'src/template/templates/*.hbs',
                    '<%= assemble.options.layoutdir %>/*.hbs',
                    '<%= assemble.options.data %>',
                    '<%= assemble.options.partials %>'
                ],
                tasks: ['assemble', 'copy'],
                options: {
                    livereload: true
                }
            }
        }

    });

    // Environment tasks
	grunt.registerTask('dev', [
        'clean',
        'concat',
        'compass',
        'cssmin',
        'assemble',
        'copy',
        'rename:fullCache',
        'rename:fullCacheNoHttpCache',
        'rename:fiwwCache',
        'rename:fiwwCacheNoHttpCache',
        'rename:httpCache',
        'rename:noCache',
        'strip_code',
        'shell',
        'remove'
    ]);
    grunt.registerTask('lint', ['jslint', 'jshint', 'htmlhint']);
    //grunt.registerTask('lint', ['htmlhint']);
    grunt.registerTask('build', ['dev', 'lint', 'copy:testsMin', 'rename:buildSrc', 'rename:buildMin', 'rename:buildDev']);
    grunt.registerTask('server', ['connect:server', 'watch']);

    // Default task
    grunt.registerTask('default', ['server']);

};