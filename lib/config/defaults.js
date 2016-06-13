var path = require('path')
var url = require('url')
var Stream = require('stream').Stream
var semver = require('semver')
var nopt = require('nopt')
var os = require('os')
var osenv = require('osenv')
var umask = require('../utils/umask')
var hasUnicode = require('has-unicode')

var log
try {
  log = require('npmlog')
} catch (er) {
  var util = require('util')
  log = { warn: function (m) {
    console.warn(m + ' ' + util.format.apply(util, [].slice.call(arguments, 1)))
  } }
}

exports.Umask = Umask
function Umask () {}
function validateUmask (data, k, val) {
  return umask.validate(data, k, val)
}

function validateSemver (data, k, val) {
  if (!semver.valid(val)) return false
  data[k] = semver.valid(val)
}

function validateStream (data, k, val) {
  if (!(val instanceof Stream)) return false
  data[k] = val
}

nopt.typeDefs.semver = { type: semver, validate: validateSemver }
nopt.typeDefs.Stream = { type: Stream, validate: validateStream }
nopt.typeDefs.Umask = { type: Umask, validate: validateUmask }

nopt.invalidHandler = function (k, val, type) {
  log.warn('invalid config', k + '=' + JSON.stringify(val))

  if (Array.isArray(type)) {
    if (type.indexOf(url) !== -1) type = url
    else if (type.indexOf(path) !== -1) type = path
  }

  switch (type) {
    case Umask:
      log.warn('invalid config', 'Must be umask, octal number in range 0000..0777')
      break
    case url:
      log.warn('invalid config', "Must be a full url with 'http://'")
      break
    case path:
      log.warn('invalid config', 'Must be a valid filesystem path')
      break
    case Number:
      log.warn('invalid config', 'Must be a numeric value')
      break
    case Stream:
      log.warn('invalid config', 'Must be an instance of the Stream class')
      break
  }
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

    color: true,

    group: process.platform === 'win32' ? 0
            : process.env.SUDO_GID || (process.getgid && process.getgid()),
    heading: 'arduboy',
    prefix: globalPrefix,

    'user-agent': 'arduboy/{arduboy-version} ' +
                  'node/{node-version} ' +
                  '{platform} ' +
                  '{arch}',

    'onload-script': false,
    shell: osenv.shell(),
    tmp: temp,
    unicode: hasUnicode(),

    usage: false,
    user: process.platform === 'win32' ? 0 : 'nobody',
    userconfig: path.resolve(home, '.arduboyrc'),
    umask: process.umask ? process.umask() : umask.fromString('022'),
    version: false,
    versions: false,
    viewer: process.platform === 'win32' ? 'browser' : 'man',
    _exit: true
  }

  return defaults
}})

exports.types = {
  browser: [null, String],
  color: ['always', Boolean],
  group: [Number, String],
  'user-agent': String,
  'heading': String,
  'onload-script': [null, String],
  input: path,
  output: path,
  prefix: path,
  shell: String,
  tmp: path,
  usage: Boolean,
  user: [Number, String],
  userconfig: path,
  umask: Umask,
  unicode: Boolean,
  version: Boolean,
  viewer: String,
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

