// Karma configuration

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
        'bower_components/angular/angular.min.js',
        'bower_components/angular-mocks/angular-mocks.js',
        'bower_components/angular-gettext/dist/angular-gettext.min.js',
        'bower_components/angular-route/angular-route.min.js',
        'bower_components/angular-resource/angular-resource.min.js',
        'bower_components/angular-xeditable/dist/js/xeditable.js',
        'bower_components/angular-bootstrap/ui-bootstrap.min.js',
        'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
        'bower_components/angular-md5/angular-md5.min.js',
        'bower_components/angular-ui-select/dist/select.min.js',
        'bower_components/angular-password/angular-password.min.js',
        'bower_components/angular-messages/angular-messages.min.js',
        'bower_components/angular-gettext/dist/angular-gettext.min.js',
        'bower_components/digits-trie/dist/digits-trie.js',
        'bower_components/google-libphonenumber/dist/browser/libphonenumber.js',
        'bower_components/bc-countries/dist/bc-countries.js',
        'bower_components/bc-phone-number/dist/js/bc-phone-number.js',
        'bower_components/moment/moment.js',
        'bower_components/moment-timezone/builds/moment-timezone-with-data.js',
        'bower_components/angular-moment/angular-moment.js',
        'bower_components/angular-upload/angular-upload.min.js',
        'assets/js/modernizr-output.js',
        'bower_components/angular-cached-resource/angular-cached-resource.js',
        'bower_components/offline/offline.min.js',
        // 'assets/js/unit-test-helpers.js',
        'app/app.js',
        // 'app/**/*.html',
        'app/common/**/*.js',
        'app/components/**/*.js',
        'app/components/*.tests.js'

    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
