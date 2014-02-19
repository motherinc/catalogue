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
- Is easy to setup, awesome to use, and easy to remove
- Is free and open source
- Works offline (TODO: finalize font dependencies and fallbacks)

#### Usage

Just pass your mongoose instance in, and this library will run a server
on the specified port, which you can then access using your web browser.

````
var catalogue = require('catalogue'),
    mongoose  = require('mongoose');

mongoose.connect( options.host );
// mongoose configuration...

catalogue(mongoose, { port: 1234 });
````

If you have multiple connections connected, pass in the desired connection instance instead.

````
var db1 = mongoose.createConnection('mongodb://user:pass@localhost:port/database');
var db2 = mongoose.createConnection('mongodb://user:pass@localhost:port/database2');

// mongoose configuration...

catalogue(db1, { port: 1234 });
catalogue(db2, { port: 1235 });
````

#### Careful
- Do not use in production!
- Careful performing operations that do not make use of indexes efficiently
- Note that updates are non-atomic in order to take advantage of schema hooks
- Not compatbile with IE <10

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
