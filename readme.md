# thug-couch [![Build Status](https://travis-ci.org/twilson63/thug-couch.png?branch=master)](https://travis-ci.org/twilson63/thug-couch)

Thug is a functional model system for nodejs, this module is an add-on module of common couchdb cmds that any model may use.

## What is thug?

[https://github.com/sintaxi/thug](https://github.com/sintaxi/thug)

> Thug was created to minimize the complexity of validating and altering an object before writing it to a data store or performing an operation. Thug is not an ORM but is ment to be a replacment for one. Thug is very small and works on both the server or in a browser.

## What is thug-couch?

The thug-couch module was constructed to remove any persistent specific functionality from the actual thug model.  ThugCouch implements the three primary thug constructors (read, write, remove) to a couchDb backend.  Then it goes on to support a couple of api methods that make customizing your models easier.

## Install

```
npm install thug-couch --save
```

## Implementation

Thug Model

```
var Thug = require('thug');
var couch = require('thug-couch');

module.exports = function(config) {
  var post = new Thug({
    "methods": {
      all: function(cb) { db.all('posts', cb); }
    }
  });

  var db = couchDb(config.db);

  post.constructor.prototype.read = db.read;
  post.constructor.prototype.write = db.write;
  post.constructor.prototype.remove = db.remove;

  return post;
}
```

## ThugCouch API

### `read(id, callback)`

Implemented to Thug Specs.

### `write(id, doc, callback)`

Implemented to Thug Specs.

### `remove(field, defaultValue)`

Implemented to Thug Specs.

### `all([params], callback)`

Example:

``` javascript
var db = couchDb('http://localhost:5984/db');
var post = new Thug({
  "methods": {
	all: function(cb) { db.all('posts', cb); }
  }
});
```

### `findOne(view, action, value, [params], callback)`

Example:

``` javascript
var db = couchDb('http://localhost:5984/db');
var user = new Thug({
  "methods": {
	byEmail: function(email, cb) { db.findOne('user', 'email', email, cb); }
  }
});
```


### `findByView(view, action, keys, [params], callback)`

Example:

``` javascript
var db = couchDb('http://localhost:5984/db');
var user = new Thug({
  "methods": {
	byRoles: function(roles, cb) { db.findByView('users', 'roles', roles, cb); }
  }
});
```


## LICENSE

MIT

## Contributing

pull requests are welcome!

## Thanks to the contributors and maintainers of the following projects

* [https://github.com/sintaxi/thug](https://github.com/sintaxi/thug)
* [https://github.com/chriso/node-validator](https://github.com/chriso/node-validator)
* [https://github.com/broofa/node-uuid/](https://github.com/broofa/node-uuid/)

