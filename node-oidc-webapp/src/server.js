const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const express = require('express');
const handlebars = require('express-handlebars');
const path = require('path');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const request = require('request-promise');
const session = require('express-session');

// loading env vars from .env file
require('dotenv').config();

const nonceCookie = 'auth0rization-nonce';
let oidcProviderInfo;

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(crypto.randomBytes(16).toString('hex')));
app.use(
  session({
    secret: crypto.randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: false
  })
);
app.engine('handlebars', handlebars());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/profile', (req, res) => {
  const { idToken, decodedIdToken } = req.session;
  res.render('profile', {
    idToken,
    decodedIdToken
  });
});

app.get('/login', (req, res) => {
  // define constants for the authorization request
  const authorizationEndpoint = oidcProviderInfo['authorization_endpoint'];
  const responseType = 'id_token';
  // To see more info about the user
  // Initially the openid info was retrieved, but profile and email was added
  // Go to `curl -X GET https://<DOMAIN>/.well-known/openid-configuration | jq` to see
  // what scopes are supported
  const scope = 'openid profile email';
  const clientID = process.env.CLIENT_ID;
  const redirectUri = 'http://localhost:3000/callback';
  const responseMode = 'form_post';
  const nonce = crypto.randomBytes(16).toString('hex');
  // define a signed cookie, containing the nonce value
  const options = {
    maxAge: 1000 * 60 * 15,
    httpOnly: true, // The cookie only accessible by the web server
    signed: true
  };

  // add cookie to the response and issue a 302 redirecting the user
  res
    .cookie(nonceCookie, nonce, options)
    .redirect(
      authorizationEndpoint +
        '?response_mode=' +
        responseMode +
        '&response_type=' +
        responseType +
        '&scope=' +
        scope +
        '&client_id=' +
        clientID +
        '&redirect_uri=' +
        redirectUri +
        '&nonce=' +
        nonce
    );
});

app.post('/callback', async (req, res) => {
  // take nonce from cookie
  const nonce = req.signedCookies[nonceCookie];

  // delete nonce
  delete req.signedCookies[nonceCookie];

  // take ID token posted by the user
  const { id_token } = req.body;

  // decode token
  const decodeToken = jwt.decode(id_token, { complete: true });

  // get key id
  const kid = decodeToken.header.kid;

  // get public key
  const client = jwksClient({
    jwksUri: oidcProviderInfo['jwks_uri']
  });

  client.getSigningKey(kid, (err, key) => {
    const signingKey = key.publicKey || key.rsaPublicKey;

    // Verify signature and decode token
    const verifiedToken = jwt.verify(id_token, signingKey);

    // check audience, nonce and expiration time
    const {
      nonce: decodedNonce,
      aud: audience,
      exp: expirationDate,
      iss: issuer
    } = verifiedToken;

    const currentTime = Math.floor(Date.now() / 1000);
    const expectedAudience = process.env.CLIENT_ID;

    if (
      audience !== expectedAudience ||
      decodedNonce !== nonce ||
      expirationDate < currentTime ||
      issuer !== oidcProviderInfo['issuer']
    ) {
      // send an unauthorized http status
      return res.status(401).send();
    }

    console.log(verifiedToken);
    req.session.decodedIdToken = verifiedToken;
    req.session.idToken = id_token;

    // Send the decoded version of the ID token
    res.redirect('/profile');
  });
});

app.get('/to-dos', async (req, res) => {
  res.status(501).send();
});

app.get('/remove-to-do/:id', async (req, res) => {
  res.status(501).send();
});

const { OIDC_PROVIDER } = process.env;
const discEnd = `https://${OIDC_PROVIDER}/.well-known/openid-configuration`;

request(discEnd)
  .then(res => {
    oidcProviderInfo = JSON.parse(res);
    app.listen(3000, () => {
      console.log(`Server running on http://localhost:3000`);
    });
  })
  .catch(error => {
    console.error(error);
    console.error(`Unable to get OIDC endpoints for ${OIDC_PROVIDER}`);
    process.exit(1);
  });
