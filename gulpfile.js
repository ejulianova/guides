var open = require('open');
var karmaServer = require('karma').Server;

var gulp = require('gulp');
var uglify = require('gulp-uglify');
var browserify = require('gulp-browserify');
var sass = require('gulp-sass');
var rename = require('gulp-rename');
var banner = require('gulp-banner');
var connect = require('gulp-connect');
var ghPages = require('gulp-gh-pages');

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

gulp.task('test', function (done) {
  new karmaServer({
    configFile: require('path').resolve('karma.conf.js'),
    singleRun: true
  }, done).start();
});

gulp.task('demo', ['script', 'style', 'test'], function() {
  return gulp.src(['./dist/guides.css', './dist/guides.min.js'])
    .pipe(gulp.dest('demo/'));
});

gulp.task('github-page', ['demo'], function() {
  return gulp.src(['./demo/**/*'])
    .pipe(ghPages());
});

gulp.task('server', function () {
  connect.server({
    root: ['./demo'],
    port: 8080,
    livereload: true
  });
});

gulp.task('watch', ['server'], function() {
  open('http://localhost:8080/');
  gulp.watch('src/**/*', ['build']);
  gulp.watch(['demo/**/*.html', 'demo/**/*.scss'], ['build']);
});

gulp.task('build', ['demo']);
gulp.task('default', ['build', 'watch']);
gulp.task('deploy', ['build', 'github-page']);