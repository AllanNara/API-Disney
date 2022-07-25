const { Router } = require('express');
const characters = require('./characters');
const movies = require('./movies');
const auth = require('./auth');
const { isLoggedIn } = require('../middleware/auth')
const router = Router()


router.use('/characters', isLoggedIn, characters);
router.use('/movies', isLoggedIn, movies);
router.use('/auth', auth);



module.exports = router
