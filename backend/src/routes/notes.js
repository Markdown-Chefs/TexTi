const { Router } = require('express');
const { userAuth } = require('../middlewares/auth');
const { createNoteValidation, fetchNoteValidation,saveNoteValidation } = require('../validators/notes');
const { validationMiddleware } = require('../middlewares/validation');
const { getUserNotes, createUserNote, deleteUserNote, fetchUserNoteContent, saveUserNoteContent } = require('../controllers/notes');
const router = Router();

router.get('/user-notes', userAuth, getUserNotes);
router.post('/create-notes', userAuth, createNoteValidation, validationMiddleware, createUserNote);
router.delete('/delete-notes', userAuth, deleteUserNote);

router.get('/note/:noteID', userAuth, fetchNoteValidation, validationMiddleware, fetchUserNoteContent)
router.put('/note/:noteID', userAuth, saveNoteValidation, validationMiddleware, saveUserNoteContent);

module.exports = router;