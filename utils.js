const crypto = require('crypto');
const jwt = require('jsonwebtoken');

function validPassword(password, hash, salt) {
  var hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
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
  const id = user.id;
  const expiresIn = '1d';

  const payload = {
    id,
  };

  const signedToken = jwt.sign(payload, process.env.SECRET, { expiresIn: expiresIn });

  return {
    token: 'Bearer ' + signedToken,
    expires: expiresIn,
  };
}

module.exports.validPassword = validPassword;
module.exports.genPassword = genPassword;
module.exports.createJWT = createJWT;
