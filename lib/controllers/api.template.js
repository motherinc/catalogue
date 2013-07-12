
var fs = require('fs');

// Fetch Template

module.exports = function(req, res, next) {
   var templatePath = req.params[0];

   fs.readFile( __dirname + '/../views/' + templatePath, 'utf8', function(err, data) {
      if( err ) return next( err );
      res.set({ 'Content-Type': 'application/javascript' });
      res.send( 'carbon.templates.register("' + templatePath + '", "' + escape(data) + '");' );
   });
};
