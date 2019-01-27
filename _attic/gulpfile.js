var cp = require('child_process');
var gulp = require('gulp');
var less = require('gulp-less');
var concat = require('gulp-concat');
var minifyCSS = require('gulp-minify-css');
var webserver = require('gulp-webserver');
var changed = require('gulp-changed');
var imagemin = require('gulp-imagemin');

// TODO: file is a work in progress


var all_sub = '/**/*';
var paths = {
  // TODO: js: '_src/js',

  jekyll: [
    '**/*',
    '!_src/**/*',
    '!_site/**/*',
    '!**/node_modules/**/*'
  ],

  // CSS
  css: 'css',
  css_src: '_src/css',

  // LESS
  less: '_src/css',
  less_src: '_src/less',

  // IMAGES
  img: 'assets/img',
  img_src: '_src/img',

  // TODO: Skins
  skins: 'assets/skins',
  skins_str: '_src/skins'
};


gulp.task('images', function() {
  return gulp.src(paths.img_src + all_sub)
  .pipe(changed(paths.img))
  .pipe(imagemin({optimizationLevel: 5}))
  .pipe(gulp.dest(paths.img));
});

gulp.task('less', function() {
  gulp.src(paths.less_src + all_sub)
  .pipe(less())
  .pipe(concat('less.css'))
  .pipe(gulp.dest(paths.less))
});

gulp.task('css', function() {
  gulp.src(paths.css_src + all_sub)
  .pipe(minifyCSS({
    keepBreaks: true
  }))
  .pipe(concat('css.css'))
  .pipe(gulp.dest(paths.css))
});

gulp.task('server', function() {
  return gulp.src('_site').pipe(webserver({
    livereload: true
  }));
});

gulp.task('jekyll', function() {
  cp.spawn('jekyll', ['build'], {stdio: 'inherit'});
});

gulp.task('watch', function() {
  gulp.watch(paths.less_src + all_sub, ['less']);
  gulp.watch(paths.css_src + all_sub, ['css']);
  gulp.watch(paths.img_src + all_sub, ['images']);
  gulp.watch(paths.jekyll, ['jekyll']);
  gulp.watch('*.html', function() {});
});

gulp.task('default', ['watch', 'server']);
