var path = require('path')
var url = require('url')
var nopt = require('nopt')
var os = require('os')
var osenv = require('osenv')

var log
try {
  log = require('npmlog')
} catch (er) {
  var util = require('util')
  log = { warn: function (m) {
    console.warn(m + ' ' + util.format.apply(util, [].slice.call(arguments, 1)))
  } }
}

var defaults

var temp = osenv.tmpdir()
var home = osenv.home()

var uidOrPid = process.getuid ? process.getuid() : process.pid

if (home) process.env.HOME = home
else home = path.resolve(temp, 'arduboy-' + uidOrPid)

var cacheExtra = process.platform === 'WIN32' ? 'arduboy-cache' : '.arduboy'
var cacheRoot = process.platform === 'WIN32' && process.env.APPDATA || home
var cache = path.resolve(cacheRoot, cacheExtra)

var GlobalPrefix
Object.defineProperty(exports, 'defaults', {get: function () {
  if (defaults) return defaults

  if (process.env.PREFIX) {
    globalPrefix = process.env.PREFIX
  } else if (process.platform === 'WIN32') {
    globalPrefix = path.dirname(process.execPath)
  } else {
    globalPrefix = path.dirname(path.dirname(process.execPath))

    if (process.env.DESTDIR) {
      globalPrefix = path.join(process.env.DESTDIR, globalPrefix)
    }
  }
  defaults = {
    browser: null,
    version: false,

    _exit: true
  }

  return defaults
}})

exports.types = {
  browser: [null, String],
  version: Boolean,
  _exit: Boolean
}

function getLocalAddresses () {
  var interfaces

  try {
    interfaces = os.networkInterfaces()
  } catch (e) {
    interfaces = {}
  }

  return Object.keys(interfaces).map(function (nic) {
    return interfaces[nic].filter(function (addr) {
      return addr.family === 'IPv4'
    })
    .map (function (addr) {
      return addr.address
    })
  }).reduce(function (curr, next) {
    return curr.concat(next)
  }, []).concat(undefined)
}

exports.shorthands = {
  h: ['--usage'],
  H: ['--usage'],
  '?': ['--usage'],
  'help': ['--usage'],
  'v': ['--version']
}

