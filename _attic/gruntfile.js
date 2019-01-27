module.exports = function (grunt) {
	grunt.initConfig({
		shell: {
			jekyllBuild: {
				command: 'jekyll build'
			}
		},
		connect: {
			server: {
				options: {
					port: 8080,
					base: '_site',
					middleware: function (connect, options) {
						var middlewares = [];
						middlewares.push(function (req, res, next) {
							var filename = (req.url.substr(-1) == '/') ? (req.url + 'index.html') : req.url;
							if (grunt.file.exists(options.base + filename)) return next();
							res.end(grunt.file.read(options.base + '/404.html'));
						});
						middlewares.push(connect.static(options.base));
						return middlewares;
					},
				}
			}
		},
		watch: {
		  livereload: {
			files: [
				'**/*', 'skin/**/*', '!_site/**/*', '!**/node_modules/**/*'
			],
			tasks: ['shell:jekyllBuild'],
			options: {
			  livereload: 1337,
			},

		  },
		}
	});

	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-shell');
	grunt.registerTask('default', ['shell', 'connect', 'watch'])
};