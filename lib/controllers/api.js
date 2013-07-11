
var fs = require('fs'),
    async = require('async'),
    querystring = require('querystring'),
    mongoose = require('mongoose');

// Fetch Template
exports.templates = function(req, res, next) {
   var templatePath = req.params[0];

   fs.readFile( __dirname + '/../views/' + templatePath, 'utf8', function(err, data) {
      if( err ) return next( err );
      res.set({ 'Content-Type': 'application/javascript' });
      res.send( 'carbon.templates.register("' + templatePath + '", "' + escape(data) + '");' );
   });
};

// Update Document
exports.updateDoc = function(req, res, next) {
   var doc = req.body.data;
   delete doc._id;

   var model = req.db.model( req.params.model );
   model.update({ _id : req.params.id }, doc, /* { safe : false } ,*/ function(err, num, raw) {
      // console.log( err, num, raw );
      if( err ) res.send( 500, 'Error saving document' );
      else if( num == 1 ) res.send( 200, 'Document saved succesfully' );
      else res.send( 500, 'No document was saved' );
   });
};

// Get Docs 
exports.getDocs = function(req, res, next) {
   
   var defaultLimit = 100;

   res.locals.model = req.params.model;

   var model = req.db.model( req.params.model );
   var schema = model.schema;

   // Selection criteria
   if( req.query.select ) {
      var fields = req.query.select.split(' ');
      if( fields.indexOf('_id') == -1 ) fields.unshift('_id');
   } 

   // No selection criteria
   else {
      var fields = ['_id'];
   }

   var fieldData = [{
      name : '_id',
      type : 'ObjectId',
      ref  : req.params.model
   }];    

   schema.eachPath(function(path, type) {
      if( req.query.select && fields.indexOf( path ) == -1 ) return;
      
      if( path == '__v' ) return;
      if( path == '_id' ) return;
      if( type.options.type == mongoose.Schema.Types.Mixed ) return;
      if( Array.isArray( type.options.type ) ) return;

      var field = { name : path };
      if( type.instance == 'ObjectID' ) {
         field.type = 'ObjectId';
         field.ref = type.options.ref;
      }
      
      if( ! req.query.select ) fields.push( path );
      fieldData.push( field );
   });

   var filter = ( req.query.filter ) ? eval( '(' + req.query.filter + ')' ) : {};
   var select = fields.join(' ');
   var limit = req.query.limit || defaultLimit;
   var skip = req.query.skip || 0;
   var sort = req.query.sort || null;

   var query = model.find(filter).select(select).lean().limit(limit).sort(sort).skip(skip);
   var county = model.count(filter);

   var operations = {
      data : function(cb) {
         var populate = ( req.query.populate ) ? JSON.parse( req.query.populate ) : {};
         for( var k in populate ) {
            for( var f = 0; f < fieldData.length; f++ ) {
               if( fieldData[f].name == k ) {
                  fieldData[f].populated = true;
                  break;
               }
            }
            query.populate( k, populate[k] );
         }

         query.exec(cb)
      },
      count : function(cb) {
         county.exec(cb)
      }
   };

   delete req.query.skip;

   async.parallel(operations, function(err, results) {
      if( err ) return res.send(200, 'Error querying for data');
      if( ! results.data ) return res.send(200, 'No results found');         

      res.json({ 
         model  : req.params.model,
         fields : fieldData, 
         data   : results.data, 
         skip   : parseInt( skip ), 
         count  : results.count,
         qs     : querystring.stringify( req.query ),
         limit  : parseInt( limit ),
         nlimit : parseInt( limit ) * -1,
         length : results.data.length
      });
   });
};

