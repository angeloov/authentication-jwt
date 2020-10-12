const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const SECRET = process.env.JWT_SECRET;

// DB Require
const pool = require('./db');

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: SECRET,
};

module.exports = passport => {
  // The JWT payload is passed into the verify callback
  passport.use(
    new JwtStrategy(options, function (jwt_payload, done) {
      // Check if there's someone with the id stored in the JWT
      const query = 'SELECT * FROM users WHERE id=$1';
      const values = [jwt_payload.id];

      pool.query(query, values, (err, res) => {
        const user = res.rows[0];

        if (err) return done(err, false);
        if (user) {
          return done(null, user);
        } else return done(null, false);
      });
    })
  );
};
