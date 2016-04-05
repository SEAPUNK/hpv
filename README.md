hpv
===

**requires node v4 or later**

hapi promise view: lets you pass promises to `reply.view()`

**this module is super basic, and probably won't work very well with your code; use this at your own risk!** (and open up some issues/PRs to help this module grow)

---

```js
const hpv = require('hpv')
const handlebars = require('handlebars')

// assuming 'server' is your set up hapi server w/ vision

// wrap server.views object in hpv
server.views(hpv({
  engines: {
    handlebars: handlebars
  }
}))

server.route({
  path: '/',
  method: 'GET',
  handler: (request, reply) => {
    const promise = handleIndex(request, reply)
    reply.view('index', promise)
  }
})

function handleIndex (request, reply) {
  return new Promise((resolve, reject) => {
    resolve({
      nice: 5
    })
  })
}

```

API
===

`hpv(viewsOptions, options)`

* `viewsOptions`: configuration object for server.views
  - `compileMode` is force set to `'async'`, although you should set `compileMode` to let hpv know how to wrap the compile function
  - every engine's `compile` function is wrapped in hpv's custom wrapper that passes through the context
* `options`: configuration for hpv
  - `allowPassthrough`: (default: `true`) if context promise is not a Promise, don't throw an error and use it as the context for the template