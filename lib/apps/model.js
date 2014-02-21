
// Dependencies

var carbon = require('../plugins/carbon'),
    swig = require('swig'),
    templates = require('../../build/js/templates');

require('jquery-scrollable-table');
require('jquery-serialize');

// Constructor

function Model($container, options) {
   this.$container = $container;
   this.model = options.model;
   setupDelegates.call(this);
   fetchDocs.call(this);
}

// Private Functions

function setupDelegates() {
   var $container = this.$container;
   $container.find('#model-options-form').submit(saveOptions.bind(this));
   $container.find('#model-options a').click(displayOptionsModal.bind(this));
}

function fetchDocs() {
   var options = ( localStorage[this.model] ) ? JSON.parse(localStorage[this.model]) : {};
   carbon.api.get('/model/' + this.model + '/documents?' + $.param(options), null, displayDocs.bind(this));
}

function displayDocs(err, results) {
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
      scrollContainer: function($table) {
         return $table.closest('#results-container');
      }
   });
}

function saveOptions(e) {
   var $form = this.$container.find('#model-options-form');
   var data = $form.serializeObject();
   var fieldTypes = {
      filter   : 'string',
      select   : 'string',
      sort     : 'string',
      limit    : 'number',
      populate : 'object'
   };



   for( var i in data ) {
      if( data.hasOwnProperty(i) ) {
         if( ! data[i].trim() ) {
            delete data[i];
         }
         else {
            try {
               // if( fieldTypes[i] == 'object' ) {
               //    data[i] = JSON.parse(data[i]);
               // }
               data[i] = encodeURIComponent(data[i]);
            } catch(e) {
               console.log(e);
            }
         }
      }
   }

   localStorage[this.model] = JSON.stringify(data);
   fetchDocs.call(this);
   this.$container.find('#options-modal').fadeOut('fast');
   return false;
}

function displayOptionsModal() {
   var options = ( localStorage[this.model] ) ? JSON.parse(localStorage[this.model]) : {};
   var $modal = this.$container.find('#options-modal');

   // Filter
   var filter = options.filter || '{}';
   $modal.find('[name="filter"]').val( decodeURIComponent(filter) );

   // Select
   var select = options.select || '';
   $modal.find('[name="select"]').val(decodeURIComponent(select));

   // Sort
   var sort = options.sort || '';
   $modal.find('[name="sort"]').val(decodeURIComponent(sort));

   // Limit
   var limit = options.limit || 10;
   $modal.find('[name="limit"]').val(decodeURIComponent(limit));

   // Populate
   var populate = options.populate || '{}'; // JSON.stringify(options.populate || {}, undefined, 3);
   $modal.find('[name="populate"]').val(decodeURIComponent(populate));

   $modal.fadeIn('fast');
}

// Expose

module.exports = exports = Model;
