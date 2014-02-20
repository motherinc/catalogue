
//----------------------------------------------
// Dependencies
//----------------------------------------------

var $ = require('jquery'), 
    carbon = require('./plugins/carbon'),
    page = require('page'),
    swig = require('swig'),
    swigFilters = require('./plugins/swig.helpers');

var apps = {
   Model : require('./apps/model'),
   Document : require('./apps/document')
};

var overlay = require('./apps/overlay'),
    templates = require('../build/js/templates');


//----------------------------------------------
// Initialization
//----------------------------------------------

var $viewport;

function init() {
   $viewport = $('#viewport');
   setupRoutes();
   setupSwigFilters();
   setupNav();
}

function setupSwigFilters() {
   for( var f in swigFilters ) {
      if( swigFilters.hasOwnProperty(f) ) {
         swig.setFilter(f, swigFilters[f]);
      }
   }
}

function setupNav() {
   $('body').on('click', 'a', function(e) {
      var href = $(this).attr('href');
      page(href);
      e.preventDefault();
   });
}

//----------------------------------------------
// Global Overlay Helpers
//----------------------------------------------

function pinAndShowOverlay(ctx, next) {
   overlay.show();
   overlay.pin();
}

function unpinAndHideOverlay(ctx, next) {
   overlay.hide();
   overlay.unpin();
   next();
}

//----------------------------------------------
// Routes / Page Behaviour
//----------------------------------------------

var routes = {};

function setupRoutes() {
   page.base('');
   page('/', pinAndShowOverlay);
   page('/model/:model', unpinAndHideOverlay, routes.model);
   page('/model/:model/document/:id', unpinAndHideOverlay, routes.document);
   page('*', unpinAndHideOverlay, routes.notfound)
   page.start();
}

routes.model = function(ctx, next) {
   var options = { model: ctx.params.model };
   displayPage('model.html', options);
   new apps.Model($viewport, options);
}

routes.document = function(ctx, next) {
   var options = { model: ctx.params.model, document: ctx.params.id };
   displayPage('document.html', options);
   new apps.Document($viewport, options);
}

routes.notfound = function(ctx, next) {
   displayPage('404.html');
}

function displayPage(page, options) {
   options = options || {};
   var html = swig.run( templates[page], options );
   $viewport.html(html);
}


//----------------------------------------------

$(document).ready(init);

