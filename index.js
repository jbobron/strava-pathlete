const express = require('express');
const passport = require('passport');
const http = require('http');
const StravaStrategy = require('passport-strava-oauth2').Strategy;
const util = require('util');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');

const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;

const app = express();

// configure Express
var cbUrl = '';
if (app.get('env') === 'development') {
  // var use = app.use(express.errorHandler());
  cbUrl = 'http://localhost:3000/auth/strava/callback';
} else {
  cbUrl = 'http://strava-pathlete.herokuapp.com/auth/strava/callback';
}

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Strava profile is
//   serialized and deserialized.
passport.serializeUser((user, done) => done(null, user));

passport.deserializeUser((obj, done) => done(null, obj));


// Use the StravaStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Strava
//   profile), and invoke a callback with a user object.
passport.use(new StravaStrategy({
  clientID: STRAVA_CLIENT_ID,
  clientSecret: STRAVA_CLIENT_SECRET,
  callbackURL: cbUrl,
},
  (accessToken, refreshToken, profile, done) => {
    // asynchronous verification, for effect...
    // accessToken = You should save this off in some table where you store
    // access tokens for a user.
    // profile contains information about the user

    process.nextTick(() => done(null, profile));
    // To keep the example simple, the user's Strava profile is returned to
    // represent the logged-in user.  In a typical application, you would want
    // to associate the Strava account with a user record in your database,
    // and return that user instead.
  }
));


// app.configure(() => {
app.set('views', __dirname + '/public');
app.set('view engine', 'ejs');
app.use(express.logger());
app.use(express.cookieParser());
app.use(bodyParser.json());
app.use(methodOverride());

// below causes memory leak on heroku prod, use connect-mongo or cookie-Session
// app.use(express.session({ secret: 'keyboard cat' }));

// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(__dirname + '/public'));
// });

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
  return null;
}

app.get('/', (req, res) => {
  res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, (req, res) => {
  res.render('account', { user: req.user });
});

app.get('/login', (req, res) => {
  res.render('login', { user: req.user });
});

// GET /auth/strava
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Strava authentication will involve
//   redirecting the user to strava.com.  After authorization, Strava
//   will redirect the user back to this application at /auth/strava/callback
app.get('/auth/strava',
  passport.authenticate('strava', { scope: ['public'] }), (req, res) => {
    // The request will be redirected to Strava for authentication, so this
    // function will not be called.
  });

// GET /auth/strava/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/strava/callback',
  passport.authenticate('strava', { failureRedirect: '/login' }), (req, res) => {
    res.redirect('/');
  });

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

app..listen(process.env.PORT || 3000)
