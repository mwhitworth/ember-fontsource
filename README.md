<h1 align="center">Ember Fontsource</h1>

<div align="center">
  <a href="https://travis-ci.org/mwhitworth/ember-fontsource"><img src="https://travis-ci.org/mwhitworth/ember-fontsource.svg?branch=master" alt="Build Status"></a>
  <a href="https://www.npmjs.com/package/ember-fontsource"><img src="https://img.shields.io/npm/v/ember-fontsource.svg" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/ember-fontsource"><img src="https://img.shields.io/npm/dm/ember-fontsource.svg" alt="Monthly Downloads"></a>
  <a href="http://emberobserver.com/addons/ember-fontsource"><img src="http://emberobserver.com/badges/ember-fontsource.svg" alt="Ember Observer Score"></a>
</div>

<br>

<div align="center">
  <p>Easily add fontsources to your Ember project in 2 easy steps.</p>
</div>

<br>
<br>
<br>

Background
----------

This Ember addon is adapted from [ember-typeface](https://github.com/jeffjewiss/ember-typeface)

Installation
------------

```shell
ember install ember-fontsource
```

Usage
-----

1. Install Ember Fontsource: `ember install ember-fontsource`
2. Pick a fontsource from the list of over [800 available](https://github.com/jeffjewiss/ember-fontsource/blob/master/lib/typefaces.js) and add it to your project: `npm install fontsource-lato --save-dev`

That’s it!

You are now free to use `font-family: "Lato"` in your application’s styles.

Advanced Usage
--------------

Ember Fontsource will try to look through your `node_modules` to discover fontsource packages. If fontsources are specified in the config options in your app’s evironment: `ENV.fontsourceOptions.fontsources` the two lists will be merged for unique values. However, you can choose to disable this auto discovery and configure which fontsources are imported into your project.

```javascript
// config/environment.js
module.exports = function(environment) {
  let ENV = {
    ...

    fontsourceOptions: {
      disableAuto: true, // default is false, disable to manually choose fontsources
      fontsources: [
        'lato'
      ]
    }
  };
};
```

Commands
--------

* `ember fontsource:active` – view a list of the fontsources to be included in the app
* `ember fontsource:list` – view a list of all the available fontsources
* `ember fontsource:search <name>` – perform a fuzzy search on the list of fontsources
