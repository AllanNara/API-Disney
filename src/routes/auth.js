const { Router } = require('express');
const { logOut, logIn, createUser } = require('../controllers/auth');
const { isLoggedIn } = require('../middleware/auth')

const router = Router();

router.post("/register", createUser);
router.post("/login", logIn);
router.post("/logout", isLoggedIn, logOut);


module.exports = router;
