module.exports = function(req, res) {
   res.locals.scripts = [
      '/js/catalogue/model.client.js'
   ];

   res.locals.model = req.params.model;
   res.render( 'model.html' );
}