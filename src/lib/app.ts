import {init as initExpress} from './express'
import {Application as ExpressApp} from 'express'
import { Connection as DBConnection } from 'rethinkdb'
import { Server as HTTPServer} from 'http'
import * as config from '../config'

export function init() {
	return initExpress()
}

export function start(port?: number) {
	init()
	.listen(port || config.server.port);
}