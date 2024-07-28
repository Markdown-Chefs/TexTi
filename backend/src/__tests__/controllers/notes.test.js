const db = require('../../config/db');
const { getUserNotes, createUserNote, deleteUserNote, pinUserNote, fetchUserNoteContent, saveUserNoteContent, updateNotePermission, publishUserNote,unpublishUserNote, fetchAllPublicNotes,fetchSinglePublicNote, fetchNotePermission } = require('../../controllers/notes');

jest.mock('../../config/db');

describe('getUserNotes controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            user: {
                username: 'fake_username',
            },
            query: {
                folderID: 0,
            }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return user notes successfully', async () => {
        const mockNotes = [
            { note_id: 1, title: 'Note 1', last_modified: '2023-01-01', pin_by_owner: true, published: false },
            { note_id: 2, title: 'Note 2', last_modified: '2023-01-02', pin_by_owner: false, published: true }
        ];
        db.query.mockResolvedValue({ rows: mockNotes });

        await getUserNotes(req, res);

        expect(db.query).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            listOfNotes: mockNotes,
        });
    });

    it('should return empty array when user has no notes', async () => {
        const mockNotes = [];
        db.query.mockResolvedValue({ rows: mockNotes });

        await getUserNotes(req, res);

        expect(db.query).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            listOfNotes: mockNotes,
        });
    });

    it('should handle database errors', async () => {
        const dbError = new Error("Database error");
        db.query.mockRejectedValue(dbError);

        await getUserNotes(req, res);

        expect(db.query).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: "Database error"
        });
    });
});

describe('createUserNote controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {
                noteTitle: 'fake_title',
            },
            user: {
                user_id: 1,
                username: 'fake_username'
            },
            query: {
                folderID: 0,
            }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create note succesfully', async () => {
        const ret = [ {note_id: 1, title: req.body.noteTitle} ];
        db.query.mockResolvedValue({ rows: ret });

        await createUserNote(req, res);

        expect(db.query).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Note created',
            noteCreated: ret[0],
        });
    });

    it('should handle database errors', async () => {
        const dbError = new Error("Database error");
        db.query.mockRejectedValue(dbError);

        await createUserNote(req, res);

        expect(db.query).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: "Database error"
        });
    });
});

describe('deleteUserNote controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {
                noteID: 1,
            },
            user: {
                user_id: 1,
                username: 'fake_username'
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

    it('should delete note successfully', async () => {
        db.query.mockResolvedValue();

        await deleteUserNote(req, res);

        expect(db.query).toHaveBeenCalledTimes(3);
        expect(db.query).toHaveBeenNthCalledWith(1, `DELETE FROM public_note_template WHERE note_id = $1 AND user_id = $2`, [req.body.noteID, req.user.user_id]);
        expect(db.query).toHaveBeenNthCalledWith(2, `DELETE FROM note_permission WHERE note_id = $1`, [req.body.noteID]);
        expect(db.query).toHaveBeenNthCalledWith(3, `DELETE FROM notes WHERE note_id = $1 AND user_id = $2`, [req.body.noteID,req.user.user_id]);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Note deleted',
        });
    });

    it('should handle database errors', async () => {
        const dbError = new Error('Database error');
        db.query.mockRejectedValue(dbError);
    
        await deleteUserNote(req, res);
    
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Database error'
        });
    });

    it('should handle case when note does not exist', async () => {
        db.query.mockResolvedValue();
    
        await deleteUserNote(req, res);
    
        // The function should still return a success message even if no rows were affected
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Note deleted'
        });
    });
});

describe('pinUserNote controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {
                noteID: 1,
            },
            user: {
                user_id: 1,
                username: 'fake_username'
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

    it('should pin note successfully', async () => {
        req.body.pinNote = true;
        db.query.mockResolvedValue();;

        await pinUserNote(req, res);

        expect(db.query).toHaveBeenCalledWith(
            `UPDATE notes SET pin_by_owner = $1, last_modified = CURRENT_TIMESTAMP
            WHERE note_id = $2`, [
                req.body.pinNote,
                req.body.noteID,
        ]);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Note pinned',
        });
    });

    it('should unpin note successfully', async () => {
        req.body.pinNote = false;
        db.query.mockResolvedValue();;

        await pinUserNote(req, res);

        expect(db.query).toHaveBeenCalledWith(
            `UPDATE notes SET pin_by_owner = $1, last_modified = CURRENT_TIMESTAMP
            WHERE note_id = $2`, [
                req.body.pinNote,
                req.body.noteID,
        ]);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Note unpinned',
        });
    });

    it('should handle database error', async () => {
        const dbError = new Error('Database error');
        db.query.mockRejectedValue(dbError);
    
        await pinUserNote(req, res);
    
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Database error'
        });
    });
});

