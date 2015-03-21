
exports.jsonpath = function(input, path) {
   var elements = path.split('.');
   var obj = input;
   
   try {
      if( obj && typeof obj === 'object' ) {
         for( var i = 0; i < elements.length; i++ ) {
            if( obj && obj.hasOwnProperty( elements[i] ) ) {
               obj = obj[ elements[i] ];
            }
            else {
               return '';
            }
         }
      }
      return obj;
   } 

   catch(e) {
      return '';
   }
}
