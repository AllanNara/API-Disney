const { Router } = require('express');
const characters = require('./characters')
const movies = require('./movies')

const router = Router()


router.use('/characters', characters);
router.use('/movies', movies)



module.exports = router
