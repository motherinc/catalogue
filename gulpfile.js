
var gulp = require('gulp'),
    less = require('gulp-less'),
    swig = require('gulp-swig'),
    path = require('path');

//---------------------------------------------------------
// # Constants
//---------------------------------------------------------

var BUILD_DIR = './lib/build';

//---------------------------------------------------------
// # Production Tasks
//---------------------------------------------------------

gulp.task('less', function() {
  gulp.src('lib/less/*.less')
    .pipe(less({
      paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .pipe(gulp.dest(BUILD_DIR + '/css'));
});

// gulp.task('swig', function() {
//   gulp.src('lib/views/partials/*.html')
//     .pipe(swig())
//     .pipe(gulp.dest(BUILD_DIR + '/views/partials'))
// });


// The default task (called when you run `gulp`)
gulp.task('default', function() {
  gulp.run('less');
});

//---------------------------------------------------------
// # Development Tasks
//---------------------------------------------------------

gulp.task('watch-less', function() {
  gulp.watch('lib/less/*.less', function() {
    gulp.run('less');
  });
});