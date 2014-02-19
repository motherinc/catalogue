
//-----------------------------------------------
// # Setup
//-----------------------------------------------

var $ = require('jquery');
var carbon = {};
var API_URL = '/api/';

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
            return callback( null, arguments[0] );
         }
         ajaxSettings.error = function() {
            return callback( arguments[2], null );
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
// # Exposing Carbon
//-----------------------------------------------

exports.api = carbon.api;
