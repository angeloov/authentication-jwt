require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const helmet = require('helmet');

app.use(
  cors({
    origin: 'http://127.0.0.1:5500',
    credentials: true,
  })
);
app.use(helmet());
app.use(express.json());

const passport = require('passport');
app.use(passport.initialize());
require('./config/passport')(passport);

const routes = require('./routes/routes');
app.use('/', routes);

/*
 * --------------- ERROR HANDLING ---------------
 */

app.use((err, req, res, next) => {
  const status = err.status || 500;
  console.log(err.stack);

  res.status(status).json({ message: 'Something went wrong! Server error' });
});

app.listen(3000, () => console.log('Listening on port 3000'));
