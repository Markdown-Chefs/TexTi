const { check } = require('express-validator');
const db = require('../config/db');

const noteTitle = check('noteTitle').isLength({ min: 1, max: 255 }).withMessage("Note's title must be between 1 and 255 characters.");
const content = check('updatedContent').isString().withMessage("Note's content must be strings.");

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

const canViewCheck = check('noteID') // check for: valid note id, is owner or can_view or can_edit
    .isInt().withMessage("Note not found.").bail()
    .custom(async (value, { req }) => {

        const { rows } = await db.query(
            `SELECT notes.note_id, users.username, users.user_id
            FROM notes
            INNER JOIN users
            ON users.user_id = notes.user_id
            WHERE notes.note_id = $1`, [
                value
        ]);

        if (!rows.length) {
            throw new Error('Note not found.');
        }

        const ownerID = rows[0].user_id;
        if (rows[0].username !== req.user.username) { // not owner
            const response = await db.query(
                `SELECT note_permission.*, users.username
                FROM note_permission
                INNER JOIN users
                ON note_permission.user_id = users.user_id
                WHERE note_permission.note_id = $1 AND note_permission.owner_id = $2 AND users.username = $3`, [
                    value,
                    ownerID,
                    req.user.username
                ]);
            if (!response.rows.length) { // no permission record
                throw new Error('Access Denied.');
            }
            if (!response.rows[0].can_view && !response.rows[0].can_edit) { // have permission record but not allowed
                throw new Error('Access Denied.');
            }
        }
    })

const canEditCheck = check('noteID') // check for: valid note id, is owner or can_edit
.isInt().withMessage("Note not found.").bail()
.custom(async (value, { req }) => {

    const { rows } = await db.query(
        `SELECT notes.note_id, users.username, users.user_id
        FROM notes
        INNER JOIN users
        ON users.user_id = notes.user_id
        WHERE notes.note_id = $1`, [
            value
    ]);

    if (!rows.length) {
        throw new Error('Note not found.');
    }

    const ownerID = rows[0].user_id;
    if (rows[0].username !== req.user.username) { // not owner
        const response = await db.query(
            `SELECT note_permission.*, users.username
            FROM note_permission
            INNER JOIN users
            ON note_permission.user_id = users.user_id
            WHERE note_permission.note_id = $1 AND note_permission.owner_id = $2 AND users.username = $3`, [
                value,
                ownerID,
                req.user.username
            ]);
        if (!response.rows.length) { // no permission record
            throw new Error('Access Denied.');
        }
        if (response.rows[0].can_view && !response.rows[0].can_edit) {
            throw new Error('Access Denied. View only.');
        }
        if (!response.rows[0].can_view && !response.rows[0].can_edit) {
            throw new Error('Access Denied. Permission revoked.');
        }
    }
})

const isPublishedNote = check('noteID').custom(async (value) => {
    const { rows } = await db.query(`SELECT published FROM notes WHERE note_id = $1`, [value]);

    if (rows[0].published) {
        throw new Error('Cannot delete a publised note.');
    }
})

const fetchNotePermCheck = check('noteID') // check for valid noteID and owner only
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

        if (rows[0].username !== req.user.username) { // not owner
            throw new Error('Access Denied.');
        }
    })

const targetUserCheck = check('usernameToShare').custom(async (value, { req }) => {
    if (value === req.user.username) {
        throw new Error('Cannot modify your own permission.');
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
    deleteNoteValidation: [fetchNotePermCheck, isPublishedNote],
    fetchNoteContentValidation: [canViewCheck],
    saveNoteContentValidation: [canEditCheck, content],
    fetchNotePermValidation: [fetchNotePermCheck],
    updateNotePermValidation: [fetchNotePermCheck, targetUserCheck, viewPermissionCheck, editPermissionCheck, permissionConflictCheck],
}