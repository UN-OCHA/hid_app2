# Humanitarian ID Web App version 2

## Running localy

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

* `docker-compose up`
* visit [http://app.hid.vm](http://app.hid.vm)

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

## Front end

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

#### Grid

Uses a simplified [Bootstrap v4 grid](https://github.com/twbs/bootstrap).

Uses `col-{breakpoint}-{number}` style classes as with standard Bootstrap grid. `push`, `pull` and `offset` also supported.

See `app/common/_variables.scss` for available breakpoints.
