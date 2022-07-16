// const { Movie, Character, Genre, Op } = require('../db');

function assocciation(array, entity, model) {
    //IF NEW ASSOCIATIONS EXIST
    if(array.length) {
        //CATCH FUNCTION FOR ADD AN ENTITY INSIDE ANOTHER ENTITY (BELONGS TO MANY)
        let nameModel = model.options.name.singular;
        const addition = 'add' + nameModel[0].toUpperCase() + nameModel.slice(1);
        //MAP PROMISES OF ALL GENRES AND CHARACTERS IN REQ.BODY(RETURN PROMISES ARRAY)
        let arrayPromises = array.map(elem => model.findOne({
            where: { name: elem } 
        }));
        //ADD ALL GENRES AND CHARACTERS (BODY) IN THE NEW MOVIE
        const response = Promise.all(arrayPromises).then(e => {
            if(!e.includes(null)) {
                let data = e.map(dts => dts.toJSON());
                data.forEach(e => entity[addition](e.id));
                return "200"
            };
            return "404"
        }).catch(error => { return error });
        return response
    };
    return null
    }

module.exports = {
    assocciation
}