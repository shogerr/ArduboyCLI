module.exports = hardware

var arduboy = require('./arduboy.js')
var fs = require('fs')
var log = require('npmlog')
var usage = require('./utils/usage')
var async = require('async')

var Serialport = require('serialport')

hardware.usage = usage(
    'hardware',
    'arduboy hardware find'
)

hardware.subcommands = ['find']

hardware.completion = function (opts, cb) {
  var argv = opts.conf.argv.remain
  if (argv[1] !== 'hardware') argv.unshift('hardware')
  if (argv.length === 2)
    return cb(null, hardware.subcommands)

  action = argv[2]

  switch (action) {
    case 'find':
    default: return cb(new Error(argv[2] + ' not recognized'))
  }
}

function hardware (args, cb) {
  var action = args.shift()
  var params

  switch (action) {
    case 'find': return find(cb)
    default: return unknown(action, cb)
  }
}

function find (cb) {
  poll(cb)
}

function poll (cb) {
  Serialport.list(function (err, ports) {
    if (err) return cb(err)

    if (ports.length) {
      ports.forEach(function(port) {
        if (port.pnpId.indexOf('USB\\VID_2341&PID_8036&MI_00\\') > -1 ) {
          log.info("Found an Arduboy on " + arduboy.config.get('comport'))
        }
      })
    }
    else {
      return cb("No Arduboy found! Is it turned on?")
    }
  })

  return cb()
}

function unknown (action, cb) {
  cb('Usage: \n' + hardware.usage)
}

