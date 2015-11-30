import * as express from 'express'
import * as logger from 'morgan'
import * as compression from 'compression'
import {join} from 'path'

import {server} from '../config'
import {connect as connectSocket} from './socket.io'

import {Connection as DBConnection} from 'rethinkdb'

// Route controllers
import index from '../routes/index'
import busRoutes from '../routes/busRoutes'


// Setup useful express middleware here
export function setupMidleware(app: express.Application) {
	if (process.env.NODE_ENV == 'development') {
		app.use(logger('dev'))
	} else {
		app.use(logger('combined'))
	}
	
	
	app.use(compression())
	
}

// Setup the static files routes here.
export function setupStaticRoutes(app: express.Application) {
		app.use(express.static(join(__dirname, '../public')))
}


// Setup the dynamic express routes in this function
export function setupDynamicRoutes(app: express.Application) {
	app.use('/', index)
		.use('/routes', busRoutes)
}
  
// Initialize the server
export function init() {

	let app = express()

	setupMidleware(app)
	setupStaticRoutes(app)
	setupDynamicRoutes(app)

	let server = connectSocket(app)

	return server
} 