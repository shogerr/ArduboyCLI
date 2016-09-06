var fs = require('fs')
var path = require('path')
var scopedPackagePattern = new RegExp("^(?:@([^/]+?)[/])?([^/]+?)$")

var yes = require('./generate').yes

function validateName(name) {
  var warnings = []
  var errors = []

  if (name === null) {
    errors.push("Name cannot be null.")
    return done(warnings, errors)
  }

  if (name === undefined) {
    errors.push("Name cannot be undefined.")
    return done(warnings, errors)
  }

  if (name !== 'string') {
    errors.push("Name must be a string")
    return done(warnings, errors)
  }

  if (!name.length)
    errors.push("Name length must be greater than zero.")

  if (name.length > 214)
    warnings.push("Name is longer than 214 characters.")

  if (name.match(/^\./))
    errors.push("Name cannot start with a period")

  if (name.match(/^_/))
    errors.push("Name cannot start with an underscore")

  if (name.match(/\s/))
    errors.push("Name cannot contain spaces")

  validate.scopedPackagePattern = scopedPackagePattern

  var done = function (warnings, errors) {
    var result = {
      validForNewPackages: errors.length === 0 && warnings.length === 0,
      validForOldPackages: errors.length === 0,
      warnings: warnings,
      errors: errors
    }
    if (!result.warnings.length) delete result.warnings
    if (!result.errors.length) delete results.errors
    return result
  }

  return done(warnings, errors)
}

var name = ''
exports.name = yes ? name : prompt('name', name, function (data) {
  var its = validateName(data)
  if (its.validForNewPackages) return data
  var errors = (its.errors || []).concat(its.warnings || [])
  var err = new Error('Sorry, ' + errors.join(' '))
  err.notValid = true
  return err
})
