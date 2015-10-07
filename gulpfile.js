var gulp = require('gulp')
var gulp_jspm = require('gulp-jspm');
var sourcemaps = require('gulp-sourcemaps');
var ts = require('gulp-typescript');
var inject = require('gulp-inject');
var liveServer = require('live-server');
var jsmin = require('gulp-jsmin');
var rename = require('gulp-rename');
var imagemin = require('gulp-imagemin');
var concatCss = require('gulp-concat-css');
var del = require('delete');
var path = require('path');

var config = require('./config');


var params = {
  port: 8181, // Set the server port. Defaults to 8080. 
  host: "0.0.0.0", // Set the address to bind to. Defaults to 0.0.0.0. 
  root: config.Public.src, // Set root directory that's being server. Defaults to cwd. 
  open: true, // When false, it won't load your browser by default. 
  ignore: './**/*.ts', // comma-separated string for paths to ignore 
  file: "index.html", // When set, serve this file for every 404 (useful for single-page applications) 
  wait: 0 // Waits for all changes, before reloading. Defaults to 0 sec. 
};

gulp.task('default', ['compile.server.typescript', 'build.public.prod'], function () {

});


gulp.task('compile.server.typescript', function () {
  var tsProject = ts.createProject('tsconfig.json');
  var tsResult = tsProject.src() // instead of gulp.src(...) 
    .pipe(ts(tsProject));

  var stream = tsResult.js.pipe(gulp.dest('./'));
  return stream;
})


gulp.task('compile.public.typescript', function () {
  var tsProject = ts.createProject(path.join(config.Public.src, 'tsconfig.json'));
  var tsResult = tsProject.src() // instead of gulp.src(...) 
    .pipe(ts(tsProject));

  var stream = tsResult.js.pipe(gulp.dest(config.Public.src));
  return stream;
});

gulp.task('systemjs.public.prod', function () {
  gulp.src(path.join(config.Public.src, './jspm_packages/system.js'))
    .pipe(gulp.dest(path.join(config.Public.build, './js/lib')))
});

gulp.task('jspm.public.prod', ['compile.public.typescript', 'systemjs.public.prod'], function () {

  var stream = gulp.src(path.join(config.Public.src, './main.js'))
    .pipe(gulp_jspm())
    .pipe(jsmin())
    .pipe(rename({
      basename: 'app',
      suffix: '.min'
    }))
    .pipe(gulp.dest(path.join(config.Public.build, './js/')));
  return stream;
});

// production tasks
gulp.task('index.public.prod', function () {
  gulp.src(path.join(config.Public.src, './index.html'))
    .pipe(gulp.dest(config.Public.build));
});

gulp.task('inject.public.prod', ['index.public.prod', 'jsmin.public.prod', 'css.public.prod', 'jspm.public.prod'], function () {
  var target = gulp.src(path.join(config.Public.build, './index.html'));

  var sources = gulp.src([path.join(config.Public.build, './js/lib/system.js'),
    path.join(config.Public.build, './js/**/*.js'),
    path.join(config.Public.build, './css/**/*.css')],
    { read: false });

  var stream = target.pipe(inject(sources, { relative: true }))
    .pipe(gulp.dest(config.Public.build))

  return stream;
});

gulp.task('css.public.prod', function () {
  return gulp.src(path.join(config.Public.src, './css/**/*.css'))
    .pipe(concatCss("css/app.css"))
    .pipe(gulp.dest(config.Public.build));
})

gulp.task('images.public.prod', function () {
  return gulp.src(path.join(config.Public.src, 'images/*'))
    .pipe(imagemin())
    .pipe(gulp.dest(path.join(config.Public.build, 'images')));
})

gulp.task('jsmin.public.prod', function () {
  gulp.src(path.join(config.Public.src, 'js/**/*.js'))
    .pipe(jsmin())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(path.join(config.Public.build, '/js')));
});

gulp.task('clean.public.prod', function () {
  del.sync('./public', { force: true });
});

gulp.task('move-components.public.prod',
  function () {
    gulp.src([path.join(config.Public.src, './components/**/*.html'), path.join(config.Public.src, '!./components/**/*.ts')])
      .pipe(gulp.dest(path.join(config.Public.build, './components')));
    gulp.src((path.join(config.Public.src, './templates/**/*.html')))
      .pipe(gulp.dest(path.join(config.Public.build, './templates')));
  });

gulp.task('build.public.prod', ['clean.public.prod',
  'index.public.prod',
  'compile.public.typescript',
  'jspm.public.prod',
  'jsmin.public.prod',
  'images.public.prod',
  'inject.public.prod',
  'move-components.public.prod']);

// development tasks

gulp.task('jspm.public.dev', ['compile.public.typescript'], function () {

  var stream = gulp.src(path.join(config.Public.src, 'main.js'))
    .pipe(sourcemaps.init())
    .pipe(gulp_jspm())
    .pipe(sourcemaps.write(config.Public.src))
    .pipe(gulp.dest(config.Public.src));

  return stream;
});

gulp.task('inject.public.dev', ['jspm.public.dev'], function () {
  var target = gulp.src(path.join(config.Public.src, './index.html'));

  var sources = gulp.src([path.join(config.Public.src, './jspm_packages/system.js'),
    path.join(config.Public.src, './jspm-bundle.js'),
    path.join(config.Public.src, './js/**/*.js'),
    path.join(config.Public.src, './css/**/*.css')],
    { read: false });

  var stream = target.pipe(inject(sources, {relative: true}))
    .pipe(gulp.dest(config.Public.src))

  return stream;
});

gulp.task('build.public.dev', ['compile.public.typescript', 'jspm.public.dev', 'inject.public.dev']);

gulp.task('watch.public.dev', ['build.public.dev'], function () {
  liveServer.start(params);
  gulp.watch([path.join(config.Public.src, './**/*.ts'), path.join(config.Public.src, './templates/**/*.html'), path.join(config.Public.src, './components/**/*.html')], ['build.public.dev'])
});

// end development tasks