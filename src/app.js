const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const routes = require('./routes/index')

const app = express()

app.use(cors())
app.use(morgan('dev'))
// app.use(express.urlencoded({ extended: true, limit: '50mb' }));
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
