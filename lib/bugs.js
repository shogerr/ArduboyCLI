module.exports = bugs

var arduboy = require('./arduboy.js')
var log = require('npmlog')
var opener = require('opener')
//var fetchPackageMetadata = require('./fetch-package-metadata.js')
var usage = require('./utils/usage')

bugs.usage = usage(
  'bugs',
  'arduboy bugs [<pkgname>]'
)

bugs.completion = function (opts, cb) {
  // FIXME: there used to be registry completion here, but it stopped making
  // sense somewhere around 50,000 packages on the registry
  cb()
}

function bugs (args, cb) {
  var n = args.length ? args[0] : '.'
  /*
  fetchPackageMetadata(n, '.', function (er, d) {
    if (er) return cb(er)

    var url = d.bugs && ((typeof d.bugs === 'string') ? d.bugs : d.bugs.url)
    if (!url) {
      url = 'https://github.com/rogosher/ArduboyCLI/' + d.name
    }
    log.silly('bugs', 'url', url)
    opener(url, { command: npm.config.get('browser') }, cb)
  })
  */
  var url 

  url = 'https://github.com/rogosher/ArduboyCLI/issues'
  opener(url, { command: arduboy.config.get('browser') }, cb)
}
