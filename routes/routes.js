const express = require('express');
let router = express.Router();
const crypto = require('crypto');

const passport = require('passport');
const utils = require('../utils');

// Database
const db = require('../config/db');

const jwt = require('jsonwebtoken');

/*
 * --------------- LOGIN ROUTE ---------------
 */

router.post('/login', (req, res, next) => {
  const query = 'SELECT id, hash, salt, refresh_token FROM users WHERE username=$1';
  const values = [req.body.username];

  db.query(query, values, (err, dbRes) => {
    const user = dbRes.rows[0]; // Taking the user

    if (err) next(err);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Your username is incorrect' });
    }

    const isValid = utils.validPassword(req.body.password, user.hash, user.salt); // Password Validation

    if (isValid) {
      const JWT_OBJ = utils.createJWT(user);
      const refreshToken = utils.createRefreshToken(user, next);

      res.cookie('refreshToken', refreshToken, {
        maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days in ms
        httpOnly: true,
      });

      res
        .status(200)
        .json({ success: true, accessToken: JWT_OBJ.token, expiresIn: JWT_OBJ.expires });
    } else {
      res.status(401).json({ success: false, message: 'Your password is incorrect' });
    }
  });
});

/*
 * --------------- REGISTER ROUTE ---------------
 */

router.post('/register', (req, res, next) => {
  const pwd = utils.genPassword(req.body.password);

  const hash = pwd.hash;
  const salt = pwd.salt;
  const generatedUserID = crypto.randomBytes(32).toString('hex');

  const query = 'INSERT INTO users(id, username, hash, salt) VALUES ($1, $2, $3, $4)';
  const values = [generatedUserID, req.body.username, hash, salt];

  db.query(query, values, err => {
    if (err) return next(err);
  });

  res.json({ success: true });
});

/*
 * --------------- PROTECTED ROUTE ---------------
 */

router.get('/protected', passport.authenticate('jwt', { session: false }), (req, res, next) => {
  let userToken = req.headers['authorization'].split(' ')[1];

  let userData = jwt.verify(userToken, process.env.JWT_SECRET);
  console.log("/protected route request -> id:", userData.id);


  res.status(200).json({ message: 'Successfully accessed protected route! 🎉👌' });
});

router.get('/refresh_token', (req, res) => {
  // Read refresh token from cookie
  let refreshToken = req.cookies.refreshToken;

  // Validate token and check that it's not expired
  try {
    // If refresh token is valid
    // generate a new access token and send it to the user
    let user = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    let newAccessToken = utils.createJWT(user, process.env.JWT_SECRET);
    return res.status(200).json({ success: true, accessToken: newAccessToken });
  } catch (err) {
    // If refresh token is not valid log out the user
    req.logOut();
    return res.status(401).json({ success: false, message: 'The refresh token is expired' });
  }
});

module.exports = router;
