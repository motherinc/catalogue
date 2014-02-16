
var app = module.parent.exports.app;

// ----------------------------------------------------
// # API Routes
// ----------------------------------------------------

var api = require('../controllers/api');

app.get( '/api/model/:model/documents', api.getDocs );
app.post( '/api/model/:model/document', api.addDoc );
app.put( '/api/model/:model/document/:id', api.updateDoc );
app.delete( '/api/model/:model/document/:id', api.deleteDoc );


// ----------------------------------------------------
// # Web App Routes
// ----------------------------------------------------

// If it's not an AJAX request, just send the main page regardless of the path.
// The client logic will then invoke an AJAX request for the appropriate path.

app.get('*', function(req, res, next) {
   if( ! req.xhr ) return res.render( 'index' );
   else next();
});

app.get( '/', require('../controllers/catalogue') );
app.get( '/catalogue', require('../controllers/catalogue') );
app.get( '/model/:model', require('../controllers/model') );
app.get( '/model/:model/document/new', require('../controllers/document.new') );
app.get( '/model/:model/document/:id', require('../controllers/document.update') );