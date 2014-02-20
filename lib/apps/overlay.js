

// Dependencies

var $ = require('jquery'),
    carbon = require('../plugins/carbon'),
    swig = require('swig'),
    templates = require('../../build/js/templates');

// Constructor

function Overlay() {
   this.$overlay;

   $(document).ready(function() {
      this.$overlay = $('#overlay');
      setupDelegates.call(this);
      carbon.api.get('/models', null, displayModels.bind(this));
   }.bind(this));
}

Overlay.prototype.show = function(ctx, next) {
   this.$overlay.addClass('open');
   this.$overlay.fadeIn('fast');
   if (next) next();
}

Overlay.prototype.hide = function(ctx, next) {
   this.$overlay.removeClass('open');
   this.$overlay.fadeOut();
   if (next) next();
}

Overlay.prototype.pin = function() {
   $(window).off('keyup.overlay');
}

Overlay.prototype.unpin = function() {
   $(window).off('keyup.overlay');
   $(window).on('keyup.overlay', toggleOverlay.bind(this));
}

// Private Functions

function displayModels(err, models) {
   var html = models.reduce(function(html, model) {
      return html + swig.run( templates['partials/model.link.html'], { model: model } );
   }, '');

   this.$overlay.find('#models-list').html(html);
}

function setupDelegates() {
   $(window).on('keyup.overlay', toggleOverlay.bind(this));
   $('body').on('click', 'a.show-overlay', this.show.bind(this));
}

function toggleOverlay(e) {
   if ( e.keyCode !== 32 ) return;

   var tag = e.target.tagName.toLowerCase();
   if ( tag == 'input' || tag == 'textarea' || tag == 'article' ) return;

   if ( $('#overlay').hasClass('open') ) this.hide();
   else this.show();

   e.stopPropagation();
   e.preventDefault();
}

// Expose

module.exports = exports = new Overlay();
