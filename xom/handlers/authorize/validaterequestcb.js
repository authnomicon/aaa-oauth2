exports = module.exports = function(directory) {
  var oauth2orize = require('oauth2orize');
  
  // purpose of this it to verify the redirect URI in the request, so we are not an open redirector
  // Implements 3.1.2.4.  Invalid Endpoint
  
  // http://nimbusds.com/blog/openid-connect-ldap-schema-update/
  // https://bitbucket.org/connect2id/server-ldap-schemas
  
  // https://tools.ietf.org/html/draft-hunt-oauth-scim-client-reg-00
  // http://www.simplecloud.info/specs/draft-scim-core-schema-01.html
  // https://github.com/andreassolberg/voot/wiki/Protocol-SCIM
  
  return function validateRequest(clientID, redirectURI, cb) {
    directory.query(clientID, function(err, client) {
      if (err) { return cb(err); }
      if (!client) {
        return cb(new oauth2orize.AuthorizationError('Client not found', 'unauthorized_client'));
      }
      if (!client.redirectURIs || !client.redirectURIs.length) {
        // `redirectURIs` is an optional property, and may not be present on
        // on clients that do not use flows with redirection.  Such clients are
        // not authorized to use the `/authorize` endpoint.
        return cb(new oauth2orize.AuthorizationError('Client has no registered redirect URIs', 'unauthorized_client'));
      }
      
      // TODO: Implement 3.1.2.2.  Registration Requirements
      /*
      The authorization server MUST require the following clients to
      register their redirection endpoint:

      o  Public clients.

      o  Confidential clients utilizing the implicit grant type.
      */
      
      // TODO: Implement 3.1.2.3.  Dynamic Configuration
      /*
      If multiple redirection URIs have been registered, if only part of
      the redirection URI has been registered, or if no redirection URI has
      been registered, the client MUST include a redirection URI with the
      authorization request using the "redirect_uri" request parameter.
      */
      
      if (!redirectURI) {
        // If the request did not explicitly specify a redirect URI, use the
        // higest priority URI specified in the client's registration.
        redirectURI = client.redirectURIs[0];
      } else if (client.redirectURIs.indexOf(redirectURI) == -1) {
        return cb(new oauth2orize.AuthorizationError('Client not allowed to use redirect URI: ' + redirectURI, 'unauthorized_client'));
      }
      
      return cb(null, client, redirectURI);
    });
  };
};

exports['@require'] = [ 'http://schemas.modulate.io/js/aaa/clients/Directory' ];