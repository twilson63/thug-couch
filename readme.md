# thug-couch [![Build Status](https://travis-ci.org/twilson63/thug-couch.png?branch=master)](https://travis-ci.org/twilson63/thug-couch)

Thug is a functional model system for nodejs, this module is an add-on module of common couchdb cmds that any model may use.

## What is thug?

[https://github.com/sintaxi/thug](https://github.com/sintaxi/thug)

> Thug was created to minimize the complexity of validating and altering an object before writing it to a data store or performing an operation. Thug is not an ORM but is ment to be a replacment for one. Thug is very small and works on both the server or in a browser.

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
      all: function(cb) { db.all('post', cb); }
    }
  });

  var db = couchDb(config.db);

  post.constructor.prototype.read = db.read;
  post.constructor.prototype.write = db.write;
  post.constructor.prototype.remove = db.remove;

  return post;
}
```

## Couch API

### `read(id, callback)`
### `write(id, doc, callback)`
### `remove(field, defaultValue)`
### `all(callback)`
### `findOne(view, action, value, callback)`

## LICENSE

MIT

## Contributing

pull requests are welcome!

## Thanks to the contributors and maintainers of the following projects

* [https://github.com/sintaxi/thug](https://github.com/sintaxi/thug)
* [https://github.com/chriso/node-validator](https://github.com/chriso/node-validator)
* [https://github.com/broofa/node-uuid/](https://github.com/broofa/node-uuid/)

