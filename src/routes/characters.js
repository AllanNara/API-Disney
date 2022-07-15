const { Router } = require('express');
const { Character, Movie, Op } = require('../db');

const router = Router();

router.get("/", async (req, res, next) => {
    const { name, age, weigth, movies } = req.query;
    if(age && isNaN(parseInt(age))) return res.status(400).send('Query "Age" not valid')
    if(weigth && isNaN(parseInt(weigth))) return res.status(400).send('Query "Weigth" not valid')

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
        if(!Object.keys(allCharacters).length) {
            return res.json({data: 'no data available'})
        };
        res.json(allCharacters)
    } catch (error) {
        next(error)
    }
});

router.post("/", async (req, res, next) => {
    const { image, name, age, weigth, history } = req.body;

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
        const newCharacter = await Character.create(req.body)
        res.json(newCharacter)
    } catch (error) {
        next(error)      
    }
});

router.get("/:idCharacter", async(req, res, next) => {
    const { idCharacter } = req.params;
    try {
        const character = await Character.findByPk(idCharacter, { include: [Movie] });
        if(!character) return res.status(404).send('Character not found or ID invalid')
        res.json(character)
    } catch (error) {
        next(error)
    }
});

router.put("/:idCharacter", async(req, res, next) => {
    const { idCharacter } = req.params;
    const { image, name, age, weigth, history } = req.body;
    if(
        (typeof image !== 'string' ||
        typeof image !== 'undefined') ||
        (typeof name !== 'string' ||
        typeof name !== 'undefined') ||
        (typeof history !== 'string' ||
        typeof history !== 'undefined') ||
        (typeof age !== 'number' ||
        typeof age !== 'undefined') ||
        (typeof weigth !== 'number' ||
        typeof weigth !== 'undefined')
    ) return res.status(400).send("Invalid parameters");

    try {
        const character = await Character.findByPk(idCharacter);
        if(!character) return res.status(404).send('Character not found or ID invalid')
        const response = await Character.update(req.body, { where: { id: idCharacter } });
        response[0] === 1 || response === 1
        ? res.send("Character successfully updated")
        : res.status(400).send("Could not update character")
        res.json(response)
    } catch (error) {
        next(error)
    }
});

router.delete("/:idCharacter", async(req, res, next) => {
    const { idCharacter } = req.params;
    try {
        const character = await Character.findByPk(idCharacter);
        if(!character) return res.status(404).send('Character not found or ID invalid');
        const response = await Character.destroy({ where: { id: idCharacter } });
        response[0] === 1 || response === 1
        ? res.send("Character successfully delete")
        : res.status(400).send("Could not delete character")
    } catch (error) {
        next(error)
    }
})


module.exports = router;