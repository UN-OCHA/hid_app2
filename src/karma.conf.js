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
        '../node_modules/@bower_components/angular/angular.min.js',
        '../node_modules/@bower_components/angular-mocks/angular-mocks.js',
        '../node_modules/@bower_components/karma-read-json/karma-read-json.js',
        '../node_modules/@bower_components/angular-gettext/dist/angular-gettext.min.js',
        '../node_modules/@bower_components/angular-route/angular-route.min.js',
        '../node_modules/@bower_components/angular-resource/angular-resource.min.js',
        '../node_modules/@bower_components/angular-xeditable/dist/js/xeditable.js',
        '../node_modules/@bower_components/angular-bootstrap/ui-bootstrap.min.js',
        '../node_modules/@bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
        '../node_modules/@bower_components/angular-md5/angular-md5.min.js',
        '../node_modules/@bower_components/angular-ui-select/dist/select.min.js',
        '../node_modules/@bower_components/angular-password/angular-password.min.js',
        '../node_modules/@bower_components/angular-messages/angular-messages.min.js',
        '../node_modules/@bower_components/angular-gettext/dist/angular-gettext.min.js',
        '../node_modules/@bower_components/digits-trie/dist/digits-trie.js',
        '../node_modules/@bower_components/google-libphonenumber/dist/browser/libphonenumber.js',
        '../node_modules/@bower_components/bc-countries/dist/bc-countries.js',
        '../node_modules/@bower_components/bc-phone-number/dist/js/bc-phone-number.js',
        '../node_modules/@bower_components/moment/moment.js',
        '../node_modules/@bower_components/moment-timezone/builds/moment-timezone-with-data.js',
        '../node_modules/@bower_components/angular-moment/angular-moment.js',
        '../node_modules/@bower_components/angular-upload/angular-upload.min.js',
        '../node_modules/@bower_components/localforage/dist/localforage.min.js',
        '../node_modules/@bower_components/angular-localforage/dist/angular-localForage.min.js',
        'assets/js/modernizr-output.js',
        '../node_modules/@bower_components/offline/offline.min.js',
        '../node_modules/phantomjs-polyfill-object-assign/object-assign-polyfill.js',
        'app/config/config.js',
        'app/app.js',
        'app/common/*.module.js',
        'app/components/**/*.module.js',
        'app/components/**/*.controller.js',
        'app/components/**/*.service.js',
        'app/components/**/*.directive.js',
        'app/components/**/*.tests.js',
        'app/common/validators.directive.js',
        'app/common/validators.directive.tests.js',
        {pattern: 'app/test-fixtures/**/*.json', included: false},
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
        'app/components/**/*.controller.js': 'coverage',
        'app/components/**/*.service.js': 'coverage',
        'app/common/validators.directive.js': 'coverage'
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'coverage'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    browserConsoleLogOptions: {
        terminal: true,
        level: ""
    },

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],
    browserNoActivityTimeout: 30000,


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,

  })
}
