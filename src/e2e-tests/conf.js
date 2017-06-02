var env;
var SpecReporter = require('jasmine-spec-reporter').SpecReporter;

if (!process.env.TRAVIS) {
  env = require('./environment.js');
}

exports.config = {
	baseUrl:  process.env.TRAVIS ? process.env.baseUrl : env.baseUrl,
	directConnect: true,
	jasmineNodeOpts: {
		print: function() {}
	},
	onPrepare: function () {
    jasmine.getEnv().addReporter(new SpecReporter({
      spec: {
        displayStacktrace: true
      }
    }));
  },
	specs: ['specs/**/*-spec.js'],
  suites: {
  	login: 'specs/login-spec.js',
  	nav: 'specs/navigation-spec.js',
  	profile: 'specs/profile-spec.js',
    list: 'specs/lists/*-spec.js',
  	search: 'specs/search-spec.js',
    checkin: 'specs/checkin-spec.js',
  }
};

exports.config.params = {
  userName: 'Test E2E User',
	// userName: process.env.TRAVIS ? process.env.testUserName : env.params.testUserName,
	email: process.env.TRAVIS ? process.env.testUserEmail : env.params.testUserEmail,
	password: process.env.TRAVIS ? process.env.testUserPassword : env.params.testUserPassword,
  userId: process.env.TRAVIS ? process.env.testUserId : env.params.testUserId,
  adminUserName: 'Test Admin E2E User',
  // adminUserName: process.env.TRAVIS ? process.env.testAdminUserName : env.params.testAdminUserName,
  adminEmail: process.env.TRAVIS ? process.env.testAdminUserEmail : env.params.testAdminUserEmail,
  adminPassword: process.env.TRAVIS ? process.env.testAdminUserPassword : env.params.testAdminUserPassword,
  adminUserId: process.env.TRAVIS ? process.env.testAdminUserId : env.params.testAdminUserId,

  standardTestList: 'E2e test list - standard'
}
