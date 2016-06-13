module.exports = config

var log = require('npmlog')
var arduboy = require('./arduboy.js')
var arduboyconf = require('./config/core.js')
var fs = require('graceful-fs')
var writeFileAtomic = require('write-file-atomic')
var types = arduboyconf.defs.types
var ini = require('ini')
var editor = require('editor')
var os = require('os')
var umask = require('./utils/umask')
var usage = require('./utils/usage')

config.usage = usage(
  'config',
  'arduboy config set <key> <value>' +
  '\narduboy config get [<key>]' +
  '\narduboy config delete <key>' +
  '\narduboy config list' +
  '\narduboy config edit' +
  '\narduboy set <key> <value>' +
  '\narduboy get [<key>]'
)
config.completion = function (opts, cb) {
  var argv = opts.conf.argv.remain
  if (argv[1] !== 'config') argv.unshift('config')
  if (argv.length === 2) {
    var cmds = ['get', 'set', 'delete', 'ls', 'rm', 'edit']
    if (opts.partialWord !== 'l') cmds.push('list')
    return cb(null, cmds)
  }

  var action = argv[2]
  switch (action) {
    case 'set':
      // todo: complete with valid values, if possible.
      if (argv.length > 3) return cb(null, [])
      // fallthrough
      /*eslint no-fallthrough:0*/
    case 'get':
    case 'delete':
    case 'rm':
      return cb(null, Object.keys(types))
    case 'edit':
    case 'list': case 'ls':
      return cb(null, [])
    default: return cb(null, [])
  }
}

// arduboy config set key value
// arduboy config get key
// arduboy config list
function config (args, cb) {
  var action = args.shift()
  switch (action) {
    case 'set': return set(args[0], args[1], cb)
    case 'get': return get(args[0], cb)
    case 'delete': case 'rm': case 'del': return del(args[0], cb)
    case 'list': case 'ls': return list(cb)
    case 'edit': return edit(cb)
    default: return unknown(action, cb)
  }
}

function edit (cb) {
  var e = arduboy.config.get('editor')
  var which = arduboy.config.get('global') ? 'global' : 'user'
  var f = arduboy.config.get(which + 'config')
  if (!e) return cb(new Error('No EDITOR config or environ set.'))
  arduboy.config.save(which, function (er) {
    if (er) return cb(er)
    fs.readFile(f, 'utf8', function (er, data) {
      if (er) data = ''
      data = [
        ';;;;',
        '; arduboy ' + (arduboy.config.get('global')
                  ? 'globalconfig' : 'userconfig') + ' file',
        '; this is a simple ini-formatted file',
        '; lines that start with semi-colons are comments.',
        '; read `arduboy help config` for help on the various options',
        ';;;;',
        '',
        data
      ].concat([
        ';;;;',
        '; all options with default values',
        ';;;;'
      ]).concat(Object.keys(arduboyconf.defaults).reduce(function (arr, key) {
        var obj = {}
        obj[key] = arduboyconf.defaults[key]
        if (key === 'logstream') return arr
        return arr.concat(
          ini.stringify(obj)
            .replace(/\n$/m, '')
            .replace(/^/g, '; ')
            .replace(/\n/g, '\n; ')
            .split('\n'))
      }, []))
      .concat([''])
      .join(os.EOL)
      writeFileAtomic(
        f,
        data,
        function (er) {
          if (er) return cb(er)
          editor(f, { editor: e }, cb)
        }
      )
    })
  })
}

function del (key, cb) {
  if (!key) return cb(new Error('no key provided'))
  var where = arduboy.config.get('global') ? 'global' : 'user'
  arduboy.config.del(key, where)
  arduboy.config.save(where, cb)
}

function set (key, val, cb) {
  if (key === undefined) {
    return unknown('', cb)
  }
  if (val === undefined) {
    if (key.indexOf('=') !== -1) {
      var k = key.split('=')
      key = k.shift()
      val = k.join('=')
    } else {
      val = ''
    }
  }
  key = key.trim()
  val = val.trim()
  log.info('config', 'set %j %j', key, val)
  var where = arduboy.config.get('global') ? 'global' : 'user'
  if (key.match(/umask/)) val = umask.fromString(val)
  arduboy.config.set(key, val, where)
  arduboy.config.save(where, cb)
}

function get (key, cb) {
  if (!key) return list(cb)
  if (!publicVar(key)) {
    return cb(new Error('---sekretz---'))
  }
  var val = arduboy.config.get(key)
  if (key.match(/umask/)) val = umask.toString(val)
  console.log(val)
  cb()
}

function sort (a, b) {
  return a > b ? 1 : -1
}

function publicVar (k) {
  return !(k.charAt(0) === '_' ||
           k.indexOf(':_') !== -1 ||
           types[k] !== types[k])
}

