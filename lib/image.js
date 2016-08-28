module.exports = image

var debug = require('debug')('gm')
var log = require('npmlog')
var arduboy = require('./arduboy.js')
var usage = require('./utils/usage')
var read = require('read')
var gm = require('gm').subClass({imageMagick: true})
var fs = require('fs')
var mkdir = require('mkdirp')

image.usage = usage(
    'arduboy image test',
    'arduboy image tobytes [--input=filename] [--output=filename]'
)

image.subcommands = ['convert', 'test', 'tobytes']

image.completion = function (opts, cb) {
  var argv = opts.conf.argv.remain
  if (argv.length === 2) {
    return cb(null, image.subcommands)
  }

  switch (argv[2]) {
    default:
      return cb(new Error(argv[2] + ' not recognized'))
  }
}

function image (args, cb) {
  var action = args.shift()
  var params
  switch (action) {
    case 'test': return test(cb)
    case 'tobytes': return toBytes(arduboy.config.get('input'), cb)
    default: return unknown(action, cb)
  }
}

function toBytes (args, cb) {
  gm(args)
  .identify(function (err, val) {
    if (err) return cb(err)
    debug(JSON.stringify(val))
  })


  gm(args)
  .setFormat('PBM')
  .bitdepth(1)
  .colors(2)
  .compress('None')
  .toBuffer(function (err, buf) {
    if (err) return cb(err)
    debug(buf)
    fs.writeFile('./tmp/converted_output.pbm', buf, function(err) {
      if (err) return cb(err)
      log.info("Created pbm file")
    })

    var buf_ = parseImgBuffer(buf)
    //log.info(buf.readUInt8(buf.length-3))
    debug(buf_)
    printCCompat(buf_)
    return cb()
  })
}

function printCCompat(buf) {
  for (var i = 0; i < buf.length; i++) {
    process.stdout.write(buf[i])
    if (i > 0 && i % 8 === 0) process.stdout.write('\n')
  }
  process.stdout.write('\n')
}

function parseImgBuffer() {
  if (!(arguments.length > 0)) return

  var arr = new Uint8Array(arguments[0])

  if (arr.legth < 1 || arr[0] !== 80 && arr[1] !== 49)
    return cb("Must parse a PBM file.")

  var barr = []

  var offset = 0    // array offset
  var pflag = false // flag for parsing magic number
  var height = ''   // image height
  var width = ''    // image width
  var i = 0         // iterator
  var m = 8         // width of a byte
  var aByte = ''    // a byte used for processing


loop:
  for (i = 3; i < arr.length; i++) {
    if (pflag === true) {
      if (arr[i] === 10) break loop
      height = height + (arr[i] - 48)
    }
    else {
      if (arr[i] === 32) {
        pflag = true
        continue loop
      }
      width = width + (arr[i] - 48)
    }
  }


  // push needed characters to new array
  for (i += 1; i < arr.length; i++) {
    if (arr[i] === 48 || arr[i] === 49)
      barr.push(arr[i])
  }


  var offset
  var bit
  var k
  var byteArray = []
  for (i = 0; i < Math.ceil(height/m); i++) {
    for (j = 0; j < width; j++) {
      k = 0
      aByte = ''
      while (k < m) {
        offset = i*width*m + k*width + j
        if (typeof barr[offset] !== 'undefined') {
          bit = barr[offset] - 48
          bit ^= 1 
        }
        else
          bit = 0
        aByte = '' + bit + aByte
        k++
      }
      aByte = parseInt(aByte, 2).toString(16)
      debug(aByte)
      byteArray.push('0x' + aByte + ((offset !== barr.length - 1) ? ',':''))
    }
  }
  debug(byteArray)
  return byteArray
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
  var output = './tmp/single_pixel.ppm'
  gm(1,1, '#FFFFFF')
  .write(output, function (err) {
    if (err) return cb(err)
    log.info( 'Created: ' + output )
  })
}

var generateDemonstration = function generateDemonstration(cb) {
  var m = 8
  var n = 8

  mkdir('./tmp/demo', function(err) {
    if (err) return cb(err)
  })

  for (var i = 1; i <= m; i++) {
    for (var j = 1; j <= n; j++) {
      gm(i, j, '#ffffff')
      .colors(2)
      .compress('None')
      .setFormat('PBM')
      .write(('./tmp/demo/demo_' + i + 'x' + j + '.pbm'), function (err) {
        if (err) return cb(err)
      })
    }
  }

  log.info('Created: ./tmp/demo/*')
}

var generateCheckerboard = function generateSinglePixel(cb) {
  w = arguments[1]
  h = arguments[2]
  output = './tmp/checkerboard.pbm'
  gm(w,h)
  .out('pattern:gray50')
  .colors(2)
  .compress('None')
  .toBuffer('PBM', function (err, buf) {
    if (err) return cb(err)
    debug('\n'+buf)
    fs.writeFile(output, buf, function(err) {
      if (err) return cb(err)
      log.info('Created: ' + output)
    })
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
    .write((imageOutput="./tmp/test_arduboy.png"), function (err) {
      if (err) return cb(err)
      log.info('created: ' + imageOutput)
    })
}

function test (cb) {
  tmpdir = './tmp'
  mkdir(tmpdir, function(err) {
    if (err) return cb(err)
  })
  generateDemonstration(cb)
  generateSinglePixel(cb)
  generateCheckerboard(cb,8,8)
  generateTestImage(cb)
  cb()
}

function unknown (action, cb) {
  cb('Image: \n' + image.usage)
}
