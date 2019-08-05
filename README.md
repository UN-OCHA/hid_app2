# Humanitarian ID Web App version 2

[![Build Status](https://travis-ci.org/UN-OCHA/hid_app2.svg?branch=master)](https://travis-ci.org/UN-OCHA/hid_app2) [![Greenkeeper badge](https://badges.greenkeeper.io/UN-OCHA/hid_app2.svg)](https://greenkeeper.io/)

## Running locally

### Prerequisites

* [Docker for Mac](https://docs.docker.com/docker-for-mac/) / Docker for your OS of choice
* [Node](https://nodejs.org/en/)
* [Yarn](https://yarnpkg.com/lang/en/docs/install/)
* [Grunt](http://gruntjs.com/getting-started)
* [Sass](http://sass-lang.com/install)


### Building the app

* Clone repo `git clone git@github.com:UN-OCHA/hid_app2.git`
* In the app directory `cd hid_app2`
* Switch to the dev branch `git checkout dev`
* Install node modules with yarn `yarn install`
* Add the local url to your hosts file:
  * macOS: `sudo vi /etc/hosts`, then add `127.0.0.1  app.hid.vm`
* Run the Grunt tasks `grunt`. Specify a `--target` to point to different HID API environments
  * Example: `grunt --target=local` will use your local API. Edit `app/config/config.local.js` to configure each endpoint.


### Running the app

* `docker-compose up`
* visit [https://app.hid.vm](https://app.hid.vm) and accept the SSL certificate exception


## Deployment

See https://github.com/UN-OCHA/hid-stack/blob/master/README.md


## Coding standards

This project aims to follow the [John Papa Angular 1 style guide](https://github.com/johnpapa/angular-styleguide/tree/master/a1). You can lint the codebase by running the following command (look at [the plugin's README](https://www.npmjs.com/package/eslint-plugin-angular) to interpret the rule names, which link to the styleguide in the format `y123`)

```sh
yarn run lint
```

The linting is run on every PR via Travis integration.


## Unit tests

Unit tests are written using [Jasmine](https://jasmine.github.io/) and run with [Karma](https://karma-runner.github.io/).

```sh
# install Karma CLI
npm install -g karma-cli

# Run tests once
grunt test

# Re-run tests when files are changed
grunt test-watch
```


## E2E tests

E2E is implemented with Protractor, an end-to-end testing tool for Angular.

Installation on **host machine**:

```sh
# install E2E tools: first-time setup
yarn global add protractor
webdriver-manager update
```

Manually install [Java Development Kit (JDK)](https://www.oracle.com/technetwork/java/javase/downloads/index.html)

You will need to add the environment variables to run the tests locally.

* Ask Ops to share 'HID E2E test environment vars' with you on LastPass.
* Copy `e2e-tests/enviroment.example.js` to `environment.js`
* Replace the file's content with the variables from LastPass

Finally, make sure you're running both containers (API/App) and they're both properly configured for local development.

Now you can run the E2E tests:

```sh
# Run all E2E tests in series
yarn run protractor

# Run a single E2E test suite
protractor --suite="my-suite-name" src/e2e-tests/conf.js
```


### What to do if it fails on TravisCI

The tests are prone to random failures on Travis. If this happens:

* manually check on staging to see if you can recreate the problem
* if you can, fix your code!
* if you can't, try re-running the tests in Travis and if possible alter the failing test to make it more robust

### Issues

If the tests fail you may need to log in and reset some things required for the tests manually.

As Test E2E User:

* Unfavourite 'E2e test list - standard'
* Delete 'E2e temp list'

As Test Admin E2E User:

* Delete 'E2e temp mailchimp service' and 'E2e temp google service'
* Delete 'E2e temp' user
* Un-verify 'Test E2E user'
* Cancel pending connection with 'Test E2E user'


## Front end

### CSS

This project uses [Sass](https://sass-lang.com/)

Run `grunt watch` to watch for changes and rebuild the css.

#### Structure

##### Global styles

Global styles, such as resets and grid styles, should be added to `app/common`.

Any `_*.scss` file in `app/common` (excluding sub-directories) will be automatically added to the CSS build.

##### Variables and mixins

As variables and mixins need to be imported before other Sass these are added to sub-directories in `app/common` and manually imported into `app/common/_setup.scss`

##### Component styles

Component specific files should be added to that component's directory, e.g. `app/components/my-component/my-component.scss`.

Any `_*.scss` file in `app/components` (including sub-directories) will be automatically added to the CSS build.
