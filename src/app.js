const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const routes = require('./routes/index')

const app = express()

app.use(cors())
app.use(morgan('dev'))
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));
app.use('/api', routes)



module.exports = app
