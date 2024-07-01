const { register, login, logout } = require('../../controllers/auth');
const db = require('../../config/db');
const { hash } = require('bcryptjs');
const { sign } = require('jsonwebtoken');
const config = require('../../config/bucket');

jest.mock('../../config/db');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

// register
describe('register controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {
                username: 'fake_username',
                email: "fake_email",
                password: "fake_password",
            },
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should register a new user successfully', async () => {
        hash.mockResolvedValue('hashedPassword');
        db.query.mockResolvedValue();

        await register(req, res);

        expect(hash).toHaveBeenCalledWith('fake_password', 10);
        expect(db.query).toHaveBeenCalledWith(
            `INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3)`,
            ['fake_email', 'fake_username', 'hashedPassword']
        );
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'User account created',
        });
    });

    it('should failed to register a new user with existing email', async () => {
        hash.mockResolvedValue('hashedPassword');
        const duplicateEmailError = new Error('duplicate key value violates unique constraint "users_email_key"');
        db.query.mockRejectedValue(duplicateEmailError);

        await register(req, res);

        expect(hash).toHaveBeenCalledWith('fake_password', 10);
        expect(db.query).toHaveBeenCalledWith(
            `INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3)`,
            ['fake_email', 'fake_username', 'hashedPassword']
        );
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'duplicate key value violates unique constraint "users_email_key"',
        });
    });

    it('should failed to register a new user with existing username', async () => {
        hash.mockResolvedValue('hashedPassword');
        const duplicateUsernameError = new Error('duplicate key value violates unique constraint "users_username_key"');
        db.query.mockRejectedValue(duplicateUsernameError);

        await register(req, res);

        expect(hash).toHaveBeenCalledWith('fake_password', 10);
        expect(db.query).toHaveBeenCalledWith(
            `INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3)`,
            ['fake_email', 'fake_username', 'hashedPassword']
        );
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'duplicate key value violates unique constraint "users_username_key"',
        });
    });

    it('should handle hash errors', async () => {
        const hashError = new Error('hash error');
        hash.mockRejectedValue(hashError);

        await register(req, res);

        expect(hash).toHaveBeenCalledWith('fake_password', 10);
        expect(db.query).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'hash error',
        });
    });

    it('should handle database errors', async () => {
        hash.mockResolvedValue('hashedPassword');
        const dbError = new Error('database error');
        db.query.mockRejectedValue(dbError);

        await register(req, res);

        expect(hash).toHaveBeenCalledWith('fake_password', 10);
        expect(db.query).toHaveBeenCalledWith(
            `INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3)`,
            ['fake_email', 'fake_username', 'hashedPassword']
        );
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'database error',
        });
    });
});

// login
// NOTE: login with incorrect details will be tested in another file
// it('Login with correct details');
describe('login controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            user: {
                username: 'fake_username',
                email: "fake_email",
            },
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn().mockReturnThis(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should login successfully and return a token', async () => {
        const mockToken = 'mockJWTToken';
        sign.mockResolvedValue(mockToken);

        await login(req, res);

        expect(sign).toHaveBeenCalledWith({
            username: 'fake_username',
            email: "fake_email",
        }, config.SECRET);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.cookie).toHaveBeenCalledWith('token', mockToken, { httpOnly: true, sameSite: config.NODE_ENV === 'development' ? 'strict' : 'none', secure: config.NODE_ENV !== 'development' });
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Logged in succefully',
            userInfo: { username: 'fake_username' },
        });
    });

    it('should handle errors during token signing', async () => {
        const mockError = new Error('Token signing failed');
        sign.mockRejectedValue(mockError);
    
        await login(req, res);
    
        expect(sign).toHaveBeenCalledWith({
            username: 'fake_username',
            email: "fake_email",
        }, config.SECRET);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Token signing failed',
        });
    });
});

// // logout
describe('logout controller and return a clearToken', () => {
    let req, res;

    beforeEach(() => {
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            clearCookie: jest.fn().mockReturnThis(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should logout successfully', async () => {
        await logout(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.clearCookie).toHaveBeenCalledWith('token', { httpOnly: true, sameSite: config.NODE_ENV === 'development' ? 'strict' : 'none', secure: config.NODE_ENV !== 'development'});
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Logged out succefully',
        });
    });
});