const { Router } = require('express');
const { registerValidation, loginValidation } = require('../validators/auth');
const { validationMiddleware } = require('../middlewares/validation');
const { userAuth } = require('../middlewares/auth');
const { register, login, protected, logout } = require('../controllers/auth');
const router = Router();

// router.get('/get-users', getUsers);
router.get('/protected', userAuth, protected);
router.post('/register', registerValidation, validationMiddleware, register);
router.post('/login', loginValidation, validationMiddleware, login);
router.get('/logout', logout);

module.exports = router;