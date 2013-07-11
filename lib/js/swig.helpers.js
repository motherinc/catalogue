
(function(exports) {

   exports.jsonpath = function(input, path) {
      var elements = path.split('.');
      var obj = input;
      for( var i = 0; i < elements.length; i++ ) {
         if( obj.hasOwnProperty( elements[i] ) ) {
            obj = obj[ elements[i] ];
         }
         else {
            return '';
         }
      }
      return obj;
   }

})( typeof exports === 'undefined' ? this['swigHelpers'] = {} : exports );