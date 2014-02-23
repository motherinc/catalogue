
var gulp = require('gulp'),
    clean = require('gulp-clean'),
    concat = require('gulp-concat'),
    exec = require('gulp-exec'),
    less = require('gulp-less'),
    swig = require('gulp-swig-precompile'),
    uglify = require('gulp-uglify'),
    browserify = require('gulp-browserify'),
    path = require('path');

//---------------------------------------------------------
// Constants
//---------------------------------------------------------

var BUILD_DIR = './build';
var DEV = typeof process.env.CATALOGUE !== 'undefined';

//---------------------------------------------------------
// Browserify Shims
//---------------------------------------------------------

var browserifyShims = {
   'jquery-scrollable-table' : {
      path: __dirname + '/lib/plugins/jquery.scrollable.table.js',
      depends: { jquery: 'jQuery', underscore: '_' },
      exports: null
   },

   'jquery-serialize' : {
      path: __dirname + '/lib/plugins/jquery.serialize.js',
      depends: { jquery: '$' },
      exports: null
   },

   // Code Mirror
   'codemirror' : {
      path: __dirname + '/lib/plugins/codemirror/lib/codemirror.js',
      exports: 'CodeMirror'
   },
   'codemirror/addon/fold/foldcode' : {
      path: __dirname + '/lib/plugins/codemirror/addon/fold/foldcode.js',
      depends: { codemirror: 'CodeMirror' },
      exports: null
   },
   'codemirror/addon/fold/foldgutter' : {
      path: __dirname + '/lib/plugins/codemirror/addon/fold/foldgutter.js',
      depends: { codemirror: 'CodeMirror' },
      exports: null
   },
   'codemirror/addon/fold/brace-fold' : {
      path: __dirname + '/lib/plugins/codemirror/addon/fold/brace-fold.js',
      depends: { codemirror: 'CodeMirror' },
      exports: null
   },
   'codemirror/addon/edit/matchbrackets' : {
      path: __dirname + '/lib/plugins/codemirror/addon/edit/matchbrackets.js',
      depends: { codemirror: 'CodeMirror' },
      exports: null
   },
   'codemirror/mode/javascript/javascript' : {
      path: __dirname + '/lib/plugins/codemirror/mode/javascript/javascript.js',
      depends: { codemirror: 'CodeMirror' },
      exports: null
   }
};

//---------------------------------------------------------
// Clean
//---------------------------------------------------------

gulp.task('clean', ['githooks'], function() {
   return gulp.src(BUILD_DIR, { read: false })
      .pipe(clean());
});

//---------------------------------------------------------
// Copy Git Hook
//---------------------------------------------------------

gulp.task('githooks', function() {
   return gulp.src('scripts/githooks/*')
      .pipe(gulp.dest('.git/hooks/'))
      .pipe(exec('chmod +x <%= file.path %>'));
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
// Client Scripts / Browserify
//---------------------------------------------------------

gulp.task('scripts', ['templates'], function() {
   var options = {
      insertGlobals: true,
      debug: DEV,
      shim: browserifyShims
   };

   var stream = gulp.src('lib/index.client.js', { read: false })
      .pipe(browserify(options));

   if ( ! DEV ) {
      stream.pipe(uglify());
   }
    
   return stream.pipe(gulp.dest(BUILD_DIR + '/js'));
});

//---------------------------------------------------------
// Templates
//---------------------------------------------------------
   
gulp.task('templates', function() {
   var base = path.join(__dirname, 'lib/views'),
       tpl = 'exports["<%= file.relative %>"]=<%= template %>;';
   
   return gulp.src('lib/views/**/*.html', { base: base })
      .pipe(swig({ output: tpl, filters: require('./lib/plugins/swig.helpers') }))
      .pipe(concat('templates.js'))
      .pipe(uglify())
      .pipe(gulp.dest(BUILD_DIR + '/js'));
});

//------------------------------------------------
// Rerun the task when an asset file changes
//------------------------------------------------

gulp.task('watch-assets', function () {
   gulp.watch('lib/less/**/*.less', ['less']);
   gulp.watch('lib/views/**/*.html', ['scripts']);
   gulp.watch('lib/apps/**/*.js', ['scripts']);
   gulp.watch('lib/index.client.js', ['scripts']);
});

//------------------------------------------------
// Main Entrypoints
//------------------------------------------------

gulp.task('build', ['githooks', 'less', 'templates', 'scripts']);
gulp.task('default', ['build', 'watch-assets']);
