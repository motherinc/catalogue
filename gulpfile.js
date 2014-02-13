
var gulp = require('gulp'),
    less = require('gulp-less'),
    path = require('path');

//---------------------------------------------------------
// Constants
//---------------------------------------------------------

var BUILD_DIR = './build';

//---------------------------------------------------------
// Clean
//---------------------------------------------------------

gulp.task('clean', function() {
  return gulp.src('public', { read: false })
    .pipe(clean());
});

//---------------------------------------------------------
// LESS Task
//---------------------------------------------------------

gulp.task('less', function() {
  var options = { paths: [ path.join(__dirname, 'lib', 'less') ] };
  return gulp.src('lib/less/**/*.less')
    .pipe(less(options))
    .pipe(gulp.dest(BUILD_DIR + '/css'));
});

//------------------------------------------------
// Rerun the task when an asset file changes
//------------------------------------------------

gulp.task('watch-assets', function () {
   gulp.watch('lib/less/**/*.less', ['less']);
});

//------------------------------------------------
// Main Entrypoints
//------------------------------------------------

gulp.task('default', ['less', 'watch-assets']);
gulp.task('build', ['less']);
