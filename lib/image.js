module.exports = image

var log = require('npmlog')
var arduboy = require('./arduboy.js')
var usage = require('./utils/usage')
var read = require('read')
var gm = require('gm')
var fs = require('fs')


image.usage = usage(
    'image',
    'arduboy image [--input=filename] [--output=filename]'
)

image.subcommands = ['convert', 'test']

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
  log.info(JSON.stringify(args))
  var action = args.shift()
  var params
  //parseParams(cmd, args, cb)
  switch (action) {
    case 'test': return test(cb)
    case 'tobytes': return toBytes(arduboy.config.get('input'), cb)
    default: return unknown(action, cb)
  }
}

function parseParams (cmd, args, cb) {
  if (cmd === 'convert') {
    convertImage(arduboy.config.get('input'), cb)
  }
  else if (cmd === 'tobytes') {
    toBytes(arduboy.config.get('input'), cb)
  }
  else cb()
}

function toBytes (args, cb) {
  var size
  gm(args)
  .size(function (err, _size) {
    if (err) return cb(err)
    size = _size
  })
  gm(args)
  .setFormat('PPM')
  .toBuffer(function (err, buf) {
    if (err) return cb(err)
    //log.info(JSON.stringify(size))

    //var buf_ = parseImgBuffer(buf)
    //log.info(buf.readUInt8(buf.length-3))
    return cb()
  })
  /*
  .stream(function (err, stdout, stderr) {
    if (err) return cb(err)

    var arr = []

    stdout.on('data', function (data) {
      arr.push(data.readUInt8(data.length-3))
    })

    stdout.on('end', function() {
      log.info(JSON.stringify(arr))
    })

    log.info(arr)
    return cb()
  })
  */
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

function parseImgBuffer() {
  if (!(arguments.length > 0)) return
  var arr = new Uint8Array(arguments[0])
  log.info(arr)
  return 0
}

function _parseImgBuffer() {
  if (!(arguments.length > 1)) return
  var arr = new Uint8Array(arguments[0])
  var size = arguments[1]
  for (var i = 0; i < size.hieght/8; i++) {
    for (var j = 0; j < size.width; j++) {
    }
  }

  log.info(arr)
  return 0
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

var generateTestImage = function generateTestImage (cb) {
  var imageOutput = ''
  gm(128, 64, "#000000")
    .stroke("#ffffff")
    .drawRectangle(28, 2, 100, 90, 2, 2)
    // screen
    .drawRectangle(32, 6, 96, 38, 2, 2)
    .drawText(36, 24, "Arduboy")
    .font(__dirname + "/../html/PressStart2p.ttf", 8)
    // buttons
    .drawCircle(72, 65, 77, 65)
    .drawCircle(87, 60, 92, 60)
    // write image
    .write((imageOutput="./tmp/test_img"+Math.random()+".png"), function (err) {
      if (err) {
        return cb(err)
      }
      log.info('created: ' + imageOutput)
    })
}

function test (cb) {
  generateTestImage(cb)
  cb()
}

function unknown (action, cb) {
  cb('Image: \n' + image.usage)
}
