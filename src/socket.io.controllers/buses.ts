import * as r from 'rethinkdb'
import {rethinkdb} from '../config'
import * as buses from '../models/busesRealtime'
import * as routes from '../models/routes'

export function connect(socket: SocketIO.Socket) {
	// pass the user a modest backlog of bus locations when they first
	// establish their connection with the server so that their 
	// initial view of the application is populated with some data.
	// r.connect(rethinkdb.connectionOptions)
	// 	.then(function(conn) {
	// 		this.conn = conn;
	// 	})
	// 	.then(buses.allBuses)
	// 	.then(cursor => cursor.toArray())
	// 	.then(allBuses => {
	// 		allBuses.forEach(bus => {
	// 			socket.emit('update-all', bus)
	// 		})
	// 	})
	// 	.finally(function() {
	// 		if (this.conn) this.conn.close()
	// 	})

}

export function events(io: SocketIO.Server) {
	r.connect(rethinkdb.connectionOptions)
		.then(buses.allRunningBuses)
		.then(cursor => {
			cursor.each((err, bus: any) => {
				if (!err) {
					let _bus: buses.RunningBus = bus.new_val
					_bus.location = bus.new_val.location.coordinates.reverse()
					io.sockets
						.emit('update-all', _bus)


					io.sockets
						.emit('update-on-route', _bus.assignedRouteId, _bus)
				}
			})
		})
		.error(e => console.error(e))
}