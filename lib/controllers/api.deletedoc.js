
module.exports = function(req, res, next) {
   var model = req.db.model( req.params.model );

   model.remove({ _id : req.params.id }, function(err, doc) {
      if( err ) return next( err );
      return res.send( 200, doc._id );
   });
};