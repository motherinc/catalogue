
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

// exports.testtag = {
//    compile : function (compiler, args, content, parents, options) {
//      return compiler(content, parents, options, args.join(''));
//    },
//    parse : function (str, line, parser) {
//      parser.on('*', function (token) {
//        this.out.push(token.match);
//      });
//      return true;
//    },
//    ends : true,
//    block : true
// };
