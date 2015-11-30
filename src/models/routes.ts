import * as r from 'rethinkdb'
import * as Promise from 'bluebird'

let db = r.db('transinfo'),
	tableName = 'routes',
	table = db.table(tableName)


interface RStop {
	name: string
	coordinates: r.Point
}

export interface Stop {
	name: string,
	coordinates: number[]
}

interface RRoute {
	name: string
	coordinates: r.Line
	stops: RStop[],
	id: string | number
}

export interface Route {
	name: string
	coordinates: number[][],
	stops: Stop[],
	id: string | number
}

export function createRoute(route: Route) {
	let insertion = {
		name: route.name,
		coordinates: r.line.apply(r, route.coordinates),
		stops: route.stops.map(stop => {
			return {
				name: stop.name,
				coordinats: r.point.apply(r, stop.coordinates)
			}
		})
	}

	return table.insert(insertion)
}

export function getRoute(name: string) {
	return function(conn) {
		return table.filter({ name })
			.limit(1)
			.run(conn)
			.then(cursor => {
				return cursor.next()
			})
	}
}

export function getAllRoutes(conn: r.Connection): Promise<Route[]> {
	return table
		.run(conn)
		.then(cursor => {
			return cursor.toArray()
		})
		.then((results: RRoute[]) => {
			let routes: Route[] = []

			// get each route and get the coordinate objects of each one 
			// and each stop.
			results.forEach(route => {
				routes.push({
					name: route.name,
					coordinates: route.coordinates.coordinates,
					stops: route.stops.map(stop => {
						return {
							name: stop.name,
							coordinates: stop.coordinates.coordinates
						}
					}),
					id: route.id
				})
			})

			return routes
		})
}