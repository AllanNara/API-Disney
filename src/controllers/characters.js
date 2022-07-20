const { Movie, Character, Op } = require('../db');
const { association, alredyExist } = require('./index');

const getAllCharacters = async (req, res, next) => {
    const { name, age, weigth, movies } = req.query;
    if(age && isNaN(parseInt(age))) return res.status(400).send('Query "Age" not valid');
    if(weigth && isNaN(parseInt(weigth))) return res.status(400).send('Query "Weigth" not valid');
    try {
        const options =
        {
            attributes: ['image', 'name'],
            where: {}   
        }
        //QUERY PARAMETERS
        if(name) {
            Object.assign(options.where, {name: {[Op.iLike]: name }})
        };
        if(age) {
            Object.assign(options.where, {age: age})
        };
        if(weigth) {
            Object.assign(options.where, {weigth: weigth})
        };
        if(movies) {
            Object.assign(options, {include: [
                {
                    model: Movie,
                    where: { id: movies }
                }   
            ]})
        };
        //IF NOT EXIST QUERY PARAMS
        if(!Object.keys(options.where).length) delete options.where;
        
        const allCharacters = await Character.findAll(options);
        //VERIFY IF DATABASE IS EMPTY
        if(!Object.keys(allCharacters).length) return res.json({data: 'no data available'});
        res.json(allCharacters)
    } catch (error) {
        next(error)
    }
};

const postNewCharacter = async (req, res, next) => {
    const { image, name, age, weigth, history, movies } = req.body;

    if (!image || !name || !age || !weigth || !history) {
        return res.status(422).send("Missing parameters")
    } else if(
        typeof image !== 'string' ||
        typeof name !== 'string' ||
        typeof history !== 'string' ||
        typeof age !== 'number' ||
        typeof weigth !== 'number'
    ) return res.status(400).send("Invalid parameters");

    try {
        const newCharacter = await Character.create(req.body);

        const addMovie = movies?.length ? await association(movies, newCharacter, Movie) : false;
        if(addMovie !== false && addMovie === '404') return res.status(404).send('Movie not found');
        if(typeof addMovie === 'object') next(addMovie);

        res.json(newCharacter.toJSON())
    } catch (error) {
        next(error)      
    }
};

const getCharacterById = async(req, res, next) => {
    const { idCharacter } = req.params;
    try {
        const character = await Character.findByPk(idCharacter, { 
            include: [
                {
                    model: Movie,
                    through: {
                        attributes: [],
                      }
                }
            ] 
        });
        if(!character) return res.status(404).send('Character not found or ID invalid')
        res.json(character)
    } catch (error) {
        next(error)
    }
};

const updateCharacter = async(req, res, next) => {
    const { idCharacter } = req.params;
    const { image, name, age, weigth, history, movies, removeMv } = req.body;
    if(
        (typeof image !== 'string' &&
        typeof image !== 'undefined') ||
        (typeof name !== 'string' &&
        typeof name !== 'undefined') ||
        (typeof history !== 'string' &&
        typeof history !== 'undefined') ||
        (typeof age !== 'number' &&
        typeof age !== 'undefined') ||
        (typeof weigth !== 'number' &&
        typeof weigth !== 'undefined')
    ) return res.status(400).send("Invalid parameters");

    try {
        const character = await Character.findByPk(idCharacter, { include: [Movie] });
        if(!character) return res.status(404).send('Character not found or ID invalid');
        const relationMovies = [];
        character.toJSON().movies.forEach(e => relationMovies.push(e.title));
        // REMOVE RELATIONS IF EXIST
        let rmMv = false
        if(removeMv?.length) {
            if(!relationMovies.length) return res.status(400).send("Not exist items for remove");
            if(!alredyExist(relationMovies, removeMv)) return res.status(400).send("Error trying to remove: Selected movie not found with this character");
            const rm = await Movie.findAll({where: {title: removeMv}});
            const response = await character.removeMovies(rm);
            rmMv = Boolean(response)
        };
        //VERIFY IF EXIST NEW RELATIONS
        let newMv = false;
        if(movies?.length && relationMovies.length) newMv = !alredyExist(relationMovies, movies);

        //VERIFY IF THE DATA HASN'T BEEN CHANGED        
        const { image: imageCh, name: nameCh, age: ageCh, weigth: weigthCh, history: historyCh } = character;
        if(
            (image === imageCh || image === undefined) && 
            (name === nameCh || name === undefined) && 
            (age === ageCh || age === undefined) && 
            (weigth === weigthCh || weigth === undefined) && 
            (history === historyCh|| history === undefined) &&
            !rmMv && !newMv
        ) return res.send("No changes have been made");

        //NEW RELATIONS
        const addMovie = movies?.length ? await association(movies, character, Movie) : false;
        if(addMovie !== false && addMovie === '404') return res.status(404).send('Movie not found');
        if(typeof addMovie === 'object') next(addMovie);

        const response = await Character.update(req.body, { where: { id: idCharacter } });
        return response[0] !== 0 || rmMv || newMv? 
        res.send("Character successfully updated")
        : res.status(400).send("Could not update character")
    } catch (error) {
        next(error)
    }
};

const deleteCharacter = async(req, res, next) => {
    const { idCharacter } = req.params;
    try {
        const character = await Character.findByPk(idCharacter);
        if(!character) return res.status(404).send('Character not found or ID invalid');
        const response = await Character.destroy({ where: { id: idCharacter } });
        return response[0] !== 0 ? 
        res.send("Character successfully delete")
        : res.status(400).send("Could not delete character")
    } catch (error) {
        next(error)
    }
};

module.exports = {
    getAllCharacters,
    postNewCharacter,
    getCharacterById,
    updateCharacter,
    deleteCharacter
};
