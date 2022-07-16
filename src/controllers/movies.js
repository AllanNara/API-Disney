const { Movie, Character, Genre, Op } = require('../db');
const { assocciation } = require('./index');

const getAllMovies = async (req, res, next) => {
    const { title, genre, order } = req.query;
    if(order) {
        if(order.toUpperCase() !== "ASC" && order.toUpperCase() !== "DESC") {
            return res.status(400).send("Query 'Order' only allows DESC or ASC")
        };
    };
    try {
        const options = {
            attributes: ['image', 'title', 'released'],
            where: {}
        };
        if(order) {
            options.order = [['released', `${order.toUpperCase()}`]];
        };
        if(title) {
            Object.assign(options.where, {title: {[Op.iLike]: title}})
        };
        if(genre) {
            const findGenre = await Genre.findOne({where: {id: genre}, attributes: ['name']})
            if(!findGenre) return res.status(404).send('<h2>GENRE NOT FOUND</h2>');
            Object.assign(options, {include: [
                {
                    model: Genre,
                    where: { name: genre }
                }   
            ]})
        };
        //IF NOT EXIST QUERY TITLE
        if(!Object.keys(options.where).length) delete options.where;
        const allMovies = await Movie.findAll(options);
        //VERIFY IF DATABASE IS EMPTY
        if(!Object.keys(allMovies).length) {
            return res.json({data: 'no data available'})
        };
        res.json(allMovies)
    } catch (error) {
        next(error)
    }
};

const postNewMovie = async (req, res, next) => {
    const { image, title, released, rating, characters, genres } = req.body;
    if(!image || !title || !released || !rating) {
        return res.status(422).send("Missing parameters");
    } else if(
        typeof image !== 'string' ||
        typeof title !== 'string'
    ) return res.status(400).send("Invalid parameters");

    try {
        const newMovie = await Movie.create(req.body);
        
        const addCharacter = await assocciation(characters, newMovie, Character);
        if(addCharacter !== null && addCharacter === '404') return res.status(404).send('Character not found');
        
        const addGenre = await assocciation(genres, newMovie, Genre);
        if(addGenre !== null && addGenre === '404') return res.status(404).send('Genre not found');

        res.send(newMovie.toJSON());
    } catch (error) {
        next(error)
    }
};

const getMovieById = async (req, res, next) => {
    const { idMovie } = req.params
    try {
        const movie = await Movie.findByPk(idMovie, { include: [Character, Genre]});
        if(!movie) return res.status(404).send('Movie not found or ID invalid');
        res.json(movie);
    } catch (error) {
        next(error)
    }
};

const updateMovie = async (req, res, next) => {
    const { idMovie } = req.params;
    const { image, title, released, rating, characters, genres } = req.body;
    if(
        (typeof image !== 'string' ||
        typeof image !== 'undefined') ||
        (typeof title !== 'string' ||
        typeof title !== 'undefined') ||
        (typeof released !== 'string' ||
        typeof released !== 'undefined') ||
        (typeof rating !== 'number' ||
        typeof rating !== 'undefined')    
    ) return res.status(400).send("Invalid parameters");

    try {
        const movie = await Movie.findByPk(idMovie);
        if(!movie) return res.status(404).send('Movie not found or ID invalid');

        const addCharacter = await assocciation(characters, movie, Character);
        if(addCharacter !== null && addCharacter === '404') {
            return res.status(404).send('Character not found')
        };
        
        const addGenre = await assocciation(genres, movie, Genre);
        if(addGenre !== null && addGenre === '404') {
            return res.status(404).send('Genre not found')
        };

        const response = await Movie.update(req.body, { where: { id: idMovie } });
        return response[0] !== 0 ? 
        res.send("Movie successfully updated")
        : res.status(400).send("Could not update movie");
    } catch (error) {
        next(error)
    }
};

const deleteMovie = async (req, res, next) => {
    const { idMovie } = req.params
    try {
        const movie = await Movie.findByPk(idMovie);
        if(!movie) return res.status(404).send('Movie not found or ID invalid');
        const response = await Movie.destroy({ where: { id: idMovie } });
        return response[0] !== 0 ?
        res.send("Movie successfully delete")
        : res.status(400).send("Could not delete movie")
    } catch (error) {
        next(error)
    }
};

module.exports = {
    getAllMovies,
    postNewMovie,
    getMovieById,
    updateMovie,
    deleteMovie
}