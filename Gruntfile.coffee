module.exports = (grunt) ->
  grunt.loadNpmTasks('grunt-contrib-coffee')

  grunt.initConfig
    coffee: {
      compile: {
        options: {
          join: true
        },
        files: {
          'build/physics.js': ['js/**/*.coffee']
        }
      }
    }
