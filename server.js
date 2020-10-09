require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
const cors = require('cors');
const helmet = require('helmet');
const passport = require('passport');

const utils = require('./utils');

const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const SECRET = process.env.SECRET;

// Database
const pool = require('./postgres.config');

app.use(
  cors({
    origin: 'http://127.0.0.1:5500',
    credentials: true,
  })
);
app.use(helmet());
app.use(express.json());

app.use(passport.initialize())
require('./passport.config')(passport);

/* pool.query("SELECT * FROM users WHERE username=$1", ['Angelo'], (err, res) => {
  if (err) console.log(err);
  console.log(res.rows);
}); */

/*
 * ---------- ROUTES ----------
 */

app.post('/login', passport.authenticate('jwt', { session: false }), (req, res) => {
  const username = req.body.username;
})

app.post('/register', (req, res) => {
  console.log(req.body);

  const pwd = utils.genPassword(req.body.password);

  const hash = pwd.hash;
  const salt = pwd.salt;

  const query = 'INSERT INTO users(username, hash, salt) VALUES ($1, $2, $3)';
  const values = [req.body.username, hash, salt];
  console.log(values);

  pool.query(query, values, (err, res) => {
    if (err) console.log(err);
  });

  res.json({ success: true });
});

app.listen(3000, () => console.log('Listening on port 3000'));
