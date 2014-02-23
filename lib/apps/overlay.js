
// Dependencies

var $ = require('jquery'),
    swig = require('swig'),
    templates = require('../../build/js/templates');

// Constructor

function Overlay() {
   this.$overlay = null;

   $(document).ready(function() {
      this.$overlay = $('#overlay');
      setupDelegates.call(this);
      
      var apiXhr = $.get('/api/models', displayModels.bind(this));
      apiXhr.fail(function(data) {
         alert('Error getting models: ' + data.responseText);
      });
   }.bind(this));
}

Overlay.prototype.show = function(ctx, next) {
   this.$overlay.addClass('open');
   this.$overlay.fadeIn('fast');
   
   if (next) {
      next();
   }
};

Overlay.prototype.hide = function(ctx, next) {
   this.$overlay.removeClass('open');
   this.$overlay.fadeOut();

   if (next) {
      next();
   }
};

Overlay.prototype.pin = function() {
   $(window).off('keyup.overlay');
};

Overlay.prototype.unpin = function() {
   $(window).off('keyup.overlay');
   $(window).on('keyup.overlay', toggleOverlay.bind(this));
};

// Private Functions

function displayModels(models) {
   var html = models.reduce(function(html, model) {
      return html + swig.run( templates['partials/model.link.html'], { model: model } );
   }, '');

   this.$overlay.find('#models-list').html(html);
}

function setupDelegates() {
   $(window).on('keyup.overlay', toggleOverlay.bind(this));
   $('body').on('click', '#header', this.show.bind(this));
   $('body').on('click', '#overlay', this.hide.bind(this));
}

function toggleOverlay(e) {
   if ( e.keyCode !== 32 ) {
      return;
   }

   var tag = e.target.tagName.toLowerCase();
   if ( tag == 'input' || tag == 'textarea' || tag == 'article' ) {
      return;
   }

   if ( $('#overlay').hasClass('open') ) {
      this.hide();
   } else { 
      this.show();
   }

   e.stopPropagation();
   e.preventDefault();
}

// Expose

module.exports = exports = new Overlay();
