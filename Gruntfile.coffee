module.exports = (grunt) ->
  
  grunt.task.loadTasks 'gruntcomponents/tasks'
  grunt.task.loadNpmTasks 'grunt-contrib-coffee'
  grunt.task.loadNpmTasks 'grunt-contrib-watch'
  grunt.task.loadNpmTasks 'grunt-contrib-concat'
  grunt.task.loadNpmTasks 'grunt-contrib-uglify'

  grunt.initConfig

    pkg: grunt.file.readJSON('package.json')
    banner: """
/*! <%= pkg.name %> (<%= pkg.repository.url %>)
 * lastupdate: <%= grunt.template.today("yyyy-mm-dd") %>
 * version: <%= pkg.version %>
 * author: <%= pkg.author %>
 * License: MIT */

"""

    growl:

      ok:
        title: 'COMPLETE!!'
        msg: '＼(^o^)／'

    coffee:

      fullphotodialog:
        src: [ 'jquery.fullphotodialog.coffee' ]
        dest: 'jquery.fullphotodialog.js'

    concat:

      banner:
        options:
          banner: '<%= banner %>'
        src: [ '<%= coffee.fullphotodialog.dest %>' ]
        dest: '<%= coffee.fullphotodialog.dest %>'
        
    uglify:

      options:
        banner: '<%= banner %>'
      fullphotodialog:
        src: '<%= concat.banner.dest %>'
        dest: 'jquery.fullphotodialog.min.js'

    watch:

      fullphotodialog:
        files: '<%= coffee.fullphotodialog.src %>'
        tasks: [
          'default'
        ]

  grunt.registerTask 'default', [
    'coffee'
    'concat'
    'uglify'
    'growl:ok'
  ]

