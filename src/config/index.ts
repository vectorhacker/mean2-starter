import {join} from 'path';

export module server {
	export var port = 8081
}

export module socket {
	export var servers = []
}

export module rethinkdb {
	// Change these values to your own rethinkdb server
	export var host = '104.209.178.24'
	export var port = 32769
	
	export var db = 'transinfo'
	export var tables = ['routes', 'running_buses']
	
	export var connectionOptions = {
		host: process.env.RETHNKDB_HOST || host || 'localhost',
		port: process.env.RETHNKDB_PORT || port || 28015
	}
}