var express = require('express'),
    extend  = require('xtend'),
    path    = require('path'),
    swig    = require('swig');

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

   // TODO: This should only apply to responses serving JSON data
   var noCacheHeader = 'no-cache, private, no-store, must-revalidate, \
                        max-stale=0, post-check=0, pre-check=0';

   // ----------------------------------------------------
   // # Web App
   // ----------------------------------------------------

   var app = express();

   app.set('db', options.connection);

   var config = require('./server/config');
   app.locals.scripts = config.scripts || [];
   app.locals.stylesheets = config.stylesheets || [];

   app.engine('html', swig.renderFile);
   app.set('view engine', 'html');
   app.set('views', __dirname + '/views');

   if( process.env.CATALOGUE ) {
      swig.setDefaults({ cache: false });
   }

   app.use(express.json());
   app.use(express.urlencoded());

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

   var staticPath = path.join(__dirname, '..', 'build');
   app.use('/js', express.static(__dirname + '/js'));
   app.use('/css', express.static(staticPath + '/css'));
   app.use('/build/js', express.static(staticPath + '/js'));

   app.use(express.favicon());
   app.use(app.router);

   app.listen(options.port, function() {
      console.log('Catalogue Ready');
   });

   module.exports.app = app;
   routes = require('./server/routes');
}