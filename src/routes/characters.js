const { Router } = require('express');
const { 
    getAllCharacters, 
    postNewCharacter, 
    getCharacterById, 
    updateCharacter, 
    deleteCharacter 
} = require('../controllers/characters');

const router = Router();

router.get("/", getAllCharacters);
router.post("/", postNewCharacter);
router.get("/:idCharacter", getCharacterById);
router.put("/:idCharacter", updateCharacter);
router.delete("/:idCharacter", deleteCharacter);


module.exports = router;
