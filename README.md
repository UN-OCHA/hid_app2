# Humanitarian ID Web App version 2

[![Build Status](https://travis-ci.org/UN-OCHA/hid_app2.svg?branch=master)](https://travis-ci.org/UN-OCHA/hid_app2)

## Running locally

### Prerequisites:

* [Docker for Mac](https://docs.docker.com/docker-for-mac/) / Docker for your OS of choice
* [Node](https://nodejs.org/en/)
* [Bower](https://bower.io/#install-bower)
* [Grunt](http://gruntjs.com/getting-started)
* [Ruby](https://www.ruby-lang.org/en/)
* [Sass](http://sass-lang.com/install)

### Building the app

* Clone repo `git clone git@github.com:UN-OCHA/hid_app2.git`
* In the app directory `cd hid_app2`
* Switch to the dev branch `git checkout dev`
* Install node modules `npm install`
* Install Bower modules `bower install`
* Add the local url to your hosts file:
on Mac: `sudo vi /etc/hosts`
Add `127.0.0.1   app.hid.vm`
* Run the Grunt tasks `grunt`
(Note to set you local environment to use the staging api use `grunt --target="dev"`)

### Running the app

* If you are using Docker for Mac you will need to add ports to docker-compose.yml
	```
	ports:
   	- 80:80
  ```
* `docker-compose up`
* visit [http://app.hid.vm](http://app.hid.vm)

## Deployment

See https://github.com/UN-OCHA/hid-stack/blob/master/README.md

## Code style guide

This project aims to follow the [John Papa Angular 1 style guide](https://github.com/johnpapa/angular-styleguide/tree/master/a1)


## Unit tests

Unit tests are written using [Jasmine](https://jasmine.github.io/) and run with [Karma](https://karma-runner.github.io/).

### Pre-requisites

Install Karma CLI

```
npm install -g karma-cli
```

### Running the tests

Single run: `grunt test`

Watch for changes an re-run tests: `grunt test-watch`

## E2E tests

### Pre-requisites

Protractor:

```
npm install -g protractor
```

webdriver-manager

```
webdriver-manager update
```

Java Development Kit (JDK) http://www.oracle.com/technetwork/java/javase/downloads/index.html

### Environment variables

You will need to add the environment variables to run the tests locally.

* Ask Ops to share 'HID E2E test environment vars' with you on LastPass.
* Rename e2e-tests/enviroment.example.js to environment.js
* Replace the file's content with the variables from LastPass

### Running the tests

```
npm run protractor
```

Running a single test suite

```
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

### Styleguide and pattern library

The styleguide and pattern library is available at https://un-ocha.github.io/styleguide/hid/

### CSS

This project uses [Sass](http://sass-lang.com/)

Run `grunt watch` to watch for changes and rebuild the css.

#### Structure

##### Global styles

Global styles, such as resets and grid styles, should be added to `app/common`.

Any _*.scss file in `app/common` (excluding sub-directories) will be automatically added to the CSS build.

##### Variables and mixins

As variables and mixins need to be imported before other Sass these are added to sub-directories in `app/common` and manually imported into `app/common/_setup.scss`

##### Component styles

Component specific files should be added to that component's directory, e.g. `app/components/my-component/my-component.scss`.

Any _*.scss file in `app/components` (including sub-directories) will be automatically added to the CSS build.
