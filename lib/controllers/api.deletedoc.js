
module.exports = function(req, res, next) {
   var model = req.db.model( req.params.model );

   model.remove({ _id : req.params.id }, function(err, doc) {
      if( err ) return res.send( 500, err );
      else return res.send( 200, doc._id );
   });
};