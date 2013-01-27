var url = 'http://localhost:5984/foobar';
var init = require('couch-init')(url);
var couchDb = require('../');
var es = require('event-stream');
var assert = require('assert');
var nock = require('nock');

nock('http://localhost:5984')
  .put('/foobar')
  .reply(201, "{\"ok\":true}\n");

nock('http://localhost:5984')
  .put('/foobar/_design/posts', "{\"language\":\"javascript\",\"views\":{\"all\":{\"map\":\"function(doc) {\\n  if (doc.docType === 'post') {\\n    emit(doc._id, doc);\\n  }\\n}\"},\"author\":{\"map\":\"function(doc) {\\n  if (doc.docType === 'post') {\\n    emit(doc.author, doc);\\n  }\\n}\"}}}")
  .reply(201, "{\"ok\":true,\"id\":\"_design/posts\",\"rev\":\"1-fc417395eea8ac50773aaa8b1289de40\"}\n");

nock('http://localhost:5984')
  .get('/foobar')
  .reply(200, "{\"db_name\":\"foobar\",\"doc_count\":1,\"doc_del_count\":0,\"update_seq\":1,\"purge_seq\":0,\"compact_running\":false,\"disk_size\":460,\"data_size\":381,\"instance_start_time\":\"1356037350163229\",\"disk_format_version\":6,\"committed_update_seq\":0}\n");

nock('http://localhost:5984')
  .get('/foobar/_design/posts/_view/all')
  .reply(200, "{\"total_rows\":1,\"offset\":0,\"rows\":[{\"key\":\"key\", \"value\": {\"title\":\"Awesome Post\",\"body\":\"TL DR\",\"docType\":\"post\",\"author\":\"foo@bar.com\"}}]}\n");

nock('http://localhost:5984')
  .post('/foobar/_design/posts/_view/author', "{\"keys\":[\"foo@bar.com\"]}")
  .reply(200, "{\"total_rows\":1,\"offset\":0,\"rows\":[\r\n{\"id\":\"f117b2de7f4010634606845a4700142e\",\"key\":\"foo@bar.com\",\"value\":{\"_id\":\"f117b2de7f4010634606845a4700142e\",\"_rev\":\"1-975e567ab4207ce03e07bd560f27f02f\",\"title\":\"Awesome Post\",\"body\":\"TL DR\",\"docType\":\"post\",\"author\":\"foo@bar.com\"}}\r\n]}\n");
  
nock('http://localhost:5984')
  .delete('/foobar')
  .reply(200, "{\"ok\":true}\n");

nock('http://localhost:5984')
  .post('/foobar', "{\"title\":\"Awesome Post\",\"body\":\"TL DR\",\"docType\":\"post\",\"author\":\"foo@bar.com\"}")
  .reply(201, "{\"ok\":true,\"id\":\"f117b2de7f4010634606845a4700061d\",\"rev\":\"2-d9a5be454198018e6ebc2cb90e263c29\"}\n");

nock('http://localhost:5984')
  .get('/foobar/f117b2de7f4010634606845a4700061d')
  .reply(201, "{\"_id\":\"f117b2de7f4010634606845a4700061d\",\"_rev\":\"2-d9a5be454198018e6ebc2cb90e263c29\"}\n");

nock('http://localhost:5984')
  .put('/foobar/f117b2de7f4010634606845a4700061d', '{"title":"Awesome Post","body":"TL DR","docType":"post","author":"foo@bar.com","_id":"f117b2de7f4010634606845a4700061d","_rev":"2-d9a5be454198018e6ebc2cb90e263c29","_deleted":true}')
  .reply(200, "{\"_id\":\"f117b2de7f4010634606845a4700061d\",\"_rev\":\"2-d9a5be454198018e6ebc2cb90e263c29\"}\n");

nock('http://localhost:5984')
  .post('/foobar/_design/posts/_view/author', "{\"keys\":[\"foo@bar.com\"]}")
  .reply(200, "{\"total_rows\":1,\"offset\":0,\"rows\":[\r\n{\"id\":\"f117b2de7f4010634606845a4700142e\",\"key\":\"foo@bar.com\",\"value\":{\"_id\":\"f117b2de7f4010634606845a4700142e\",\"_rev\":\"1-975e567ab4207ce03e07bd560f27f02f\",\"title\":\"Awesome Post\",\"body\":\"TL DR\",\"docType\":\"post\",\"author\":\"foo@bar.com\"}}\r\n]}\n");

describe('couchDb', function() {
  var db = couchDb(url);
  var result = null;
  before(function(done) {
    init.createDb(function(){
      init.createView('post', ['author'], done);
    });
  });
  it('should', function(done){
    db.write('new', {title: 'Awesome Post', body: 'TL DR', docType: 'post', author: 'foo@bar.com'}, function(doc) {
      result = doc;
      assert.ok(doc._id, 'write to db');
      done();
    });
  });
  it('should read from db', function(done){
    db.read(result._id, function(doc) {
      assert.ok(doc._id, 'read from db');
      done();
    });
  });
  it('should get all docs from db', function(done){
    db.all('posts', function(posts) {
      posts.pipe(es.writeArray(function(err, array){
        assert.ok(array.length > 0);
        done();
      }));
    });
  });
  it('should find one doc from db', function(done){
    db.findOne('posts', 'author', 'foo@bar.com', function(post) {
      assert.ok(post.author === 'foo@bar.com');
      done();
    });
  });
  it('should remove from db', function(done){
    db.remove(result._id, result, function(doc){
      assert.ok(doc === null, 'remove from db');
      done();
    });
  });
  it('should find docs by view', function(done){
    db.findByView('posts', 'author', ['foo@bar.com'], function(posts) {
      posts.pipe(es.writeArray(function(err, array){
        var post = JSON.parse(array[0]);
        assert.ok(post.author === 'foo@bar.com');
        done();
      }));
      //assert.ok(posts[0].author === 'foo@bar.com');
      
    });
  });
  after(function(done){
    init.destroyDb(done);
  });
})