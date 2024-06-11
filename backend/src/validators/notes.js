const { check } = require('express-validator');
const db = require('../config/db');

const noteTitle = check('noteTitle').isLength({ min: 1, max: 255 }).withMessage("Note's title must be between 1 and 255 characters.");

const titleExists = check('noteTitle').custom(async (value, { req }) => {
    let response = await db.query(`SELECT user_id FROM users WHERE username = $1`, [req.user.username]);
    const userID = response.rows[0].user_id;
    const { rows } = await db.query('SELECT * from notes WHERE title = $1 AND user_id = $2', [
        value,
        userID,
    ]);

    if (rows.length) {
        throw new Error('Note already exists');
    }
})

// VALIDATION FOR FETCHING NOTE

const fetchNoteCheck = check('noteID') // check for: valid note id, user that request has permission
    .isInt().withMessage("Note not found.").bail()
    .custom(async (value, { req }) => {

        const { rows } = await db.query(
            `SELECT notes.note_id, users.username
            FROM notes
            INNER JOIN users
            ON users.user_id = notes.user_id
            WHERE notes.note_id = $1`, [
                value
        ]);

        if (!rows.length) {
            throw new Error('Note not found.');
        }

        if (rows[0].username !== req.user.username) {
            throw new Error('Access Denied.');
        }
    })

const targetUserCheck = check('usernameToShare').custom(async (value, { req }) => {
    if (value === req.user.username) {
        throw new Error('Owner already has view and edit access.');
    }

    const { rows } = await db.query(`SELECT user_id FROM users WHERE username = $1`, [
        value
    ]);

    if (!rows.length) {
        throw new Error('User does not exists.');
    }
})
const viewPermissionCheck = check('can_view').isBoolean().withMessage('Invalid permission parameter.');
const editPermissionCheck = check('can_edit').isBoolean().withMessage('Invalid permission parameter.');
const permissionConflictCheck = check('can_view').custom(async (value, { req }) => {
    if (!value && req.body.can_edit) { // cannot view but can edit
        throw new Error('User must be able to view note to edit note.');
    }
})

module.exports = {
    createNoteValidation: [noteTitle, titleExists],
    fetchNoteValidation: [fetchNoteCheck],
    saveNoteValidation: [fetchNoteCheck],
    fetchNotePermValidation: [fetchNoteCheck],
    updateNotePermValidation: [fetchNoteCheck, targetUserCheck, viewPermissionCheck, editPermissionCheck, permissionConflictCheck],
}