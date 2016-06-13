var extend = Object.assign || require('util')._extend

var shorthands = {
  'im': 'image',
  'c': 'config'
}

var affordances = {
  'verison': 'version'
}

var cmdList = [
  'config',
  'set',
  'get',
  'update',

  'image',

  'ls',
  'edit',
  'help',
  'view',
  'edit',
  'explore',
  'bugs',
  'prefix',
  'bin',

  'completion'
]

var plumbing = []

module.exports.aliases = extend(extend({}, shorthands), affordances)
module.exports.shorthands = shorthands
module.exports.affordances = affordances
module.exports.cmdList = cmdList
module.exports.plumbing = plumbing

