/// <reference path="typings/tsd.d.ts" />
import 'zone.js'
import 'reflect-metadata'

import {Component, View, bootstrap, provide} from 'angular2/angular2'
import {ROUTER_DIRECTIVES, RouteConfig, Location, ROUTER_PROVIDERS, LocationStrategy, HashLocationStrategy, Route, AsyncRoute, Router} from 'angular2/router'
import {HTTP_PROVIDERS} from 'angular2/http'

import { About } from './components/About/About'
import { Home } from './components/Home/Home'

declare var System: any;

class ComponentHelper {

	static LoadComponentAsync(name, path) {
		return System.import(path).then(c => c[name])
	}
}


@Component({
	selector: 'starter',
	templateUrl: './templates/main.html',
	directives: [ROUTER_DIRECTIVES]
})
@RouteConfig([
	new Route({ path: '/about/:page', component: About, as: 'About' }),
	new Route({ path: '/', component: Home, as: 'Home' }),
	new AsyncRoute({
		path: '/lazy',
		loader: () => ComponentHelper.LoadComponentAsync('LazyLoaded', './components/lazy-loaded/lazy-loaded'),
		as: 'Lazy'
	})
])
class Starter {
}

bootstrap(Starter, [ROUTER_PROVIDERS, HTTP_PROVIDERS,
	provide(LocationStrategy, { useClass: HashLocationStrategy })]);
