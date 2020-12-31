require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

app.use(express.static('public'));

app.use(
  cors({
    origin: 'http://127.0.0.1:5500',
    credentials: true,
  })
);
app.use(helmet());
app.use(cookieParser());
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
  console.log(err.stack);
  
  res.status(err.status || 500).json({ message: 'Something went wrong! Server error' });
});

app.listen(3000, () => console.log('Listening on port 3000'));
