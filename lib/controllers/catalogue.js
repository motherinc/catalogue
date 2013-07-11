
module.exports = function(req, res) {
   var modelNames = req.db.modelNames();
   res.render( 'catalogue.html', { models : modelNames } );
};