var umask = require('umask')
var log = require('npmlog')
var _fromString = umask.fromString

module.exports = umask

// fromString with logging callback
umask.fromString = function (val) {
  log.info("val is: " + val)
  _fromString(val, function (err, result) {
    if (err) {
      log.warn('invalid umask', err.message)
    }
    val = result
  })

  return val
}
