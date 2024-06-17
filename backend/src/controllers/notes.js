const db = require('../config/db');
// const config = require('../config/bucket');

exports.getUserNotes = async (req, res) => {
    try {
        // console.log(req.user);
        const userToSelect = req.user.username;
        const { rows } = await db.query(
            `SELECT notes.note_id, notes.title
            FROM users
            INNER JOIN notes
            ON users.user_id = notes.user_id
            WHERE users.username = $1;`, [userToSelect]
        );
        // console.log(typeof(rows));
        // const listOfNotes = rows.map(note => note.title); // [{ id: title }, { id:title }]
        return res.status(200).json({
            success: true,
            // listOfNotes: listOfNotes,
            listOfNotes: rows,
        });
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({
                error: err.message,
        });
    }
}

exports.createUserNote = async (req, res) => {
    const { noteTitle } = req.body;
    try {
        let response = await db.query(`SELECT user_id FROM users WHERE username = $1`, [req.user.username]);
        const userID = response.rows[0].user_id;
        await db.query(`INSERT INTO notes (title, content, user_id) VALUES ($1, $2, $3);`, [
            noteTitle,
            "",
            userID,
        ]);
        response = await db.query(`SELECT note_id, title FROM notes WHERE title = $1`, [noteTitle]);
        
        return res.status(201).json({
            success: true,
            message: 'Note created',
            noteCreated: response.rows[0],
        });
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({
                error: err.message,
        });
    }
}

exports.deleteUserNote = async (req, res) => {
    const { note_id, title } = req.body;
    try {
        // console.log(note_id, title);
        // console.log(req.body);
        let response = await db.query(`SELECT user_id FROM users WHERE username = $1`, [req.user.username]);
        const userID = response.rows[0].user_id;
        // console.log(userID);
        await db.query(`DELETE FROM notes WHERE title = $1 AND note_id = $2 AND user_id = $3`, [
            title,
            note_id,
            userID,
        ]);

        return res.status(200).json({
            success: true,
            message: 'Note deleted',
        });

    } catch (err) {
        console.log(err.message);
        return res.status(500).json({
                error: err.message,
        });
    }
}

exports.fetchUserNoteContent = async (req, res) => {
    try {
        const { rows } = await db.query(`SELECT content FROM notes WHERE note_id = $1`, [
            req.params.noteID
        ]);
        return res.status(200).json({
            success: true,
            // message: 'HELLO',
            content: rows[0].content,
        });
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({
                error: err.message,
        });
    }
}

exports.saveUserNoteContent = async (req, res) => {
    try {
        await db.query(
            `UPDATE notes SET content = $1
            WHERE note_id = $2`, [
                req.body.updatedContent,
                req.params.noteID
        ]);

        return res.status(200).json({
                success: true,
                message: 'Note content updated successfully.',
        });
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({
                error: err.message,
        });
    }
}

exports.updateNotePermission = async (req, res) => {
    try {
        let response = await db.query(
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

        // check have record or not
        let check_exists = await db.query('SELECT owner_id FROM note_permission WHERE owner_id = $1 AND note_id = $2 AND user_id = $3', [
            response.rows[0].user_id,
            req.body.noteID,
            response.rows[1].user_id,
        ])

        if (check_exists.rows.length) {
            await db.query(`UPDATE note_permission SET can_view = $1, can_edit = $2 WHERE owner_id = $3 AND note_id = $4 AND user_id = $5`, [
                req.body.can_view,
                req.body.can_edit,
                response.rows[0].user_id,
                req.body.noteID,
                response.rows[1].user_id,
                ]);
        } else {
            await db.query(`INSERT INTO note_permission (owner_id, note_id, user_id, can_view, can_edit) VALUES ($1, $2, $3, $4, $5)`, [
                response.rows[0].user_id,
                req.body.noteID,
                response.rows[1].user_id,
                req.body.can_view,
                req.body.can_edit,
            ]);
        }

        return res.status(200).json({
            success: true,
            message: 'Note permission updated successfully.',
        });
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({
                error: err.message,
        });
    }
}

exports.fetchNotePermission = async (req, res) => {
    try {
        let response = await db.query('SELECT user_id FROM users WHERE username = $1', [req.user.username]);
        const ownerID = response.rows[0].user_id;
        let view_arr = [];
        let edit_arr = [];
        const { rows } = await db.query(
            `SELECT users.username, note_permission.user_id, note_permission.can_view, note_permission.can_edit 
            FROM note_permission
            INNER JOIN users
            ON note_permission.user_id = users.user_id
            WHERE note_permission.owner_id = $1 AND note_permission.note_id = $2`, [
                ownerID,
                req.body.noteID,
        ]);

        for (let x in rows) {
            if (rows[x].can_view && !rows[x].can_edit) {
                view_arr.push(rows[x].username);
            } else if (rows[x].can_view && rows[x].can_edit) {
                edit_arr.push(rows[x].username);
            }
        }

        return res.status(200).json({
            success: true,
            listOfUsers: {
                can_view: view_arr,
                can_edit: edit_arr,
            },
        });
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({
                error: err.message,
        });
    }
}