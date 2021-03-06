const express = require('express');
const app = express();
// const keys = require('./key');
const request = require('request');

// const STRAVA_CLIENT_ID = !!process.env.STRAVA_CLIENT_ID ? process.env.STRAVA_CLIENT_ID : require('./key').STRAVA_CLIENT_ID
// const STRAVA_CLIENT_SECRET = !!process.env.STRAVA_CLIENT_SECRET ? process.env.STRAVA_CLIENT_SECRET : require('./key').STRAVA_CLIENT_SECRET
const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;


// app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.render('index');
});

function getRedirectURL() {
  if (app.get('port') !== '5000') {
    return 'http://strava-pathlete.herokuapp.com/token_exchange';
  }
  return 'http://localhost:5000/token_exchange';
}

const clientId = '?client_id=' + STRAVA_CLIENT_ID;
const clientSecret = '&client_secret=' + STRAVA_CLIENT_SECRET;

app.get('/auth/strava', (req, res) => {
  const stravaOauthUrl = 'https://www.strava.com/oauth/authorize';
  const responseType = '&response_type=code';
  const redirectURI = '&redirect_uri=' + getRedirectURL();
  const redirectUrl = stravaOauthUrl + clientId + responseType + redirectURI;
  console.log('redirectUrl', redirectUrl);
  res.redirect(redirectUrl);
});

var authCode = '';
var access_token = '';
var user = {};
app.get('/token_exchange', (req, res) => {
  authCode = req.param('code');
  var res1 = res;
  console.log("is this your auth code->", req.params.code, " or ", authCode)
  const postUrl = 'https://www.strava.com/oauth/token' + clientId + clientSecret + '&code=' + authCode;
  request.post(postUrl, (error, response, body) => {
    if (!error && response.statusCode == 200) {
      console.log(body);
    }
    access_token = body.access_token;
    res1.render('dashboard.html', response);
    }
);
})

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
