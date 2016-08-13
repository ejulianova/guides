var open = require('open');
var karmaServer = require('karma').Server;

var gulp = require('gulp');
var uglify = require('gulp-uglify');
var browserify = require('gulp-browserify');
var sass = require('gulp-sass');
var rename = require('gulp-rename');
var banner = require('gulp-banner');
var connect = require('gulp-connect');

var pkg = require('./bower.json');

const DIST = 'dist/';
const BANNER =
    '/*\n' +
    ' * <%= pkg.name %> <%= pkg.version %>\n' +
    ' * <%= pkg.description %>\n' +
    ' * <%= pkg.homepage %>\n' +
    ' *\n' +
    ' * Copyright 2015, <%= pkg.authors.join(", ") %>\n' +
    ' * Released under the <%= pkg.license %> license.\n' +
    '*/\n\n';

gulp.task('script', function() {
  gulp.src('src/guides.js')
    .pipe(browserify())
    .pipe(banner(BANNER, {
        pkg: pkg
    }))
    .pipe(gulp.dest(DIST))
    .pipe(uglify())
    .pipe(banner(BANNER, {
        pkg: pkg
    }))
    .pipe(rename('guides.min.js'))
    .pipe(gulp.dest(DIST))
    .pipe(connect.reload());
});

gulp.task('style', function() {
  gulp.src('src/guides.scss')
    .pipe(banner(BANNER, {
        pkg: pkg
    }))
    .pipe(gulp.dest(DIST))
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(banner(BANNER, {
        pkg: pkg
    }))
    .pipe(gulp.dest(DIST))
    .pipe(connect.reload());
});

gulp.task('jquery-manifest', function() {
  gulp.src('package.json')
    .pipe(rename('guides.jquery.json'))
    .pipe(gulp.dest('./'));
});

gulp.task('test', function (done) {
  new karmaServer({
    configFile: require('path').resolve('karma.conf.js'),
    singleRun: true
  }, done).start();
});

gulp.task('server', function () {
  connect.server({
    root: ['./'],
    port: 8080
  })
});

gulp.task('watch', ['server'], function() {
  open('http://localhost:8080/demo');
  gulp.watch('src/**/*', ['build']);
  gulp.watch('test/**/*', ['test']);
  gulp.watch('demo/**/*', function () {
    connect.reload();
  });
});

gulp.task('build', ['test', 'script', 'style', 'jquery-manifest']);
gulp.task('default', ['build', 'watch']);