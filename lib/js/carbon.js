
/*------------------------------------------------------------------

     [ CARBON ]

     Crafted by     :  Mother
     Version        :  0.1

-------------------------------------------------------------------*/

(function(undefined) {

   //-----------------------------------------------
   // # Setup
   //-----------------------------------------------

   var carbon = {};

   //-----------------------------------------------
   // # Utils
   //-----------------------------------------------

   var atrim = function(str, char) {
      var ltrimmed = str.replace(new RegExp("^["+char+"]+","g"),"");
      var trimmed  = ltrimmed.replace(new RegExp("["+char+"]+$","g"),"");
      return trimmed;
   };

   //-----------------------------------------------
   // # Logging Binding + Console Fallback
   //-----------------------------------------------

   var consoleSupported = ( window.console !== undefined );
   if( ! consoleSupported ) console = window.console || { log : function() {} };
   if( consoleSupported && console.log.bind ) carbon.log = console.log.bind( console );

   // ----------------------------------------------------
   // # Address Logic (jQuery Address)
   // ----------------------------------------------------

   if( typeof $.address !== 'undefined' ) 
   {
      carbon.$address = new function() {

         // Check for push state support
         var state   = ( window.history.pushState !== undefined ),
             init    = true;

         $.address
            .state('/')
            .init(function() {
               $('body').on('click', 'a', function() {  
                   $.address.value( $(this).attr('href') );  
                   return false;
               });
            })
            .change(addressHasChanged);

         function addressHasChanged(event) {
            $('#viewport').load( event.value, function(response, status, xhr) {
               if (status == "error") {
                  var msg = "Sorry but there was an error: <br/><br/>";
                  $("#viewport").html(msg + xhr.status + " " + response);
               }
            });
         }
      }
   }

   //-----------------------------------------------
   // # Benchmarking
   //-----------------------------------------------

   var Benchmark = function(name) {
      this.name  = name;
      this.start = ( new Date() ).getTime();
      this.end   = 0;
   }

   Benchmark.prototype.stop = function() {
      this.end = ( new Date() ).getTime();
      var diff = this.end - this.start;
      carbon.log('Carbon Benchmarker: "' + this.name  + '" took ' + diff + ' ms');
   }

   carbon.benchmark = function(name) {
      return new Benchmark(name);
   }

   //-----------------------------------------------
   // # Templates
   //-----------------------------------------------

   if( typeof swig !== 'undefined' )
   {
      carbon.templates = new function() {
         var templates = {};

         this.init = function(options) {
            swig.init(options || {});
         }

         this.register = function(name, template) {
            name = atrim(name, '/');

            // Template has already been registered
            if( typeof templates[name] !== 'undefined' ) 
               return;

            // TODO: Unescaping the template should be an option
            template = unescape(template);
            var template = swig.compile(template, { filename : name });
            templates[name] = template;
         }

         this.render = function(name, data) {
            name = atrim(name, '/');
            if( typeof templates[name] === 'undefined' )
               throw new Error('Template "' + name + '" has not been registered.');
            else return templates[name](data);
         }
      }
   }

   // ----------------------------------------------------
   // # Do
   // ----------------------------------------------------

   carbon.do = function(carbonFn) {
      var args = Array.prototype.slice.call(arguments, 1);
      return function () {
         return carbon[carbonFn].apply(
             this, args.concat(Array.prototype.slice.call(arguments))
         );
      };
   }

   //-----------------------------------------------
   // # Exposing Carbon
   //-----------------------------------------------

   this['carbon'] = carbon;

}).call(this);
