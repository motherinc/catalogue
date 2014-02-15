Catalogue by Mother
=========

### A Proper Mongoose Based Database Client

#### Why?

We wanted to build a database client that:

- Has a table view to give us a holistic view of any given collection
- Has options to filter, sort, select, and populate data when viewing a collection
- Leverage mongoose schemas, validation, hooks, middleware
- Has easy navigation based on mongoose field references to other collections
- Integrated well with our workflow
- Is nice to use
- Is free and open source

#### How to use

Just pass your mongoose connection instance in, and this library will run a server
on the specified port, which you can then access using your web browser.

````
var catalogue = require('catalogue'),
    mongoose  = require('mongoose');

var mongooseConnection = mongoose.connect( options.host );

// mongoose configuration...

catalogue({ 
   port: 1234,
   connection: mongooseConnection,
});
````

#### Careful
- Do not use in production!
- Careful performing operations that do not make use of indexes efficiently
- Note that updates are non-atomic in order to take advantage of schema hooks

#### To Do

Short Term Tasks

- Lots of cleaning
- ~~Add support for LESS~~
- Holistic Styling
- Improve navigation
- Improve CodeMirror styling & experience
- ~~Create gulp task for LESS compilation~~
- Create grunt task for client combination & minification
- ~~Create gulp task for template pre-compilation~~
- Better error handling (server-side)
- Better error handling (client-side)
- Cleanup & modularize client files
- Separate API & app logic
- Rewrite prompt plugin
- Figure out how to display populated objects in a table
- Format dates
- Make no-cache header only applicable to API calls
- Better documentation & examples
- Add documentation re: SSL setup
- Write tests

Long Term Tasks

- Figure out how to display arrays and subdocs in a table
- Better JSON validation
- Use local storage instead of storing query parameters in browser address bar
- Add ability to pass in (authentication) middleware
- Add additional views (such as document-based)
