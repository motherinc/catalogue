
// Update Document

module.exports = function(req, res, next) {
   var newDoc = req.body.data;

   var model = req.db.model( req.params.model );
   var schema = model.schema;

   var keys = [];
   schema.eachPath(function(path, type) {
      keys.push( path );
   });

   model.findById(req.params.id, function(err, origDoc) {
      if( err ) return next( err );
      if( ! origDoc ) return next( new Error('Document not found') );

      for( var key in newDoc ) {
         origDoc[key] = newDoc[key];
         var keyIndex = keys.indexOf( key );
         keys.splice( keyIndex, 1 );
      }

      for( var i = 0; i < keys.length; i++ ) {
         origDoc[keys[i]] = undefined;
      }

      origDoc.save(function(err) {
         if( err ) return next( err );
         res.send( 200 );
      });
   });
};
