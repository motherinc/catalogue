var express = require('express'),
    extend  = require('xtend');

module.exports = function(options) {

   // ----------------------------------------------------
   // # Options
   // ----------------------------------------------------

   var defaults = {
      port : 4444
   };

   options = extend({}, defaults, options);

   // ----------------------------------------------------
   // # No Cache Header value
   // ----------------------------------------------------

   var noCacheHeader = 'no-cache, private, no-store, must-revalidate, \
                        max-stale=0, post-check=0, pre-check=0';

   // ----------------------------------------------------
   // # Template Engine
   // ----------------------------------------------------

   var cacheTemplates = false;

   var swig = require('swig').init({ 
      cache          : cacheTemplates, 
      allowErrors    : true, 
      filters        : require('./js/swig.helpers.js'),
      root           : __dirname + '/views'
   });

   // ----------------------------------------------------
   // # Web App
   // ----------------------------------------------------

   var cons    = require('consolidate'),
       app     = express();

   app.set('db', options.connection);

   var config = require('./config');
   app.locals.scripts = config.scripts || [];
   app.locals.stylesheets = config.stylesheets || [];

   app.engine('.html', cons.swig);
   app.set('view engine', 'html');
   app.set('view options', { layout: false });
   app.set('views', __dirname + '/views');

   app.use(express.bodyParser());
   app.use(express.methodOverride());

   // Ensure responses are not cached
   app.use(function(req, res, next) {
      res.header('Cache-Control', noCacheHeader);
      next();
   });

   // Expose the mongoose connection
   app.use(function(req, res, next) {
      req.db = app.get('db');
      next();
   });

   app.use('/js', express.static(__dirname + '/js'));
   app.use('/css', express.static(__dirname + '/css'));
   app.use(express.favicon());
   app.use(app.router);

   app.listen(options.port, function() {
      console.log('Catalogue Ready');
   });

   module.exports.app = app;
   routes = require('./routes');
}