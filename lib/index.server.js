
var DEV = typeof process.env.CATALOGUE !== 'undefined';

var express = require('express'),
    extend = require('xtend'),
    ms = require('ms'),
    path = require('path'),
    swig = require('swig');

var staticPath = path.join(__dirname, '..', 'build'),
    staticOptions = {},
    noCacheHeader = 'no-cache, private, no-store, must-revalidate, \
                     max-stale=0, post-check=0, pre-check=0';

if(!DEV) {
   staticOptions.maxAge = ms('1d');
}

var defaults = { 
   port: 4444
};


function Catalogue(mongooseInstance, options) {

   // Setup options
   options = options || {};
   options = extend({}, defaults, options);   
   if ( ! mongooseInstance ) {
      throw new Error('You must provide catalogue with a mongoose instance');
   }

   // Create an express app
   var app = this.app = express();

   // View configuration
   app.engine('html', swig.renderFile);
   app.set('view engine', 'html');
   app.set('views', __dirname);

   if( DEV ) {
      swig.setDefaults({ cache: false });
   }

   // Static Assets   
   app.use( '/plugins', express.static(__dirname + '/plugins'), staticOptions );
   app.use( '/assets/images', express.static(__dirname + '/assets/images'), staticOptions );
   app.use( '/css', express.static(staticPath + '/css'), staticOptions );
   app.use( '/build/js', express.static(staticPath + '/js'), staticOptions );

   app.use(express.json());
   app.use(express.urlencoded());
   app.use(express.methodOverride());

   // Ensure responses are not cached
   app.use(function(req, res, next) {
      res.header('Cache-Control', noCacheHeader);
      next();
   });

   // Expose the mongoose connection instance to the routes
   app.set('db', mongooseInstance);
   app.use(function(req, res, next) {
      req.db = app.get('db');
      next();
   });

   app.use(express.favicon());
   app.use(app.router);

   // Error Handling
   app.use(function(err, req, res, next) {
      console.error(err.stack);
      res.send(500, err.message);
   });

   // Start Listening
   app.listen(options.port, function() {
      console.log('Catalogue Ready on Port ' + options.port);
   });

   // API Routes
   var api = require('./server/api');
   app.get('/api/models', api.models);
   app.get('/api/model/:model/documents', api.getDocs);
   app.get('/api/model/:model/document/:id', api.getDoc);
   app.post('/api/model/:model/document', api.addDoc);
   app.put('/api/model/:model/document/:id', api.updateDoc);
   app.delete('/api/model/:model/document/:id', api.deleteDoc);

   // Web App Routes
   app.get('*', function(req, res, next) {
      if( ! req.xhr ) return res.render( 'index' );
      else next();
   });

   return this;
}


function createCatalogue() {
   return Catalogue.apply(null, arguments);
}


exports = module.exports = createCatalogue;

