module.exports = function(grunt) {

  var target = grunt.option('target') || 'local';

  // Project configuration.
  grunt.initConfig({
    copy: {
      config: {
        src: 'src/app/config/config.' + target + '.js',
        dest: 'src/app/config/config.js',
      },
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
          'csstransforms'
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

  // Default task
  grunt.registerTask('default', [
    'copy',
    'nggettext_extract',
    'nggettext_compile', 'sass_import', 'concat', 'sass', 'modernizr', 'autoprefixer']);
};
