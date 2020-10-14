require('dotenv').config();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const db = require('./config/db');

function validPassword(password, hash, salt) {
  let hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === hashVerify;
}

function genPassword(password) {
  var salt = crypto.randomBytes(32).toString('hex');
  var genHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');

  return {
    salt: salt,
    hash: genHash,
  };
}

function createJWT(user) {
  const expiresIn = 60 * 0.1; // 5 minutes

  const payload = {
    id: user.id,
    exp: Date.now() / 1000 + expiresIn,
  };

  const signedToken = jwt.sign(payload, process.env.JWT_SECRET);

  return {
    token: 'Bearer ' + signedToken,
    expires: expiresIn,
  };
}

function createRefreshToken(user, next) {
  const expiresIn = 60 * 60 * 24 * 7; // 7 days

  const payload = {
    id: user.id,
    exp: Date.now / 1000 + expiresIn,
  };

  let refreshToken;
  // If there's no refresh token
  if (!user.refresh_token) {
    refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET);

    const query = 'INSERT INTO users (refresh_token) VALUES ($1)';

    db.query(query, [refreshToken], (err, res) => {
      if (err) return next(err);
      console.log('SUCCESS');
    });
  } else {
    // If there's a refresh token in the DB

    // Check if the token is valid, if not generate a new one
    try {
      jwt.verify(user.refresh_token, process.env.REFRESH_TOKEN_SECRET);
    }
    catch (err) {
      refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET);

      const query = 'UPDATE users SET refresh_token=$1';
      db.query(query, [refreshToken], err => (err ? next(err) : null));
    }
  }

  return refreshToken;
}

module.exports.validPassword = validPassword;
module.exports.genPassword = genPassword;
module.exports.createJWT = createJWT;
module.exports.createRefreshToken = createRefreshToken;
