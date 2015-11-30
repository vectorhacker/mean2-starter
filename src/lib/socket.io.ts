import * as socketio from 'socket.io'
import {createServer} from 'http'

import * as busEvents from '../socket.io.controllers/buses' 

export function connect(app) {
	let server = createServer(app)
	
	let io = socketio.listen(server)
	
	busEvents.events(io)
	
	io.on('connect', (socket) =>  {
		busEvents.connect(socket)
	})
	return server;
}