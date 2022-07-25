require('dotenv').config()
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const session = require('express-session')
const routes = require('./routes/index')

const app = express()

const options = 
{
  name: 'sid',
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000
  }
};

app.use(session(options));

app.use((req, res, next) => {
  console.log('prueba: ', app.get('env'))
  console.log(req.session);
  next();
});

app.use(cors())
app.use(morgan('dev'))
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '50mb' }));
app.use('/api', routes)

// Error catching endware.
app.use((err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || err;
    console.error({errorMsg: message});
    res.status(status).send(message);
  });
  

module.exports = app
