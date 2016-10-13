const path = require('path');
const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const StravaStrategy = require('passport-strava-oauth2').Strategy;

const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;

const app = express();

var cbUrl = app.get('env') === 'development' ?
  'http://127.0.0.1:3000' :
  'http://strava-pathlete.herokuapp.com';

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new StravaStrategy({
  clientID: STRAVA_CLIENT_ID,
  clientSecret: STRAVA_CLIENT_SECRET,
  callbackURL: cbUrl + '/auth/strava/callback',
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

app.set('views', path.join(__dirname, '/public'));
app.set('view engine', 'ejs');
app.use(express.session({ secret: 'keyboard cat', cookie: { maxAge: 1000 * 60 * 60 } }));
app.use(express.logger());
app.use(express.cookieParser());
app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page. (ex: see /account route)
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
  // res.render('login', { user: req.user });
  res.redirect('auth/strava');
});

// passport.authenticate() authenticates the request w/ strava by redirecting
// this request to strava, authorizing user, and then strava redirects back
// to /auth/strava/callback at the Authorization Callback Domain set in Strava API settings
app.get('/auth/strava',
  passport.authenticate('strava', { scope: ['public'] }));

app.get('/auth/strava/callback',
  passport.authenticate('strava', { failureRedirect: '/login' }), (req, res) => {
    res.redirect('/');
  });

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

if (app.get('env') === 'development') app.listen(3000);
else app.listen(process.env.PORT);
