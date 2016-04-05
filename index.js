'use strict'

const asyncify = require('async.asyncify')

module.exports = (engine) => {
  function compileFn (template, options) {
    return compileWithEngine(engine, template, options).then((compiled) => {
      return asyncify((context, options) => {
        return loadContext(context).then((data) => {
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

function loadContext (context) {
  return new Promise((resolve, reject) => {
    context.then(resolve).catch(reject)
  })
}
