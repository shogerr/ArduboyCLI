#!/usr/bin/env node

;(function() {
  //process.title = 'arduboy'

  var log = require('npmlog')
  log.pause()

  log.info('worked if it ends with', 'ok')

  var path = require('path')
  var arduboy = require('../lib/arduboy.js')
  var arduboyconf = require('../lib/config/core.js')
  var errorHandler = require('../lib/utils/error-handler.js')

  var configDefs = arduboyconf.defs
  var shorthands = configDefs.shorthands
  var types = configDefs.types
  var nopt = require('nopt')

  log.verbose('cli', process.argv)

  var conf = nopt(types, shorthands)
  arduboy.argv = conf.argv.remain
  if (arduboy.deref(arduboy.argv[0])) arduboy.command = arduboy.argv.shift()
  else conf.usage = true

  if (conf.version) {
    console.log(arduboy.version)
    return
  }

  if (conf.versions) {
    arduboy.command = 'version'
    conf.usage = false
    arduboy.argv = []
  }

  log.info('using', 'arduboy@%s', arduboy.version)
  log.info('using', 'node@%s', process.version)

  process.on('uncaughtException', errorHandler)

  if (conf.usage && arduboy.command !== 'help')
  {
    arduboy.argv.unshift(arduboy.command)
    arduboy.command = 'help'
  }

  conf._exit = true
  arduboy.load(conf, function (er) {
    if (er) return errorHandler(er)
    arduboy.commands[arduboy.command](arduboy.argv, errorHandler)
  })
})()