describe('fetchUserNoteContent controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            user: {
                user_id: 1,
                username: 'fake_username'
            },
            params: {
                noteID: 1
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

    it('should fetch note content for the owner', async () => {
        const isPublished = false;
        db.query
            .mockResolvedValueOnce({ rows: [{ title: 'fake_note', content: 'fake_content', user_id: 1, published: isPublished }] })
            .mockResolvedValueOnce({ rows: [{ username: 'fake_username', user_id: 1 }] });
    
        await fetchUserNoteContent(req, res);
    
        expect(db.query).toHaveBeenCalledTimes(2);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            title: 'fake_note',
            content: 'fake_content',
            permission: {
                isOwner: true,
                canView: true,
                canEdit: true,
                isPublished: isPublished,
            }
        });
    });

    it('should handle note with edit permission for non-owner', async () => {
        const isPublished = false;
        db.query
            .mockResolvedValueOnce({ rows: [{ title: 'fake_note', content: 'fake_content', user_id: 2, published: isPublished }] })
            .mockResolvedValueOnce({ rows: [{ username: 'fake_username', user_id: 1 }] })
            .mockResolvedValueOnce({ rows: [{ can_view: true, can_edit: true }] });
    
        await fetchUserNoteContent(req, res);
    
        expect(db.query).toHaveBeenCalledTimes(3);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            title: 'fake_note',
            content: 'fake_content',
            permission: {
                isOwner: false,
                canView: true,
                canEdit: true,
                isPublished: isPublished,
            }
        });
    });

    it('should handle note with view permission for non-owner', async () => {
        const isPublished = false;
        db.query
            .mockResolvedValueOnce({ rows: [{ title: 'fake_note', content: 'fake_content', user_id: 2, published: isPublished }] })
            .mockResolvedValueOnce({ rows: [{ username: 'fake_username', user_id: 1 }] })
            .mockResolvedValueOnce({ rows: [{ can_view: true, can_edit: false }] });
    
        await fetchUserNoteContent(req, res);
    
        expect(db.query).toHaveBeenCalledTimes(3);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            title: 'fake_note',
            content: 'fake_content',
            permission: {
                isOwner: false,
                canView: true,
                canEdit: false,
                isPublished: isPublished,
            }
        });
    });

    it('should handle fetch note for non-owner and no permission', async () => {
        const isPublished = false;
        db.query
            .mockResolvedValueOnce({ rows: [{ title: 'fake_note', content: 'fake_content', user_id: 1, published: isPublished }] })
            .mockResolvedValueOnce({ rows: [{ username: 'fake_username', user_id: 2 }] })
            .mockResolvedValueOnce({ rows: [] });
    
        await fetchUserNoteContent(req, res);
    
        expect(db.query).toHaveBeenCalledTimes(3);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            title: 'fake_note',
            content: 'fake_content',
            permission: {
                isOwner: false,
                canView: false,
                canEdit: false,
                isPublished: isPublished,
            }
        });
    });

    it('should handle database errors', async () => {
        const dbError = new Error('Database error');
        db.query.mockRejectedValue(dbError);
    
        await fetchUserNoteContent(req, res);
    
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          error: 'Database error'
        });
    });
});

describe('saveUserNoteContent controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {
                updatedContent: "hello another world",
            },
            params: {
                noteID: 1,
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

    it('should update note successfully', async () => {
        db.query.mockResolvedValue();;

        await saveUserNoteContent(req, res);

        expect(db.query).toHaveBeenCalledWith(
            `UPDATE notes SET content = $1, last_modified = CURRENT_TIMESTAMP
            WHERE note_id = $2`, [
                req.body.updatedContent,
                req.params.noteID
        ]);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Note content updated successfully.',
        });
    });

    it('should handle case when note does not exist', async () => {
        db.query.mockResolvedValue();;

        await saveUserNoteContent(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Note content updated successfully.',
        });
    });

    it('should handle database error', async () => {
        const dbError = new Error('Database error');
        db.query.mockRejectedValue(dbError);
    
        await saveUserNoteContent(req, res);
    
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Database error'
        });
    });
});

