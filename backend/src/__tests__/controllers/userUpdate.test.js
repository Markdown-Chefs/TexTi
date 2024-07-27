const db = require('../../config/db');
const { sign } = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../../config/bucket');
const { changeUserUsername, changeUserEmail, changeUserPassword } = require('../../controllers/userUpdate');

jest.mock('../../config/db');
jest.mock('jsonwebtoken');
jest.mock('bcryptjs');

describe('User Update Controllers', () => {
    let req, res;
    const newToken = 'new.jwt.token';
    const hashedPassword = 'hashedPassword123';

    beforeEach(() => {
        req = {
            user: {
                username: 'oldUsername',
                email: 'user@example.com'
            },
            body: {
                newUsername: 'newUsername',
                newEmail: 'newemail@example.com',
                newPassword: 'newPassword123'
            },
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn().mockReturnThis()
        };


        bcrypt.hash.mockResolvedValue(hashedPassword);
        sign.mockResolvedValue(newToken);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('changeUserUsername', () => {
        it('should change the username and return a new token', async () => {
            db.query.mockResolvedValue({});

            await changeUserUsername(req, res);

            expect(db.query).toHaveBeenCalledWith(
                'UPDATE users SET username = $1 WHERE username = $2 AND email = $3',
                ['newUsername', 'oldUsername', 'user@example.com']
            );
            expect(sign).toHaveBeenCalledWith(
                { username: 'newUsername', email: 'user@example.com' },
                config.SECRET
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.cookie).toHaveBeenCalledWith('token', newToken, {
                httpOnly: true,
                sameSite: 'strict',
                secure: config.NODE_ENV !== 'development'
            });
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Username updated successfully.',
                userInfo: { username: 'newUsername' }
            });
        });

        it('should handle database errors', async () => {
            const dbError = new Error('Database error');
            db.query.mockRejectedValue(dbError);

            await changeUserUsername(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Database error'
            });
        });
    });

    describe('changeUserEmail', () => {
        it('should change the email and return a new token', async () => {
            db.query.mockResolvedValue({});

            await changeUserEmail(req, res);

            expect(db.query).toHaveBeenCalledWith(
                'UPDATE users SET email = $1 WHERE email = $2 AND username = $3',
                ['newemail@example.com', 'user@example.com', 'oldUsername']
            );
            expect(sign).toHaveBeenCalledWith(
                { username: 'oldUsername', email: 'newemail@example.com' },
                config.SECRET
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.cookie).toHaveBeenCalledWith('token', expect.any(String), expect.any(Object));
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Email updated successfully.',
                userInfo: { username: 'oldUsername' }
            });
        });

        it('should handle database errors', async () => {
            const dbError = new Error('Database error');
            db.query.mockRejectedValue(dbError);

            await changeUserEmail(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Database error'
            });
        });
    });

    describe('changeUserPassword', () => {
        it('should change the password', async () => {
            db.query.mockResolvedValue({});

            await changeUserPassword(req, res);

            expect(db.query).toHaveBeenCalledWith(
                'UPDATE users SET password_hash = $1 WHERE username = $2 AND email = $3',
                [hashedPassword, 'oldUsername', 'user@example.com']
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Password successfully changed.'
            });
        });

        it('should handle database errors', async () => {
            const dbError = new Error('Database error');
            db.query.mockRejectedValue(dbError);

            await changeUserPassword(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Database error'
            });
        });
    });
});
