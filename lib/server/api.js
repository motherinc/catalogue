
var async = require('async'),
    flat = require('flat'),
    querystring = require('querystring'),
    mongoose = require('mongoose');


//---------------------------------------------------
// Fetch Models
//---------------------------------------------------


exports.models = function (req, res, next) {
   var modelNames = req.db.modelNames();
   return res.json(modelNames);
}


//---------------------------------------------------
// Fetch Documents
//---------------------------------------------------

exports.getDoc = function (req, res, next) {
   var model = req.db.model( req.params.model );
   var schema = model.schema;

   var fieldData = [];
   var fields = [];

   schema.eachPath(function(path, type) {
      if( path == '__v' ) return;

      var field = { name: path };
      if( type.instance == 'ObjectID' ) {
         field.type = 'ObjectId';
         field.ref = type.options.ref;
      }
      
      fields.push( path );
      fieldData.push( field );
   });

   model
      .findById(req.params.id)
      .select(fields.join(' '))
      .lean()
      .exec(function(err, doc) {
         if( err ) return next( err );
         if( ! doc ) return next( new Error('Document not found') );

         res.json({
            fields: fieldData,
            doc: doc, 
            docString: JSON.stringify(doc, null, '\t')
         });
      }
   );
}

exports.getDocs = function (req, res, next) {

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
      if( Array.isArray( type.options.type ) ) return;

      // Warning: This relies on internals and could break in the future
      if( typeof type.options.type === 'function' ) {
         var name = type.options.type.name;
         if( /Mixed/i.test(name) ) return;
      }

      var field = { name: path };
      
      // Warning: This relies on internals and could break in the future
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
            if( populate.hasOwnProperty(k) ) {
               for( var f = 0; f < fieldData.length; f++ ) {
                  if( fieldData[f].name == k ) {
                     fieldData[f].populated = true;
                     break;
                  }
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
      if( err ) return next( err );
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
}


//---------------------------------------------------
// Add Document
//---------------------------------------------------


exports.addDoc = function (req, res, next) {
   var model = req.db.model( req.params.model );

   model.create(req.body.data, function(err, doc) {
      if( err ) return next( err );
      return res.send( 200, doc._id );
   });
}


//---------------------------------------------------
// Update Document
//---------------------------------------------------


exports.updateDoc = function (req, res, next) {

   var newDoc = req.body.data;

   var model = req.db.model( req.params.model );
   var schema = model.schema;

   var keys = [];
   schema.eachPath(function(path, type) {
      keys.push( path );
   });

   model.findById(req.params.id, function(err, origDoc) {
      if( err ) return next( err );
      if( ! origDoc ) return next( new Error('Document not found') );

      newDoc = flat.flatten( newDoc, { safe : true } );

      for( var key in newDoc ) {
         if( newDoc.hasOwnProperty(key) ) {
            origDoc.set(key, newDoc[key]);
            var keyIndex = keys.indexOf( key );
            keys.splice( keyIndex, 1 );
         }
      }
      
      for( var i = 0; i < keys.length; i++ ) {
         origDoc.set(keys[i], undefined);
      }

      origDoc.save(function(err) {
         if( err ) return next( err );
         res.send( 200 );
      });
   });
}


//---------------------------------------------------
// Delete Document
//---------------------------------------------------


exports.deleteDoc = function (req, res, next) {
   var model = req.db.model( req.params.model );

   model.remove({ _id : req.params.id }, function(err, doc) {
      if( err ) return next( err );
      return res.send( 200, doc._id );
   });
}
