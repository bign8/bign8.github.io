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
                        return [function (req, res) {
                            var filename = (req.url.substr(-1) == '/') ? (req.url + 'index.html') : req.url;
                            if (!grunt.file.exists(options.base + filename)) filename = '/404.html';
                            res.end(grunt.file.read(options.base + filename));
                        }];
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
}