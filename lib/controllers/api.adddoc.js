
module.exports = function(req, res, next) {
   var model = req.db.model( req.params.model );

   model.create(req.body.data, function(err, doc) {
      if( err ) return next( err );
      return res.send( 200, doc._id );
   });
};