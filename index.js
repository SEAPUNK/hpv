'use strict'

module.exports = function (engine) {
  return {
    compile: function (template, options, next) {
      let compiled
      try {
        compiled = engine.compile(template, options)
      } catch (err) {
        return next(err)
      }
      return next(null, function (context, options, callback) {
        try {
          context.then(function (data) {
            const rendered = compiled(data)
            callback(null, rendered)
          }).catch(callback)
        } catch (err) {
          return callback(err)
        }
      })
    }
  }
}
