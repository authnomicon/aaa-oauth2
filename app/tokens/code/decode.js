exports = module.exports = function() {
  
  
  return function decode(tok, options, cb) {
    console.log('NORMALIZE FROM JWT AUTHZ CODE:');
    console.log(claims);
    
    var claims = tok.claims;
    
    var ctx = {}
      , prm, keys, key
      , i, len;
    
    ctx.userID = claims.sub;
    ctx.clientID = claims.cid;
    ctx.permissions = [];
    
    if (claims.prm) {
      for (i = 0, len = claims.prm.length; i < len; ++i) {
        prm = claims.prm[i];
        ctx.permissions.push({
          resourceID: prm.rid,
          scope: prm.scp
        });
      }
    }
    
    if (claims.cnf) {
      ctx.confirmation = [];
      
      keys = Object.keys(claims.cnf);
      for (i = 0, len = keys.length; i < len; ++i) {
        key = keys[i];
       
        switch (key) {
        case 'redirect_uri':
          ctx.confirmation.push({ method: 'redirect-uri', uri: claims.cnf.redirect_uri });
          break;
        case 'code_challenge':
        case 'code_challange':
          ctx.confirmation.push({
            method: 'pkce',
            challenge: claims.cnf.code_challenge || claims.cnf.code_challange,
            transform: claims.cnf.code_challenge_method || claims.cnf.code_challange_method || 'none'
          });
          break;
        case 'code_challenge_method':
        case 'code_challange_method':
          break;
        default:
          ctx.confirmation.push({ method: 'unknown', name: key });
          break;
        }
      }
    }
    
    
    // TODO: Add options argument as way to signal required/optional claims
    // and standardized "header-like" claims (such as confirmation), which
    // may depend on the scheme negoatiated (PoP, Named)
    // https://tools.ietf.org/html/draft-sakimura-oauth-rjwtprof-05
    
    
    console.log('GOT SECURE CONTEXT AZ CODE!');
    console.log(ctx);
    
    return cb(null, ctx);
  };
};

exports['@implements'] = 'http://i.bixbyjs.org/tokens/interpretClaimsFunc';
exports['@dialect'] = 'http://schemas.authnomicon.org/tokens/jwt/authorization-code';
