module.exports = set

set.usage = 'arduboy set <key> <value> (See `arduboy config`)'

var arduboy = require('./arduboy.js')

set.completion = arduboy.commands.config.completion

function set (args, cb) {
  if (!args.length) return cb(set.usage)
  arduboy.commands.config(['set'].concat(args), cb)
}
