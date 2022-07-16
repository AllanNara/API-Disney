const { Router } = require('express');
const { 
    getAllMovies, 
    postNewMovie, 
    getMovieById, 
    updateMovie, 
    deleteMovie 
} = require('../controllers/movies')

const router = Router()

router.get('/', getAllMovies);
router.post('/', postNewMovie);
router.get('/:idMovie', getMovieById);
router.put('/:idMovie', updateMovie);
router.delete('/:idMovie', deleteMovie);


module.exports = router;
