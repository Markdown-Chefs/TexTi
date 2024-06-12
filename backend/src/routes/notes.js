const { Router } = require('express');
const { userAuth } = require('../middlewares/auth');
const { createNoteValidation } = require('../validators/notes');
const { validationMiddleware } = require('../middlewares/validation');
const { getUserNotes, createUserNote, deleteUserNote } = require('../controllers/notes');
const router = Router();

router.get('/user-notes', userAuth, getUserNotes);
router.post('/create-notes', userAuth, createNoteValidation, validationMiddleware, createUserNote);
router.delete('/delete-notes', userAuth, deleteUserNote);

module.exports = router;