
(function(undefined) {

   //-----------------------------------------------
   // # Setup
   //-----------------------------------------------

   var carbon = {};

   //-----------------------------------------------
   // # Constants
   //-----------------------------------------------

   var API_URL = '/api/';

   //-----------------------------------------------
   // # Logging + Console Fallback
   //-----------------------------------------------

   var consoleSupported = ( window.console !== undefined );
   if( ! consoleSupported ) console = window.console || { log : function() {} };
   if( consoleSupported && console.log.bind ) carbon.log = console.log.bind( console );

   //-----------------------------------------------
   // # Atrim - To Be Deprecated
   //-----------------------------------------------

   function atrim(str, char) {
      var ltrimmed = str.replace(new RegExp("^["+char+"]+","g"),"");
      var trimmed  = ltrimmed.replace(new RegExp("["+char+"]+$","g"),"");
      return trimmed;
   };

   carbon.atrim = atrim;

   // ----------------------------------------------------
   // # Inception
   // ----------------------------------------------------

   carbon.incept = function(options) {
      var app        = options.url || $(this).attr('href'),
          container  = options.container,
          callback   = options.callback;
      
      if( ! app ) {
         throw new Error('You must specify an app to incept');
      }

      // If this function was applied to a link element, change the URL
      if( options.url && typeof $.address !== 'undefined' ) {
         $.address.value( app );
      }

      $.get( app, null, function(data) {
         $(container).html(data);
         if( callback ) callback();
      }, 'html');

      return false;
   }
   
   //-----------------------------------------------
   // # API
   //-----------------------------------------------
      
   carbon.api = new function()
   {
      var self = this,
         operations = ['get', 'add', 'update', 'remove'],
         actionMethodMap = {
            get      : 'get',
            add      : 'post',
            update   : 'put',
            remove   : 'delete'
         };

      // Emit the request over HTTP
      var request = function(action, resource, data, options, callback) {
         // If action or resource is a falsey, throw error
         if( ! action || ! resource )
            return;

         var ajaxSettings = {};

         // If no data is specified, that's fine
         if( typeof data === 'undefined' )
            data = {};

         if( arguments.length == 5 && typeof options !== 'undefined' ) {
            if( options.html ) ajaxSettings.contentType = 'text/html';

            var parsed = self._parseRequestOptions(options);
            var query = $.extend({}, parsed, data);
            query = $.param(query);

            if( resource.indexOf('?') == -1 ) resource += '?' + query;
            else resource += '&' + query;
         }
         else {
            callback = options;
         }

         // The rest of the AJAX settings
         ajaxSettings.url  = (API_URL + resource).replace('//', '/');
         ajaxSettings.type = actionMethodMap[action];
         ajaxSettings.data = data;

         if( callback ) {
            ajaxSettings.success = function() {
               if( callback.length == 1 ) return callback( arguments[0] );
               else return callback( null, arguments[0] );
            }
            ajaxSettings.error = function() {
               if( callback.length == 1 ) return callback( null );
               else return callback( arguments[2], null );
            }
         }

         // Make the request
         $.ajax( ajaxSettings );
      }

      // Forward all CRUD operations to request  
      for( var i = 0; i < operations.length; i++ ) {
         self[ operations[i] ] = (function(op) { 
            return function() {
               var a = Array.prototype.slice.call(arguments, 0); 
               a.unshift(op); 
               request.apply(self, a); 
            }
         })( operations[i] );
      }

      this.url = function(resource, options) {
         if( typeof options === 'undefined' ) return null;

         var parsed = self._parseRequestOptions(options);
         var query = $.extend({}, parsed);
         query = $.param(query);

         if( resource.indexOf('?') == -1 ) resource += '?' + query;
         else resource += '&' + query;

         return (API_URL + resource).replace('//', '/');
      }

      // Listen via WebSockets/socket.io for messages
      if( typeof carbon.socketio !== 'undefined' )
         this.subscribe = carbon.socketio.listen;

      // Take request options and parse them so that they can be serialized
      this._parseRequestOptions = function(options) {
         var parsed = {};

         if( typeof options.filter !== 'undefined' ) {
            for( var key in options.filter ) 
               parsed['_filter_' + key] = options.filter[key];
         }

         if( typeof options.populate !== 'undefined' ) {
            for( var key in options.populate ) 
               parsed['_populate_' + key] = options.populate[key];
         }

         if( typeof options.options !== 'undefined' ) {
            for( var key in options.options ) 
               parsed['_options_' + key] = options.options[key];
         }
         
         if( typeof options.select !== 'undefined' ) {
            if( Object.prototype.toString.call(options.select) !== '[object Array]' ) {
               options.select = options.select.split(' ');
            }
            parsed = $.extend({}, { _select : options.select.join(',') }, parsed);
         }

         if( typeof options.sort !== 'undefined' ) {
            if( Object.prototype.toString.call(options.sort) !== '[object Array]' ) {
               options.sort = options.sort.split(' ');
            }
            parsed = $.extend({}, { _sort : options.sort.join(',') }, parsed);
         }

         if( typeof options.limit !== 'undefined' ) {
            parsed = $.extend({}, { _limit : options.limit }, parsed);
         }

         if( typeof options.html !== 'undefined' ) {
            parsed = $.extend({}, { _template : options.html }, parsed);
         }

         return parsed;
      }
   }
   
   //-----------------------------------------------
   // # Templates
   //-----------------------------------------------

   carbon.templates = new function() 
   {
      var _templates = {};
      this.register = function(path, fn) {
         console.log(path)
         _templates[path] = fn;
      };
      this.render = function(path, data) {
         console.log( _templates, path  )
         if( _templates[path] && typeof swig !== 'undefined' ) {
            console.log('hi')
            return swig.run(_templates[path], data);
         }
         return '';
      }
   }

   carbon.scripts = new function() 
   {
      var _scripts = {};
      this.register = function(path, fn) {
         _scripts[path] = fn;
      };
      this.run = function(path, data) {
         if( _scripts[path] )
            return _scripts[path]();
         else console.log('Script not registered: ' + path);
      }
   }

   //-----------------------------------------------
   // # Exposing Carbon
   //-----------------------------------------------

   this['carbon'] = carbon;

}).call(this);