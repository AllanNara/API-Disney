const { User } = require('../db');

const isLoggedIn = async (req, res, next) => {
    try {
        const { userId } = req.session;
        let msgError = "Client provides no credentials or invalid credentials"
        if(!userId) return res.status(401).send(msgError);
        const user = await User.findOne({where: {id: userId}});
        if(!user) return res.status(401).send(msgError)
        next()
    } catch (error  ) {
        next(error)
    }
};

const isGuest = 

module.exports = {
    isLoggedIn
}