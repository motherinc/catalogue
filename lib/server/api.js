
var async = require('async'),
    flat = require('flat'),
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
   var fields = [];

   schema.eachPath(function(path, type) {
      if( path == '__v' ) return;
      fields.push( path );
   });

   model
      .findById(req.params.id)
      .select(fields.join(' '))
      .lean()
      .exec(function(err, doc) {
         if( err ) return next( err );
         if( ! doc ) return next( new Error('Document not found') );
         res.json(doc);
      }
   );
}

exports.getDocs = function (req, res, next) {
   
   var model = req.db.model( req.params.model );
   var schema = model.schema;

   var filter = req.query.filter ? decodeURIComponent(req.query.filter) : {};
   var select = req.query.select ? decodeURIComponent(req.query.select) : undefined;
   var sort = req.query.sort ? decodeURIComponent(req.query.sort) : { $natural: -1 };
   var populate = req.query.populate ? decodeURIComponent(req.query.populate) : {};

   var skip = parseInt(decodeURIComponent(req.query.skip));
   skip = ( !isNaN(skip) ) ? skip : 0;

   var limit = parseInt(decodeURIComponent(req.query.limit));
   limit = ( !isNaN(limit) ) ? limit : 50;

   // Filter

   if( typeof filter === 'string' ) {
      try {
         filter = eval('(' + filter + ')');
      } catch(e) {
         return next(e);
      }
   }

   // Population

   if( typeof populate === 'string' ) {
      try {
         populate = eval('(' + populate + ')');
      } catch(e) {
         return next(e);
      }
   }

   // Selection criteria

   if( select ) {
      var fields = select.split(' ');
      if( fields.indexOf('_id') == -1 ) fields.unshift('_id');
   } else {
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

      var field = { 
         name: path 
      };
      
      // Warning: This relies on internals and could break in the future
      if( type.instance == 'ObjectID' ) {
         field.type = 'ObjectId';
         field.ref = type.options.ref;
      }
      
      if( ! req.query.select ) fields.push( path );
      fieldData.push( field );
   });

   // Mongoose Queries

   var documentsQuery = model.find(filter).select(select).lean().limit(limit).sort(sort).skip(skip);
   var countQuery = model.count(filter);

   var operations = {
      documents : function(cb) {
         for( var k in populate ) {
            if( populate.hasOwnProperty(k) ) {
               for( var f = 0; f < fieldData.length; f++ ) {
                  if( fieldData[f].name == k ) {
                     fieldData[f].populated = true;
                     break;
                  }
               }
            }

            populate[k] += ' -_id';
            documentsQuery.populate( k, populate[k] );
         }

         documentsQuery.exec(cb)
      },
      count : function(cb) {
         countQuery.exec(cb)
      }
   };

   async.parallel(operations, function(err, results) {
      if( err ) return next( err );
      if( ! results.documents ) {
         results.documents = [];
         results.total = 0;
      }  

      res.json({ 
         fields: fieldData, 
         documents: results.documents, 
         total: results.count
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
