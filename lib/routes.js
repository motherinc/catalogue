
var app = module.parent.exports.app;

// ----------------------------------------------------
// # API Routes
// ----------------------------------------------------

var apiController = require('./controllers/api');
app.get( /api\/template\/(.*)/, apiController.templates );
app.get( '/api/model/:model/documents', apiController.getDocs );
app.put( '/api/model/:model/document/:id', apiController.updateDoc );


// ----------------------------------------------------
// # Web App Routes
// ----------------------------------------------------

// If it's not an AJAX request, just send the main page regardless of the path.
// The client logic will then invoke an AJAX request for the appropriate path.

app.get('*', function(req, res, next) {
   if( ! req.xhr ) return res.render( 'index' );
   else next();
});

app.get( '/', require('./controllers/catalogue') );
app.get( '/catalogue', require('./controllers/catalogue') );
app.get( '/model/:model', require('./controllers/model') );
app.get( '/model/:model/document/:id', require('./controllers/document') );