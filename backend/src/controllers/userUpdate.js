const db = require('../config/db');
const { hash } = require('bcryptjs');
const { sign } = require('jsonwebtoken');
const config = require('../config/bucket');

exports.changeUserUsername = async (req, res) => {
    // oldUsername = req.user.username
    // newUsername = req.body.newUsername
    // email = req.user.email
    try {
        await db.query('UPDATE users SET username = $1 WHERE username = $2 AND email = $3', [
            req.body.newUsername,
            req.user.username,
            req.user.email
        ]);

        // update user details in the session or context
        req.user.username = req.body.newUsername;
        const payload = {
            username: req.user.username,
            email: req.user.email
        };

        // sign new token
        const newToken = await sign(payload, config.SECRET);

        // send the new token back to the user
        return res.status(200).cookie('token', newToken, {
            httpOnly: true,
            sameSite: 'strict',
            secure: config.NODE_ENV !== 'development'
        }).json({
            success: true,
            message: 'Username updated successfully.',
            userInfo: { username: req.user.username }
        });
        
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({
                error: err.message,
        });
    }
}

exports.changeUserEmail = async (req, res) => {
    // oldEmail = req.user.email
    // newEmail = req.body.newEmail
    // username = req.user.username
    try {
        await db.query('UPDATE users SET email = $1 WHERE email = $2 AND username = $3', [
            req.body.newEmail,
            req.user.email,
            req.user.username
        ]);

        // update user details in the session or context
        req.user.email = req.body.newEmail;
        const payload = {
            username: req.user.username,
            email: req.user.email
        };

        // sign new token
        const newToken = await sign(payload, config.SECRET);

        // send the new token back to the user
        return res.status(200).cookie('token', newToken, {
            httpOnly: true,
            sameSite: 'strict',
            secure: config.NODE_ENV !== 'development'
        }).json({
            success: true,
            message: 'Email updated successfully.',
            userInfo: { username: req.user.username }
        });
        
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({
                error: err.message,
        });
    }
}

exports.changeUserPassword = async (req, res) => {
    try {
        const hashedPassword = await hash(req.body.newPassword, 10);

        await db.query('UPDATE users SET password_hash = $1 WHERE username = $2 AND email = $3', [
            hashedPassword,
            req.user.username,
            req.user.email
        ]);

        return res.status(200).json({
            success: true,
            message: 'Password successfully changed.',
        });

    } catch (err) {
        console.log(err.message);
        return res.status(500).json({
                error: err.message,
        });
    }
}
