var arduboy = require('../lib/arduboy.js')

var conf = []

conf.input = '../html/arduboy_logo.png'

function errorHandler(err) {
  console.log(err)
  process.exit()
}

arduboy.load(conf, function (err) {
  if (err) errorHandler(err)
  arduboy.commands['image'](['tobytes'], errorHandler)
})

