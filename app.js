const express = require("express");
const app = express();

const AppleAuth = require('apple-auth');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const key = `-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQghDYv5/M4+i1EPz7V
i2qwv6hAuXhr+69Vo1DGta4/a9mgCgYIKoZIzj0DAQehRANCAASeOElO90SMe2lv
XCluyS2z/9UzUAJGd5kkIIBhdPPqdeaPv0gfLRJEab0FhvyXu0av0JJB9zeHNCPm
bp4QOh0/
-----END PRIVATE KEY-----`
let auth = new AppleAuth(
  {
    "client_id": "com.tandemexperiences.login.app",
    "team_id": "RW6MKM37W3",
    "key_id": "Z9TRQF8RF3",
    "redirect_uri": "https://sample-react-app-vercel-testing.vercel.app/",
    "scope": "name email",
  },
  key.toString(),
  'text'
);

const port = process.env.PORT || 3001;

app.get('/', (req, res) => {
  console.log(Date().toString() + 'GET /');
  res.send(`<a href="${auth.loginURL()}">Sign in with Apple</a>`);
});

app.get('/token', (req, res) => {
  res.send(auth._tokenGenerator.generate());
});

app.post('/auth', bodyParser(), async (req, res) => {
  try {
    console.log(Date().toString() + 'GET /auth');
    const response = await auth.accessToken(req.body.code);
    const idToken = jwt.decode(response.id_token);

    const user = {};
    user.id = idToken.sub;

    if (idToken.email) user.email = idToken.email;
    if (req.body.user) {
      const { name } = JSON.parse(req.body.user);
      user.name = name;
    }

    res.json(user);
  } catch (ex) {
    console.error(ex);
    res.send('An error occurred!');
  }
});

app.get('/refresh', async (req, res) => {
  try {
    console.log(Date().toString() + 'GET /refresh');
    const accessToken = await auth.refreshToken(req.query.refreshToken);
    res.json(accessToken);
  } catch (ex) {
    console.error(ex);
    res.send('An error occurred!'+ex.message);
  }
});


app.listen(port, () => console.log(`Example app listening on port ${port}!`));
