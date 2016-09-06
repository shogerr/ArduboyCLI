'use strict'

module.exports = init

var arduboy = require('./arduboy.js')
var fs = require('fs')

init.usage = usage(
    'arduboy init'
)

function init (args, cb) {
  return cb()
}

function unkown (cb) {
  cb('Usage: \n' + generate.usage)
}
