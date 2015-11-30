
import {Component, NgIf} from 'angular2/angular2';
import {RouteParams} from 'angular2/router';
import {ROUTER_DIRECTIVES} from 'angular2/router';

@Component({
	selector:'about',
	templateUrl: './app/components/About/About.html',
	directives: [NgIf, ROUTER_DIRECTIVES]
})
export class About {
	page:string;
	constructor(params: RouteParams) {
		this.page = params.get('page');
	}
}