module.exports = image

var log = require('npmlog')
var arduboy = require('./arduboy.js')
var usage = require('./utils/usage')
var read = require('read')
var gm = require('gm')
var fs = require('fs')
var mkdir = require('mkdirp')


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
    log.warn(JSON.stringify(size))
  })

  gm(args)
  .setFormat('PBM')
  .toBuffer(function (err, buf) {
    if (err) return cb(err)
    fs.writeFile('./tmp/converted_output.PBM', buf, function(err) {
      if (err) return cb(err)
      log.info("Created pbm file")
    })

    var buf_ = parseImgBuffer(buf)
    //log.info(buf.readUInt8(buf.length-3))
    return cb()
  })
}

function parseImgBuffer() {
  if (!(arguments.length > 0)) return
  var arr = new Uint8Array(arguments[0])
  log.info(arr)
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
    if (err) return cb(er)
    return cb()
  })
}

var generateSinglePixel = function generateSinglePixel(cb) {
  var output = 'single_pixel.ppm'
  gm(1,1, "#FFFFFF")
  .write("./tmp/"+output, function (err) {
    if (err) return cb(err)
    log.info( 'Created: ' + output )
  })
}

var generateCheckerboard = function generateSinglePixel(cb) {
  w = arguments[1]
  h = arguments[2]
  log.info(w)
  log.info(h)
  var output = 'checkerboard.pbm'
  gm(w, h)
  .out('pattern:checkerboard')
  .write("./tmp/" + output, function (err) {
    if (err) return cb(err)
    log.info( 'Created: ' + output )
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
      if (err) return cb(err)
      log.info('created: ' + imageOutput)
    })
}

function test (cb) {
  tmpdir = './tmp'
  mkdir(tmpdir, function(err) {
    if (err) return cb(err)
  })
  generateSinglePixel(cb)
  generateCheckerboard(cb,30,30)
  generateTestImage(cb)
  cb()
}

function unknown (action, cb) {
  cb('Image: \n' + image.usage)
}
