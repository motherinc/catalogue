
// Dependencies

var carbon = require('../plugins/carbon'),
    swig = require('swig'),
    templates = require('../../build/js/templates');

require('jquery-scrollable-table');
require('jquery-serialize');

// Defaults

var defaults = {
   limit: 50
};

// Constructor

function Model($container, options) {
   this.$container = $container;
   this.model = options.model;
   this.options = loadOptions.call(this);

   var page = parseInt(options.page);
   this.options.page = !isNaN(page) ? page : 1;
   this.options.skip = this.options.limit * (this.options.page - 1);

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
   var options = encodeOptions( this.options );
   carbon.api.get('/model/' + this.model + '/documents?' + $.param(options), null, displayDocs.bind(this));
}

function displayDocs(err, results) {
   var html = swig.run( templates['partials/model.results.html'], results );
   this.$container.find('#results-container').html( html );
   updatePaginationControls.call(this, results.documents.length, parseInt(results.total));

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

function updatePaginationControls(pageDocsCount, totalDocsCount) {
   var $container = this.$container.find('#model-pagination');
   var $left = $container.find('a:eq(0)');
   var $label = $container.find('#model-results-label');
   var $right = $container.find('a:eq(1)');

   if( totalDocsCount == 0 ) {
      $left.hide();
      $label.html('No results found');
      $right.hide();
      return;
   }

   var pageStart = this.options.skip + 1;
   var pageEnd = this.options.skip + pageDocsCount;

   $label.html( pageStart + ' - ' + pageEnd + ' / ' + totalDocsCount );

   if( this.options.skip == 0 ) {
      $left.hide();
   } else {
      $left.attr('href', '/model/' + this.model + '/' + (this.options.page-1));
      $left.show();
   }

   if( (pageDocsCount + this.options.skip) >= totalDocsCount ) {
      $right.hide();
   } else {
      $right.attr('href', '/model/' + this.model + '/' + (this.options.page+1));
      $right.show();
   }
}

function saveOptions(e) {
   var $form = this.$container.find('#model-options-form');
   this.options = $form.serializeObject();
   this.options.skip = 0;

   localStorage[this.model] = JSON.stringify(encodeOptions(this.options));
   fetchDocs.call(this);
   this.$container.find('#options-modal').fadeOut('fast');
   return false;
}

function displayOptionsModal() {
   var $modal = this.$container.find('#options-modal');
   
   $modal.find('[name="filter"]').val( this.options.filter || '{}' );
   $modal.find('[name="select"]').val( this.options.select || '' );
   $modal.find('[name="sort"]').val( this.options.sort || '' );
   $modal.find('[name="limit"]').val( this.options.limit || 10 );
   $modal.find('[name="populate"]').val( this.options.populate || '{}' );

   $modal.fadeIn('fast');
}

// Options Helpers

function loadOptions() {
   var options = ( localStorage[this.model] ) ? JSON.parse(localStorage[this.model]) : {};
   options = decodeOptions(options);

   var limit = parseInt(options.limit);
   if( !isNaN(limit) ) options.limit = limit;
   else delete options.limit;

   options = $.extend({}, defaults, options);
   return options;
}

function decodeOptions(options) {
   var decodedOptions = {};
   for( var i in options ) {
      if( options.hasOwnProperty(i) ) {
         if( options[i] ) {
            decodedOptions[i] = decodeURIComponent(options[i]);
         }
      }
   }

   return decodedOptions;
}

function encodeOptions(options) {
   var encodedOptions = {};
   for( var i in options ) {
      if( options.hasOwnProperty(i) ) {
         if( options[i] ) {
            encodedOptions[i] = encodeURIComponent(options[i]);
         }
      }
   }

   return encodedOptions;
}

// Expose

module.exports = exports = Model;
