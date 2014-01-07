/*------------------------------------------------------------------

     [ CARBON ]

     Crafted by     :  Mother
     Version        :  0.0.2

     Dependencies   :   jQuery 1.9.1+
                        jQuery address 1.6+
                        socket.io
                        swig 1.2.2+

-------------------------------------------------------------------*/

(function(undefined) {

   //-----------------------------------------------
   // # Setup
   //-----------------------------------------------

   var carbon = {};

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
   
   // ----------------------------------------------------
   // # Pub/Sub
   // ----------------------------------------------------

   carbon._subscribers = {};

   carbon.publish = function(channel, data) {
      var subscribers = carbon._subscribers[channel] || [];
      for( var i = 0; i < subscribers.length; i++ )
         subscribers[i].apply(this, [data] || []);
   }

   carbon.subscribe = function(channel, handlers) {
      carbon._subscribers[channel] = carbon._subscribers[channel] || [];
      for( var i = 1; i < arguments.length; i++ ) 
         carbon._subscribers[channel].push(arguments[i]);
   }

   carbon.unsubscribe = function(channel) {
      if( carbon._subscribers[channel] )
         carbon._subscribers[channel] = [];
   }
   
   //-----------------------------------------------
   // # Socket.io / WebSockets
   //-----------------------------------------------

   if( typeof io !== 'undefined' ) 
   {
      carbon.socketio = new function() 
      {
         var state      = 0,
            socket      = null,
            callbacks   = {},
            queue       = {};

         this.connect = function() {

            // Only supporting websockets + long polling
            var transports = [
               'websocket', 
               'xhr-polling',
               'xhr-multipart'
            ];

            var settings = {
               'connect timeout'           : 2000,
               'reconnect'                 : true,
               'reconnection delay'        : 500,
               'max reconnection attempts' : 20,
               'try multiple transports'   : true,
               'secure'                    : true,
               'transports'                : transports
            };

            socket = io.connect(null, settings);
            socket.on('connect', function(data) {

               // Do nothing if the it's been initialized
               if( state === 1 ) return;
               state = 1;

               // Emit all the messages in the queue
               for( var msg in queue ) {
                  for( var i = 0; i < queue[ msg ].length; i++ ) {
                     var options = queue[ msg ][ i ][0];
                     var callback = queue[ msg ][ i ][1];
                     socket.emit(msg, options, callback);
                  }
               }

               queue = [];
            });

            // TODO: Clean this up, try to relay directly to callback
            socket.on('__carbon.socketio.listen', function(relayData) {
               var msg  = relayData.carbonMsg;
               var data = relayData.data;
               for( var i in callbacks[msg] )
                  callbacks[ msg ][ i ]( data );
            });
         }

         this.listen = function(msg, callback) {
            
            if( ! callbacks[ msg ] )
               callbacks[ msg ] = new Array();

            // TODO: Remove this shit
            // TODO: A very inefficient way to make sure the same function is not added multiple times
            for( var i in callbacks[msg] ) {
               if( callbacks[msg][i] && callbacks[msg][i].toString() == callback.toString() ) {
                  callbacks[msg][i] = callback;
                  return;
               }
            }

            // Add callback for that message
            callbacks[msg].push( callback );
         }

         this.emit = function(msg, options, callback, rootCallback) {

            // If socket.io connection established, just emit
            if( state === 1 ) 
               return socket.emit(msg, options, callback);

             // If the connection is not ready, queue it
            if( ! queue[ msg ] )
               queue[ msg ] = new Array();

            // TODO: Really need to clean this up...
            // A very inefficient way to make sure the same function is not added multiple times
            var callbackToCompare = rootCallback || callback;
            for( var i in queue[ msg ] ) {
               if( queue[ msg ][ i ] && queue[ msg ][ i ][2].toString() == callbackToCompare.toString() ) {
                  queue[ msg ][ i ] = [options, callback, callbackToCompare];
                  return;
               }
            }

            // Add the message to the queue
            queue[ msg ].push( [options, callback, callbackToCompare] );
         }
      }

      // Connect right away
      carbon.socketio.connect();
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

            template = unescape(template);
            var template = swig.compile(template, { filename : '/' + name });
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
      
   //-----------------------------------------------
   // # Live Stylesheets
   //-----------------------------------------------

   if( carbon.socketio ) {
      carbon.socketio.listen('/_carbon/stylesheet/updated', function(stylesheet) {
         var linkElements = document.getElementsByTagName('link');

         for( var i = linkElements.length - 1; i >= 0; i-- ) {
            var href = linkElements[i].getAttribute('href');
            if( href.indexOf('.css') == -1 || href.indexOf('http://') == 0 ) 
               continue;

            var sheetRequestIdIndex = href.indexOf('?_=');
            if( sheetRequestIdIndex != -1 ) 
               href = href.substring(0, sheetRequestIdIndex);

            linkElements[i].disabled = true;
            linkElements[i].parentNode.removeChild( linkElements[i] );

            var head    = document.getElementsByTagName("head")[0],
                cssNode = document.createElement('link');

            cssNode.type   = 'text/css';
            cssNode.rel    = 'stylesheet';
            cssNode.href   = href + '?_=' + ( new Date() ).getTime();
            head.appendChild(cssNode);
         }
      });
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
   // # Exposing Carbon
   //-----------------------------------------------

   this['carbon'] = carbon;

}).call(this);