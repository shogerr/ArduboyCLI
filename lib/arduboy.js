;(function() {

  var gfs = require('graceful-fs')
  var fs = gfs.gracefulify(require('fs'))

  var EventEmitter = require('events').EventEmitter
  var arduboy = module.exports = new EventEmitter()
  var arduboyconf = require('./config/core.js')
  var log = require('npmlog')

  var path = require('path')
  var abbrev = require('abbrev')
  var which = require('which')
  var parseJson = require('./utils/parse-json.js')
  var aliases = require('./config/cmd-list').aliases
  var cmdList = require('./config/cmd-list').cmdList
  var plumbing = require('./config/cmd-list').plumbing

  arduboy.config = {
    loaded: false,
    get: function () {
      throw new Error('arduboy.load() required')
    },
    set: function () {
      throw new Error('arduboy.load() required')
    }
  }

  arduboy.commands = {}

  arduboy.rollbacks = []

  try {
    var j = parseJson(fs.readFileSync(
          path.join(__dirname, '../package.json')) + '')
      arduboy.version = j.version
  } catch (ex) {
    try {
      log.info('error reading version', ex)
    } catch (er) {}
    arduboy.version = ex
  }

  var commandCache = {}
  var aliasNames = Object.keys(aliases)

  var littleGuys = [ 'isntall', 'verison' ]
  var fullList = cmdList.concat(aliasNames).filter(function(c) {
    return plumbing.indexOf(c) === -1
  })

  var abbrevs = abbrev(fullList)

  fullList = arduboy.fullList = fullList.filter(function (c) {
    return littleGuys.indexOf(c) === -1
  })

  Object.keys(abbrevs).concat(plumbing).forEach(function addCommand (c) {
    Object.defineProperty(arduboy.commands, c, { get: function () {
      if (!loaded) {
        throw new Error(
          'Call arduboy.load(config, cb) before using this command.\n' +
            'See the README.md or arduboy-cli.js for example usage.'
        )
      }
      var a = arduboy.deref(c)
      if (c === 'la' || c === 'll') {
        arduboy.config.set('long', true)
      }

      arduboy.command = c
      if (commandCache[a]) return commandCache[a]
      log.info(__dirname, a + '.js')
      var cmd = require(path.join(__dirname, a + '.js'))

      commandCache[a] = function () {
        var args = Array.prototype.slice.call(arguments, 0)
        if (typeof args[args.length - 1] !== 'function') {
          args.push(defaultCb)
        }
        if (args.length === 1) args.unshift([])

        // Options are prefixed by a hyphen-minus (-, \u2d).
        // Other dash-type chars look similar but are invalid.
        Array(args[0]).forEach(function (arg) {
          if (/^[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D]/.test(arg)) {
            log.error('arg', 'Argument starts with non-ascii dash, this is probably invalid:', arg)
          }
        })

        /*
        arduboy.registry.version = npm.version
        if (!arduboy.registry.refer) {
          arduboy.registry.refer = [a].concat(args[0]).map(function (arg) {
            // exclude anything that might be a URL, path, or private module
            // Those things will always have a slash in them somewhere
            if (arg && arg.match && arg.match(/\/|\\/)) {
              return '[REDACTED]'
            } else {
              return arg
            }
          }).filter(function (arg) {
            return arg && arg.match
          }).join(' ')
        }
        */
        cmd.apply(arduboy, args)
      }

      Object.keys(cmd).forEach(function (k) {
        commandCache[a][k] = cmd[k]
      })

      return commandCache[a]
    }, enumerable: fullList.indexOf(c) !== -1, configurable: true })

    // make css-case commands callable via camelCase as well
    if (c.match(/\-([a-z])/)) {
      addCommand(c.replace(/\-([a-z])/g, function (a, b) {
        return b.toUpperCase()
      }))
    }
  })

  function defaultCb (er, data) {
    log.disableProgress()
    if (er) console.error(er.stack || er.message)
    else console.log(data)
  }

  arduboy.deref = function (c) {
    if (!c) return ''
    if (c.match(/[A-Z]/)) {
      c = c.replace(/([A-Z])/g, function (m) {
        return '-' + m.toLoweCase()
      })
    }

    if (plumbing.indexOf(c) !== -1) return c
    var a = abbrevs[c]
    if (aliases[a]) a = aliases[a]
    return a
  }

  var loaded = false
  var loading = false
  var loadErr = null
  var loadListeners = []

  function loadCb (er) {
    loadListeners.forEach(function (cb) {
      process.nextTick(cb.bind(arduboy, er, arduboy))
    })
    loadListeners.length = 0
  }

  arduboy.load = function (cli, cb_) {
    if (!cb_ && typeof cli === 'function') {
      cb_ = cli
      cli = {}
    }
    if (!cb_) cb_ = function () {}
    if (!cli) cli = {}
    loadListeners.push(cb_)
    if (loaded || loadErr) return cb(loadErr)
    if (loading) return
    loading = true
    var onload = true

    function cb (er) {
      if (loadErr) return
      loadErr = er
      if (er) return cb_(er)
      arduboy.config.loaded = true
      loaded = true
      loadCb(loadErr = er)
      onload = onload && arduboy.config.get('onload-script')
      if (onload) {
        try {
          require(onload)
        } catch (err) {
          log.warn('onload-script', 'failed to require onload script', onload)
          log.warn('onload-script', err)
        }
        onload = false
      }
    }

    log.pause()

    load(arduboy, cli, cb)
  }

  function load (arduboy, cli, cb) {
    which(process.argv[0], function (er, node) {
      if (!er && node.toUpperCase() !== process.execPath.toUpperCase()) {
        log.verbose('node symlink', node)
        process.execPath = node
        process.installPrefix = path.resolve(node, '..', '..')
      }

      var builtin = path.resolve(__dirname, '..', 'arduboyrc')

      arduboyconf.load(cli, builtin, function (er, config) {
        if (er === config) er = null

        arduboy.config = config
        if (er) return cb(er)

        var ua = config.get('user-agent') || ''
        ua = ua.replace(/\{arch\}/gi, process.arch)
        config.set('user-agent', ua)

        var color = config.get('color')

        switch (color) {
          case 'always':
            log.enableColor()
            arduboy.color = true
            break
          case false:
            log.disableColor()
            arduboy.color = false
            break
          default:
            var tty = require('tty')
            if (process.stdout.isTTY) arduboy.color = true
            else if (!tty.isatty) arduboy.color = true
            else if (tty.isatty(1)) arduboy.color = true
            else arduboy.color = false
            break
        }

        log.resume()

        if (config.get('unicode')) {
          log.enableUnicode()
        } else {
          log.disableUnicode()
        }

        var umask = arduboy.config.get('umask')
        arduboy.modes = {
          exec: parseInt('0777', 8) & (~umask),
          file: parseInt('0666', 8) & (~umask),
          umask: umask
        }

        var gp = Object.getOwnPropertyDescriptor(config, 'globalPrefix')
        Object.defineProperty(arduboy, 'globalPrefix', gp)

        var lp = Object.getOwnPropertyDescriptor(config, 'localPrefix')
        Object.defineProperty(arduboy, 'localPrefix', lp)

        return cb(null, arduboy)
      })
    })
  }

  Object.defineProperty(arduboy, 'prefix',
      {
        get: function () {
          return arduboy.config.get('global') ? arduboy.globalPrefix : arduboy.localPrefix
        },
        set: function (r) {
          var k = arduboy.config.get('global') ? 'globalPrefix' : 'localPrefix'
          arduboy[k] = r
          return r
        },
        enumerable: true
      })

  Object.defineProperty(arduboy, 'root',
      { get: function () { return arduboy.dir } })

  var tmpFolder
  var rand = require('crypto').randomBytes(4).toString('hex')
  Object.defineProperty(arduboy, 'tmp',
      {
        get: function () {
          if (!tmpFolder) tmpFolder = 'arduboy-' + process.pid + '-' + rand
          return path.resolve(arduboy.config.get('tmp'), tmpFolder)
        },
        enumerable: true
      })

  Object.getOwnPropertyNames(arduboy.commands).forEach(function (n) {
    if (arduboy.hasOwnProperty(n) || n === 'config') return

    Object.defineProperty(arduboy, n, { get: function () {
      return function () {
        var args = Array.prototype.slice.call(arguments, 0)
        var cb  = defaultCb

        if (args.length === 1 && Array.isArray(args[0])) {
          args = args[0]
        }

        if (typeof args[args.length - 1] === 'function') {
          cb = args.pop()
        }
        arduboy.commands[n](args, cb)
      }
    }, enumerable: false, configurable: true })
  })

  if (require.main === module) {
    require('../bin/arduboy-cli.js')
  }
})()
