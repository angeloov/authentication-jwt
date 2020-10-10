const express = require('express');
let router = express.Router();

const passport = require('passport');
const utils = require('../utils');

// Database
const db = require('../config/db');

/*
 * --------------- LOGIN ROUTE ---------------
 */

router.post('/login', (req, res, next) => {
  const query = 'SELECT id, hash, salt FROM users WHERE username=$1';
  const values = [req.body.username];

  db.query(query, values, (err, dbRes) => {
    const user = dbRes.rows[0]; // Taking the user

    if (err) next(err);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: 'Your username is incorrect' });
    }

    const isValid = utils.validPassword(req.body.password, user.hash, user.salt); // Password Validation

    if (isValid) {
      const JWT_OBJ = utils.createJWT(user);
      res
        .status(200)
        .json({ success: true, token: JWT_OBJ.token, expiresIn: JWT_OBJ.expires });
    } else {
      res.status(401).json({ success: false, message: 'Your password is incorrect' });
    }
  });
});

/*
 * --------------- REGISTER ROUTE ---------------
 */

router.post('/register', (req, res) => {
  const pwd = utils.genPassword(req.body.password);

  const hash = pwd.hash;
  const salt = pwd.salt;

  const query = 'INSERT INTO users(username, hash, salt) VALUES ($1, $2, $3)';
  const values = [req.body.username, hash, salt];

  db.query(query, values, err => {
    if (err) return next(err);
  });

  res.json({ success: true });
});

/*
 * --------------- PROTECTED ROUTE ---------------
 */

router.get('/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.status(200).json({ message: 'Successfully accessed protected route! 🎉👌' });
});

/*
 * --------------- ERROR HANDLING ---------------
 */

router.use((err, req, res, next) => {
  const status = err.status || 500;
  console.log(err.stack);
  
  res.status(status).json({ message: 'Something went wrong! Server error' });
});

module.exports = router;
