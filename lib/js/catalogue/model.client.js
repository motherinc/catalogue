$(document).ready(function() {

   var _model = $('#_model').val();
   var url = new Url(  );
   var operations = ['filter', 'select', 'sort', 'limit', 'populate'];


   for( var i = 0; i < operations.length; i++ ) {
      var operationValue = '';
      var remember = false;

      if( url.query[operations[i]] ) operationValue = decodeURIComponent( url.query[operations[i]] );
      if( store.get( _model + ' ' + operations[i] ) ) {
         operationValue = store.get( _model + ' ' + operations[i] );
         remember = true;
      }

      $( '#' + operations[i] ).prompt({
         html : carbon.templates.render( 'partials/model.prompt.html', { 
            body : operationValue, 
            operation : operations[i],
            remember : remember
         }),
         callback : (function(operation) {
            return function(results) {
               if( ! results ) return false;

               if( results.body == '' && url.query[operation] ) delete url.query[operation];
               else url.query[operation] = results.body;
               
               if( results.remember ) store.set( _model + ' ' + operation, results.body );
               else store.remove(  _model + ' ' + operation );

               if( operation == 'filter' ) delete url.query.skip;
               document.location = url;
            }
         })( operations[i] )
      });
   }

   (function init() {
      var storedPrefs = {};
      for( var i = 0; i < operations.length; i++ ) {
         if( store.get( _model + ' ' + operations[i] ) ) storedPrefs[ operations[i] ] = store.get( _model + ' ' + operations[i] );
      }

      var url = new Url;
      var data = $.extend(storedPrefs, url.query);

      $.get('/api/model/' + _model + '/documents?' + data, function(results) {
         var paginationHtml = carbon.templates.render( 'partials/model.pagination.html', results );
         var resultsHtml = carbon.templates.render( 'partials/model.results.html', results );
         $('#model-pagination').html( paginationHtml );
         $('#results-container').html( resultsHtml );

         // Fixed table header
         var $table = $("#model-docs-table");
         $table.floatThead({
            scrollingTop: 90,
            debounceResizeMs: 3,
            useAbsolutePositioning: false,
             scrollContainer: function($table){
               return $table.closest('#results-container');
            }
         });
         //$('#model-docs-table').resizableColumns({ store : store });
      });
   })()

   $('#results-container').on('click', 'tr:gt(0)', function(e) {
      var id = $(this).data('id');
      if( e.target.nodeName.toLowerCase() !== 'a' ) {
         $.address.value( '/model/' + _model + '/document/' + id );
         return false;
      }
   });

});

