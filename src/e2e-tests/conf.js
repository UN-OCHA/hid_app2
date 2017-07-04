var env;
var SpecReporter = require('jasmine-spec-reporter').SpecReporter;

if (!process.env.TRAVIS) {
  env = require('./environment.js');
}

exports.config = {
	baseUrl:  process.env.TRAVIS ? process.env.baseUrl : env.baseUrl,
	directConnect: true,
	jasmineNodeOpts: {
		print: function() {},
    defaultTimeoutInterval: 150000
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
  	profile: 'specs/profile/*-spec.js',
    list: 'specs/lists/*-spec.js',
  	search: 'specs/search-spec.js',
    checkin: 'specs/checkin-spec.js',
    services: 'specs/service-spec.js',
    dashboard: 'specs/dashboard-spec.js',
  }
};

exports.config.params = {
  userName: 'Test E2E User',
	email: process.env.TRAVIS ? process.env.testUserEmail : env.params.testUserEmail,
	password: process.env.TRAVIS ? process.env.testUserPassword : env.params.testUserPassword,
  userId: process.env.TRAVIS ? process.env.testUserId : env.params.testUserId,
  adminUserName: 'Test Admin E2E User',
  adminEmail: process.env.TRAVIS ? process.env.testAdminUserEmail : env.params.testAdminUserEmail,
  adminPassword: process.env.TRAVIS ? process.env.testAdminUserPassword : env.params.testAdminUserPassword,
  adminUserId: process.env.TRAVIS ? process.env.testAdminUserId : env.params.testAdminUserId,
  adminUserPhoneNumber: '+44 114 139 3939',
  standardTestList: 'E2e test list - standard',
  tempList: 'E2e temp list',
  tempUserEmail: 'e2etemp@example.com',
  tempUserFirstName: 'E2e temp',
  tempUserLastName: 'user',
  lockedTestList: 'E2e test list - verified only',
  tempMailChimpService: 'E2e temp mailchimp service',
  tempGoogleService: 'E2e temp google service',
  mailChimpApiKey: process.env.TRAVIS ? process.env.testMailChimpApiKey : env.params.testMailChimpApiKey,
}
