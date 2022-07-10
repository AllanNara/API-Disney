const { Router } = require('express');
const { Character, MovieOrShow } = require('../db')

const router = Router();

// FALTANTES
// GET /characters?name=nombre
// GET /characters?age=edad
// GET /characters?movies=idMovie
router.get("/", async (req, res, next) => {
    try {
        const allCharacters = await Character.findAll({
            attributes: ['image', 'name']
        });
        res.json(allCharacters)
    } catch (error) {
        next(error)
    }
});

router.post("/", async (req, res, next) => {
    const { image, name, age, weight, history } = req.body;

    if (!image || !name || !age || !weight || !history) {
        return res.status(422).send("Missing parameters")
    } else if(
        typeof image !== 'string' ||
        typeof name !== 'string' ||
        typeof history !== 'string' ||
        typeof age !== 'number' ||
        typeof weight !== 'number'
    ) {
        return res.status(400).send("Invalid parameters")
    };

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
        const character = await Character.findByPk(idCharacter, { include: [MovieOrShow] });
        if(!character) return res.status(404).send('Character not found or ID invalid')
        res.json(character)
    } catch (error) {
        next(error)
    }
});

router.put("/:idCharacter", async(req, res, next) => {
    const { idCharacter } = req.params;
    const { image, name, age, weight, history } = req.body;
    if(
        (typeof image === 'string' ||
        typeof image === 'undefined') ||
        (typeof name === 'string' ||
        typeof name === 'undefined') ||
        (typeof history === 'string' ||
        typeof history === 'undefined') ||
        (typeof age === 'number' ||
        typeof age === 'undefined') ||
        (typeof weight === 'number' ||
        typeof weight === 'undefined')
    ) {
        return res.status(400).send("Invalid parameters")
    };
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