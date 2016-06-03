#!/usr/bin/env node

;(function() {
  process.title = 'arduboy'

  var log = require('npmlog')
  log.pause()

  var path = require('path')
  var arduboy = require('../lib/arduboy.js')
  var arduboyconf = require('../lib/config/core.js')
  var errorHandler = require('../lib/utils/error-handler.js')

  var configDefs = arduboyconf.defs
  var types = configDefs.types
  var nopt = require('nopt')

  log.verbose('cli', process.argv)

  var conf = nopt(types, shorthands)

  arduboy.load(conf, function (er) {
    if (er) return errorHandler(er)
    arduboy.commands[npm.command](npm.argv, errorHandler)
  })


})()
