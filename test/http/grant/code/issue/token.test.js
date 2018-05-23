/* global describe, it */

var expect = require('chai').expect;
var sinon = require('sinon');
var factory = require('../../../../../app/http/grant/code/issue/token');


describe('http/grant/code/issue/token', function() {
  
  it('should export factory function', function() {
    expect(factory).to.be.a('function');
  });
  
  it('should be annotated', function() {
    expect(factory['@implements']).to.be.undefined;
    expect(factory['@singleton']).to.be.undefined;
  });
  
  describe('issue', function() {
    var ds = {
      get: function(){}
    };
    var codes = {
      decode: function(){}
    };
    var sts = {
      issue: function(){}
    };
    
    var client = {
      id: 's6BhdRkqt3',
      name: 'Example Client'
    };
    
    
    describe('issuing an access token', function() {
      var token, attrs;
      
      before(function() {
        sinon.stub(codes, 'decode').yields(null, {
          user: {
            id: '1',
            displayName: 'John Doe'
          },
          client: {
            id: 's6BhdRkqt3',
            name: 'Example Client'
          },
          permissions: [ {
            resource: {
              id: '112210f47de98100',
              identifier: 'https://api.example.com/',
              name: 'Example API'
            },
            scope: [ 'read:foo', 'write:foo', 'read:bar' ]
          } ],
          redirectURI: 'https://client.example.com/cb'
        });
        sinon.stub(ds, 'get').yields(null, { id: '112210f47de98100', identifier: 'https://api.example.com/', name: 'Example API' });
        sinon.stub(sts, 'issue').yields(null, '2YotnFZFEjr1zCsicMWpAA', { token_type: 'Bearer' });
      });
      
      after(function() {
        sts.issue.restore();
        ds.get.restore();
        codes.decode.restore();
      });
      
      before(function(done) {
        var issue = factory(sts, codes, ds);
        issue(client, 'SplxlOBeZQQYbYS6WxSbIA', 'https://client.example.com/cb', {}, {}, function(err, t, r, a) {
          if (err) { return done(err); }
          token = t;
          attrs = a;
          done();
        });
      });
      
      it('should decode authorization code', function() {
        expect(codes.decode.callCount).to.equal(1);
        expect(codes.decode.args[0][0]).to.equal('SplxlOBeZQQYbYS6WxSbIA');
      });
      
      it('should get resource from directory services', function() {
        expect(ds.get.callCount).to.equal(1);
        expect(ds.get.args[0][0]).to.equal('112210f47de98100');
        expect(ds.get.args[0][1]).to.equal('resources');
      });
      
      it('should issue access token', function() {
        expect(sts.issue.callCount).to.equal(1);
        expect(sts.issue.args[0][0]).to.deep.equal({
          user: {
            id: '1',
            displayName: 'John Doe'
          },
          client: {
            id: 's6BhdRkqt3',
            name: 'Example Client'
          },
          permissions: [ {
            resource: {
              id: '112210f47de98100',
              identifier: 'https://api.example.com/',
              name: 'Example API'
            },
            scope: [ 'read:foo', 'write:foo', 'read:bar' ]
          } ]
        });
        expect(sts.issue.args[0][1]).to.deep.equal([
          { id: '112210f47de98100',
            identifier: 'https://api.example.com/',
            name: 'Example API' }
        ]);
        expect(sts.issue.args[0][2]).to.deep.equal({
          id: 's6BhdRkqt3',
          name: 'Example Client'
        });
      });
      
      it('should yield access token', function() {
        expect(token).to.equal('2YotnFZFEjr1zCsicMWpAA');
        expect(attrs).to.deep.equal({ token_type: 'Bearer' });
      });
    }); // issuing an access token
    
  });
  
});
