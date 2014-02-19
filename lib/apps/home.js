
// Dependencies

var carbon = require('../plugins/carbon'),
    swig = require('swig'),
    templates = require('../../build/js/templates');

// Constructor

function Home($container) {
   this.$container = $container;
   carbon.api.get('/models', null, displayModels.bind(this));
}

// Private Functions

var displayModels = function(err, models) {
   var html = models.reduce(function(html, model) {
      return html + swig.run( templates['partials/model.link.html'], { model: model } );
   }, '');

   this.$container.find('#models-list').html(html);
}

// Expose

module.exports = exports = Home;

