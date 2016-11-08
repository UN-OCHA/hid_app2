module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
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
          'src/assets/css/common.scss': [{path: 'src/app/common/*', first: 'src/app/common/_variables.scss'}],
          'src/assets/css/components.scss': ['src/app/components/**/*']
        }
      }
    },
    sass: {
      dist: {
        files: {
          'src/assets/css/common.css': 'src/assets/css/common.scss',
          'src/assets/css/components.css': 'src/assets/css/components.scss'
        }
      }
    },
    concat: {
      css: {
        files: {
          'src/assets/css/main.css': ['src/assets/css/common.css', 'src/assets/css/components.css']
        }
      }
    },
    watch: {
      sass: {
        files: ['src/app/common/**/*.scss', 'src/app/components/**/*.scss'],
        tasks: ['sass_import', 'sass', 'concat']
      }
    }
  });

  grunt.loadNpmTasks('grunt-angular-gettext');
  grunt.loadNpmTasks('grunt-sass-import');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task
  grunt.registerTask('default', [
    'nggettext_extract',
    'nggettext_compile', 'sass_import', 'sass', 'concat']);
};
