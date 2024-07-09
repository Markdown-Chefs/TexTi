const { check } = require('express-validator');
const db = require('../config/db');
const { compare } = require('bcryptjs');

const newPassword = check('newPassword').isLength({ min: 6, max: 30 }).withMessage('Password must be between 6 and 30 characters.');
const email = check('newEmail').isEmail().withMessage('Please provide a valid email.');
const username = check('newUsername')
    .isLength({ min: 4, max: 30 }).withMessage('Username must be between 4 and 30 characters.')
    .matches(/^[A-Za-z0-9]/).withMessage('Username must start with an alphanumeric character.')
    .matches(/^[A-Za-z0-9-_]*$/).withMessage('Username may only include alphanumeric characters, underscores, or dashes.');

// check if email exists
const emailExists = check('newEmail').custom(async (value) => {
    const { rows } = await db.query('SELECT * from users WHERE email = $1', [
        value.toLowerCase(),
    ]);
    if (rows.length) {
        throw new Error('Email already exists');
    }
})

// check if username exists
const userNameExists = check('newUsername').custom(async (value) => {
    const { rows } = await db.query('SELECT * from users WHERE username = $1', [
        value.toLowerCase(),
    ]);
    if (rows.length) {
        throw new Error('Username already exists');
    }
})

const changePasswordCheck = check('currentPassword').custom(async (value, { req }) => {
    
    if (req.body.newPassword !== req.body.confirmPassword) {
        throw new Error('New passwords do not match.');
    }

    const user = await db.query('SELECT * FROM users WHERE username = $1', [
        req.user.username,
    ]);
    if (!user.rows.length) { // this error shouldn't be triggered, but put here just in case
        throw new Error('User not found, please contact admin about this error.');
    }

    const currentPasswordMatch = await compare(value, user.rows[0].password_hash);
    if (!currentPasswordMatch) {
        throw new Error('Current password is incorrect.');
    }
})

module.exports = {
    changeUsernameValidation: [username, userNameExists],
    changeEmailValidation: [email, emailExists],
    changePasswordValidation: [newPassword, changePasswordCheck],
}