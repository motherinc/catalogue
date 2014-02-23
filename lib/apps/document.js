
// Dependencies

var $ = require('jquery'),
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
   this.model      = options.model;
   this.document   = options.document;
   this.editor     = null;

   setupDelegates.call(this);
   setupEditor.call(this);

   if ( this.document == 'new' ) {
      this.editor.setValue('{\n\n}');
   } else {
      var resource = '/api/model/' + this.model + '/document/' + this.document;
      var apiXhr = $.get(resource, displayDoc.bind(this));

      apiXhr.fail(function(data) {
         alert(data.responseText);
      });
   }
}

// Private Functions

function setupDelegates() {
   this.$container.find('#save').click(saveDoc.bind(this));
   this.$container.find('#delete').click(deleteDoc.bind(this));
}

function setupEditor() {
   this.editor = codemirror.fromTextArea( document.getElementById('doc'), {
      mode: { 
         name: 'javascript', 
         json: true 
      },
      smartIndent: true,
      matchBrackets: true,
      lineNumbers: true,
      foldGutter: true,
      gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
      theme : 'mbo'
   });
}

function displayDoc(document) {
   var docString = JSON.stringify(document, null, '\t');
   this.editor.setValue(docString);
}

function saveDoc(e) {
   var docBody = this.editor.getValue();
   var docId = this.document;
   var model = this.model;
   var action, resource;

   try {
      docBody = JSON.parse(docBody);
   } catch(e) {
      alert('Error parsing document');
      return false;
   }

   if ( docId == 'new' ) {
      action = 'post';
      resource = '/api/model/' +  this.model + '/document';
   } else {
      action = 'put';
      resource = '/api/model/' +  this.model + '/document/' + this.document;
   }

   var body = { data: docBody };
   var apiXhr = $.ajax(resource, { data: body, type: action });

   apiXhr.done(function(savedDoc) {
      if ( docId == 'new' ) {
         return page('/model/' + model + '/document/' + savedDoc._id);
      } else {
         alert( 'Document saved succesfully' );
      }
   });

   apiXhr.fail(function(data) {
      alert( 'Error Saving Document: ' + data.responseText );
   });
}

function deleteDoc(e) {
   var model = this.model;
   var confirmDelete = confirm('Are you sure you want to delete this document?');
   if( ! confirmDelete ) {
      return;
   }

   var resource = '/api/model/' + this.model + '/document/' + this.document;
   var apiXhr = $.ajax(resource, { type: 'delete' });

   apiXhr.done(function() {
      alert( 'Document deleted succesfully' );
      page('/model/' + model);
   });

   apiXhr.fail(function(data) {
      alert( 'Error deleting document \n\n' + data.responseText );
   });
}

// Expose

module.exports = exports = Document;

