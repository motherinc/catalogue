
module.exports = function(req, res, next) {
   var model = req.db.model( req.params.model );

   model.create(req.body.data, function(err, doc) {
      if( err ) return res.send( 500, err );
      else return res.send( 200, doc._id );
   });
};