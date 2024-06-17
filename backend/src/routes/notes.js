const { Router } = require('express');
const { userAuth } = require('../middlewares/auth');
const { createNoteValidation, fetchNoteContentValidation,saveNoteContentValidation, updateNotePermValidation, fetchNotePermValidation } = require('../validators/notes');
const { validationMiddleware } = require('../middlewares/validation');
const { getUserNotes, createUserNote, deleteUserNote, fetchUserNoteContent, saveUserNoteContent, updateNotePermission, fetchNotePermission } = require('../controllers/notes');
const router = Router();

router.get('/user-notes', userAuth, getUserNotes);
router.post('/create-notes', userAuth, createNoteValidation, validationMiddleware, createUserNote);
router.delete('/delete-notes', userAuth, deleteUserNote);

router.get('/note/:noteID', userAuth, fetchNoteContentValidation, validationMiddleware, fetchUserNoteContent); // owner and can_view/can_edit
router.put('/note/:noteID', userAuth, saveNoteContentValidation, validationMiddleware, saveUserNoteContent); // owner and can_edit

router.get('/note-permission', userAuth, fetchNotePermValidation, validationMiddleware, fetchNotePermission); // owner see list of users with permission
router.post('/note-permission', userAuth, updateNotePermValidation, validationMiddleware, updateNotePermission); // owner

module.exports = router;