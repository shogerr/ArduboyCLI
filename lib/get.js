module.exports = get

get.usage = "arduboy get <key> <value> (See `arduboy config`)'

var arduboy = require('./arduboy.js')

get.completion = arduboy.commands.config.completion

function get (args, cb) {
  arduboy.commands.config(['get'].concat(args, cb)
}
