# Humanitarian ID Web App version 2

## Getting started

TO DO

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
