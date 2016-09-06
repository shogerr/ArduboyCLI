module.exports = generate
module.exports.yes = yes

var arduboy = require('./arduboy.js')
var usage = require('./utils/usage')
var log = require('npmlog')

var PZ = require('promzard').PromZard
var path = require('path')
var read = require('read')
var fs = require('fs')
var noProgressTillDone = require('./utils/no-progress-while-running').tillDone
var def = require.resolve('./default-input.js')

generate.usage = usage(
    'generate',
    'arduboy generate sketch --output=<file.ino>'
)

generate.subcommands = ['sketch']

generate.completion = function (opts, cb) {
  var argv = opts.conf.argv.remain
  if (argv[1] !== 'generate') argv.unshift('generate')

  if (argv.length === 2)
    return cb(null, generate.subcommands)

  var action = argv[2]
  switch (action) {
    case 'sketch':
    default:
      return cb(null, [])
  }
}

function generate (args, cb) {
  var action = args.shift()

  var dir = process.cwd()

  var initFile = arduboy.config.get('init-module')
  switch (action) {
    case 'sketch': 
      return generateProject(dir, initFile, arduboy.config, noProgressTillDone(function (err, data) {
                if (err && err.message === 'canceled') {
                  log.warn('generate', 'canceled')
                  return cb(null, data)
                }
                if (err) {
                  log.warn('generate', err)
                  return cb(null, data)
                }
                log.info('generate', 'written successfully')
                cb(err, data)
              }))
    default: return unknown(action, cb)
  }
}

function yes (conf) {
  return !!(
    conf.get('yes') || conf.get('y') ||
    conf.get('force') || conf.get('f')
  )
}

function validateName(name) {
  var errors = []
  var warnings = []

  log

  var done = function (warnings, errors) {
    var result = {
      validFilename: errors.length === 0 && warnings.length === 0,
      warnings: warnings,
      errors: errors
    }
    if (!result.warnings.length) delete result.warnings
    if (!result.errors.length) delete result.errors
    return result
  }

  if (name === null) {
    errors.push("Name cannot be null.")
    return done(warnings, errors)
  }

  if (name === undefined) {
    errors.push("Name cannot be undefined.")
    return done(warnings, errors)
  }

  if (typeof name !== 'string') {
    errors.push("Name must be a string")
    return done(warnings, errors)
  }

  if (!name.length)
    errors.push("Name length must be greater than zero.")

  if (name.length > 214)
    warnings.push("Name is longer than 214 characters.")

  if (name.match(/^\./))
    errors.push("Name cannot start with a period")

  if (name.match(/^_/))
    errors.push("Name cannot start with an underscore")

  if (name.match(/\s/))
    errors.push("Name cannot contain spaces")

  return done(warnings, errors)
}

function generateProject (dir, input, config, cb) {
  if (typeof config === 'function')
    cb = config, config = {}

  if (typeof config.get !== 'function') {
    var data = config
    config = {
      get: function (k) {
        return data[k]
      },
      toJSON: function () {
        return data
      }
    }
  }

  var inoTemplate = [
    '#include <Arduboy.h>',
    'Arduboy arduboy',
    '',
    'void setup()',
    '{',
    '  // setup code',
    '}',
    '',
    'void loop()',
    '{',
    '  // main instruction set, runs in loop',
    '}',
  ].join('\n')

  var ctx = { yes: yes(config) }
  ctx.config = config || {}

  var inoFile = ctx.config.get('output') || 'blank.ino'
  if (!validateName(path.basename(inoFile)).validFilename) return cb('Invalid filename')

  var pz = new PZ(input, ctx)
  pz.backupFile = def

  var d = inoTemplate
  pz.on('error', cb)
  pz.on('data', function (data) {
    function write (yes) {
      fs.writeFile(inoFile, d, 'utf8', function (err) {
        if (!err && yes && !config.get('silent')) {
          console.log('Wrote to %s:\n\n%s\n', inoFile, d)
        }
        return cb(err)
      })
    }
    if (ctx.yes)
      return write(true)

    console.log('About to write %s:\n\n%s\n', inoFile, d)

    read({prompt:'Is this ok? ', default: 'yes'}, function (err, ok) {
      if (!ok || ok.toLowerCase().charAt(0) !== 'y') {
        console.log('Aborted.')
        return cb({message: 'canceled'})
      }
      else
        return write()
    })
  })
}

function unknown (action, cb) {
  log.info('wat')
  cb('Usage: \n' + generate.usage)
}

