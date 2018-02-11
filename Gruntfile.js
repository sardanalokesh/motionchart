// Gruntfile.js

module.exports = function(grunt) {

  // ===========================================================================
  // CONFIGURE GRUNT ===========================================================
  // ===========================================================================
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      options: {
        reporter: require('jshint-stylish')
      },
      build: ['Gruntfile.js', 'src/**/*.js']
    },

    concat: {
      options: {
        separator: ";"
      },
      dist: {
        src: ['src/js/exp.js', 'src/js/*.js'],
        dest: 'dist/js/ExpCharts.js'
      }

    },

    uglify: {
      options: {
        banner: '/*\n <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> \n*/\n'
      },
      build: {
        files: {
          'dist/js/ExpCharts.min.js': ['src/js/exp.js', 'src/js/*.js']
        }
      }
    },

    sass: {
      dist: {
        options: {
          sourcemap: 'none'
        },
        files: {
          'dist/css/exp-charts.css': ['src/css/main.scss', 'src/css/*scss']
        }
      }
    },

    cssmin: {
      options: {
        banner: '/*\n <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> \n*/\n'
      },
      build: {
        files: {
          'dist/css/exp-charts.min.css': 'dist/css/exp-charts.css'
        }
      }
    },

    bower_concat:{
        all: {
          dest: "dist/js/lib/bower.js",
          destCss: "dist/css/lib/bower.css"
        }
    },

    watch: {
      stylesheets: {
        files: ['src/**/*.css', 'src/**/*.scss'],
        tasks: ['sass', 'cssmin']
      },
      scripts: {
        files: ['src/**/*.js'],
        tasks: ['jshint', 'concat', 'uglify']
      },
      less: {
        files: [ 'bower.json' ],
        tasks: [ 'exec:bower_install' ]
        },
    },

    exec: {
        bower_install: {
          cmd: "bower install"
        }
    }

  });

  //load grunt plugins
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-bower-concat');

  grunt.registerTask('default', ['bower_concat', 'jshint', 'concat', 'uglify', 'sass', 'cssmin']);
};