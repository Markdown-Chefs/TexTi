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
// const noteID = check('noteID').isInt().withMessage("Note not found.");

const fetchNote = check('noteID')
    .isInt().withMessage("Note not found.").bail()
    .custom(async (value, { req }) => {
        const { rows } = await db.query('SELECT note_id FROM notes WHERE note_id = $1', [
            value
        ]);

        if (!rows.length) {
            throw new Error('Note not found.');
        }
    }).bail()
    .custom(async (value, { req }) => {
        let response = await db.query(`SELECT user_id FROM users WHERE username = $1`, [req.user.username]);
        const userID = response.rows[0].user_id;
        const { rows } = await db.query('SELECT note_id FROM notes WHERE note_id = $1 AND user_id = $2', [
            value,
            userID
        ]);

        if (!rows.length) {
            throw new Error('Access Denied.');
        }
    }).bail()

module.exports = {
    createNoteValidation: [noteTitle, titleExists],
    fetchNoteValidation: [fetchNote],
}