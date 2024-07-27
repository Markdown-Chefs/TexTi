const db = require('../config/db');
// const config = require('../config/bucket');

exports.getUserNotes = async (req, res) => {
    try {
        const userToSelect = req.user.username;
        let response;
        if (!req.query.folderID) {
            response = await db.query(
                `SELECT notes.note_id, notes.title, notes.last_modified, notes.pin_by_owner, notes.published
                FROM users
                INNER JOIN notes
                ON users.user_id = notes.user_id
                WHERE users.username = $1 AND notes.folder_id IS NULL;`, [userToSelect]
            );
        } else {
            response = await db.query(
                `SELECT notes.note_id, notes.title, notes.last_modified, notes.pin_by_owner, notes.published
                FROM users
                INNER JOIN notes
                ON users.user_id = notes.user_id
                WHERE users.username = $1 AND notes.folder_id = $2;`, [userToSelect, req.query.folderID]
            );
        }

        // const listOfNotes = rows.map(note => note.title); // [{ id: title }, { id:title }]
        return res.status(200).json({
            success: true,
            listOfNotes: response.rows,
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
        let response;
        if (!req.body.folderID) {
            response = await db.query(`INSERT INTO notes (title, content, user_id) VALUES ($1, $2, $3) RETURNING note_id, title;`, [
                noteTitle,
                "",
                req.user.user_id,
            ]);
        } else {
            response = await db.query(`INSERT INTO notes (title, content, user_id, folder_id) VALUES ($1, $2, $3, $4) RETURNING note_id, title;`, [
                noteTitle,
                "",
                req.user.user_id,
                req.body.folderID,
            ]);
        }
                
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

exports.createNewUserDefaultNote = async (userID) => {
    const defaultNoteTitle = "Welcome to TexTi!";
    const defaultNoteContent = `
# Welcome to TexTi!
<br/>

![TexTi_Logo](https://i.imgur.com/njs0IQ8.jpeg)

**TexTi** is your powerful markdown note-taking application. Here's a quick guide to help you get started:

## UI Overview
At the top right corner of the editor page, you will find a series of buttons with the following functions:
1. **Display Options**: (*You are currently in editor + previewer display!*)
    - **Editor Only**: Displays only the editor.
    - **Editor + Previewer**: Displays both the editor and the previewer side by side.
    - **Previewer Only**: Displays only the previewer.
2. **Image Upload and Embedding**: Allows you to upload images and embed them directly into your notes.

3. **Exporting Options**: Export your notes to various formats such as PDF, Markdown, or HTML.

4. **Sharing Note (Permissions)**: Share your notes by granting access to specific users. You can set permissions for viewing or editing.

5. **Publish/Unpublish Note**: Publish your note to the public pool or unpublish it as needed.


## Markdown Basics

- **Bold**: \`**text**\` or \`__text__\`
- **Italic**: \`*text*\` or \`_text_\`
- **Strikethrough**: \`~~text~~\`
- **Headers**: \`# H1\`, \`## H2\`, \`### H3\`, and so on.
- **Lists**:
    - Unordered: \`- item\`
    - Ordered: \`1. item\`
- **Links**: \`[title](http://)\`
- **Images**: \`![alt text](url)\`
- **Blockquote**: \`> text\`
> TexTi is the best note-taking tool :)

*You can find more syntax guides in the quick syntax reference tab! Simply click on the floating lightbulb button to check out more syntaxes.*

### Github-Flavoured Alerts
> [!NOTE]
> This is a note.

> [!TIP]
> This is a tip.

> [!IMPORTANT]
> This is important information.

> [!WARNING]
> This is a warning.

> [!CAUTION]
> This is a caution.

#### Important Notes
- Latex Syntax for New Lines:
  - Due to technical limitations, if you are using \`$...$\` or \`$$...$$\` for LaTeX, you need to add an extra backslash for new lines. For example, use \`\\\\\\\` instead of \`\\\\\`.
    - If you are using \`\`\`math for LaTeX, you can use \`\\\\\` for new lines as usual.
    - Examples:
        - Using \`$...$\` or \`$$...$$\`:
          
        $$ \\begin{matrix} 1 & 2 \\\\\\ 3 & 4 \\end{matrix} $$
      - Using \`\`\`math:
      \`\`\`math
      \\begin{matrix} 1 & 2 \\\\ 3 & 4 \\end{matrix}
      \`\`\`
---

We hope you enjoy using TexTi. Happy note-taking!

*Markdown Chefs*`;

    await db.query(`INSERT INTO notes (title, content, user_id) VALUES ($1, $2, $3);`, [
        defaultNoteTitle,
        defaultNoteContent,
        userID,
    ]);
}

exports.deleteUserNote = async (req, res) => {
    const { noteID, title } = req.body;
    try {
        // let response = await db.query(`SELECT user_id FROM users WHERE username = $1`, [req.user.username]);
        // const userID = response.rows[0].user_id;

        await db.query(`DELETE FROM public_note_template WHERE note_id = $1 AND user_id = $2`, [noteID, req.user.user_id]);

        await db.query(`DELETE FROM note_permission WHERE note_id = $1`, [noteID]);

        await db.query(`DELETE FROM notes WHERE note_id = $1 AND user_id = $2`, [noteID,req.user.user_id]);
       
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

exports.pinUserNote = async (req, res) => {
    const { noteID, pinNote } = req.body;
    try {
        await db.query(
            `UPDATE notes SET pin_by_owner = $1, last_modified = CURRENT_TIMESTAMP
            WHERE note_id = $2`, [
                pinNote,
                noteID
            ]);
        
        if (pinNote) {
            return res.status(200).json({
                success: true,
                message: 'Note pinned',
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Note unpinned',
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
        const { rows } = await db.query(`SELECT title, content, user_id, published FROM notes WHERE note_id = $1`, [
            req.params.noteID
        ]);

        const perm = {
            isOwner: false,
            canView: false,
            canEdit: false,
            isPublished: false,
        };
        const currUserInfo = await db.query(`SELECT username, user_id FROM users WHERE username = $1`, [req.user.username]);

        if (rows[0].published) {
            perm.isPublished = true;
        }

        if (currUserInfo.rows[0].user_id === rows[0].user_id) {
            perm.isOwner = true;
            perm.canView = true;
            perm.canEdit = true;
        } else {
            const dbPerm = await db.query(`SELECT can_view, can_edit FROM note_permission WHERE user_id = $1 AND note_id = $2`, [currUserInfo.rows[0].user_id, req.params.noteID]);
            if (dbPerm.rows.length) {
                if (dbPerm.rows[0].can_view) {
                    perm.canView = true;
                }
                if (dbPerm.rows[0].can_edit) {
                    perm.canEdit = true;
                }
            }
        }

        return res.status(200).json({
            success: true,
            title: rows[0].title,
            content: rows[0].content,
            permission: perm,
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
            `UPDATE notes SET content = $1, last_modified = CURRENT_TIMESTAMP
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
        // let response = await db.query('SELECT user_id FROM users WHERE username = $1', [req.user.username]);
        // const ownerID = response.rows[0].user_id;
        let view_arr = [];
        let edit_arr = [];
        const { rows } = await db.query(
            `SELECT users.username, note_permission.user_id, note_permission.can_view, note_permission.can_edit 
            FROM note_permission
            INNER JOIN users
            ON note_permission.user_id = users.user_id
            WHERE note_permission.owner_id = $1 AND note_permission.note_id = $2`, [
                req.user.user_id,
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

exports.publishUserNote = async (req, res) => {
    try {
        const { rows } = await db.query(`UPDATE notes SET published = TRUE WHERE note_id = $1 RETURNING (title);`, [req.body.noteID]);
        await db.query(`INSERT INTO public_note_template (note_id, title, user_id, username, note_public_description, note_public_tags) VALUES($1, $2, $3, $4, $5, $6)`, [
            req.body.noteID,
            rows[0].title,
            req.user.user_id,
            req.user.username,
            req.body.public_note_description,
            req.body.public_note_tags,
        ]);

        return res.status(200).json({
            success: true,
            message: 'Note published.',
        });

    } catch (err) {
        console.log(err.message);
        return res.status(500).json({
                error: err.message,
        });
    }
}

exports.unpublishUserNote = async (req, res) => {
    try {
        await db.query(`UPDATE notes SET published = FALSE WHERE note_id = $1`, [req.body.noteID]);
        await db.query(`DELETE FROM public_note_template WHERE note_id = $1 AND username = $2`, [req.body.noteID, req.user.username]);

        return res.status(200).json({
            success: true,
            message: 'Note unpublished.',
        });

    } catch (err) {
        console.log(err.message);
        return res.status(500).json({
                error: err.message,
        });
    }
}

exports.fetchAllPublicNotes = async (req, res) => {
    try {
        const { rows } = await db.query(`SELECT note_id, title, username, note_public_description, note_public_tags FROM public_note_template`);

        return res.status(200).json({
            success: true,
            listOfPublicNotes: rows,
        });
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({
                error: err.message,
        });
    }
}

exports.fetchSinglePublicNote = async (req, res) => {
    try {
        let response = await db.query('SELECT title, content FROM notes WHERE note_id = $1', [req.body.noteID]);
        const ori_content = response.rows[0].content;
        const ori_title = response.rows[0].title;

        const { rows } = await db.query(`INSERT INTO notes (title, content, user_id) VALUES ($1, $2, $3) RETURNING note_id, title;`, [
            ori_title,
            ori_content,
            req.user.user_id,
        ]);

        return res.status(201).json({
            success: true,
            message: 'Note imported',
            noteCreated: rows[0],
        });

    } catch (err) {
        console.log(err.message);
        return res.status(500).json({
                error: err.message,
        });
    }
}