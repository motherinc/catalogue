
//----------------------------------------------
// Dependencies
//----------------------------------------------

var $ = require('jquery'), 
    carbon = require('./plugins/carbon'),
    page = require('page'),
    swig = require('swig'),
    swigFilters = require('./plugins/swig.helpers');

var apps = {
   Home : require('./apps/home'),
   Model : require('./apps/model'),
   Document : require('./apps/document')
};

var templates = require('../build/js/templates');


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

function setupRoutes() {
   page.base('');
   page('/', routes.home);
   page('/model/:model', routes.model);
   page('/model/:model/document/:id', routes.document);
   page('*', routes.notfound)
   page.start();
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

      //$viewport.fadeOut('fast', function() {
         //page(href);
         //$viewport.fadeIn('fast');
      //});
      
      e.preventDefault();
   });
}


//----------------------------------------------
// Routes / Page Behaviour
//----------------------------------------------

var routes = {};

routes.home = function(ctx, next) { 
   displayPage('home.html');
   new apps.Home($viewport);
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

