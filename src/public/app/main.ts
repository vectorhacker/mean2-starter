/// <reference path="../typings/tsd.d.ts" />
import {Component, View, bootstrap, provide} from 'angular2/angular2'
import {ROUTER_DIRECTIVES, RouteConfig, Location, ROUTER_PROVIDERS, LocationStrategy, HashLocationStrategy, Route, AsyncRoute, Router} from 'angular2/router'
import {HTTP_PROVIDERS} from 'angular2/http'

// declare var System: any;

// class ComponentHelper {

// 	static LoadComponentAsync(name, path) {
// 		return System.import(path).then(c => c[name])
// 	}
// }

@Component({
	selector: 'starter',
	templateUrl: './app/templates/main.html',
	directives: []
})
@RouteConfig([
	// new Route({ path: '/about/:page', component: About, as: 'About' }),
	// new Route({ path: '/', component: Home, as: 'Home' }),
	// new AsyncRoute({
	// 	path: '/lazy',
	// 	loader: () => ComponentHelper.LoadComponentAsync('LazyLoaded', './components/lazy-loaded/lazy-loaded'),
	// 	as: 'Lazy'
	// })
])
class Starter {
	sayHey() {
		console.log("hey")
	}
}

bootstrap(Starter, [ROUTER_PROVIDERS, HTTP_PROVIDERS, MapService,
	provide(LocationStrategy, { useClass: HashLocationStrategy })]);
