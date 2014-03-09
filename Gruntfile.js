/*global module, require*/

/**
 * node js export
 * 
 */
module.exports = function (grunt) {

    'use strict';

    var pkg = grunt.file.readJSON('package.json'),
        gruntDeps = function (name) {
            return !name.indexOf('grunt-');
        };

    /**
     * read javascript source files
     * 
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
        pkg: pkg,

        // clean folders
        clean: {
            options: {
                force: true
            },
            examples: [
                'examples/full-cache/**/*',
                'examples/full-cache-no-http-cache/**/*',
                'examples/fiww-cache/**/*',
                'examples/fiww-cache-no-http-cache/**/*',
                'examples/http-cache/**/*',
                'examples/no-cache/**/*'
            ],
            exampleFullCache: ['examples/full-cache/**/*'],
            exampleFullCacheNoHttpCache: ['examples/full-cache-no-http-cache/**/*'],
            exampleFiwwCache: ['examples/fiww-cache/**/*'],
            exampleFiwwCacheNoHttpCache: ['examples/fiww-cache-no-http-cache/**/*'],
            exampleHttpCache: ['examples/http-cache/**/*'],
            exampleNoCache: ['examples/no-cache/**/*'],

            build: ['build/'],
            temp: ['temp/'],
            jsdoc: ['docs/jsdoc/']
        },

        // combine javascript source files
        concat: {
            cache: {
                src: getSourceFiles('src/js/cache.files', 'src/js/'),
                dest: 'temp/cache.js'
            },
            app: {
                src: getSourceFiles('src/template/js/app.files', 'src/template/js/'),
                dest: 'temp/template/js/app.js'
            },
            lib: {
                src: getSourceFiles('src/template/js/lib.files', 'src/template/js/'),
                dest: 'temp/template/js/lib.js'
            }
        },

        // strip development code for javascript
        strip_code: {
            options: {
                start_comment: 'start-dev-block',
                end_comment: 'end-dev-block',
            },
            cache: {
                src: 'temp/cache.js',
                dest: 'temp/cache.prod.js'
            }
        },

        // execute shell commands
        shell: {
            min: {
                command: [
                    'cd extras/',
                    'java -jar compiler.jar --charset  utf-8  --js ../temp/cache.prod.js --js_output_file ../temp/cache.min.js  --summary_detail_level 3 --compilation_level SIMPLE_OPTIMIZATIONS',
                    'cd ../../'
                ].join('&&'),
                options: {
                    async: true,
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
                    'cd extras/',
                    'java -jar compiler.jar --charset  utf-8  --js ../temp/cache.js --js_output_file ../temp/cache.dev.js  --summary_detail_level 3 --compilation_level SIMPLE_OPTIMIZATIONS',
                    'cd ../../'
                ].join('&&'),
                options: {
                    async: true,
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
                src: 'src/template/css/base.css',
                dest: 'src/template/css/base.min.css'
            },
            app: {
                src: 'src/template/css/app.css',
                dest: 'src/template/css/app.min.css'
            }
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
                src: ['src/template/pages/full-cache.hbs'],
                dest: 'examples/full-cache/',
                flatten: true
            },
            fullCacheNoHttpCache: {
                options: {
                    layout: 'application-cache.hbs'
                },
                expand: true,
                src: ['src/template/pages/full-cache.hbs'],
                dest: 'examples/full-cache-no-http-cache/',
                flatten: true
            },
            fiwwCache: {
                expand: true,
                src: ['src/template/pages/fiww-cache.hbs'],
                dest: 'examples/fiww-cache/',
                flatten: true
            },
            fiwwCacheNoHttpCache: {
                expand: true,
                src: ['src/template/pages/fiww-cache.hbs'],
                dest: 'examples/fiww-cache-no-http-cache/',
                flatten: true
            },
            httpCache: {
                options: {
                    layout: 'standard.hbs'
                },
                expand: true,
                src: ['src/template/pages/standard.hbs'],
                dest: 'examples/http-cache/',
                flatten: true
            },
            noCache: {
                options: {
                    layout: 'standard.hbs'
                },
                expand: true,
                src: ['src/template/pages/standard.hbs'],
                dest: 'examples/no-cache/',
                flatten: true
            }
        },

        // rename generated html files and move js files to build folder
        rename: {
            options: {
                ignore: true
            },
            buildSrc: {
                src: 'temp/cache.js',
                dest: 'build/cache.js'
            },
            buildDev: {
                src: 'temp/cache.dev.js',
                dest: 'build/cache.dev.js'
            },
            buildMin: {
                src: 'temp/cache.min.js',
                dest: 'build/cache.min.js'
            },
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
            }
        },

        // copy assemble files
        copy: {
            template: {
                files: [
                    { expand: true, flatten: true, src: ['src/template/css/**/*.css'], dest: 'temp/template/css' },
                    { expand: true, flatten: true, src: ['src/template/pages/ajax.html'], dest: 'temp/template' },                    
                    { expand: true, cwd: 'src/template/',  src: ['assets/**/*'], dest: 'temp/template' }
                ]
            },
            fullCache: {
                files: [
                    { expand: true, flatten: true, src: ['src/template/cache.manifest'], dest: 'examples/full-cache' },
                    { expand: true, flatten: true, src: ['src/template/htaccess/http-cache/.htaccess'], dest: 'examples/full-cache' },
                    { expand: true, flatten: true, src: ['build/**/*.js'], dest: 'examples/full-cache/js' },
                    { expand: true, cwd: 'temp/template/',  src: ['**/*'], dest: 'examples/full-cache/' }
                ]
            },
            fullCacheNoHttpCache: {
                files: [
                    { expand: true, flatten: true, src: ['src/template/cache.manifest'], dest: 'examples/full-cache-no-http-cache' },
                    { expand: true, flatten: true, src: ['src/template/htaccess/no-http-cache/.htaccess'], dest: 'examples/full-cache-no-http-cache' },
                    { expand: true, flatten: true, src: ['build/**/*.js'], dest: 'examples/full-cache-no-http-cache/js' },
                    { expand: true, cwd: 'temp/template/',  src: ['**/*'], dest: 'examples/full-cache-no-http-cache/' }
                ]
            },
            fiwwCache: {
                files: [
                    { expand: true, flatten: true, src: ['src/template/htaccess/http-cache/.htaccess'], dest: 'examples/fiww-cache' },
                    { expand: true, flatten: true, src: ['build/**/*.js'], dest: 'examples/fiww-cache/js/' },
                    { expand: true, cwd: 'temp/template/',  src: ['**/*'], dest: 'examples/fiww-cache/' }
                ]
            },
            fiwwCacheNoHttpCache: {
                files: [
                    { expand: true, flatten: true, src: ['src/template/htaccess/no-http-cache/.htaccess'], dest: 'examples/fiww-cache-no-http-cache' },
                    { expand: true, flatten: true, src: ['build/**/*.js'], dest: 'examples/fiww-cache-no-http-cache/js/' },
                    { expand: true, cwd: 'temp/template/',  src: ['**/*'], dest: 'examples/fiww-cache-no-http-cache/' }
                ]
            },
            httpCache: {
                files: [
                    { expand: true, flatten: true, src: ['src/template/htaccess/http-cache/.htaccess'], dest: 'examples/http-cache' },
                    { expand: true, flatten: true, src: ['build/**/*.js'], dest: 'examples/http-cache/js/' },
                    { expand: true, cwd: 'temp/template/',  src: ['**/*'], dest: 'examples/http-cache/' }
                ]
            },
            noCache: {
                files: [
                    { expand: true, flatten: true, src: ['src/template/htaccess/no-http-cache/.htaccess'], dest: 'examples/no-cache' },
                    { expand: true, flatten: true, src: ['build/**/*.js'], dest: 'examples/no-cache/js/' },
                    { expand: true, cwd: 'temp/template/',  src: ['**/*'], dest: 'examples/no-cache/' }
                ]
            },
            
            tests: {
                files: [
                    { expand: true, flatten: true, src: ['temp/template/css/**/*.css'], dest: 'tests/css' },
                    { expand: true, flatten: true, src: ['src/template/templates/ajax.html'], dest: 'tests/' },
                    { expand: true, flatten: true, src: ['temp/template/js/**/*.js'], dest: 'tests/js' },
                    { expand: true, flatten: true, src: ['build/**/*.js'], dest: 'tests/js' },
                    { expand: true, cwd: 'src/template/',  src: ['assets/**/*'], dest: 'tests/' }
                ]
            },
        },

        // remove unused html files
        remove: {
            options: {
                trace: true
            },
            fileList: [
                'full-cache.html',
                'fiww-cache.html',
                'standard.html',
            ],
            dirList: [
                'examples/full-cache/',
                'examples/full-cache-no-http-cache',
                'examples/fiww-cache/',
                'examples/fiww-cache-no-http-cache/',
                'examples/http-cache/',
                'examples/no-cache/'
            ]
        },

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

        // jslint javascript sources
        jslint: {
            cache: {
                // add all files you want to be checked for errors here
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

        // jshint javascript sources
        jshint: {
            // add all files you want to be checked for errors here
            all: [
                'src/js/_app/**/*.js'
            ],
            // change the options to you like -- see http://www.jshint.com/docs/
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

        // generate jsdoc
        jsdoc: {
            dist: {
                src: [
                    'build/cache.js',
                    'README.md'
                ],
                options: {
                    destination: 'docs/jsdoc',
                    template: 'node_modules/ink-docstrap/template',
                    configure: 'extras/jsdoc.conf.json'
                }
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

        // watch file changes to run tasks
        watch: {
            cache: {
                files: [
					'src/js/_app/**/*.js'
				],
                tasks: ['dev']
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
                    'src/template/layouts/*.hbs',
                    'src/template/data',
                    'src/template/partials'
                ],
                tasks: ['assemble', 'copy'],
                options: {
                    livereload: true
                }
            }
        }

    });

    /**
     * load all tasks automatically using the matchdep dependency
     * all dependencies are declared in the package.json
     */
    require('matchdep').filterDev('assemble').forEach(grunt.loadNpmTasks);
    Object.keys(pkg.devDependencies).filter(gruntDeps).forEach(grunt.loadNpmTasks);

    // Environment tasks
	grunt.registerTask('dev', [
        'clean',
        'concat',
        'strip_code',
        'shell:min',
        'shell:log',
        'compass',
        'cssmin',
        'assemble',
        'rename',
        'copy'
    ]);

    grunt.registerTask('build-dev', [
        'dev',
        'lint',
    ]);

    grunt.registerTask('build-deploy', [
        'build-dev',
        'clean:temp'
    ]);
    
    grunt.registerTask('build', [
        'build-deploy'
    ]);

    grunt.registerTask('docs', [
        'clean:jsdoc',
        'jsdoc'
    ]);

    grunt.registerTask('lint', [
        'jshint',
        'jslint',
        'htmlhint'
    ]);

    grunt.registerTask('server', [
        'connect:server',
        'watch'
    ]);

    // Default task
    grunt.registerTask('default', [
        'server'
    ]);

};