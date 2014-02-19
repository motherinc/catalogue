
// Dependencies

var carbon = require('../plugins/carbon'),
    swig = require('swig'),
    templates = require('../../build/js/templates');

require('jquery-scrollable-table');

// Constructor

function Model($container, options) {
   this.$container = $container;
   this.model = options.model;
   carbon.api.get('/model/' + this.model + '/documents', null, displayDocs.bind(this));
}

// Private Functions

var displayDocs = function(err, results) {
   var paginationHtml = swig.run( templates['partials/model.pagination.html'], results );
   var resultsHtml = swig.run( templates['partials/model.results.html'], results );
   this.$container.find('#model-pagination').html( paginationHtml );
   this.$container.find('#results-container').html( resultsHtml );

   // Fixed table header
   var $table = this.$container.find("#model-docs-table");
   $table.floatThead({
      scrollingTop: 90,
      debounceResizeMs: 3,
      useAbsolutePositioning: false,
       scrollContainer: function($table){
         return $table.closest('#results-container');
      }
   });
}

// Expose

module.exports = exports = Model;
