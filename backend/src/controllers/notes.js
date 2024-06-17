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
        const { rows } = await db.query(`SELECT title, content FROM notes WHERE note_id = $1`, [
            req.params.noteID
        ]);
        return res.status(200).json({
            success: true,
            // message: 'HELLO',
            title: rows[0].title,
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