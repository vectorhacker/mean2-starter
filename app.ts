import * as express from 'express'
import * as session from 'express-session'
import * as logger from 'morgan'
import * as path from 'path'
import * as config from './config/index'

let app = express()

app.use(logger('combined'))

if (process.env.DEVELOPMENT) {
  app.use(express.static(config.Public.src))
} else {
  app.use(express.static(config.Public.build))
}

app.get('/s', (req, res) => {
  res.send('hello');
})

app.listen(8081)
