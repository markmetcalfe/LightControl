var fs = require('fs');
var path = require('path');
var del = require('del');
var gulp = require('gulp');
var browserify = require('browserify');
var injectSvg = require('gulp-inject-svg');
var babelify = require('babelify');
var buffer = require('vinyl-buffer');
var browserSync = require('browser-sync');
var uglify = require('gulp-uglify-es').default;
var $$ = require('gulp-load-plugins')();
var autoprefixer = require('autoprefixer');
var reload = browserSync.reload;
var through2 = require('through2');
var htmlclean = require('gulp-htmlclean');
var source = require('vinyl-source-stream');

function handleError(err) {
  console.log(err.toString());
  this.emit('end');
}

var assetFolder = 'assets/';
var devFolder = 'src/';
var buildFolder = 'build/';

function getFolders(dir) {
  return fs.readdirSync(dir)
  .filter(function(file) {
    return fs.statSync(path.join(dir, file)).isDirectory();
  });
}

gulp.task('styles', function() {
  return gulp.src(devFolder + '**/*.scss')
  .pipe($$.sass())
  .on('error', $$.notify.onError("Error: <%= error.message %>"))
  .on('error', handleError)
  .pipe($$.postcss([ autoprefixer({ browsers: ["> 0%"] }) ]))
  .pipe(gulp.dest(buildFolder))
  .pipe($$.minifyCss({keepSpecialComments: 1}))
  .pipe(gulp.dest(buildFolder))
  .pipe(reload({ stream:true }));
});

gulp.task('scripts', function() {
  return browserify({ entries: 'src/script.js' })
  .transform(babelify)
  .bundle()
  .pipe(source('script.js'))
  .pipe(buffer())
  //.pipe(uglify.apply())
  .pipe($$.rename('bundle.js'))
  .pipe(gulp.dest(buildFolder))
});

gulp.task('pages', function() {
  return gulp.src(devFolder + '**/*.html')
  .pipe(buffer())
  .pipe(injectSvg({
    base: '/assets/'
  }))
  .pipe(gulp.dest(buildFolder))
	.pipe(reload({ stream:true }));
});

gulp.task('assets', function() {
  return gulp.src(assetFolder + '**/*')
  .pipe(gulp.dest(buildFolder))
	.pipe(reload({ stream:true }));
});

gulp.task('build', ['styles', 'scripts', 'assets', 'pages']);

gulp.task('serve', ['build'], function() {
  browserSync({ server: { baseDir: buildFolder } });
  gulp.watch(devFolder + '**/*', ['build'], reload);
});

gulp.task('default', ['build']);
