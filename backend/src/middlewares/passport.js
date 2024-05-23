const passport = require('passport');
const { Strategy } = require('passport-jwt');
const config = require('../config/bucket');
const db = require('../config/db');

const extractCookie = function (req) {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies['token'];
    }
    return token;
}

const opts = {
    secretOrKey: config.SECRET,
    jwtFromRequest: extractCookie,
};

passport.use(
    new Strategy(opts, async ({ username }, done) => {
        try {
            const { rows } = await db.query('SELECT username, email FROM users WHERE username = $1', [username]);
            if (!rows.length) {
                throw new Error('401 not authorized');
            }
            let user = { username: rows[0].username, email: rows[0].email };
            return await done(null, user);
        } catch (err) {
            console.log(err.message);
            done(null, false);
        }
    })
);