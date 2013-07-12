
module.exports = function(req, res) {
   res.locals.model = req.params.model;
   res.locals._id = req.params.id;
   res.locals.edit = true;
   
   res.locals.scripts = [
      '/js/catalogue/document.update.client.js'
   ];

   var model = req.db.model( req.params.model );
   var schema = model.schema;

   var fieldData = [];
   var fields = [];

   schema.eachPath(function(path, type) {
      if( path == '__v' ) return;

      var field = { name : path };
      if( type.instance == 'ObjectID' ) {
         field.type = 'ObjectId';
         field.ref = type.options.ref;
      }
      
      fields.push( path );
      fieldData.push( field );
   });

   var selectString = fields.join(' ');
   model.findById(req.params.id).select(selectString).lean().exec(function(err, doc) {
      if( err ) return res.send(200, 'Error querying for data');
      if( ! doc ) return res.send(200, 'No results found');
      res.render( 'document.html', { fields : fieldData, doc : doc, docString : JSON.stringify(doc, null, '\t') } );
   });
};