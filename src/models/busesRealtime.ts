import * as r from 'rethinkdb'
import {rethinkdb} from '../config'

let table = r.db('transinfo').table('running_buses')

enum ScheduleState {
	ONTIME,
	EARLY,
	LATE,
	INACTIVE,
	STARTING
}

export interface RunningBus {
	name: string
	location: number[]
	state?: ScheduleState
	id?: string
	busId?: string
	assignedRouteId?:string
}

interface Bus {
	name: string
	id: string
	attachedTrackerId: string
}

interface Tracker {
	imei: string
	id: string
}


// changefeed for buses
export function allRunningBuses(conn) {
	return table.changes()
		.run(conn)
}


export function allBuses(conn) {
	return table.run(conn)
}
// changefeed for buses near a geometry
