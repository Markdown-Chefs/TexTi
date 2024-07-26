const config = require('./config/bucket');
const express = require('express');
const axios = require('axios'); 
const multer = require('multer');
const FormData = require('form-data');
const app = express();
const upload = multer();
const cookieParser = require('cookie-parser');
const passport = require('passport');
const cors = require('cors');

// initialise middlewares
app.use(express.json());
app.use(cookieParser());
require('./middlewares/passport');
app.use(passport.initialize());
app.use(cors({ origin:config.CLIENT_URL, credentials: true }));

// import routes
const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');
const userUpdateRoutes = require('./routes/userUpdate');
const foldersRoutes = require('./routes/folders');

// initialise routes
app.use('/api', authRoutes);
app.use('/api', notesRoutes);
app.use('/api', userUpdateRoutes);
app.use('/api', foldersRoutes);

app.post('/upload', upload.single('image'), async (req, res) => {
    const formData = new FormData();
    formData.append('image', req.file.buffer, req.file.originalname);

    try {
        const response = await axios.post('https://api.imgur.com/3/image', formData, {
            headers: {
                Authorization: 'Bearer ' + config.IMGUR_ACCESS_TOKEN, 
                ...formData.getHeaders()
            }
        });

        if (response.data.success) {
            res.json({ link: response.data.data.link });
        } else {
            res.status(500).json({ error: 'Upload failed', details: response.data });
        }
    } catch (error) {
        res.status(500).json({ error: 'Upload failed', details: error.message });
    }
});

app.listen(config.PORT, () => {
    console.log(`The app is running at http://localhost:${config.PORT}`)
});