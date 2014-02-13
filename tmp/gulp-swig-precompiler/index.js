'use strict';

var PLUGIN_NAME = 'gulp-swig-precompiler';

var gutil = require('gulp-util'),
    through = require('through2'),
    swig = require('swig');


module.exports = function (options) {
   options = options || {};

   return through.obj(function (file, enc, cb) {
      if (file.isNull()) {
         this.push(file);
         return cb();
      }

      if (file.isStream()) {
         this.emit('error', new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
         return cb();
      }

      if( options.filters ) {
         for( var f in options.filters ) {
            swig.setFilter(f, options.filters[f]);
         }
      }

      try {
         var tmpl = swig.precompile(file.contents.toString(), options).tpl.toString().replace('anonymous', '');
         file.contents = new Buffer(tmpl);
         file.path = gutil.replaceExtension(file.path, '.js');
      } catch (err) {
         this.emit('error', new gutil.PluginError(PLUGIN_NAME, err));
      }

      this.push(file);
      cb();
   });
};