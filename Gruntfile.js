module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jshint: {
			options: {
			},
			build: ['Gruntfile.js', 'src/js/*.js']
		},
		less: {
			development: {
				options: {
					paths: ['src/css/*']
				},
				files: {
					'src/css/main.css': 'src/css/main.less'
				},
			},
		},
		concat: {
			javascript: {
				options: {
					separator: ';'
				},
				files: {
					'src/js/javascript.js' : 'src/js/*.js'
				}
			},
			css: {
				options: {
					separator: ';'
				},
				files: {
					'src/css/style.css' : ['src/css/reset.css', 'src/css/main.css']
				},
			}
		},
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
			},
			dist: {
				files: {
					'public/js/script.min.js': 'src/js/javascript.js'
				}
			}
		},
		cssmin: {
			options: {
				shorthandCompacting: false,
				roundingPrecision: -1
			},
			target: {
				files: {
					'public/css/style.min.css': 'src/css/style.css'
				}
			}
		},
		clean: {
			js: ['src/js/javascript.js', '!src/js/script.js'],
			css: ['src/css/*.css', '!src/css/main.less', '!src/css/reset.css']
		},
		watch: {
			options: {
				livereload: true,
			},
			css: {
				files: 'src/css/*.less',
				tasks: ['styling'],
			},
			scripts: { 
				files: 'src/js/*.js', 
				tasks: ['scripting'] 
			} 
		}
	});


	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-htmlmin');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-watch');


	grunt.registerTask('default', ['jshint', 'less', 'concat', 'uglify', 'cssmin', 'clean']);
	grunt.registerTask('scripting', ['jshint', 'concat:javascript', 'uglify']);
	grunt.registerTask('styling', ['less', 'concat:css', 'cssmin']);

};
