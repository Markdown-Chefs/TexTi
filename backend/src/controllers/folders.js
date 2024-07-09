const db = require('../config/db');

exports.getUserFolders = async (req, res) => {
    try {
        const userToSelect = req.user.username;
        let response;
        if (!req.query.parentID) {
            response = await db.query(
                `SELECT folders.folder_id, folders.folder_name, folders.created_at
                FROM users
                INNER JOIN folders
                ON users.user_id = folders.user_id
                WHERE users.username = $1 AND folders.parent_id IS NULL;`, [userToSelect]
            );
        } else {
            response = await db.query(
                `SELECT folders.folder_id, folders.folder_name, folders.created_at
                FROM users
                INNER JOIN folders
                ON users.user_id = folders.user_id
                WHERE users.username = $1 AND folders.parent_id = $2;`, [userToSelect, req.query.parentID]
            );
        }

        return res.status(200).json({
            success: true,
            listOfFolders: response.rows,
        });
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({
                error: err.message,
        });
    }
}

exports.createUserFolder = async (req, res) => {
    try {
        let response;
        if (!req.body.parentID) {
            response = await db.query(
                `INSERT INTO folders (folder_name, user_id) 
                VALUES ($1, $2)
                RETURNING folder_id, folder_name`, [
                    req.body.folderName,
                    req.user.user_id,
                ]
            );
        } else {
            response = await db.query(
                `INSERT INTO folders (folder_name, parent_id, user_id) 
                VALUES ($1, $2, $3)
                RETURNING folder_id, folder_name`, [
                    req.body.folderName,
                    req.body.parentID,
                    req.user.user_id,
                ]
            );
        }

        return res.status(201).json({
            success: true,
            message: 'Folder created',
            folderCreated: response.rows[0],
        });
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({
                error: err.message,
        });
    }
}

exports.deleteUserFolder = async (req, res) => {
    try {
        let response;
        // make sure no notes in this folder
        response = await db.query('SELECT note_id FROM notes WHERE folder_id = $1', [req.body.folderID]);
        if (response.rows.length) {
            return res.status(400).json({
                error: 'Folder must be empty.',
            })
        }
        // makesure no folders in this folder
        response = await db.query('SELECT folder_id FROM folders WHERE parent_id = $1', [req.body.folderID]);
        if (response.rows.length) {
            return res.status(400).json({
                error: 'Folder must be empty.',
            })
        }

        await db.query('DELETE FROM folders WHERE folder_id = $1 AND user_id = $2', [req.body.folderID, req.user.user_id]);

        return res.status(200).json({
            success: true,
            message: 'Folder deleted',
        });

    } catch (err) {
        console.log(err.message);
        return res.status(500).json({
                error: err.message,
        });
    }
}