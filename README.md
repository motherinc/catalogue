Catalogue
=========

<<<<<<< HEAD
A Mongoose Based Data Viewer
=======
A Mongoose Based Data Viewer (Work In Progress)
>>>>>>> 68c2ecaf75c5e0865f4c29b8179e1c8fe9ca4fcc

## Features

- Table view to give a holistic view of any given collection
- Options to filter, sort, select, and populate data when viewing a collection
- Leverages mongoose schemas, validation, hooks, middleware when adding and updating documents
- Ability to follow references to other documents
- Easy to setup

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

## Notes
- Do not use in production!
- Careful performing operations that do not make use of indexes efficiently
- Note that updates are non-atomic in order to take advantage of schema hooks
- Not compatbile with IE <10

## Roadmap

- Write tests
- Documentation
- Code cleaning
- Improve overall experience
- Improve document editing & viewing experience
- Better error handling
- Improved entry of filters, select, sort, populate, limit
- Improved display populated objects in a table
- Improved date formatting
- Display arrays and subdocs in table view
- Add additional model views (such as document-based)
