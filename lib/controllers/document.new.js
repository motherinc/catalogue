
module.exports = function(req, res) {
   res.locals.model = req.params.model;
   res.locals._id = req.params.id;

   res.locals.scripts = [
      '/js/catalogue/document.new.client.js'
   ];

   var model = req.db.model( req.params.model );
   var schema = model.schema;

   var fieldData = [];
   var fields = [];

   var selectString = fields.join(' ');
   
   res.render( 'document.html', { fields : fieldData, docString : JSON.stringify({}, null, '\t') } );
};