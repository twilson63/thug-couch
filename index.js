var request = require('request');

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
        if (b.rows[0]) { return cb(b.rows[0].value); }
        cb(null);
      });
    },
    all: function(view, cb) {
      request([db, '_design', view, '_view', 'all'].join('/'), {json: true}, function(e,r,b) {
        if (e) { return cb(null); }
        cb(b.rows.map(function(item) { return item.value; }));
      });
    },
    findByView: function(view, action, keys, cb) {
      request.post([db, '_design', view, '_view', action].join('/'), {json: {keys: keys}}, function(e,r,b) {
        if (e) { console.log(e); return cb(null); }
        var docs = b.rows.map(function(item) {
          return item.value;
        });
        cb(docs);
      });
    }
  }
}