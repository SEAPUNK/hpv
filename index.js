'use strict'

const asyncify = require('async.asyncify')
const pify = require('pify')

const defaultConfig = {
  allowPassthrough: true
}

module.exports = (viewOptions, config) => {
  config = Object.assign({}, defaultConfig, config, {
    compileMode: viewOptions.compileMode,
    layoutKeyword: viewOptions.layoutKeyword || 'content'
  })

  for (let key of Object.keys(viewOptions.engines)) {
    const engine = viewOptions.engines[key]
    overrideCompileFn(engine, config)
  }

  return Object.assign({}, viewOptions, {
    compileMode: 'async'
  })
}

function overrideCompileFn (engine, config) {
  const originalCompile = engine.compile

  function wrappedCompile (template, options) {
    return compileWithEngine(originalCompile, template, options, config).then((compiled) => {
      return asyncify((context, options) => {
        return loadContext(context, config).then((data) => {
          if (config.compileMode === 'async') {
            return pify(compiled)(data)
          } else {
            return compiled(data)
          }
        })
      })
    })
  }

  engine.compile = asyncify(wrappedCompile)
}

function compileWithEngine (compile, template, options, config) {
  return new Promise((resolve, reject) => {
    if (config.compileMode === 'async') {
      compile(template, options, (err, compiled) => {
        if (err) return reject(err)
        resolve(compiled)
      })
    } else {
      const compiled = compile(template, options)
      resolve(compiled)
    }
  })
}

function loadContext (context, config) {
  return new Promise((resolve, reject) => {
    if (typeof context.then !== 'function' && config.allowPassthrough) {
      return resolve(context)
    }
    context.then((data) => {
      const layoutKeyword = config.layoutKeyword
      if (context[layoutKeyword] !== undefined) {
        data[layoutKeyword] = context[layoutKeyword]
      }
      resolve(data)
    }).catch(reject)
  })
}
