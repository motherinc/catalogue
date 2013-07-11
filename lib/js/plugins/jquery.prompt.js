// -------------------------------------------------------------------------------
// Prompt.js
// A Plugin by Mother
//  
//
// Authors: Steven Yuen, Ajay Sabhaney
// Version: 0.1
// Created: July 4, 2013
// Updated: July 5, 2013
// -------------------------------------------------------------------------------


// Prompt jQuery Extension

(function ($) 
{
   var promptId        = 'mother-prompt-plugin';
   var promptSelector  = '#' + promptId;
   var zIndex          = 2147483647;

   $.fn.prompt = function( method ) 
    {
        if ( methods[method] )
            return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
    
        else if ( typeof method === 'object' || ! method )
            return methods.init.apply( this, arguments );
    
        else
            $.error( 'Method ' +  method + ' does not exist on jQuery.popover' ); 
    };

   var methods = {

      init : function( options ) {

         return this.each(function() {
             
            // Variables and Options
            var defaults = {
               html : "Prompt",
               callback : function() {}
            };

            options = $.extend(defaults, options);

            $(this).click(function(e) {

               var $link = $(this);
               
               // Check if a prompt is already open
               var promptData = $(this).data('prompt-plugin');
               var promptOpen = false;

               if( ! promptData ) {
                  promptData = { prompt : true, callback : options.callback };
                  $link.data('prompt-plugin', promptData);
               } else {
                  promptOpen = true;
               }

               e.stopImmediatePropagation();
               e.preventDefault();
               
               if( ! promptOpen ) {
                  $('body').append('<div id="' + promptId +'" class="modal-overlay"><div class="modal-window"></div></div>');
                  $(promptSelector).css('z-index', zIndex).fadeIn(500);
                  $(promptSelector).height( $(window).height() );

                  $(promptSelector).find('.modal-window').hide().html( options.html ); 
                  privateMethods['setPromptWindowPosition'].apply( $link );
                  
                  $(window).resize(function() {
                     privateMethods['setPromptWindowPosition'].apply( $link );
                  });

                  $(promptSelector).find('.modal-window form').submit(function(e) {
                     e.stopImmediatePropagation();
                     e.preventDefault();
                     return $link.prompt('close');
                  });

                  $(document).on('click', promptSelector, function(e) {
                     if( e.target.id == promptId ) {
                        $(promptSelector).fadeOut(function() {
                           $(this).remove();
                           $link.data('prompt-plugin').callback();
                           $link.data('prompt-plugin', null);
                        });
                     } 
                  });
               } 

               else {
                  $(promptSelector).find('.modal-window')/*.hide()*/.html( options.html );
                  privateMethods['setPromptWindowPosition'].apply( $link );
               }
               
               return false;
            });
         });
      },

      close : function() {
         var $self = $(this);
         var formData = $(promptSelector).find('.modal-window form').serializeObject();
         $('.modal-overlay').each(function() {
            $(this).fadeOut(function() {
               $self.data('prompt-plugin').callback( formData );
               $self.data('prompt-plugin', null);
               $(this).remove();
            });
         });
      },

      reset : function() {
         privateMethods['setPromptWindowPosition']();
      }
   };

   var privateMethods = {

      setPromptWindowPosition : function() {

         var modalData = $(this).data('prompt-plugin');
         if( ! modalData )
            return;

         var modalWindowHeight   = $(promptSelector).find('.modal-window').height();
         var modalWindowWidth    = $(promptSelector).find('.modal-window').width();
         var windowWidth         = $(window).width();
         var windowHeight        = $(window).height();

         $(promptSelector).find('.modal-window').css({
            top  : (windowHeight/2) - (modalWindowHeight/2),
            left : (windowWidth/2) - (modalWindowWidth/2)
         });

         $(promptSelector).find('.modal-window').fadeIn();
      }
   };

})(jQuery);
