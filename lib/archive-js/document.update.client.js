$(document).ready(function() {

   var model = $('#_model').val();
   var id = $('#_id').val();
   
   var txt = $('#doc').html().trim();
   // To remove double quotes around keys
   // txt = txt.replace(/"([^\"]*)"(\s*):/g, '$1$2:');
   // To put the double quotes back around keys
   // ([{,]\s+)([\S]*):
   $('#doc').html( txt );

   $('#delete').click(deleteDoc);
   $('#save').click(saveDoc);

   var myCodeMirror = CodeMirror.fromTextArea( document.getElementById('doc'), {
      smartIndent : true,
      // mode : 'javascript',
      mode : {name: "javascript", json: true},
      // readOnly : 'nocursor',
      matchBrackets: true,
      lineNumbers: true,
      foldGutter: true,
      gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
      // theme : 'erlang-dark'
   });


   function foldJS(cm, where) { 
      cm.foldCode(where, CodeMirror.braceRangeFinder); 
   }
 
   myCodeMirror.on('gutterClick', foldJS);

   function saveDoc() {
      var doc = myCodeMirror.getValue(); 
      try {
         doc = JSON.parse(doc);
      } catch(e) {
         alert('Error parsing document');
         return false;
      }

      $.ajax({
         type: 'PUT',
         url: '/api/model/' + model + '/document/' + id,
         data: { data : doc }
      }).done(function() { alert( 'Document saved succesfully' )
      }).fail(function(xhr) { alert( 'Error saving document \n\n' + xhr.responseText ); });
   }

   function deleteDoc() {
      var confirmDeletion1 = confirm('Are you sure you want to delete this document?');
      if( ! confirmDeletion1 ) return;

      var confirmDeletion2 = confirm('ARE YOU SURE??');
      if( ! confirmDeletion2 ) return;

      $.ajax({
         type: 'DELETE',
         url: '/api/model/' + model + '/document/' + id,
      }).done(function() { 
         alert( 'Document deleted succesfully' );
         $.address.value('/model/' + model);
      }).fail(function(xhr) { 
         alert( 'Error deleting document \n\n' + xhr.responseText ); 
      });
   }

});