/* eslint-env node */
'use strict';

const merge = require('deepmerge')
const globby = require('globby')
const fuzzysearch = require('fuzzysearch')
const titleize = require('titleize')
const humanizeString = require('humanize-string')
const detectInstalled = require('detect-installed')
const typefaceList = require('./lib/typefaces')
const VersionChecker = require('ember-cli-version-checker')

module.exports = {
  name: 'ember-typeface',

  init () {
    this._super.init && this._super.init.apply(this, arguments);

    let checker = new VersionChecker(this)
    let assertMessage = 'To use ember-typeface you must have ember-cli 2.16 or above.'

    checker
      .for('ember-cli')
      .assertAbove('2.16.0', assertMessage);
  },

  included (app) {
    let addonOptions = this._getAddonOptions(app).typefaceOptions || {}
    let typefaces = addonOptions.disableAuto ? [] : this._getTypefacesFromPackage()

    this._options = merge.all([{}, {
      typefaces
    }, addonOptions])


    if (!this._options.typefaces.length) {
      return;
    }

    this._checkTypefaces()
    this._createImports()
  },

  includedCommands: function() {
    return {
      'typeface:list': {
        name: 'typeface:list',
        description: 'Display a list of all the available typefaces.',
        works: 'insideProject',
        run () {
          for (let typeface of typefaceList) {
            this.ui.writeLine(`${titleize(humanizeString(typeface))} (${typeface})`)
          }
        }
      },
      'typeface:search': {
        name: 'typeface:search',
        description: 'Fuzzy search the list of available typefaces.',
        works: 'insideProject',
        anonymousOptions: [
          '<name>'
        ],
        run (commandOptions, rawArgs) {
          let name = rawArgs[0]
          let filteredTypefaceList = typefaceList
            .filter((typeface) => fuzzysearch(name.toLowerCase(), typeface.toLowerCase()))

          for (let typeface of filteredTypefaceList) {
            this.ui.writeLine(`${titleize(humanizeString(typeface))} (${typeface})`)
          }
        }
      }
    }
  },

  _getAddonOptions (app) {
    return (this.parent && this.parent.options) || (app && app.options) || {}
  },

  _checkTypefaces () {
    this._options.typefaces.forEach((typeface) => {
      if (!typefaceList.includes(typeface)) {
        throw new Error(`The font '${typeface}' is not supported. Please chose a font from the available list.`)
      }

      if (!detectInstalled.sync(`typeface-${typeface}`, { local: true })) {
        throw new Error(`The font package 'typeface-${typeface}' is not installed. Please add it to your project with NPM or Yarn.`)
      }
    })
  },

  _getTypefaceFiles (typeface) {
    return globby.sync(`node_modules/typeface-${typeface}/files`)
  },

  _createImports () {
    this._options.typefaces.filter(onlyUnique).forEach((typeface) => {
      this.import(`node_modules/typeface-${typeface}/index.css`, {
        destDir: 'assets/files'
      });

      this._getTypefaceFiles(typeface).forEach((fileName) => {
        this.import(fileName, {
          destDir: 'assets/files'
        });
      })
    })
  },

  _getTypefacesFromPackage () {
    return globby
      .sync('node_modules/typeface-*/', { nodir: false })
      .map((fullPath) => fullPath.replace('node_modules/', '').replace('/', '').replace('typeface-', '')
    )},
};

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index
}
