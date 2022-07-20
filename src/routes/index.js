const { Router } = require('express');
const characters = require('./characters');
const movies = require('./movies');
const auth = require('./auth/index');

const router = Router()


router.use('/characters', characters);
router.use('/movies', movies);
router.use('/auth', auth);



module.exports = router