function getKeys (data) {
  return Object.keys(data).filter(publicVar).sort(sort)
}

function list (cb) {
  var msg = ''
  var long = arduboy.config.get('long')

  var cli = arduboy.config.sources.cli.data
  var cliKeys = getKeys(cli)
  if (cliKeys.length) {
    msg += '; cli configs\n'
    cliKeys.forEach(function (k) {
      if (cli[k] && typeof cli[k] === 'object') return
      if (k === 'argv') return
      msg += k + ' = ' + JSON.stringify(cli[k]) + '\n'
    })
    msg += '\n'
  }

  // env configs
  var env = arduboy.config.sources.env.data
  var envKeys = getKeys(env)
  if (envKeys.length) {
    msg += '; environment configs\n'
    envKeys.forEach(function (k) {
      if (env[k] !== arduboy.config.get(k)) {
        if (!long) return
        msg += '; ' + k + ' = ' +
          JSON.stringify(env[k]) + ' (overridden)\n'
      } else msg += k + ' = ' + JSON.stringify(env[k]) + '\n'
    })
    msg += '\n'
  }

  // project config file
  var project = arduboy.config.sources.project
  var pconf = project.data
  var ppath = project.path
  var pconfKeys = getKeys(pconf)
  if (pconfKeys.length) {
    msg += '; project config ' + ppath + '\n'
    pconfKeys.forEach(function (k) {
      var val = (k.charAt(0) === '_')
              ? '---sekretz---'
              : JSON.stringify(pconf[k])
      if (pconf[k] !== arduboy.config.get(k)) {
        if (!long) return
        msg += '; ' + k + ' = ' + val + ' (overridden)\n'
      } else msg += k + ' = ' + val + '\n'
    })
    msg += '\n'
  }

  // user config file
  var uconf = arduboy.config.sources.user.data
  var uconfKeys = getKeys(uconf)
  if (uconfKeys.length) {
    msg += '; userconfig ' + arduboy.config.get('userconfig') + '\n'
    uconfKeys.forEach(function (k) {
      var val = (k.charAt(0) === '_')
              ? '---sekretz---'
              : JSON.stringify(uconf[k])
      if (uconf[k] !== arduboy.config.get(k)) {
        if (!long) return
        msg += '; ' + k + ' = ' + val + ' (overridden)\n'
      } else msg += k + ' = ' + val + '\n'
    })
    msg += '\n'
  }

  // global config file
  var gconf = arduboy.config.sources.global.data
  var gconfKeys = getKeys(gconf)
  if (gconfKeys.length) {
    msg += '; globalconfig ' + arduboy.config.get('globalconfig') + '\n'
    gconfKeys.forEach(function (k) {
      var val = (k.charAt(0) === '_')
              ? '---sekretz---'
              : JSON.stringify(gconf[k])
      if (gconf[k] !== arduboy.config.get(k)) {
        if (!long) return
        msg += '; ' + k + ' = ' + val + ' (overridden)\n'
      } else msg += k + ' = ' + val + '\n'
    })
    msg += '\n'
  }

  // builtin config file
  var builtin = arduboy.config.sources.builtin || {}
  if (builtin && builtin.data) {
    var bconf = builtin.data
    var bpath = builtin.path
    var bconfKeys = getKeys(bconf)
    if (bconfKeys.length) {
      msg += '; builtin config ' + bpath + '\n'
      bconfKeys.forEach(function (k) {
        var val = (k.charAt(0) === '_')
                ? '---sekretz---'
                : JSON.stringify(bconf[k])
        if (bconf[k] !== arduboy.config.get(k)) {
          if (!long) return
          msg += '; ' + k + ' = ' + val + ' (overridden)\n'
        } else msg += k + ' = ' + val + '\n'
      })
      msg += '\n'
    }
  }

  // only show defaults if --long
  if (!long) {
    msg += '; node bin location = ' + process.execPath + '\n' +
           '; cwd = ' + process.cwd() + '\n' +
           '; HOME = ' + process.env.HOME + '\n' +
           '; "arduboy config ls -l" to show all defaults.\n'

    console.log(msg)
    return cb()
  }

  var defaults = arduboyconf.defaults
  var defKeys = getKeys(defaults)
  msg += '; default values\n'
  defKeys.forEach(function (k) {
    if (defaults[k] && typeof defaults[k] === 'object') return
    var val = JSON.stringify(defaults[k])
    if (defaults[k] !== arduboy.config.get(k)) {
      msg += '; ' + k + ' = ' + val + ' (overridden)\n'
    } else msg += k + ' = ' + val + '\n'
  })
  msg += '\n'

  console.log(msg)
  return cb()
}

function unknown (action, cb) {
  cb('Usage:\n' + config.usage)
}
