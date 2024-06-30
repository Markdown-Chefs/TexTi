const { registerValidation, loginValidation } = require('../../validators/auth');
const { check, validationResult } = require('express-validator');
const db = require('../../config/db');
const { compare } = require('bcryptjs');

jest.mock('../../config/db');
jest.mock('bcryptjs');

describe('auth validators', () => {
    describe('registerValidation', () => {
        it('should pass for valid registration data', async () => {
            const req = {
                body: {
                    username: 'valid_username',
                    email: 'valid@email.com',
                    password: 'ABCabc@123_#'
                }
            };

            db.query.mockResolvedValueOnce({ rows: [] }); // for emailExists
            db.query.mockResolvedValueOnce({ rows: [] }); // for usernameExists

            await Promise.all(registerValidation.map(validation => validation.run(req)));
            const errors = validationResult(req);
            expect(errors.isEmpty()).toBe(true);
        });

        it('should fail for invalid username 1', async () => {
            const req = {
                body: {
                    username: '_valid_username',
                    email: 'valid@email.com',
                    password: 'ABCabc@123_#'
                }
            };

            db.query.mockResolvedValueOnce({ rows: [] }); // for emailExists
            db.query.mockResolvedValueOnce({ rows: [] }); // for usernameExists

            await Promise.all(registerValidation.map(validation => validation.run(req)));
            const errors = validationResult(req);
            expect(errors.isEmpty()).toBe(false);
            expect(errors.array()[0].msg).toBe('Username must start with an alphanumeric character.');
        });

        it('should fail for invalid username 2', async () => {
            const req = {
                body: {
                    username: '',
                    email: 'valid@email.com',
                    password: 'ABCabc@123_#'
                }
            };

            db.query.mockResolvedValueOnce({ rows: [] }); // for emailExists
            db.query.mockResolvedValueOnce({ rows: [] }); // for usernameExists

            await Promise.all(registerValidation.map(validation => validation.run(req)));
            const errors = validationResult(req);
            expect(errors.isEmpty()).toBe(false);
            expect(errors.array()[0].msg).toBe('Username must be between 4 and 30 characters.');
        });

        it('should fail for invalid username 3', async () => {
            const req = {
                body: {
                    username: 'valid@username',
                    email: 'valid@email.com',
                    password: 'ABCabc@123_#'
                }
            };

            db.query.mockResolvedValueOnce({ rows: [] }); // for emailExists
            db.query.mockResolvedValueOnce({ rows: [] }); // for usernameExists

            await Promise.all(registerValidation.map(validation => validation.run(req)));
            const errors = validationResult(req);
            expect(errors.isEmpty()).toBe(false);
            expect(errors.array()[0].msg).toBe('Username may only include alphanumeric characters, underscores, or dashes.');
        });

        it('should fail for invalid email', async () => {
            const req = {
                body: {
                    username: 'valid_username',
                    email: 'validemail.com',
                    password: 'ABCabc@123_#'
                }
            };

            db.query.mockResolvedValueOnce({ rows: [] }); // for emailExists
            db.query.mockResolvedValueOnce({ rows: [] }); // for usernameExists

            await Promise.all(registerValidation.map(validation => validation.run(req)));
            const errors = validationResult(req);
            expect(errors.isEmpty()).toBe(false);
            expect(errors.array()[0].msg).toBe('Please provide valid email.');
        });

        it('should fail for short password', async () => {
            const req = {
                body: {
                    username: 'valid_username',
                    email: 'valid@email.com',
                    password: Math.floor(Math.random() * 10000),
                }
            };

            db.query.mockResolvedValueOnce({ rows: [] }); // for emailExists
            db.query.mockResolvedValueOnce({ rows: [] }); // for usernameExists

            await Promise.all(registerValidation.map(validation => validation.run(req)));
            const errors = validationResult(req);
            expect(errors.isEmpty()).toBe(false);
            expect(errors.array()[0].msg).toBe('Password must be between 6 and 30 characters.');
        });

        it('should fail for long password', async () => {
            const req = {
                body: {
                    username: 'valid_username',
                    email: 'valid@email.com',
                    password: '0123456789012345678901234567890',
                }
            };

            db.query.mockResolvedValueOnce({ rows: [] }); // for emailExists
            db.query.mockResolvedValueOnce({ rows: [] }); // for usernameExists

            await Promise.all(registerValidation.map(validation => validation.run(req)));
            const errors = validationResult(req);
            expect(errors.isEmpty()).toBe(false);
            expect(errors.array()[0].msg).toBe('Password must be between 6 and 30 characters.');
        });

        it('should fail for exist username', async () => {
            const req = {
                body: {
                    username: 'valid_username',
                    email: 'valid@email.com',
                    password: 'ABCabc@123_#'
                }
            };

            db.query.mockResolvedValueOnce({ rows: [] }); // for emailExists
            db.query.mockResolvedValueOnce({ rows: [{ user_id: 1 }] }); // for usernameExists

            await Promise.all(registerValidation.map(validation => validation.run(req)));
            const errors = validationResult(req);
            expect(errors.isEmpty()).toBe(false);
            expect(errors.array()[0].msg).toBe('Username already exists');
        });

        it('should fail for exist email', async () => {
            const req = {
                body: {
                    username: 'valid_username',
                    email: 'valid@email.com',
                    password: 'ABCabc@123_#'
                }
            };

            db.query.mockResolvedValueOnce({ rows: [{ user_id: 1 }] }); // for emailExists
            db.query.mockResolvedValueOnce({ rows: [] }); // for usernameExists

            await Promise.all(registerValidation.map(validation => validation.run(req)));
            const errors = validationResult(req);
            expect(errors.isEmpty()).toBe(false);
            expect(errors.array()[0].msg).toBe('Email already exists');
        });
    });

    describe('loginValidation', () => {
        let req;

        beforeEach(() => {
            req = {
                body: {
                    email: 'valid@email.com',
                    password: 'ABCabc@123_#',
                },
            };
        });

        afterEach(() => {
            jest.clearAllMocks();
        });    

        it('should pass for valid login data', async () => {
            const db_password_hash = 'hashedPassword';
            
            db.query.mockResolvedValue({ rows: [{ user_id: 1, password_hash: db_password_hash }] });
            compare.mockResolvedValue(true);

            await Promise.all(loginValidation.map(validation => validation.run(req)));
            expect(compare).toHaveBeenCalledWith('ABCabc@123_#', db_password_hash);
            const errors = validationResult(req);
            expect(errors.isEmpty()).toBe(true);
            expect(req.user).toEqual({ user_id: 1, password_hash: db_password_hash });
        });

        it('should throw an error for non-existent email', async () => {
            db.query.mockResolvedValue({ rows: [] });

            await Promise.all(loginValidation.map(validation => validation.run(req)));
            expect(compare).not.toHaveBeenCalled();
            const errors = validationResult(req);
            expect(errors.isEmpty()).toBe(false);
            expect(errors.array()[0].msg).toBe('Email not found');
        });

        it('should throw an arror for wrong password', async () => {
            const db_password_hash = 'hashedPassword';
            db.query.mockResolvedValue({ rows: [{ user_id: 1, password_hash: db_password_hash }] });
            compare.mockResolvedValue(false);

            await Promise.all(loginValidation.map(validation => validation.run(req)));
            expect(compare).toHaveBeenCalledWith(req.body.password, db_password_hash);
            const errors = validationResult(req);
            expect(errors.isEmpty()).toBe(false);
            expect(errors.array()[0].msg).toBe('Wrong password');
        });
    });
});