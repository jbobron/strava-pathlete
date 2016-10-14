const passport = require('passport');
const router = require('express').Router();

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

module.exports = () => {
  router.get('/', (req, res) => {
    res.render('index', { user: JSON.stringify(req.user) });
  });

  router.get('/account', ensureAuthenticated, (req, res) => {
    res.render('account', { user: req.user });
  });

  router.get('/login', (req, res) => {
    res.render('login', { user: req.user });
  });

  // passport.authenticate() authenticates the request w/ strava by redirecting
  // this request to strava, authorizing user, and then strava redirects back
  // to /auth/strava/callback at the Authorization Callback Domain set in Strava API settings
  router.get('/auth/strava',
    passport.authenticate('strava', { scope: ['view_private'] }));

  router.get('/auth/strava/callback',
    passport.authenticate('strava', { failureRedirect: '/login' }), (req, res) => {
      res.redirect('/');
    });

  router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });
  return router;
};
