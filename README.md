Catalogue
=========

A Mongoose Based Data Viewer (Work In Progress)

![Catalogue Overlay](http://mothercreative.com/catalogue/overlay.png)  
![Catalogue Table View](http://mothercreative.com/catalogue/options.png)  
![Catalogue Edit Document](http://mothercreative.com/catalogue/edit.png)

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

- Write tests!!!
- Documentation
- Code cleaning
- Improve overall experience
- Improve document editing & viewing experience
- Better error handling
- Improved entry of filters, select, sort, populate, limit
- Improved display populated objects in a table
- Improved date formatting
- Display arrays, subdocs, and mixed fields in table view
- Add additional model views (such as document-based)

## License

Copyright (c) 2014 Mother Inc.

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