describe('updateNotePermission controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {
                noteID: 1,
                usernameToShare: "target_user",
                can_view: true,
                can_edit: false,
            },
            user: {
                username: "fake_username",
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

    it('should update note permission successfully', async () => {
        db.query
            .mockResolvedValueOnce({ rows: [ { user_id: 1, username: 'owner' }, { user_id: 2, username: 'fake_username' } ] })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce();

        await updateNotePermission(req, res);

        expect(db.query).toHaveBeenCalledTimes(3);
        expect(db.query).toHaveBeenNthCalledWith(1, 
            `SELECT user_id, username 
            FROM users 
            WHERE username = $1 OR username = $2
            ORDER BY CASE username
                        WHEN $1 THEN 1
                        WHEN $2 THEN 2
                        ELSE 3
                     END;`, [
            req.user.username,
            req.body.usernameToShare
        ]);
        expect(db.query).toHaveBeenNthCalledWith(2, 'SELECT owner_id FROM note_permission WHERE owner_id = $1 AND note_id = $2 AND user_id = $3', [
            1,
            req.body.noteID,
            2,
        ]);
        expect(db.query).toHaveBeenNthCalledWith(3, `INSERT INTO note_permission (owner_id, note_id, user_id, can_view, can_edit) VALUES ($1, $2, $3, $4, $5)`, [
                1,
                req.body.noteID,
                2,
                req.body.can_view,
                req.body.can_edit,
        ]);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Note permission updated successfully.',
        });
    });

    it('should not create new entry for existing user permission for the note', async () => {
        db.query
            .mockResolvedValueOnce({ rows: [ { user_id: 1, username: 'owner' }, { user_id: 2, username: 'fake_username' } ] })
            .mockResolvedValueOnce({ rows: [ { owner_id: 1 } ] })
            .mockResolvedValueOnce();

        await updateNotePermission(req, res);

        expect(db.query).toHaveBeenCalledTimes(3);
        expect(db.query).toHaveBeenNthCalledWith(1, 
            `SELECT user_id, username 
            FROM users 
            WHERE username = $1 OR username = $2
            ORDER BY CASE username
                        WHEN $1 THEN 1
                        WHEN $2 THEN 2
                        ELSE 3
                     END;`, [
            req.user.username,
            req.body.usernameToShare
        ]);
        expect(db.query).toHaveBeenNthCalledWith(2, 'SELECT owner_id FROM note_permission WHERE owner_id = $1 AND note_id = $2 AND user_id = $3', [
            1,
            req.body.noteID,
            2,
        ]);
        expect(db.query).toHaveBeenNthCalledWith(3, `UPDATE note_permission SET can_view = $1, can_edit = $2 WHERE owner_id = $3 AND note_id = $4 AND user_id = $5`, [
                req.body.can_view,
                req.body.can_edit,
                1,
                req.body.noteID,
                2,
        ]);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Note permission updated successfully.',
        });
    });

    // it('should handle target user does not exists', async () => {});

    it('should handle database error', async () => {
        const dbError = new Error('Database error');
        db.query.mockRejectedValue(dbError);
    
        await updateNotePermission(req, res);
    
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Database error'
        });
    });
});

describe('fetchNotePermission controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {
                noteID: 1,
            },
            user: {
                username: "fake_username",
                user_id: 1,
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

    it('should fetch note permissions successfully', async () => {
        const mockRows = [
            { username: 'user1', user_id: 10, can_view: true, can_edit: false }, 
            { username: 'user2', user_id: 20, can_view: true, can_edit: true }, 
            { username: 'user3', user_id: 30, can_view: true, can_edit: false }
        ];
        db.query.mockResolvedValue({ rows: mockRows });

        await fetchNotePermission(req, res);

        expect(db.query).toHaveBeenCalledWith(
            expect.any(String),
            [req.user.user_id, req.body.noteID]
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            listOfUsers: {
                can_view: ['user1', 'user3'],
                can_edit: ['user2'],
            },
        });
    });

    it('should handle database errors', async () => {
        const dbError = new Error('Database error');
        db.query.mockRejectedValue(dbError);
    
        await fetchNotePermission(req, res);
    
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          error: 'Database error'
        });
    });

    it('should handle empty result set', async () => {
        db.query.mockResolvedValue({ rows: [] });
    
        await fetchNotePermission(req, res);
    
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          listOfUsers: {
            can_view: [],
            can_edit: []
          }
        });
    });
});

