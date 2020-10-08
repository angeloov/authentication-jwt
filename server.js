const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
require('dotenv').config();
const utils = require('./utils');

const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const SECRET = 'ciaociao';

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: SECRET,
};

/*
 * ------- DATABASE -------
 */

const { Pool } = require('pg');
const pool = new Pool();

pool.query('SELECT * FROM users', (err, res) => {
  if (err) console.log(err);
  console.log(res.rows[0]);
});

/*
 * ------- ROUTES -------
 */

app.post('/login');
