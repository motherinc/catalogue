
var gulp    = require('gulp'),
    clean   = require('gulp-clean'),
    concat  = require('gulp-concat'),
    less    = require('gulp-less'),
    swig    = require('gulp-swig-precompile'),
    uglify  = require('gulp-uglify'),
    path    = require('path');

//---------------------------------------------------------
// Constants
//---------------------------------------------------------

var BUILD_DIR = './build';

//---------------------------------------------------------
// Clean
//---------------------------------------------------------

gulp.task('clean', function() {
   return gulp.src(BUILD_DIR, { read: false })
      .pipe(clean());
});

//---------------------------------------------------------
// Less Compilation Task
//---------------------------------------------------------

gulp.task('less', function() {
   var options = { paths: [ path.join(__dirname, 'lib', 'less') ] };
   return gulp.src('lib/less/**/*.less')
      .pipe(less(options))
      .pipe(gulp.dest(BUILD_DIR + '/css'));
});

//---------------------------------------------------------
// Templates
//---------------------------------------------------------
   
gulp.task('templates', function() {
   var base = path.join(__dirname, 'lib/views');
   var tpl = 'carbon.templates.register("<%= file.relative %>", <%= template %>);'
   return gulp.src('lib/views/partials/**/*.html', { base : base })
      .pipe(swig({ output : tpl, filters : require('./lib/js/swig.helpers') }))
      .pipe(concat('templates.js'))
      .pipe(uglify())
      .pipe(gulp.dest(BUILD_DIR + '/js'));
});

//------------------------------------------------
// Rerun the task when an asset file changes
//------------------------------------------------

gulp.task('watch-assets', function () {
   gulp.watch('lib/less/**/*.less', ['less']);
   gulp.watch('lib/views/partials/**/*.html', ['templates']);
});

//------------------------------------------------
// Main Entrypoints
//------------------------------------------------

gulp.task('build', ['less', 'templates']);
gulp.task('default', ['build', 'watch-assets']);
