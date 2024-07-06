const { createNoteValidation, deleteNoteValidation, fetchNoteContentValidation, saveNoteContentValidation, fetchNotePermValidation, updateNotePermValidation, publishNoteValidation } = require('../../validators/notes');
const { check, validationResult } = require('express-validator');
const db = require('../../config/db');
const { compare } = require('bcryptjs');

jest.mock('../../config/db');
jest.mock('bcryptjs');

describe('notes validators', () => {
    describe('createNoteValidation', () => {
        it('should pass for valid create note data', async () => {
            const req = {
                body: {
                    noteTitle: "valid title"
                }
            };

            await Promise.all(createNoteValidation.map(validation => validation.run(req)));
            const errors = validationResult(req);
            expect(errors.isEmpty()).toBe(true);
        });

        it('should fail for empty note title', async () => {
            const req = {
                body: {
                    noteTitle: ""
                }
            };

            await Promise.all(createNoteValidation.map(validation => validation.run(req)));
            const errors = validationResult(req);
            expect(errors.isEmpty()).toBe(false);
            expect(errors.array()[0].msg).toBe("Note's title must be between 1 and 255 characters.");
        });
    });
    
    describe('deleteNoteValidation', () => {
        it('should pass for valid note permission and not public note', async () => {
            const req = {
                body: {
                    noteID: 1,

                },
                user: {
                    username: "user_1",
                }
            };
            db.query
                .mockResolvedValueOnce({ rows: [{ published: false }] })
                .mockResolvedValueOnce({ rows: [{ note_id: 1, username: "user_1" }] });

            await Promise.all(deleteNoteValidation.map(validation => validation.run(req)));
            const errors = validationResult(req);
            expect(errors.isEmpty()).toBe(true);
        });

        it('should fail for non-owner access', async () => {
            const req = {
                body: {
                    noteID: 1,

                },
                user: {
                    username: "user_1",
                }
            };
            db.query
                .mockResolvedValueOnce({ rows: [{ published: false }] })
                .mockResolvedValueOnce({ rows: [{ note_id: 1, username: "user_100" }] });

            await Promise.all(deleteNoteValidation.map(validation => validation.run(req)));
            const errors = validationResult(req);
            expect(errors.isEmpty()).toBe(false);
            expect(errors.array()[0].msg).toBe('Access Denied.');
        });

        it('should fail for published note', async () => {
            const req = {
                body: {
                    noteID: 1,

                },
                user: {
                    username: "user_1",
                }
            };
            db.query
                .mockResolvedValueOnce({ rows: [{ published: true }] })
                .mockResolvedValueOnce({ rows: [{ note_id: 1, username: "user_1" }] });

            await Promise.all(deleteNoteValidation.map(validation => validation.run(req)));
            const errors = validationResult(req);
            expect(errors.isEmpty()).toBe(false);
            expect(errors.array()[0].msg).toBe('Cannot delete a publised note.');
        });

        it('should fail for non-existent note', async () => {
            const req = {
                body: {
                    noteID: "test",

                },
                user: {
                    username: "user_1",
                }
            };
            db.query.mockResolvedValueOnce({ rows: [{ published: false }] });

            await Promise.all(deleteNoteValidation.map(validation => validation.run(req)));
            const errors = validationResult(req);
            expect(errors.isEmpty()).toBe(false);
            expect(errors.array()[0].msg).toBe('Note not found.');
        });
    });
    
    describe('fetchNoteContentValidation', () => {
        // check for: valid note id, is owner or can_view or can_edit
        it('should pass for valid note id and owner', async () => {
            const req = {
                body: {
                    noteID: 1,
                },
                user: {
                    username: "user_1",
                },
            };
            db.query
                .mockResolvedValueOnce({ rows: [{ note_id: 1, username: 'user_1', user_id: 1 }] });
            
            await Promise.all(fetchNoteContentValidation.map(validation => validation.run(req)));
            const errors = validationResult(req);
            expect(errors.isEmpty()).toBe(true);
        });

        it('should pass for valid note id and can_view', async () => {
            const req = {
                body: {
                    noteID: 1,
                },
                user: {
                    username: "user_20",
                },
            };
            db.query
                .mockResolvedValueOnce({ rows: [{ note_id: 1, username: 'user_1', user_id: 1 }] })
                .mockResolvedValueOnce({ rows: [{ username: "user_20", perm_id: 1, owner_id: 1, note_id: 1, user_id: 20, can_view: true, can_edit: false }] });
            
            await Promise.all(fetchNoteContentValidation.map(validation => validation.run(req)));
            const errors = validationResult(req);
            expect(errors.isEmpty()).toBe(true);
        });

        it('should pass for valid note id and can_edit', async () => {
            const req = {
                body: {
                    noteID: 1,
                },
                user: {
                    username: "user_20",
                },
            };
            db.query
                .mockResolvedValueOnce({ rows: [{ note_id: 1, username: 'user_1', user_id: 1 }] })
                .mockResolvedValueOnce({ rows: [{ username: "user_20", perm_id: 1, owner_id: 1, note_id: 1, user_id: 20, can_view: true, can_edit: true }] });
            
            await Promise.all(fetchNoteContentValidation.map(validation => validation.run(req)));
            const errors = validationResult(req);
            expect(errors.isEmpty()).toBe(true);
        });

        it('should fail for invalid note permission', async () => {
            const req = {
                body: {
                    noteID: 1,
                },
                user: {
                    username: "user_20",
                },
            };
            db.query
                .mockResolvedValueOnce({ rows: [{ note_id: 1, username: 'user_1', user_id: 1 }] })
                .mockResolvedValueOnce({ rows: [] });
            
            await Promise.all(fetchNoteContentValidation.map(validation => validation.run(req)));
            const errors = validationResult(req);
            expect(errors.isEmpty()).toBe(false);
            expect(errors.array()[0].msg).toBe('Access Denied.');
        });

        it('should fail for invalid note id', async () => {
            const req = {
                body: {
                    noteID: "ppp",
                },
                user: {
                    username: "user_20",
                },
            };
            
            await Promise.all(fetchNoteContentValidation.map(validation => validation.run(req)));
            const errors = validationResult(req);
            expect(errors.isEmpty()).toBe(false);
            expect(errors.array()[0].msg).toBe('Note not found.');
        });
    });
    
    describe('saveNoteContentValidation', () => {
        // check for: valid note id, is owner or can_edit
        it('should pass for valid save note data and owner', async () => {
            const req = {
                body: { noteID: 1, updatedContent: "yolo" },
                user: { username: "user_1" }
            };
            db.query.mockResolvedValueOnce({ rows: [{ note_id: 1, username: "user_1", user_id: 1 }] });

            await Promise.all(saveNoteContentValidation.map(validation => validation.run(req)));
            const errors = validationResult(req);
            expect(errors.isEmpty()).toBe(true);
        });

        it('should pass for valid save note data and can_edit', async () => {
            const req = {
                body: { noteID: 1, updatedContent: "yolo" },
                user: { username: "user_100" }
            };
            db.query
                .mockResolvedValueOnce({ rows: [{ note_id: 1, username: "user_1", user_id: 1 }] })
                .mockResolvedValueOnce({ rows: [{ username: "user_100", perm_id: 1, owner_id: 1, note_id: 1, user_id: 100, can_view: true, can_edit: true }] });

            await Promise.all(saveNoteContentValidation.map(validation => validation.run(req)));
            const errors = validationResult(req);
            expect(errors.isEmpty()).toBe(true);
        });

        it('should fail for can_view note permission', async () => {
            const req = {
                body: { noteID: 1, updatedContent: "yolo" },
                user: { username: "user_100" }
            };
            db.query
                .mockResolvedValueOnce({ rows: [{ note_id: 1, username: "user_1", user_id: 1 }] })
                .mockResolvedValueOnce({ rows: [{ username: "user_100", perm_id: 1, owner_id: 1, note_id: 1, user_id: 100, can_view: true, can_edit: false }] });

            await Promise.all(saveNoteContentValidation.map(validation => validation.run(req)));
            const errors = validationResult(req);
            expect(errors.isEmpty()).toBe(false);
            expect(errors.array()[0].msg).toBe('Access Denied. View only.');
        });

        it('should fail for invalid note permission', async () => {
            const req = {
                body: { noteID: 1, updatedContent: "yolo" },
                user: { username: "user_100" }
            };
            db.query
                .mockResolvedValueOnce({ rows: [{ note_id: 1, username: "user_1", user_id: 1 }] })
                .mockResolvedValueOnce({ rows: [] });

            await Promise.all(saveNoteContentValidation.map(validation => validation.run(req)));
            const errors = validationResult(req);
            expect(errors.isEmpty()).toBe(false);
            expect(errors.array()[0].msg).toBe('Access Denied.');
        });

        it('should fail for invalid note id', async () => {
            const req = {
                body: { noteID: "ppp", updatedContent: "yolo" },
                user: { username: "user_1" }
            };

            await Promise.all(saveNoteContentValidation.map(validation => validation.run(req)));
            const errors = validationResult(req);
            expect(errors.isEmpty()).toBe(false);
            expect(errors.array()[0].msg).toBe('Note not found.');
        });
    });
    
    describe('fetchNotePermValidation', () => {
        // check for valid noteID and owner only
        it('should pass for valid note id and owner', async () => {
            const req = {
                body: {
                    noteID: 1,
                },
                user: {
                    username: 'user_1',
                }
            };
            db.query.mockResolvedValueOnce({ rows: [{ note_id: 1, username: 'user_1' }] });

            await Promise.all(fetchNotePermValidation.map(validation => validation.run(req)));
            const errors = validationResult(req);
            expect(errors.isEmpty()).toBe(true);
        });

        it('should fail for valid note id and can_view', async () => {
            const req = {
                body: {
                    noteID: 1,
                },
                user: {
                    username: 'user_100',
                }
            };
            db.query.mockResolvedValueOnce({ rows: [{ note_id: 1, username: 'user_1' }] });

            await Promise.all(fetchNotePermValidation.map(validation => validation.run(req)));
            const errors = validationResult(req);
            expect(errors.isEmpty()).toBe(false);
            expect(errors.array()[0].msg).toBe('Access Denied.');
        });

        it('should fail for valid note id and can_edit', async () => {
            const req = {
                body: {
                    noteID: 1,
                },
                user: {
                    username: 'user_100',
                }
            };
            db.query.mockResolvedValueOnce({ rows: [{ note_id: 1, username: 'user_1' }] });

            await Promise.all(fetchNotePermValidation.map(validation => validation.run(req)));
            const errors = validationResult(req);
            expect(errors.isEmpty()).toBe(false);
            expect(errors.array()[0].msg).toBe('Access Denied.');
        });

        it('should fail for invalid note id', async () => {
            const req = {
                body: {
                    noteID: "ppp",
                },
                user: {
                    username: 'user_1',
                }
            };

            await Promise.all(fetchNotePermValidation.map(validation => validation.run(req)));
            const errors = validationResult(req);
            expect(errors.isEmpty()).toBe(false);
            expect(errors.array()[0].msg).toBe('Note not found.');
        });
    });
    
    // describe('updateNotePermValidation', () => {
    //     // check for valid noteID and owner only
    //     it('should pass for valid note id and owner', async () => {
    //         const req = {
    //             body: {
    //                 noteID: 1,
    //                 can_view: true,
    //                 can_edit: false,
    //                 usernameToShare: "target_user"
    //             },
    //             user: {
    //                 username: 'user_1',
    //             }
    //         };
    //         db.query
    //             .mockResolvedValueOnce({ rows: [{ note_id: 1, username: 'user_1' }] })
    //             .mockResolvedValueOnce({ rows: [{ user_id: 100, username: 'user_1' }] }); // for targetUserCheck

    //         await Promise.all(updateNotePermValidation.map(validation => validation.run(req)));
    //         const errors = validationResult(req);
    //         console.log(errors);
    //         expect(errors.isEmpty()).toBe(true);
    //     });

    //     it('should fail for valid note id and can_view', async () => {
    //         const req = {
    //             body: {
    //                 noteID: 1,
    //                 can_view: true,
    //                 can_edit: false,
    //                 usernameToShare: "target_user"
    //             },
    //             user: {
    //                 username: 'user_100',
    //             }
    //         };
    //         db.query
    //             .mockResolvedValueOnce({ rows: [{ note_id: 1, username: 'user_1' }] })
    //             .mockResolvedValueOnce({ rows: [{ user_id: 100 }] });

    //         await Promise.all(updateNotePermValidation.map(validation => validation.run(req)));
    //         const errors = validationResult(req);
    //         expect(errors.isEmpty()).toBe(false);
    //         expect(errors.array()[0].msg).toBe('Access Denied.');
    //     });

    //     it('should fail for valid note id and can_edit', async () => {
    //         const req = {
    //             body: {
    //                 noteID: 1,
    //                 can_view: true,
    //                 can_edit: false,
    //                 usernameToShare: "target_user"
    //             },
    //             user: {
    //                 username: 'user_100',
    //             }
    //         };
    //         db.query
    //         .mockResolvedValueOnce({ rows: [{ note_id: 1, username: 'user_1' }] })
    //         .mockResolvedValueOnce({ rows: [{ user_id: 100 }] });

    //         await Promise.all(updateNotePermValidation.map(validation => validation.run(req)));
    //         const errors = validationResult(req);
    //         expect(errors.isEmpty()).toBe(false);
    //         expect(errors.array()[0].msg).toBe('Access Denied.');
    //     });

    //     it('should fail for invalid note id', async () => {
    //         const req = {
    //             body: {
    //                 noteID: "ppp",
    //                 can_view: true,
    //                 can_edit: false,
    //                 usernameToShare: "target_user"
    //             },
    //             user: {
    //                 username: 'user_1',
    //             }
    //         };
    //         db.query
    //             .mockResolvedValueOnce({ rows: [{ user_id: 100 }] });

    //         await Promise.all(updateNotePermValidation.map(validation => validation.run(req)));
    //         const errors = validationResult(req);
    //         expect(errors.isEmpty()).toBe(false);
    //         expect(errors.array()[0].msg).toBe('Note not found.');
    //     });

    //     // check valid target user
    //     it('should fail invalid target user', async () => {
    //         const req = {
    //             body: {
    //                 noteID: 1,
    //                 can_view: true,
    //                 can_edit: false,
    //                 usernameToShare: "target_user"
    //             },
    //             user: {
    //                 username: 'user_1',
    //             }
    //         };
    //         db.query
    //             .mockResolvedValueOnce({ rows: [{ note_id: 1, username: 'user_1' }] })
    //             .mockResolvedValueOnce({ rows: [] }); // for targetUserCheck

    //         await Promise.all(updateNotePermValidation.map(validation => validation.run(req)));
    //         const errors = validationResult(req);
    //         expect(errors.isEmpty()).toBe(false);
    //         expect(errors.array()[0].msg).toBe('User does not exists.');
    //     });

    //     // check is boolean for both permission

    //     // check permission conflict
    // });
    
    describe('publishNoteValidation', () => {
        it('should pass for valid public note description and owner', async () => {
            const req = {
                body: {
                    noteID: 1,
                    public_note_description: "yolo"
                },
                user: {
                    username: 'user_1',
                }
            };
            db.query.mockResolvedValueOnce({ rows: [{ note_id: 1, username: 'user_1' }] });

            await Promise.all(publishNoteValidation.map(validation => validation.run(req)));
            const errors = validationResult(req);
            expect(errors.isEmpty()).toBe(true);
        });

        it('should fail for not owner', async () => {
            const req = {
                body: {
                    noteID: 1,
                    public_note_description: "yolo"
                },
                user: {
                    username: 'user_100',
                }
            };
            db.query.mockResolvedValueOnce({ rows: [{ note_id: 1, username: 'user_1' }] });

            await Promise.all(publishNoteValidation.map(validation => validation.run(req)));
            const errors = validationResult(req);
            expect(errors.isEmpty()).toBe(false);
            expect(errors.array()[0].msg).toBe('Access Denied.');
        });
        
        it('should fail for invalid note description', async () => {
            const req = {
                body: {
                    noteID: 1,
                    public_note_description: "testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttest"
                },
                user: {
                    username: 'user_1',
                }
            };
            db.query.mockResolvedValueOnce({ rows: [{ note_id: 1, username: 'user_1' }] });

            await Promise.all(publishNoteValidation.map(validation => validation.run(req)));
            const errors = validationResult(req);
            expect(errors.isEmpty()).toBe(false);
            expect(errors.array()[0].msg).toBe("Note's description cannot be more than 255 characters.");
        });
    });
});