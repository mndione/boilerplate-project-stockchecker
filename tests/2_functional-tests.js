const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    // #1
    test('viewing one stock', function (done) {
        chai
          .request(server)
          .keepOpen()
          .get('/api/stock-prices?stock=GOOG&like=false')
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.type, "application/json");
            assert.property(res.body.stockData, 'likes');
            done();
          });
    });

     // #2
     test('viewing one stock and liking it', function (done) {
        chai
          .request(server)
          .keepOpen()
          .get('/api/stock-prices?stock=GOOG&like=true')
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.type, "application/json");
            assert.isAbove(res.body.stockData.likes, 0);
            done();
          });
    });

    // #3
    test('viewing the same stock and liking it again', function (done) {
        chai
          .request(server)
          .keepOpen()
          .get('/api/stock-prices?stock=GOOG&like=true')
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.type, "application/json");
            assert.property(res.body.stockData, 'likes');
            done();
          });
    });

    // #4
    test('viewing two stocks', function (done) {
        chai
          .request(server)
          .keepOpen()
          .get('/api/stock-prices?stock=GOOG&stock=MSFT')
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.type, "application/json");
            assert.equal(res.body.stockData.length, 2);
            assert.equal(res.body.stockData[0].rel_likes + res.body.stockData[1].rel_likes, 0);
            done();
          });
    });

    // #5
    test('viewing two stocks and liking them', function (done) {
        chai
          .request(server)
          .keepOpen()
          .get('/api/stock-prices?stock=GOOG&stock=MSFT&like=true')
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.type, "application/json");
            assert.equal(res.body.stockData.length, 2);
            assert.equal(res.body.stockData[0].rel_likes + res.body.stockData[1].rel_likes, 0);
            done();
          });
    });
});
