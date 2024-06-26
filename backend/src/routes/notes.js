const { Router } = require('express');
const { userAuth } = require('../middlewares/auth');
const { createNoteValidation, fetchNoteContentValidation,saveNoteContentValidation, updateNotePermValidation, fetchNotePermValidation, deleteNoteValidation } = require('../validators/notes');
const { validationMiddleware } = require('../middlewares/validation');
const { getUserNotes, createUserNote, deleteUserNote, fetchUserNoteContent, saveUserNoteContent, updateNotePermission, fetchNotePermission, pinUserNote, publishUserNote, unpublishUserNote, fetchAllPublicNotes } = require('../controllers/notes');
const router = Router();

router.get('/user-notes', userAuth, getUserNotes);
router.post('/create-notes', userAuth, createNoteValidation, validationMiddleware, createUserNote);
router.delete('/delete-notes', userAuth, deleteNoteValidation, validationMiddleware, deleteUserNote);
router.post('/pin-notes', userAuth, fetchNotePermValidation, validationMiddleware, pinUserNote);

router.get('/note/:noteID', userAuth, fetchNoteContentValidation, validationMiddleware, fetchUserNoteContent); // owner and can_view/can_edit
router.put('/note/:noteID', userAuth, saveNoteContentValidation, validationMiddleware, saveUserNoteContent); // owner and can_edit

router.get('/note-permission', userAuth, fetchNotePermValidation, validationMiddleware, fetchNotePermission); // owner see list of users with permission
router.post('/note-permission', userAuth, updateNotePermValidation, validationMiddleware, updateNotePermission); // owner

router.post('/publish-notes', userAuth, fetchNotePermValidation, validationMiddleware, publishUserNote);
router.post('/unpublish-notes', userAuth, fetchNotePermValidation, validationMiddleware, unpublishUserNote);

router.get('/fetch-public-notes', userAuth, fetchAllPublicNotes);

module.exports = router;