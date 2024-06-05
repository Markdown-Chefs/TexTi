const { Router } = require('express');
const { changeUsernameValidation, changeEmailValidation, changePasswordValidation } = require('../validators/userUpdate');
const { validationMiddleware } = require('../middlewares/validation');
const { userAuth } = require('../middlewares/auth');
const { changeUserUsername, changeUserEmail, changeUserPassword } = require('../controllers/userUpdate');
const router = Router();

router.post('/change-username', userAuth, changeUsernameValidation, validationMiddleware, changeUserUsername);
router.post('/change-email', userAuth, changeEmailValidation, validationMiddleware, changeUserEmail);
router.post('/change-password', userAuth, changePasswordValidation, validationMiddleware, changeUserPassword);

module.exports = router;