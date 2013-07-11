module.exports = function(req, res) {
   res.locals.scripts = [
      '/js/catalogue/model.client.js'
   ];

   res.locals.templates = [
      'partials/model.results.html',
      'partials/model.pagination.html',
      'partials/model.prompt.html'
   ];

   res.locals.model = req.params.model;
   res.render( 'model.html' );
}