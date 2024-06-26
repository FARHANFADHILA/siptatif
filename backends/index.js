// import from external library
const express = require("express");
const cors = require("cors");
const cookieParser = require('cookie-parser');

// importing all available routes
const login_route = require("./routes/login_route");
const register_route = require("./routes/register_route");
const lupa_password_route = require("./routes/lupa_password_route");
const jwt_auth_route = require("./routes/jwt_auth_route");
const logout_route = require("./routes/logout_route");
const pengumuman_route = require("./routes/pengumuman_route");
const dosen_route = require("./routes/dosen_route");

// importing all services based on actor role actions
const admin_prodi_route = require("./routes/admin_prodi_route");
const koordinator_ta_route = require("./routes/koordinator_ta_route");
const mahasiswa_route = require("./routes/mahasiswa_route");

require('./utils/cleanup_expires_token');
require('dotenv').config();

const app = express();
const port = process.env.PORT;

// allowing cors and body parser json request
app.use(cors({
    origin: (origin, callback) => {
        // Cek apakah origin adalah localhost atau salah satu dari 192.168.x.x
        const allowedOrigins = [
            /^http:\/\/localhost(:\d+)?$/,            // Untuk localhost
            /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/  // Untuk 192.168.x.x
        ];

        // Periksa apakah origin cocok dengan salah satu pola
        const isAllowed = allowedOrigins.some(pattern => pattern.test(origin));

        if (isAllowed || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
	credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// importing all available routes
app.use(login_route);
app.use(register_route);
app.use(lupa_password_route);
app.use(jwt_auth_route);
app.use(logout_route);
app.use(pengumuman_route);
app.use(dosen_route);

// importing all available routes based on each actor role actions
app.use(admin_prodi_route);
app.use(koordinator_ta_route);
app.use(mahasiswa_route);

// starting express api server to internal public ip and localhost
app.listen(port, '0.0.0.0', () => {
	console.log(`SIPTATIF API Started on port ${port}`);
});

