var request = require('request');
var JSONStream = require('JSONStream');
var es = require('event-stream');

module.exports = function(db) {
  return {
    read: function(id, cb) {
      if (id !== 'new') {
        request([db, id].join('/'), {json: true}, function(e,r,b){
          if (b.error) { return cb(null); }
          cb(b);
        });
        return;
      }
      cb({});
    },
    write: function(id, doc, cb){
      var url = [db, id].join('/');
      var method = 'put';
      if (id === "new") { url = db; method = 'post'; }
      request(url, { json: doc, method: method }, function(e,r,b){
        if (e) { cb(e); return; }
        if (b.error) { cb(b); return;} // report doc conflict..
        if (b.ok) {
          doc._id = b.id;
          doc._rev = b.rev;
          cb(doc);
        }
      });
    },
    remove: function(id, doc, cb){
      doc._deleted = true;
      request.put([db, id].join('/'), {json: doc}, function(e,r,b){
        if (e) { cb(e); return;}
        cb(null);
      });
    },
    findOne: function(view, action, value, cb) {
      request.post([db, '_design', view, '_view', action].join('/'), {json: {keys: [value]}}, function(e,r,b) {
        if (b.rows && b.rows[0]) { return cb(b.rows[0].value); }
        cb(null);
      });
    },
    all: function(view, cb) {
      var url = [db, '_design', view, '_view', 'all'].join('/');
      var stream = es.pipeline(
        request(url, {json: true}),
        JSONStream.parse(['rows', true]),
        es.stringify()
      );
      cb(stream);
    },
    findByView: function(view, action, keys, cb) {
      var url = [db, '_design', view, '_view', action].join('/');
      var stream = es.pipeline(
        request.post(url, {json: {keys: keys}}),
        JSONStream.parse(['rows', true, 'value']),
        es.stringify()
      )
      cb(stream);
    }
  }
}