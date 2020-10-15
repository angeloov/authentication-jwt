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
  const expiresIn = 60 * 0.2; // 5 minutes

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
  const payload = {
    id: user.id,
    expiresIn: '7d',
  };

  let refreshToken;

  try {
    if (!user.refresh_token) throw new Error('No refresh token in DB. Generate one');
    
    // Check if the refresh token is valid
    jwt.verify(user.refresh_token, process.env.REFRESH_TOKEN_SECRET);

    // If valid return the one that was in DB
    return user.refresh_token;
  } catch (err) {
    // If refresh token is expired create a new one
    refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET);

    const query = 'UPDATE users SET refresh_token=$1 WHERE id=$2';

    db.query(query, [refreshToken, user.id], (err, res) => {
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
