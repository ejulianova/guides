module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      dist: {
        src: [
          'src/intro.js',
          'src/includes/format.js',
          'src/includes/Arrow.js',
          'src/includes/Guide.js',
          'src/includes/Guides.js',
          'src/guidesPlugin.js',
          'src/outro.js'
        ],
        dest: 'dist/guides.js'
      }
    },
    uglify: {
      dist: {
        files: {
          'dist/guides.min.js': ['dist/guides.js']
        },
        options: {
          sourceMap: true
        }
      }
    },
    jasmine: {
        test: {
            src: 'src/includes/*.js',
            options: {
                vendor: [
                    'bower_components/jquery/dist/jquery.js',
                    'bower_components/jasmine-jquery/lib/jasmine-jquery.js'
                ],
                specs: 'test/spec/*.spec.js'
            }
        }
    },
    watch: {
      concat: {
        files: ['src/**/*.js', 'src/*.js'],
        tasks: 'concat'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jasmine');  
  grunt.loadNpmTasks('grunt-contrib-watch');  

  // Default task(s).
  grunt.registerTask('dist', ['concat:dist', 'uglify:dist']);
  grunt.registerTask('test', ['jasmine:test']);

};