module.exports = (grunt) ->
  grunt.loadNpmTasks('grunt-contrib-watch')
  grunt.loadNpmTasks('grunt-contrib-coffee')

  grunt.initConfig
    watch: {
      scripts: {
        files: ['src/**/*.coffee', 'example/*.coffee', 'test/*.coffee'],
        tasks: ['coffee']
      }
    },

    coffee: {
      compile: {
        options: {
          join: true
        },
        files: {
          'build/physics.js': ['src/namespace.coffee',
                               'src/**/*.coffee'],
          'example/script.js': ['example/*.coffee'],
          'test/tests.js': ['test/*.coffee'],
        }
      }
    }
