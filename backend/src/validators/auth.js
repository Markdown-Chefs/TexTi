const { check } = require('express-validator');
const db = require('../config/db');
const { compare } = require('bcryptjs');

const password = check('password').isLength({ min: 6, max: 30 }).withMessage('Password must be between 6 and 30 characters.');
const email = check('email').isEmail().withMessage('Please provide valid email.');
const username = check('username')
    .isLength({ min: 4, max: 30 }).withMessage('Username must be between 4 and 30 characters.')
    .matches(/^[A-Za-z0-9]/).withMessage('Username must start with an alphanumeric character.')
    .matches(/^[A-Za-z0-9-_]*$/).withMessage('Username may only include alphanumeric characters, underscores, or dashes.');

// check if email exists
const emailExists = check('email').custom(async (value) => {
    const { rows } = await db.query('SELECT * from users WHERE email = $1', [
        value,
    ]);
    if (rows.length) {
        throw new Error('Email already exists');
    }
})

// check if username exists
const userNameExists = check('username').custom(async (value) => {
    const { rows } = await db.query('SELECT * from users WHERE username = $1', [
        value,
    ]);
    if (rows.length) {
        throw new Error('Username already exists');
    }
})

// login validation
const loginCheck = check('email').custom(async (value, { req }) => {
    const user = await db.query('SELECT * from users WHERE email = $1', [
        value // can also be req.body.email
    ]);
    
    if (!user.rows.length) {
        throw new Error('Email not found');
    }
    
    const isValidPassword = await compare(req.body.password, user.rows[0].password_hash);
    if (!isValidPassword) {
        throw new Error('Wrong password');
    }

    req.user = user.rows[0];
})

module.exports = {
    registerValidation: [username, email, password, emailExists, userNameExists],
    loginValidation: [loginCheck],
}