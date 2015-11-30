var gulp = require('gulp')
var ts = require('gulp-typescript')
var sourcemaps = require('gulp-sourcemaps')
var stylus = require('gulp-stylus')
var concat = require('gulp-concat')
var inject = require('gulp-inject')
var del = require('delete')
var path = require('path')
var uglify = require('gulp-uglify')
var exec = require('child_process').exec

var serverTS = ts.createProject('./src/tsconfig.json')
var publicTS = ts.createProject('./src/public/tsconfig.json')

// <script src="node_modules/systemjs/dist/system.src.js"></script>
// <script src="node_modules/es6-shim/es6-shim.js"></script>
// <script src="node_modules/angular2/bundles/angular2.dev.js"></script>
// <script src="node_modules/angular2/bundles/http.dev.js"></script>
// <script src="node_modules/angular2/bundles/router.dev.js"></script>

var developmentJSLibs = ['./src/public/node_modules/systemjs/dist/system.src.js',
	'./src/public/node_modules/es6-shim/es6-shim.js',
	'./src/public/node_modules/angular2/bundles/angular2.dev.js',
  './src/public/node_modules/angular2/bundles/http.dev.js',
	'./src/public/node_modules/angular2/bundles/router.dev.js']

var productionJSLibs = ['./src/public/node_modules/systemjs/dist/system.js',
	'./src/public/node_modules/es6-shim/es6-shim.min.js',
	'./src/public/node_modules/angular2/bundles/angular2.min.js',
  './src/public/node_modules/angular2/bundles/http.min.js',
	'./src/public/node_modules/angular2/bundles/router.dev.min.js']

gulp.task('install.public.deps', function (done) {
	 exec('cd src/public && npm i', function (err, stdout, stderr) {

		console.log('NPM:', stdout)
		console.error('NPM ERROR:', stderr)

    if (err) return done(err); // return error
    done(); // finished task
	 })
})

gulp.task('clean', function (done) {
	function deleteNodeModulesGlobal(err) {
		if (err) return done(err)
		
		del('./src/public/node_modules', deleteNodeModulesPublic)
	}
	
	function deleteNodeModulesPublic(err) {
		if (err) return done(err)
		
		del('./src/**/*.js', deleteJS)
	}
	
	function deleteJS(err) {
		if (err) return done(err)
		
		del('./src/**/*.js.map', done)
	}
	
	del('./src/node_modules', deleteNodeModulesGlobal)
})

// DEVELOPMENT
gulp.task('dev.ts.public', function () {
	return publicTS.src()
		.pipe(sourcemaps.init())
		.pipe(ts(publicTS))
		.js
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('./src/public'))
})

gulp.task('dev.ts.server', function () {
	return serverTS.src()
		.pipe(sourcemaps.init())
		.pipe(ts(serverTS))
		.js
		.pipe(sourcemaps.write('.', { includeContent: false, sourceRoot: path.join(__dirname, './src') }))
		.pipe(gulp.dest('./src'))
})

gulp.task('dev.ts', ['dev.ts.server', 'dev.ts.public'])

gulp.task('dev.stylus', function () {
	return gulp.src('./src/public/css/**/*.styl')
		.pipe(sourcemaps.init())
		.pipe(stylus())
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('./src/public/css/'))
})

gulp.task('dev.inject', ['install.public.deps'], function () {
	var target = gulp.src('./src/public/index.html')
	var sources = gulp.src(['./src/public/js/**/*.js', './src/public/lib/**/*.js', './src/public/**/*.css', '!./src/public/node_modules/**/*.css'].concat(developmentJSLibs), { read: false })

	return target.pipe(inject(sources, { relative: true }))
    .pipe(gulp.dest('./src/public'));
})

gulp.task('dev.build', ['dev.ts', 'dev.stylus', 'dev.inject'])

gulp.task('dev.watch', ['dev.build'], function () {
	// watch and recompile server typescript
	gulp.watch(['./src/**/*.ts', '.!./src/public/**/*.ts', '!./src/typings/**/*.ts'], ['dev.ts.server'])
	
	// watch and recompile public typescript
	gulp.watch(['./src/public/**/*.ts', '!./src/public/typings/**/*.ts'], ['dev.ts.public'])
	
	
	// watch and recompile stylus to css, then inject
	gulp.watch(['./src/public/css/**/*.styl'], ['dev.stylus', 'dev.inject'])
	
	// inject any new javascript
	gulp.watch(['./src/public/js/**/*.js'], ['dev.inject'])
})

// PRODUCTION
gulp.task('prod.ts', function () {
	serverTS.src()
		.pipe(ts(serverTS))
		.js
		.pipe(gulp.dest('./dist'))


	publicTS.src()
		.pipe(ts(publicTS))
		.js
		.pipe(gulp.dest('./dist/public'))
})

gulp.task('prod.stylus', function () {
	return gulp.src('./src/css/**/*.styl')
		.pipe(stylus())
		.pipe(concat('app.css'))
		.pipe(gulp.dest('./dist/css/'))
})

gulp.task('cp.index.html', function () {
	return gulp.src('./src/public/index.html')
		.pipe(gulp.dest('./dist/public'))
})


gulp.task('prod.inject', ['cp.index.html', 'prod.cp.js', 'prod.stylus'], function () {
	var target = gulp.src('./dist/public/index.html')
	var sources = gulp.src(['./dist/public/js/system.js', './dist/public/js/**/*.js', './dist/public/**/*.css'], { read: false })

	return target.pipe(inject(sources, { relative: true }))
    .pipe(gulp.dest('./dist/public'))
})

gulp.task('prod.cp.pkgjson', function () {
	return gulp.src('./src/package.json')
		.pipe(gulp.dest('./dist'))
})


gulp.task('prod.cp.js', ['install.public.deps'], function () {
	return gulp.src(['./src/public/js/**/*.js'].concat(productionJSLibs))
	  .pipe(concat('lib/deps.js'))
		.pipe(gulp.dest('./dist/public/js'))
})

gulp.task('prod.cp.images', function () {
	return gulp.src('./src/public/images/**/*')
		.pipe(gulp.dest('./dist/public/images'))
})

gulp.task('prod.cp.templates', function () {
	return gulp.src('./src/public/app/**/*.html')
		.pipe(gulp.dest('./dist/public/app'))
})

gulp.task('prod.clean', function () {
	del.sync('./dist', {
    force: true
  });
})

gulp.task('prod.minify.js', function () {
	 return gulp.src(['./dist/public/**/*.js'])
    .pipe(uglify({
			mangle: false
		}))
    .pipe(gulp.dest('./dist/public'));
})

gulp.task('prod.build', ['install.public.deps', 'prod.clean', 'prod.stylus', 'cp.index.html', 'prod.cp.js', 'prod.inject', 'prod.ts', 'prod.cp.pkgjson', 'prod.cp.templates', 'prod.cp.images', 'prod.minify.js'])

gulp.task('default', ['prod.build'])