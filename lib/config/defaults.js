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
    comport: '',
    dev: true,
    editor: osenv.editor(),
    'engine-strict': false,
    force: false,

    'fetch-retries': 2,
    'fetch-retry-mintimeout': 10000,

    git: 'git',

    global: false,
    globalconfig: path.resolve(globalPrefix, 'etc', 'arduboyrc'),
    'global-style': false,
    group: process.platform === 'win32' ? 0
            : process.env.SUDO_GID || (process.getgid && process.getgid()),
    heading: 'arduboy',
    'if-present': false,
    'ignore-scripts': false,
    'init-module': path.resolve(home, '.arduboy-init.js'),
    json: false,
    key: null,
    loglevel: 'warn',
    logstream: process.stderr,
    long: false,
    maxsockets: 50,
    message: '%s',
    'node-version': process.version,
    'onload-script': false,
    parseable: false,
    prefix: globalPrefix,
    production: process.env.NODE_ENV === 'production',
    'progress': !process.env.TRAVIS && !process.env.CI,
    proxy: null,
    'https-proxy': null,
    'user-agent': 'arduboy/{arduboy-version} ' +
                  'node/{node-version} ' +
                  '{platform} ' +
                  '{arch}',
    registry: 'https://registry.arduboy.com/',
    rollback: true,
    save: false,
    'save-prefix': '^',
    scope: '',
    searchopts: '',
    searchexclude: null,
    searchsort: 'name',
    shell: osenv.shell(),
    tmp: temp,
    unicode: hasUnicode(),
    'unsafe-perm': process.platform === 'win32' ||
                      process.platform === 'cygwin' ||
                      !(process.getuid && process.setuid &&
                        process.getgid && process.setgid) ||
                      process.getuid() !== 0,

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
  access: [null, 'restricted', 'public'],
  browser: [null, String],
  ca: [null, String, Array],
  cafile: path,
  cach: path,
  'cache-lock-stale': Number,
  'cache-lock-retries': Number,
  'cache-lock-wait': Number,
  'cache-max': Number,
  'cache-min': Number,
  color: ['always', Boolean],
  description: Boolean,
  dev: Boolean,
  editor: String,
  'engine-strict': Boolean,
  force: Boolean,
  'fetch-retries': Number,
  'fetch-retry-factor': Number,
  'fetch-retry-mintimeout': Number,
  'fetch-retry-maxtimeout': Number,
  git: String,
  global: Boolean,
  globalconfig: path,
  group: [Number, String],
  'https-proxy': [null, url],
  'user-agent': String,
  'heading': String,
  'if-present': Boolean,
  'ignore-scripts': Boolean,
  'init-module': path,
  json: Boolean,
  key: [null, String],
  'local-address': getLocalAddresses(),
  loglevel: ['silent', 'error', 'warn', 'http', 'info', 'verbose', 'silly'],
  logstream: Stream,
  long: Boolean,
  maxsockets: Number,
  message: String,
  'node-version': [null, String],
  parseable: Boolean,
  prefix: path,
  production: Boolean,
  progress: Boolean,
  proxy: [null, false, url],
  registry: [null, url],
  rollback: Boolean,
  save: Boolean,
  'save-prefix': String,
  scope: String,
  searchopts: String,
  searchexclude: [null, String],
  searchsort: [
    'name', '-name',
    'description', '-description',
    'author', '-author',
    'date', '-date',
    'keywords', '-keywords'
  ],
  comport: String,
  shell: String,
  'onload-script': [null, String],
  tmp: path,
  unicode: Boolean,
  usage: Boolean,
  'unsafe-perm': Boolean,
  usage: Boolean,
  user: [Number, String],
  userconfig: path,
  umask: Umask,
  version: Boolean,
  versions: Boolean,
  viewer: String,

  input: path,
  output: path,

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
  s: ['--loglevel', 'silent'],
  d: ['--loglevel', 'info'],
  dd: ['--loglevel', 'verbose'],
  silent: ['--loglevel', 'silent'],
  verbose: ['--loglevel', 'verbose'],
  quiet: ['--loglevel', 'warn'],
  q: ['--loglevel', 'warn'],
  h: ['--usage'],
  H: ['--usage'],
  '?': ['--usage'],
  help: ['--usage'],
  v: ['--version']
}

