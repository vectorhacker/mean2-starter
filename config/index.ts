import * as path from 'path';

export class Public {
		static src: string = path.join(__dirname, '..', 'src');
		static build: string = path.join(__dirname, '..', 'public')
}

export class rethinkdb {
		static PRODUCTION = {
		host: process.env.RETHINKDB_HOST || 'localhost',
		port: process.env.RETHINKDB_PORT || 28015
		}

		static DEVELOPMENT = {
		host: 'localhost',
		port: 28015
		}
}

export class server {
	static DEVELOPMENT = {
		port: 8081
	}
	static PRODUCTION = {
		port: process.env.PORT
	}
}

export class session {
	static get session_options() {
		var options = {
			servers: [

			],
			cleanupInterval: 5000, // optional, default is 60000 (60 seconds)
			table: 'ama_session' // optional, default is 'session'
		}

		if (process.env.DEVELOPMENT) {
			options.servers[0] = { host: rethinkdb.DEVELOPMENT.host, port: rethinkdb.DEVELOPMENT.port }
		} else {
			options.servers[0] = { host: rethinkdb.PRODUCTION.host, port: rethinkdb.PRODUCTION.port }
		}
		
		return options
	}

	static maxAge: number = 4.97664 * Math.pow(10, 08) // four days
	
	
}
