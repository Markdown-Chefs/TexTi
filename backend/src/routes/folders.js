const { Router } = require('express');
const { userAuth } = require('../middlewares/auth');
const { createFolderValidation, deleteFolderValidation } = require('../validators/folders');
const { validationMiddleware } = require('../middlewares/validation');
const { getUserFolders, createUserFolder, deleteUserFolder } = require('../controllers/folders');
const router = Router();

router.get('/user-folders', userAuth, getUserFolders);
router.post('/create-folder', userAuth, createFolderValidation, validationMiddleware, createUserFolder);
router.delete('/delete-folder', userAuth, deleteFolderValidation, validationMiddleware, deleteUserFolder);

module.exports = router;