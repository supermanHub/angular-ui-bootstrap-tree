'use strict';
module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		clean: {
			dist: ['dist/*']
		},
		copy: {
			dist: {
				expand: true,
				cwd: 'src',
				src: '**',
				dest: 'dist/'
			}
		},
		uglify: {
			dist: {
				files: {
					'dist/ui-bootstrap-tree.min.js': ['dist/ui-bootstrap-tree.js']
				}
			}
		},
		cssmin: {
			dist: {
				files: {
					'dist/ui-bootstrap-tree.min.css': ['dist/ui-bootstrap-tree.css']
				}
			}
		}

	});

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');

	grunt.registerTask('default', ['clean', 'copy', 'uglify', 'cssmin']);
}
