require('dotenv').config()
const { Router } = require('express');
const { logOut, logIn, createUser } = require('../controllers/auth');
const bcrypt = require('bcrypt')
const { User } = require('../db');
const { isLoggedIn } = require('../middleware/auth')

const router = Router()
const regexEmail = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
const saltRounds = parseInt(process.env.SALT)

router.post("/register", async (req, res, next) => {
    if(req.session.userId) return res.status(423).send("A session is in progress, please log out.")
    const { first_name, last_name, email } = req.body;
    let password = req.body.password;
    if(!first_name || !last_name || !email || !password) return res.status(422).send("Missing parameters");
    try {
        //VALIDATIONS
        if(!regexEmail.test(email)) return res.status(400).send("Invalid email");
        if(!regexPassword.test(password)) return res.status(400).send("Invalid password");
        const emailExist = await User.findOne({ where: { email } });
        if(emailExist) return res.status(400).send("Email alredy exists");

        password = await bcrypt.hash(password, saltRounds);
        await User.create({
            first_name,
            last_name,
            email,
            password
        });

        res.send("User successfully created")
    } catch (error) {
        next(error)
    }
});

router.post("/login", async (req, res, next) => {
    if(req.session.userId) return res.status(423).send("A session is in progress, please log out.")
    const { email, password } = req.body;
    if(!email || !password) return res.status(422).send("Missing parameters");
    try {
        let msgError = 'Email or password wrong';
        
        const user = await User.findOne({where: { email }});
        if(!user) return res.status(400).send(msgError);

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) return res.status(400).send(msgError);
    
        req.session.userId = user.id;
        res.send('User has successfully logged in');

    } catch (error) {
        next(error)
    }
});

router.post("/logout", isLoggedIn, (req, res, next) => {
    req.session.destroy(err => {
        if(err) return next(err);
        res.clearCookie('sid');
        return res.send('User has successfully logged out')
    });
});


module.exports = router;
