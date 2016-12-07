module.exports = function(grunt) {

  var target = grunt.option('target') || 'local';

  // Project configuration.
  grunt.initConfig({
    copy: {
      config: {
        src: 'src/app/config/config.' + target + '.js',
        dest: 'src/app/config/config.js',
      },
      fonts_exo: {
        expand: true,
        cwd: 'src/assets/fonts/exo',
        src: '**',
        dest: 'dist/fonts/exo'
      },
      fonts_fontawesome: {
        expand: true,
        cwd: 'src/bower_components/components-font-awesome/fonts',
        src: '**',
        dest: 'dist/fonts'
      },
      img: {
        expand: true,
        cwd: 'src/assets/img',
        src: '**',
        dest: 'dist/img'
      },
      app: {
        expand: true,
        cwd: 'src',
        src: '*',
        dest: 'dist/',
        filter: 'isFile'
      }
    },
    nggettext_extract: {
      pot: {
        files: {
          'src/po/template.pot': ['src/app/*/*.html', 'src/app/*/*.js']
        }
      },
    },
    nggettext_compile: {
      all: {
        files: {
          'src/app/common/translations.js': ['src/po/*.po']
        }
      },
    },
    sass_import: {
      options: {},
      dist: {
        files: {
          'src/assets/css/common.scss': [{path: 'src/app/common/*', first: 'src/app/common/_setup.scss'}],
          'src/assets/css/components.scss': ['src/app/components/**/*']
        }
      }
    },
    sass: {
      dist: {
        files: {
          'src/assets/css/main.css': 'src/assets/css/main.scss'
        }
      }
    },
    concat: {
      css: {
        files: {
          'src/assets/css/main.scss': ['src/assets/css/common.scss', 'src/assets/css/components.scss']
        }
      }
    },
    watch: {
      sass: {
        files: ['src/app/common/**/*.scss', 'src/app/components/**/*.scss'],
        tasks: ['sass_import', 'concat', 'sass'],
        options: {
          spawn: false,
        }
      }
    },
    modernizr: {
      dist: {
        'crawl': false,
        'customTests': [],
        'dest': 'src/assets/js/modernizr-output.js',
        'tests': [
          'svg',
          'flexbox',
          'csscalc',
          'csstransforms',
          'appearance'
        ],
        'options': [
          'setClasses'
        ],
        'uglify': true
      }
    },
    autoprefixer: {
      dist: {
        files: {
          'src/assets/css/main.css': 'src/assets/css/main.css'
        }
      }
    },
    cacheHash: {},
    useminPrepare: {
      html: 'src/index.html'
    },
    ngtemplates: {
      app: {
        files: [{
          cwd: 'src',
          src: ['app/common/*.html', 'app/components/**/*.html'],
          dest: '.tmp/concat/js/templates.js'
        }],
        options: {
          module: 'hidApp',
          usemin: 'dist/js/app.min.js',
          htmlmin: {
            collapseBooleanAttributes:      true,
            collapseWhitespace:             true,
            removeAttributeQuotes:          true,
            removeComments:                 true,
            removeEmptyAttributes:          true,
            removeScriptTypeAttributes:     true,
            removeStyleLinkTypeAttributes:  true
          }
        }
      }
    },
    // Annotates to prevent angularjs errors on minification.
    ngAnnotate: {
      js: {
        files: {
          '.tmp/concat/js/app.min.js': ['.tmp/concat/js/app.min.js']
        }
      }
    },
    usemin: {
      html: 'dist/index.html'
    },
    // Cache bust
    cacheBust: {
      bust: {
        options: {
          jsonOutput: true,
          jsonOutputFilename: '../.tmp/cachebust.json',
          baseDir: 'dist/',
          assets: ['js/*', 'css/*'],
          queryString: true
        },
        src: ['dist/index.html']
      }
    },
    // Build cache manifest
    manifest: {
      generate: {
        options: {
          basePath: 'dist/',
          cache: ['<%= cacheHash["js/app.min.js"] %>',
                  '<%= cacheHash["css/app.min.css"] %>',
                  '/favicon.ico'],
          // network: ['*'],
          //fallback: ['/ partials/offline.html'],
          // exclude: ['']
          preferOnline: true,
          hash: true,
          verbose: false
        },
        src: [
          // 'js/app.min.js',
          // 'css/app.min.css',
          // 'index.html',
          'img/*.png',
          'fonts/exo/*',
          'fonts/FontAwesome.otf',
          'fonts/fontawesome-webfont.eot',
          'fonts/fontawesome-webfont.svg',
          'fonts/fontawesome-webfont.ttf',
          'fonts/fontawesome-webfont.woff',
          'fonts/fontawesome-webfont.woff2'
        ],
        dest: 'dist/offline.appcache'
      }
    },
    // Removes tmp dir.
    clean: {
      dist: {
        src: ['dist/**/*']
      },
      tmp: {
        src: ['.tmp']
      }
    }

  });

  grunt.loadNpmTasks('grunt-angular-gettext');
  grunt.loadNpmTasks('grunt-sass-import');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks("grunt-modernizr");
  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-angular-templates');
  grunt.loadNpmTasks("grunt-usemin");
  grunt.loadNpmTasks('grunt-ng-annotate');
  grunt.loadNpmTasks('grunt-manifest');
  grunt.loadNpmTasks("grunt-cache-bust");
  grunt.loadNpmTasks("grunt-contrib-clean");

  //load cache buster json and generate manifest
  grunt.registerTask('manifest-gen','Generate manifest from cache buster output', function(){
    grunt.config.set('cacheHash', grunt.file.readJSON('.tmp/cachebust.json'));
    grunt.log.write('Read cacheBust output');
    grunt.task.run(['manifest']);
  });

  // Default task
  grunt.registerTask('default', [
    'clean:dist',
    'copy',
    'nggettext_extract',
    'nggettext_compile',
    'sass_import',
    'concat:css',
    'sass',
    'modernizr',
    'autoprefixer',
    'useminPrepare',
    'ngtemplates',
    'concat:generated',
    'ngAnnotate',
    'cssmin:generated',
    'uglify:generated',
    'usemin',
    'cacheBust',
    'manifest-gen',
    'clean:tmp'
  ]);
};
