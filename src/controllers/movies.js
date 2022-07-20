const { Movie, Character, Genre, Op } = require('../db');
const { association, alredyExist } = require('./index');

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
            const findGenre = await Genre.findOne({where: {id: genre}})
            if(!findGenre) return res.status(404).send('<h2>GENRE NOT FOUND</h2>');
            Object.assign(options, {include: [
                {
                    model: Genre,
                    where: { id: genre },
                    attributes: [],
                    through: { attributes: [] }
                }
            ]})
        };
        //IF NOT EXIST QUERY TITLE
        if(!Object.keys(options.where).length) delete options.where;
        const allMovies = await Movie.findAll(options);
        //VERIFY IF DATABASE IS EMPTY
        if(!Object.keys(allMovies).length) return res.json({data: 'no data available'});
        res.json(allMovies)
    } catch (error) {
        next(error)
    }
};

const postNewMovie = async (req, res, next) => {
    const { image, title, released, rating, characters, genres } = req.body;
    if(!image || !title) {
        return res.status(422).send("Missing parameters");
    } else if(
        typeof image !== 'string' ||
        typeof title !== 'string' ||
        (rating && typeof rating !== 'number') ||
        (released && typeof released !== 'string') 
    ) return res.status(400).send("Invalid parameters");

    try {
        const newMovie = await Movie.create(req.body);
        
        const addCharacter = characters?.length ? await association(characters, newMovie, Character) : false;
        if(addCharacter !== false && addCharacter === '404') return res.status(404).send('Character not found');
        if(typeof addCharacter === 'object') next(addCharacter);
        
        const addGenre = genres?.length ? await association(genres, newMovie, Genre) : false;
        if(addGenre !== false && addGenre === '404') return res.status(404).send('Genre not found');
        if(typeof addGenre === 'object') next(addGenre);

        res.send(newMovie.toJSON())
    } catch (error) {
        next(error)
    }
};

const getMovieById = async (req, res, next) => {
    const { idMovie } = req.params
    try {
        const movie = await Movie.findByPk(idMovie, { 
            include: [
            {
                model: Genre,
                through: {
                    attributes: [],
                  }
            },
            {
                model: Character,
                through: {
                    attributes: [],
                  }
            }
        ]});
        if(!movie) return res.status(404).send('Movie not found or ID invalid');
        res.json(movie);
    } catch (error) {
        next(error)
    }
};

const updateMovie = async (req, res, next) => {
    const { idMovie } = req.params;
    const { image, title, released, rating, characters, genres, removeCh, removeGr } = req.body;
    if(
        (typeof image !== 'string' &&
        typeof image !== 'undefined') ||
        (typeof title !== 'string' &&
        typeof title !== 'undefined') ||
        (typeof released !== 'string' &&
        typeof released !== 'undefined') ||
        (typeof rating !== 'number' &&
        typeof rating !== 'undefined')    
    ) return res.status(400).send("Invalid parameters");

    try {
        const movie = await Movie.findByPk(idMovie, { include: [Character, Genre] });
        if(!movie) return res.status(404).send('Movie not found or ID invalid');
        const relations = {
            characters: [],
            genres: []
        };
        movie.toJSON().characters.forEach(e => relations.characters.push(e.name));
        movie.toJSON().genres.forEach(e => relations.genres.push(e.name));
        // REMOVE RELATIONS IF EXIST
        let rmCh = false
        let rmGr = false
        if(removeCh?.length) {
            if(!relations.characters.length) return res.status(400).send("Not exist items for remove")
            if(!alredyExist(relations.characters, removeCh)) return res.status(422).send("Error trying to remove: Selected character not found in this movie")
            const rm = await Character.findAll({where: {name: removeCh}});
            const response = await movie.removeCharacters(rm);
            rmCh = Boolean(response);
        };
        if(removeGr?.length) {
            if(!relations.genres.length) return res.status(400).send("Not exist items for remove")
            if(!alredyExist(relations.genres, removeGr)) return res.status(422).send("Error trying to remove: Selected genre not found in this movie")
            const rm = await Genre.findAll({where: {name: removeGr}});
            const response = await movie.removeGenres(rm);
            rmGr = Boolean(response);
        };
        //VERIFY IF EXIST NEW RELATIONS
        let newCh = false;
        let newGr = false;
        if(characters?.length && relations.characters.length) newCh = !alredyExist(relations.characters, characters);
        if(genres?.length && relations.genres.length) newGr = !alredyExist(relations.genres, genres);

        //VERIFY IF THE DATA HASN'T BEEN CHANGED
        const { image: imageMv, title: titleMv, released: releasedMv, rating: ratingMv } = movie;
        if( 
            (image === imageMv || image === undefined) && 
            (title === titleMv || title === undefined) && 
            (released === releasedMv || released === undefined) && 
            (rating === ratingMv || rating === undefined) &&
            !newCh && !newGr && !rmCh && !rmGr
        ) return res.send("No changes have been made");

        //NEW RELATIONS
        const addCharacter = characters?.length ? await association(characters, movie, Character) : false;
        if(addCharacter !== false && addCharacter === '404') return res.status(404).send('Character not found');
        if(typeof addCharacter === 'object') next(addCharacter);
        const addGenre = genres?.length ? await association(genres, movie, Genre) : false;
        if(addGenre !== false && addGenre === '404') return res.status(404).send('Genre not found');
        if(typeof addGenre === 'object') next(addGenre);

        const response = await Movie.update(req.body, { where: { id: idMovie } });
        return response[0] !== 0 || newCh || newGr || rmCh || rmGr ? 
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
};
