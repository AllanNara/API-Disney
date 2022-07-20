const { Genre } = require('../db')

function association(array, entity, model) {

        //CATCH FUNCTION FOR ADD AN ENTITY INSIDE ANOTHER ENTITY (BELONGS TO MANY)
        let nameModel = model.options.name.singular;
        const addition = 'add' + nameModel[0].toUpperCase() + nameModel.slice(1);
        //MAP PROMISES OF ALL GENRES AND CHARACTERS IN REQ.BODY(RETURN PROMISES ARRAY)
        let arrayPromises = array.map(elem => {
            const attribute = nameModel === "movie" ? "title" : "name"
            return model.findOne({
                where: { [attribute]: elem } 
            });
        });
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

async function addGenres() {
    try {
        const allGenres = ['Fantasy',  'Adventure', 'Musical', 'Romance', 'Comedy', 'Animation', 'Action', 'Drama']
        const promiseGenres = allGenres.map(elem => Genre.create({ name: elem }));
        await Promise.all(promiseGenres);
        console.log('Base de datos cargada')
    } catch (error) {
        console.log('La base de datos ya esta cargada!!');
    }
};

function alredyExist(origin, newOptions) {
    for (let i = 0; i < newOptions.length; i++) {
        if(!origin.includes(newOptions[i])) return false     
    }
    return true
};

module.exports = {
    association,
    addGenres,
    alredyExist
}