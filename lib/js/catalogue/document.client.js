$(document).ready(function() {

   var model = $('#_model').val();
   var id = $('#_id').val();
   
   var txt = $('#doc').html().trim();
   // To remove double quotes around keys
   // txt = txt.replace(/"([^\"]*)"(\s*):/g, '$1$2:');
   // To put the double quotes back around keys
   // ([{,]\s+)([\S]*):
   $('#doc').html( txt );

   $('#save').click(save);

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

   function save() {
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
      }).fail(function() { alert( 'Error saving document' ); });
   }

});