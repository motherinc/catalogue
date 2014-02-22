Catalogue by Mother
=========

A Proper Mongoose Based Data Viewer

## Why?

We wanted to build a database client that:

- Has a table view to give us a holistic view of any given collection
- Has options to filter, sort, select, and populate data when viewing a collection
- Leverage mongoose schemas, validation, hooks, middleware
- Has easy navigation based on mongoose field references to other collections
- Integrated well with our workflow
- Is easy to setup, awesome to use, and easy to remove
- Is free and open source

## Install

Install as a development dependency using npm

````
npm install --save-dev catalogue
````

## Usage

Just pass your mongoose instance in, and this library will run a server
on the specified port, which you can then access using your web browser.

````
var catalogue = require('catalogue'),
    mongoose  = require('mongoose');

mongoose.connect(options.host);
// mongoose configuration...

if (process.env.NODE_ENV == 'development') {
   catalogue(mongoose, { port: 1234 });
}
````

If you have multiple connections connected, pass in the desired connection instance instead.

````
var db1 = mongoose.createConnection('mongodb://user:pass@localhost:port/database');
var db2 = mongoose.createConnection('mongodb://user:pass@localhost:port/database2');

// mongoose configuration...

if (process.env.NODE_ENV == 'development') {
   catalogue(db1, { port: 1234 });
   catalogue(db2, { port: 1235 });
}
````

## Careful
- Do not use in production!
- Careful performing operations that do not make use of indexes efficiently
- Note that updates are non-atomic in order to take advantage of schema hooks
- Not compatbile with IE <10

## To Do

Short Term Tasks

- Lots of cleaning
- Holistic Styling
- Improve CodeMirror styling & experience
- Better error handling (server-side)
- Better error handling (client-side)
- Improve entry of filters, select, sort, populate, limit
- Figure out how to display populated objects in a table
- Format dates
- Better documentation & examples
- Add documentation re: SSL setup
- Browser compatability check
- Write tests

Long Term Tasks

- Figure out how to display arrays and subdocs in a table
- Better JSON validation
- Add ability to pass in (authentication) middleware
- Add additional model views (such as document-based)
