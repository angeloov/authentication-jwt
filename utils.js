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
  const expiresIn = 60 * 5; // 5 minutes

  const payload = {
    id: user.id,
    exp: Math.floor(Date.now() / 1000) + expiresIn,
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
    expiresIn: Math.floor(Date.now() / 1000) + expiresIn,
  };

  let refreshToken;

  try {
    if (!user.refresh_token) throw new Error('No refresh token in DB. Generate one');

    // Check if the refresh token is valid, if not pass to catch
    jwt.verify(user.refresh_token, process.env.REFRESH_TOKEN_SECRET);

    return user.refresh_token; // If valid return the refresh token that was in DB
  } catch (err) {
    // If refresh token is expired
    // or it doesn't exist in DB, create a new one
    refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET);

    const query = 'UPDATE users SET refresh_token=$1 WHERE id=$2';

    db.query(query, [refreshToken, user.id], err => {
      if (err) return next(err);
      console.log('Generated a refresh token and put in DB');
    });
  }

  return refreshToken;
}

module.exports.validPassword = validPassword;
module.exports.genPassword = genPassword;
module.exports.createJWT = createJWT;
module.exports.createRefreshToken = createRefreshToken;
