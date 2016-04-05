'use strict'

const asyncify = require('async.asyncify')

module.exports = (engine, config) => {
  config = Object.assign({
    allowPassthrough: true
  }, config)

  function compileFn (template, options) {
    return compileWithEngine(engine, template, options).then((compiled) => {
      return asyncify((context, options) => {
        return loadContext(context, config).then((data) => {
          return compiled(data)
        })
      })
    })
  }

  return {
    compile: asyncify(compileFn)
  }
}

function compileWithEngine (engine, template, options) {
  return new Promise((resolve, reject) => {
    const compiled = engine.compile(template, options)
    resolve(compiled)
  })
}

function loadContext (context, config) {
  return new Promise((resolve, reject) => {
    if (typeof context.then !== 'function' && config.allowPassthrough) {
      return resolve(context)
    }
    context.then(resolve).catch(reject)
  })
}
