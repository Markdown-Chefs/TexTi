const { check } = require('express-validator');
const db = require('../config/db');

const noteTitle = check('noteTitle').isLength({ min: 1, max: 255 }).withMessage("Note's title must be at least 1 characters.");

const titleExists = check('noteTitle').custom(async (value) => {
    const { rows } = await db.query('SELECT * from notes WHERE title = $1', [
        value,
    ]);
    if (rows.length) {
        throw new Error('Note already exists');
    }
})

module.exports = {
    createNoteValidation: [noteTitle, titleExists],
}