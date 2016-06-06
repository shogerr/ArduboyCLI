module.exports = image

var log = require('npmlog')
var arduboy = require('./arduboy.js')
var usage = require('./utils/usage')
var read = require('read')
var gm = require('gm');


image.usage = usage(
    'image',
    'arduboy image [--input=filename] [--output=filename] [--i2h]'
)

function image (args, cb) {
  gm(128, 64, "#000000")
    .font("Arial.ttf", 12)
    .stroke("#ffffff")
    //.drawText(32, 32, "test")
    .drawRectangle(46, 5, 86, 60, 2, 2)
    .drawRectangle(50, 7, 82, 30, 2, 2)
    .drawCircle(73, 46, 76, 46)
    .drawCircle(79, 42, 82, 42)
    .write("./tmp/test_img.png", function (err) {
      if (err) {
        return cb(err)
      }
      log.silly('created')
    });
  cb()
}

