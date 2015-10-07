import * as express from 'express'
import * as session from 'express-session'
import * as logger from 'morgan'
import * as rstore from 'session-rethinkdb'
import * as path from 'path'

import * as config from './config/index'

let app = express()

let RDBStore = rstore(session);

const store = RDBStore(config.session.session_options)

app.use(logger('combined'))
  .use(session({
    secret: 'keyboard cat',
    cookie: {
      maxAge: config.session.maxAge 
    },
    store: store,
    resave: true,
    saveUninitialized: true
  }))
  
if (process.env.DEVELOPMENT) {
  app.use(express.static(config.Public.src))
} else {
  app.use(express.static(config.Public.build))
}

app.listen(8081);