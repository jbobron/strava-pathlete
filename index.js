const path = require('path');
const logger = require('morgan');
const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const StravaStrategy = require('passport-strava-oauth2').Strategy;

const routes = require('./routes');

const app = express();

const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;


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
app.use(session({
  secret: 'keyboard cat',
  cookie: { maxAge: 1000 * 60 * 60 },
  resave: true,
  saveUninitialized: true,
}));
app.use(logger('dev'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(passport.initialize());
app.use(passport.session());
app.use('/', routes());

if (app.get('env') === 'development') app.listen(3000);
else app.listen(process.env.PORT);
