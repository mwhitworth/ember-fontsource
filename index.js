/* eslint-env node */
'use strict';

const merge = require('deepmerge')
const globby = require('globby')
const fuzzysearch = require('fuzzysearch')
const titleize = require('titleize')
const humanizeString = require('humanize-string')
const detectInstalled = require('detect-installed')
const VersionChecker = require('ember-cli-version-checker')
const typefaceList = require('./lib/typefaces')
const defaultOptions = { fontsources: [] }

module.exports = {
  name: 'ember-fontsource',

  init () {
    this._super.init && this._super.init.apply(this, arguments);

    let checker = new VersionChecker(this)
    let assertMessage = 'To use ember-fontsource you must have ember-cli 2.16 or above.'

    checker
      .for('ember-cli')
      .assertAbove('2.16.0', assertMessage);
  },

  included (app) {
    let fontsourceOptions = require(`${this.project.root}/config/environment`)(app.env).fontsourceOptions || defaultOptions
    let fontsources = fontsourceOptions.disableAuto ? [] : getFontSourcesFromPackage()

    this._options = merge.all([{}, {
      fontsources
    }, fontsourceOptions])


    if (!this._options.fontsources.length) {
      return;
    }

    this._checkFontSources()
    this._createImports()
  },

  includedCommands () {
    let emberEnv = process.env.EMBER_ENV || 'development'
    let fontsourceOptions = require(`${this.project.root}/config/environment`)(emberEnv).fontsourceOptions || defaultOptions

    return {
      'fontsource:active': {
        name: 'fontsource:active',
        description: 'Display a list of the active fontsources.',
        works: 'insideProject',
        run () {
          let fontsourceListFromConfig = fontsourceOptions.fontsources
            .filter((fontsource) => typefaceList.includes(fontsource.toLowerCase()))
          let fontsourceListFromPackages = getFontSourcesFromPackage()
            .filter((fontsource) => typefaceList.includes(fontsource.toLowerCase()))

          let fullFontSourceList = fontsourceOptions.disableAuto ?
            fontsourceListFromConfig :
            fontsourceListFromConfig.concat(fontsourceListFromPackages).filter(onlyUnique)

          if (!(fullFontSourceList.length > 0)) {
            this.ui.writeLine('There are no active fontsources.')
          }

          for (let fontsource of fullFontSourceList) {
            this.ui.writeLine(`${titleize(humanizeString(fontsource))} (${fontsource})`)
          }
        }
      },
      'fontsource:list': {
        name: 'fontsource:list',
        description: 'Display a list of all the available fontsources.',
        works: 'insideProject',
        run () {
          for (let fontsource of typefaceList) {
            this.ui.writeLine(`${titleize(humanizeString(fontsource))} (${fontsource})`)
          }
        }
      },
      'fontsource:search': {
        name: 'fontsource:search',
        description: 'Fuzzy search the list of available fontsources.',
        works: 'insideProject',
        anonymousOptions: [
          '<name>'
        ],
        run (commandOptions, rawArgs) {
          let name = rawArgs[0]
          let filteredFontSourceList = typefaceList
            .filter((fontsource) => fuzzysearch(name.toLowerCase(), fontsource.toLowerCase()))

          for (let fontsource of filteredFontSourceList) {
            this.ui.writeLine(`${titleize(humanizeString(fontsource))} (${fontsource})`)
          }
        }
      }
    }
  },

  _getAddonOptions (app) {
    return (this.parent && this.parent.options) || (app && app.options) || {}
  },

  _checkFontSources () {
    this._options.fontsources.forEach((fontsource) => {
      if (!typefaceList.includes(fontsource)) {
        throw new Error(`The font '${fontsource}' is not supported. Please chose a font from the available list.`)
      }

      if (!detectInstalled.sync(`fontsource-${fontsource}`, { local: true })) {
        throw new Error(`The font package 'fontsource-${fontsource}' is not installed. Please add it to your project with NPM.`)
      }
    })
  },

  _getFontSourceFiles (fontsource) {
    return globby.sync(`node_modules/fontsource-${fontsource}/files`)
  },

  _createImports () {
    this._options.fontsources.filter(onlyUnique).forEach((fontsource) => {
      this.import(`node_modules/fontsource-${fontsource}/index.css`, {
        destDir: 'assets/files'
      });

      this._getFontSourceFiles(fontsource).forEach((fileName) => {
        this.import(fileName, {
          destDir: 'assets/files'
        });
      })
    })
  },

};

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index
}

function getFontSourcesFromPackage () {
  return globby
    .sync('fontsource-*', { cwd: 'node_modules', onlyDirectories: true })
    .map((fullPath) => fullPath.replace('fontsource-', '')
  )}
