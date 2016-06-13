module.exports = image

var log = require('npmlog')
var arduboy = require('./arduboy.js')
var usage = require('./utils/usage')
var read = require('read')
var gm = require('gm')
var fs = require('fs')


image.usage = usage(
    'image',
    'arduboy image [--input=filename] [--output=filename] [--i2h]'
)

image.subcommands = ['convert']

image.completion = function (opts, cb) {
  var argv = opts.conf.argv.remain
  if (argv.length === 2) {
    return cb(null, image.subcommands)
  }

  switch (argv[2]) {
    case 'convert':
    default:
      return cb(new Error(argv[2] + ' not recognized'))
  }
}

function image (args, cb) {
  var cmd = args.shift()
  var params
  parseParams(cmd, args, cb)
}

function parseParams (cmd, args, cb) {
  if (cmd === 'convert') {
    convertImage(arduboy.config.get('input'), cb)
  }
  if (cmd === 'tobytes') {
    toBytes(arduboy.config.get('input'), cb)
  }
}

function toBytes (args, cb) {
  log.info(args)
  gm(args)
  .colorspace('GRAY')
  .stream(function (err, stdout, stderr) {
    if (err) return cb(er)

    var arr = []

    stdout.on('data', function (data) {
      arr.push(data)
    })

    stdout.on('end', function() {
      log.info(JSON.stringify(arr))
    })

    log.info(arr)
    return cb()
  })
  /*
  fs.readFile(args, 'binary', function(err, data) {
    if (err) return cb(er)
    log.info(data)
    var arr = new Uint16Array(data)
    log.info(arr)
    return cb()
  })
  */
}

function convertImage (img, cb) {
  var img_ = './tmp/output.png'
  gm(img)
  .resize(128, 64)
  .colorspace('GRAY')
  .colors(2)
  .type('Bilevel')
  .write(img_, function (er) {
    if (!er) return cb(er)
    return cb()
  })
}

function generateTestImage () {
  gm(128, 64, "#000000")
    .font("Arial.ttf", 12)
    .stroke("#ffffff")
    .drawText(32, 32, "test")
    .drawRectangle(46, 5, 86, 60, 2, 2)
    .drawRectangle(50, 7, 82, 30, 2, 2)
    .drawCircle(73, 46, 76, 46)
    .drawCircle(79, 42, 82, 42)
    .write("./tmp/test_img.png", function (err) {
      if (err) {
        return cb(err)
      }
      log.info('created')
    })
}
