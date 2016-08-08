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
  });

  grunt.loadNpmTasks("grunt-angular-gettext");

  // Default task
  grunt.registerTask('default', [
    'nggettext_extract',
    'nggettext_compile']);
};
