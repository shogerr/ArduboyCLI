var extend = Object.assign || require('util')._extend

var shorthands = {
  'im': 'image'
}

var affordances = {
  'verison': 'version'
}

var cmdList = [
  'image'
]

var plumbing = []

module.exports.aliases = extend(extend({}, shorthands), affordances)
module.exports.shorthands = shorthands
module.exports.affordances = affordances
module.exports.cmdList = cmdList
module.exports.plumbing = plumbing

