exports = module.exports = function(issueToken, aaa, pdp, Resources, AAA, service, verifyPassword) {
  var MFARequiredError = require('oauth2orize-mfa').MFARequiredError;
  
  
  return function issue(client, username, passwd, scope, body, authInfo, cb) {
    
    verifyPassword(username, passwd, function(err, user) {
      console.log('PASSWORD VERIFIED');
      console.log(err);
      console.log(user);
      
      var audience = body.audience;
      
      var options = {
        client: client,
        user: user,
        scope: scope,
        audience: audience
      };
      
      var req = aaa.request(options, function(res) {
        console.log(res);
      
        function ondecision(result) {
          if (result === true) {
            var resource = { id: 'http://www.example.com/',
             name: 'Example Service',
             tokenTypes: 
              [ { type: 'application/fe26.2' },
                { type: 'urn:ietf:params:oauth:token-type:jwt',
                  secret: 'some-shared-with-rs-s3cr1t-asdfasdfaieraadsfiasdfasd' } ] }
        
            //res.resources = [ resource ]
            // TODO: Get res.resources here
        
            // TODO: Issue real access token.
            /*
            var ctx = {};
            ctx.user = txn.user;
            ctx.client = txn.client;
            ctx.resources = txn.resources;
            ctx.permissions = [ { resource: txn.resources[0], scope: 'foo' } ];
    
            issueToken(ctx, function(err, accessToken) {
              if (err) { return cb(err); }
      
              return cb(null, accessToken);
            });
            */
        
            return cb(null, 'some-access-token-goes-here');
        
            //return cb(null, true, { permissions: [ { resource: resource, scope: 'foo' } ]});
          } else {
            return cb(null, false);
          }
        
          // TODO: Handle indeterminte by prompting?  Or attenuating scope?
          
          
        }
      
        function onprompt(name, options) {
          // TODO: Send errors based on prompt.  Consent is implicit
          
          // case 'login':
          // TODO: MFA Support
          // var areq = { scope: scope };
          // var ctx = { methods: [ 'password' ] };
          // return cb(new MFARequiredError('Multi-factor authentication required', null, areq, user, ctx));
          
          var opts = options || {};
          opts.prompt = name;
          return cb(null, false, opts);
        }
      
        function onend() {
          res.removeListener('decision', ondecision);
          res.removeListener('prompt', onprompt);
        }
      
        res.once('decision', ondecision);
        res.once('prompt', onprompt);
        res.once('end', onend);
      });
    
      req.on('error', function(err) {
        // TODO:
      })
    
      req.send();
    });
  };
};

exports['@require'] = [
  '../util/issuetoken',
  'http://schemas.authnomicon.org/js/aaa',
  'http://schema.modulate.io/js/aaa/PolicyDecisionPoint',
  'http://schemas.modulate.io/js/aaa/realms',
  'http://schemas.modulate.io/js/aaa',
  'http://schemas.authnomicon.org/js/aaa/Service',
  'http://schemas.authnomicon.org/js/security/authentication/password/verifyFn'
];
