const db = require('../config/db');
const { hash } = require('bcryptjs');
const { sign } = require('jsonwebtoken');
const config = require('../config/bucket');

// exports.getUsers = async (req, res) => {
//     try {
//         const { rows } = await db.query('SELECT username, email FROM USERS');
        
//         return res.status(200).json({
//             success: true,
//             users: rows,
//         });

//     } catch (err) {
//         console.log(err.message);
//     }
// }

exports.register = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const hashedPassword = await hash(password, 10);

        await db.query('INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3)', [
            email.toLowerCase(),
            username.toLowerCase(),
            hashedPassword
        ])

        return res.status(201).json({
            success: true,
            message: 'User account created',
        });

    } catch (err) {
        console.log(err.message);
        return res.status(500).json({
                error: err.message,
        });
    }
}

exports.login = async (req, res) => {
    let user = req.user;
    payload = {
        username: user.username,
        email: user.email
    };
    try {
        const token = await sign(payload, config.SECRET)

        return res.status(200).cookie('token', token, { httpOnly: true, sameSite: 'strict', secure: config.NODE_ENV !== 'development' }).json({
            success: true,
            message: 'Logged in succefully',
            userInfo: { username: user.username },
        });
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({
                error: err.message,
        });
    }
}

exports.logout = async (req, res) => {
    try {
        return res.status(200).clearCookie('token', { httpOnly: true, sameSite: config.NODE_ENV === 'development' ? 'strict' : 'none', secure: config.NODE_ENV !== 'development'}).json({
            success: true,
            message: 'Logged out succefully',
        });
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({
                error: err.message,
        });
    }
}

// for testing only
exports.protected = async (req, res) => {
    try {    
        return res.status(200).json({
            info: 'protected info',
        });

    } catch (err) {
        console.log(err.message);
    }
}