const jwt = require("jsonwebtoken");

const admin_prodi_only = (req, res, next) => {

    if (req.user.role === "Admin Prodi" || req.user.id_role == 1) return next();

    return res.status(403).json({
        response: false,
        message: "Mau ngapain mas bro aowkowk, heker yh banh? 😜😜"
    });
};

const koordinator_ta_only = (req, res, next) => {
    if (req.user.role === "Koordinator TA" || req.user.id_role == 2) return next();

    return res.status(403).json({
        response: false,
        message: "Mau ngapain mas bro aowkowk, heker yh banh? 😜😜"
    });
};

const mahasiswa_only = (req, res, next) => {
    if (req.user.role === "Mahasiswa" || req.user.id_role == 3) return next();

    return res.status(403).json({
        response: false,
        message: "Mau ngapain mas bro aowkowk, heker yh banh? 😜😜"
    });
};

const forbiden_for_mahasiswa_only = (req, res, next) => {
    if (req.user.role !== "Mahasiswa") return next();
    
    return res.status(403).json({
        response: false,
        message: "Mau ngapain mas bro aowkowk, heker yh banh? 😜😜"
    });
}

module.exports = {
	admin_prodi_only,
	koordinator_ta_only,
	mahasiswa_only,
    forbiden_for_mahasiswa_only
};
