require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const helmet = require('helmet');
const passport = require('passport');

const utils = require('./utils');

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

app.use(passport.initialize());
require('./passport.config')(passport);

/*
 * ---------- ROUTES ----------
 */

app.post('/login', (req, res, next) => {
  const query = 'SELECT id, hash, salt FROM users WHERE username=$1';
  const values = [req.body.username];

  // Query the DB
  pool.query(query, values, (err, dbRes) => {
    const user = dbRes.rows[0]; // Fetch the user

    if (err) next(err);
    if (!user)
      res.status(401).json({ success: false, message: 'Your username is incorrect' });

    const isValid = utils.validPassword(req.body.password, user.hash, user.salt); // Password Validation

    if (isValid) {
      const JWT_OBJ = utils.createJWT(user);
      res
        .status(200)
        .json({ success: true, token: JWT_OBJ.token, expiresIn: JWT_OBJ.expires });
    } else {
      res.status(200).json({ success: false, message: 'Your password is incorrect' });
    }
  });
});

app.post('/register', (req, res) => {
  const pwd = utils.genPassword(req.body.password);

  const hash = pwd.hash;
  const salt = pwd.salt;

  const query = 'INSERT INTO users(username, hash, salt) VALUES ($1, $2, $3)';
  const values = [req.body.username, hash, salt];

  pool.query(query, values, err => {
    if (err) console.log(err);
  });

  res.json({ success: true });
});

app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).json({ message: 'Something went wrong! Server error' });
});

app.listen(3000, () => console.log('Listening on port 3000'));
