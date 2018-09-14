module.exports = function(config) {
  config.set({
    browsers: ['PhantomJS'],
    frameworks: ['jasmine', 'browserify'],
    files: [
      'node_modules/jquery/dist/jquery.js',
      'test/**/*.spec.js'
    ],
    preprocessors: {
      'test/**/*.spec.js': [ 'browserify' ]
    },
    plugins : ['karma-jasmine', 'karma-phantomjs-launcher', 'karma-browserify'],
    browserify: {
      debug: true
    }
  });
};