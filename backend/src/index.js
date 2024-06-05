const config = require('./config/bucket');
const express = require('express');
const app = express();
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

// initialise routes
app.use('/api', authRoutes);
app.use('/api', notesRoutes);
app.use('/api', userUpdateRoutes);

app.listen(config.PORT, () => {
    console.log(`The app is running at http://localhost:${config.PORT}`)
});