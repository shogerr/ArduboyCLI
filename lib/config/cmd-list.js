var extend = Object.assign || require('util')._extend

var shorthands = {
  'hw': 'hardware',
  'im': 'image',
  'g' : 'generate',
  'c' : 'config'
}

var affordances = {
  'verison': 'version'
}

var cmdList = [
  'config',
  'set',
  'get',

  'image',
  'hardware',
  'generate',

  'edit',
  'help',
  'view',
  'edit',
  'bugs',
]

var plumbing = []

module.exports.aliases = extend(extend({}, shorthands), affordances)
module.exports.shorthands = shorthands
module.exports.affordances = affordances
module.exports.cmdList = cmdList
module.exports.plumbing = plumbing