describe('publishUserNote controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {
                noteID: 1,
                public_note_description: "test description",
                public_note_tags: ["test", "jest"],
            },
            user: {
                username: "fake_username",
                user_id: 1,
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

    it('should publish user note successfully', async () => {
        const mockRows = [{ title: "test note" }];
        db.query
            .mockResolvedValueOnce({ rows: mockRows })
            .mockResolvedValueOnce();
        
        await publishUserNote(req, res);

        expect(db.query).toHaveBeenCalledTimes(2);
        expect(db.query).toHaveBeenNthCalledWith(1, expect.any(String), [req.body.noteID]);
        expect(db.query).toHaveBeenNthCalledWith(2, expect.any(String), [
            req.body.noteID,
            "test note",
            req.user.user_id,
            req.user.username,
            req.body.public_note_description,
            req.body.public_note_tags,
        ]);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Note published.',
        });
    });

    it('should handle database errors', async () => {
        const dbError = new Error('Database error');
        db.query.mockRejectedValue(dbError);
        
        await publishUserNote(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Database error'
        });
    });
});

describe('unpublishUserNote controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {
                noteID: 1,
            },
            user: {
                username: "fake_username",
                user_id: 1,
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

    it('should unpublish note successfully', async () => {
        db.query
            .mockResolvedValueOnce()
            .mockResolvedValueOnce();
        
        await unpublishUserNote(req, res);

        expect(db.query).toHaveBeenCalledTimes(2);
        expect(db.query).toHaveBeenNthCalledWith(1, expect.any(String), [req.body.noteID]);
        expect(db.query).toHaveBeenNthCalledWith(2, expect.any(String), [req.body.noteID, req.user.username]);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Note unpublished.',
        });
    });

    it('should handle database errors', async () => {
        const dbError = new Error('Database error');
        db.query.mockRejectedValue(dbError);
        
        await unpublishUserNote(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Database error'
        });
    });
});

describe('fetchAllPublicNotes controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            user: {
                username: "fake_username",
                user_id: 1,
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

    it('should fetch all public notes successfully', async () => {
        const mockRows = [
            { note_id: 100, title: "pb note 1", username: "rd user 1", note_public_description: "rd desc 1", note_public_tags: ["t1", "t2"] },
            { note_id: 200, title: "pb note 2", username: "rd user 2", note_public_description: "rd desc 2", note_public_tags: ["t3"] },
            { note_id: 300, title: "pb note 3", username: "rd user 3", note_public_description: "rd desc 3", note_public_tags: ["t4", "t6", "t5"] },
        ];
        db.query.mockResolvedValue({ rows: mockRows });

        await fetchAllPublicNotes(req, res);

        expect(db.query).toHaveBeenCalledWith(expect.any(String));
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            listOfPublicNotes: mockRows,
        });
    });

    it('should handle database errors', async () => {
        const dbError = new Error('Database error');
        db.query.mockRejectedValue(dbError);
        
        await fetchAllPublicNotes(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Database error'
        });
    });
});

describe('fetchSinglePublicNote controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {
                noteID: 100,
            },
            user: {
                username: "fake_username",
                user_id: 1,
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

    it('should fetch single public note successfully', async () => {
        const mockRows1 = [{ title: "pb note 1", content: "rd content 1" }];
        const mockRows2 = [{ note_id: 21, title: "pb note 1" }];
        db.query
            .mockResolvedValueOnce({ rows: mockRows1 })
            .mockResolvedValueOnce({ rows: mockRows2 });
        
        await fetchSinglePublicNote(req, res);

        expect(db.query).toHaveBeenCalledTimes(2);
        expect(db.query).toHaveBeenNthCalledWith(1, expect.any(String), [req.body.noteID]);
        expect(db.query).toHaveBeenNthCalledWith(2, expect.any(String), ["pb note 1", "rd content 1", req.user.user_id]);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Note imported',
            noteCreated: mockRows2[0],
        });
    });

    it('should handle database errors', async () => {
        const dbError = new Error('Database error');
        db.query.mockRejectedValue(dbError);
        
        await fetchAllPublicNotes(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Database error'
        });
    });
});