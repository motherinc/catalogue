
// Dependencies

var carbon = require('../plugins/carbon'),
    page = require('page'),
    swig = require('swig'),
    templates = require('../../build/js/templates');

var codemirror = require('codemirror');
require('codemirror/addon/fold/foldcode');
require('codemirror/addon/fold/foldgutter');
require('codemirror/addon/fold/brace-fold');
require('codemirror/addon/edit/matchbrackets');
require('codemirror/mode/javascript/javascript');


// Constructor

function Document($container, options) {

   this.$container = $container;
   this.model = options.model;
   this.document = options.document;
   this.editor;

   setupDelegates.call(this);
   setupEditor.call(this);

   if ( this.document == 'new' ) {
      this.editor.setValue('{\n\n}');
   } else {
      var resource = '/model/' + this.model + '/document/' + this.document;
      carbon.api.get(resource, null, displayDoc.bind(this));
   }
}

// Private Functions

var setupDelegates = function() {
   this.$container.find('#save').click(saveDoc.bind(this));
   this.$container.find('#delete').click(deleteDoc.bind(this));
}

var setupEditor = function() {
   this.editor = codemirror.fromTextArea( document.getElementById('doc'), {
      mode: { 
         name: 'javascript', 
         json: true 
      },
      smartIndent: true,
      matchBrackets: true,
      lineNumbers: true,
      foldGutter: true,
      gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter']
      // theme : 'erlang-dark'
   });
}

var displayDoc = function(err, document) {
   var docString = JSON.stringify(document, null, '\t');
   this.editor.setValue(docString);
}

var saveDoc = function(e) {
   var doc = this.editor.getValue(); 

   try {
      doc = JSON.parse(doc);
   } catch(e) {
      alert('Error parsing document');
      return false;
   }

   if ( this.document == 'new' ) {
      var action = 'add';
      var resource = '/model/' +  this.model + '/document';
   } else {
      var action = 'update';
      var resource = '/model/' +  this.model + '/document/' + this.document;
   }

   var body = { data: doc };
   carbon.api[action](resource, body, function(err, result) {
      if( err ) return alert( 'Error saving document \n\n' + err.toString() );
      alert( 'Document saved succesfully' );
   });
}

var deleteDoc = function(e) {
   var model = this.model;
   var confirm1 = confirm('Are you sure you want to delete this document?');
   if( ! confirm1 ) return;

   var confirm2 = confirm('ARE YOU SURE??');
   if( ! confirm2 ) return;

   carbon.api.remove('/model/' + this.model + '/document/' + this.document, null, function(err) {
      if( err ) return alert( 'Error deleting document \n\n' + err.toString() );
      alert( 'Document deleted succesfully' );
      page('/model/' + model);
   });
}

// Expose

module.exports = exports = Document;

