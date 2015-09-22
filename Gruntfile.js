module.exports = function(grunt) {

  /**
	 * Dynamically load npm tasks
	 */
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.initConfig({

    // Import package manifest
    pkg: grunt.file.readJSON('package.json'),

    // Banner definitions
    meta: {
      banner: '/*\n' +
      ' *  <%= pkg.title || pkg.name %> - v<%= pkg.version %>\n' +
      ' *  <%= pkg.description %>\n' +
      ' *  <%= pkg.homepage %>\n' +
      ' *\n' +
      ' *  Made by <%= pkg.author.name %>\n' +
      ' *  Under <%= pkg.license %> License\n' +
      ' */\n',
    },

    // Concat definitions
    concat: {
      options: {
        banner: '<%= meta.banner %>',
      },
      dist: {
        src: ['src/js/both.js'],
        dest: 'dist/both.js',
      },
    },

    /**
     * less
     * LESS/CSS compilation
     * https://github.com/sindresorhus/grunt-contrib-less
     */
    less: {
      demo: {
        options: {
          compress: false,
          cleancss: false,
          ieCompact: true,
          sourceMap: true,
          strictMath: true,
        },
        src: ['src/less/demo.less'],
        dest: 'dist/demo.css',
      },
    },

    /**
     * Uglify (minify) JavaScript files
     * Compresses and minifies all JavaScript files into one
     * https://github.com/gruntjs/grunt-contrib-uglify
     */
    uglify: {
      my_target: {
        src: ['dist/both.js'],
        dest: 'dist/both.min.js',
      },
      options: {
        banner: '<%= meta.banner %>',
      },
    },

    /**
     * Runs tasks against changed watched files
     * Watching development files and run concat/compile tasks
     * https://github.com/gruntjs/grunt-contrib-watch
     */
    watch: {
      files: ['src/**/*'],
      tasks: ['default'],
    },

  });

  grunt.registerTask('build', ['less:demo','concat', 'uglify']);
  grunt.registerTask('default', ['build']);

};
